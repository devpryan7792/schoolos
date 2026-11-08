package gt06

import (
	"bytes"
	"encoding/hex"
	"io"
	"log"
)

// FrameHandler is invoked whenever a valid or recoverable GT06 frame is received.
type FrameHandler func(packet Packet, raw []byte) error

// ErrorLogger is invoked when corrupted bytes are drained from the stream.
type ErrorLogger func(msg string, malformedBytes []byte)

// StreamFramer buffers incoming bytes from a persistent TCP socket, isolates
// frames between 0x78 0x78 and 0x0D 0x0A, and recovers gracefully from stream noise.
type StreamFramer struct {
	reader      io.Reader
	buf         []byte
	errLogger   ErrorLogger
	maxBuffSize int
}

// NewStreamFramer constructs a resilient GT06 stream decoder.
func NewStreamFramer(r io.Reader, errLogger ErrorLogger) *StreamFramer {
	if errLogger == nil {
		errLogger = func(msg string, malformedBytes []byte) {
			log.Printf("[GT06 RESILIENCE] %s: hex=%s", msg, hex.EncodeToString(malformedBytes))
		}
	}
	return &StreamFramer{
		reader:      r,
		buf:         make([]byte, 0, 4096),
		errLogger:   errLogger,
		maxBuffSize: 65536, // 64KB max buffer safety ceiling
	}
}

// ReadNextFrame blocks and reads from the underlying stream until a complete frame
// is recovered or an unrecoverable IO error (e.g. EOF / connection reset by peer) occurs.
//
// Invariant 4: Never drops connection on malformed frames. It drains invalid bytes,
// logs the hex dump, and proceeds to the next valid frame.
func (f *StreamFramer) ReadNextFrame() (Packet, []byte, error) {
	temp := make([]byte, 1024)

	for {
		// Look for frame header 0x78 0x78
		for len(f.buf) >= 2 {
			headerIdx := bytes.Index(f.buf, []byte{StartByte1, StartByte2})
			if headerIdx == -1 {
				// No header found at all; drain buffer except the last byte in case 0x78 was split
				if len(f.buf) > 1 {
					f.errLogger("discarding garbage bytes without GT06 header", f.buf[:len(f.buf)-1])
					f.buf = f.buf[len(f.buf)-1:]
				}
				break
			}

			// If header is not at index 0, drain prefix garbage
			if headerIdx > 0 {
				f.errLogger("draining corrupt prefix before GT06 header", f.buf[:headerIdx])
				f.buf = f.buf[headerIdx:]
			}

			// Now f.buf starts with 0x78 0x78
			// Need at least 3 bytes to know the packet length
			if len(f.buf) < 3 {
				break
			}

			packetLength := int(f.buf[2])
			// Expected total frame size: Start(2) + Length(1) + PacketData(packetLength) + Stop(2) = packetLength + 5
			totalExpectedLen := packetLength + 5

			// Sanity check packetLength (GT06 standard frames are between 5 and 64 bytes)
			if packetLength < 5 || packetLength > 64 {
				f.errLogger("invalid packet length byte; advancing past false header", f.buf[:3])
				f.buf = f.buf[1:] // Advance by 1 byte to check next potential header
				continue
			}

			// If protocol byte is already available, verify it is a valid GT06 protocol
			if len(f.buf) >= 4 {
				proto := f.buf[3]
				if proto != ProtoLogin && proto != ProtoGPSLocation && proto != ProtoGPSLocationAlt &&
					proto != ProtoHeartbeat && proto != ProtoAlarm && proto != 0x15 && proto != 0x8A {
					f.errLogger("unknown protocol number in header candidate; advancing", f.buf[:4])
					f.buf = f.buf[1:]
					continue
				}
			}

			// If we haven't received all bytes for this frame yet, wait for more stream data
			if len(f.buf) < totalExpectedLen {
				break
			}

			frameCandidate := f.buf[:totalExpectedLen]

			// Validate stop bytes (0x0D 0x0A)
			if frameCandidate[totalExpectedLen-2] != StopByte1 || frameCandidate[totalExpectedLen-1] != StopByte2 {
				f.errLogger("frame footer mismatch (expected 0x0D 0x0A); advancing", frameCandidate[:3])
				f.buf = f.buf[1:] // Skip false header by 1
				continue
			}

			// Parse packet candidate
			pkt, err := ParseFrame(frameCandidate)
			if err != nil {
				f.errLogger("frame parsing or CRC error; advancing past header", frameCandidate[:3])
				f.buf = f.buf[1:] // Skip false header by 1
				continue
			}

			// Successfully isolated and decoded a valid frame!
			frameCopy := make([]byte, totalExpectedLen)
			copy(frameCopy, frameCandidate)
			f.buf = f.buf[totalExpectedLen:]

			return pkt, frameCopy, nil
		}

		// Buffer safety valve to prevent memory leaks from malicious flood
		if len(f.buf) > f.maxBuffSize {
			f.errLogger("buffer exceeded safety ceiling; resetting", f.buf[:len(f.buf)-1024])
			f.buf = f.buf[len(f.buf)-1024:]
		}

		// Read more data from socket
		n, err := f.reader.Read(temp)
		if err != nil {
			return nil, nil, err // Connection closed or socket timeout
		}
		if n > 0 {
			f.buf = append(f.buf, temp[:n]...)
		}
	}
}
