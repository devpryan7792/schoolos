package gt06

import (
	"encoding/binary"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"
)

const (
	StartByte1 = 0x78
	StartByte2 = 0x78
	StopByte1  = 0x0D
	StopByte2  = 0x0A

	ProtoLogin          = 0x01
	ProtoGPSLocationAlt = 0x12
	ProtoHeartbeat      = 0x13
	ProtoAlarm          = 0x16
	ProtoGPSLocation    = 0x22
)

var (
	ErrPacketTooShort     = errors.New("packet too short for GT06 specification")
	ErrInvalidHeader      = errors.New("invalid GT06 packet header: expected 0x78 0x78")
	ErrInvalidFooter      = errors.New("invalid GT06 packet footer: expected 0x0D 0x0A")
	ErrInvalidLength      = errors.New("packet length byte does not match buffer length")
	ErrCRCMismatch        = errors.New("CRC checksum mismatch")
	ErrUnknownProtocol    = errors.New("unrecognized GT06 protocol number")
	ErrMalformedBCD       = errors.New("malformed BCD IMEI")
)

// Packet is the common interface implemented by decoded GT06 frames.
type Packet interface {
	Protocol() uint8
	SerialNumber() uint16
}

// LoginPacket represents the 0x01 terminal registration frame.
type LoginPacket struct {
	Proto  uint8
	IMEI   string
	Serial uint16
}

func (p *LoginPacket) Protocol() uint8       { return p.Proto }
func (p *LoginPacket) SerialNumber() uint16 { return p.Serial }

// LocationPacket represents the 0x22 (or 0x12) GPS position telemetry frame.
type LocationPacket struct {
	Proto       uint8
	Timestamp   time.Time
	Satellites  uint8
	Latitude    float64
	Longitude   float64
	SpeedKmh    float64
	HeadingDeg  float64
	IgnitionOn  bool
	Serial      uint16
}

func (p *LocationPacket) Protocol() uint8       { return p.Proto }
func (p *LocationPacket) SerialNumber() uint16 { return p.Serial }

// HeartbeatPacket represents the 0x13 status keep-alive frame.
type HeartbeatPacket struct {
	Proto        uint8
	TerminalInfo uint8
	VoltageLevel uint8
	GSMStrength  uint8
	Serial       uint16
}

func (p *HeartbeatPacket) Protocol() uint8       { return p.Proto }
func (p *HeartbeatPacket) SerialNumber() uint16 { return p.Serial }

// DecodeBCD converts an 8-byte BCD array into an IMEI string.
func DecodeBCD(bcd []byte) (string, error) {
	var sb strings.Builder
	for _, b := range bcd {
		high := (b >> 4) & 0x0F
		low := b & 0x0F
		if high > 9 || low > 9 {
			// Some IMEI padding might use 0x0F
			if high <= 9 {
				sb.WriteByte('0' + high)
			}
			if low <= 9 {
				sb.WriteByte('0' + low)
			}
			continue
		}
		sb.WriteByte('0' + high)
		sb.WriteByte('0' + low)
	}

	result := sb.String()
	// An IMEI is typically 15 digits; if 16 digits and starts with '0', strip leading '0'
	if len(result) == 16 && result[0] == '0' {
		result = result[1:]
	}

	if len(result) < 14 {
		return "", fmt.Errorf("%w: decoded length %d is too short", ErrMalformedBCD, len(result))
	}

	return result, nil
}

// EncodeBCD converts a 15-digit IMEI string into an 8-byte BCD array.
func EncodeBCD(imei string) ([]byte, error) {
	clean := strings.TrimSpace(imei)
	if len(clean) == 15 {
		clean = "0" + clean // Pad to 16 nibbles (8 bytes)
	}
	if len(clean) != 16 {
		return nil, fmt.Errorf("IMEI must be 15 or 16 digits, got %d", len(clean))
	}

	res := make([]byte, 8)
	for i := 0; i < 8; i++ {
		high := clean[i*2] - '0'
		low := clean[i*2+1] - '0'
		if high > 9 || low > 9 {
			return nil, fmt.Errorf("invalid digit in IMEI: %s", clean)
		}
		res[i] = (high << 4) | low
	}
	return res, nil
}

// ParseFrame decodes a raw GT06 byte slice into a typed Packet.
func ParseFrame(buf []byte) (Packet, error) {
	if len(buf) < 10 {
		return nil, ErrPacketTooShort
	}
	if buf[0] != StartByte1 || buf[1] != StartByte2 {
		return nil, ErrInvalidHeader
	}
	if buf[len(buf)-2] != StopByte1 || buf[len(buf)-1] != StopByte2 {
		return nil, ErrInvalidFooter
	}

	length := int(buf[2])
	// buf = Start(2) + Length(1) + PacketData(length) + Stop(2)
	// so expected total len = 1 + length + 4 = length + 5
	if len(buf) != length+5 {
		return nil, fmt.Errorf("%w: length byte indicates %d, total buffer length is %d", ErrInvalidLength, length, len(buf))
	}

	// Verify CRC
	if !VerifyCRC(buf) {
		return nil, ErrCRCMismatch
	}

	protocolNum := buf[3]

	switch protocolNum {
	case ProtoLogin:
		// Login Frame:
		// [0:2] 0x78 0x78
		// [2] Length (0x0D or 13)
		// [3] Protocol (0x01)
		// [4:12] IMEI (8 Bytes BCD)
		// [12:14] Serial (2 Bytes)
		// [14:16] CRC (2 Bytes)
		// [16:18] Stop (0x0D 0x0A)
		if len(buf) < 18 {
			return nil, ErrPacketTooShort
		}
		imeiBytes := buf[4:12]
		imei, err := DecodeBCD(imeiBytes)
		if err != nil {
			// Fallback to hex string if BCD decode fails
			imei = hex.EncodeToString(imeiBytes)
		}
		serial := binary.BigEndian.Uint16(buf[12:14])
		return &LoginPacket{
			Proto:  protocolNum,
			IMEI:   imei,
			Serial: serial,
		}, nil

	case ProtoGPSLocation, ProtoGPSLocationAlt:
		// Location Frame:
		// [0:2] 0x78 0x78
		// [2] Length
		// [3] Protocol (0x22 or 0x12)
		// [4:10] Timestamp: YY MM DD HH MM SS (UTC)
		// [10] Satellites (lower 4 bits) & GPS len (upper 4 bits)
		// [11:15] Latitude (4 bytes big-endian)
		// [15:19] Longitude (4 bytes big-endian)
		// [19] Speed (1 byte km/h)
		// [20:22] Course & Status flags (2 bytes)
		// [22:24] Terminal Info / ACC status or LBS info
		// Serial and CRC are at the end
		if len(buf) < 30 {
			return nil, ErrPacketTooShort
		}

		year := int(buf[4]) + 2000
		month := time.Month(buf[5])
		day := int(buf[6])
		hour := int(buf[7])
		minute := int(buf[8])
		second := int(buf[9])

		timestamp := time.Date(year, month, day, hour, minute, second, 0, time.UTC)
		satellites := buf[10] & 0x0F

		// Latitude: 4-byte big endian / 1,800,000.0
		latRaw := binary.BigEndian.Uint32(buf[11:15])
		latitude := float64(latRaw) / 1800000.0

		// Longitude: 4-byte big endian / 1,800,000.0
		lngRaw := binary.BigEndian.Uint32(buf[15:19])
		longitude := float64(lngRaw) / 1800000.0

		speedKmh := float64(buf[19])

		// Course & Status flags: 2 bytes
		courseStatus := binary.BigEndian.Uint16(buf[20:22])
		headingDeg := float64(courseStatus & 0x03FF) // lower 10 bits = 0..360

		// Status flags (Byte 20):
		// Bit 3 (0x08): 1 = South Latitude, 0 = North Latitude
		// Bit 2 (0x04): 1 = West Longitude, 0 = East Longitude
		statusByte := buf[20]
		if (statusByte & 0x08) != 0 {
			latitude = -latitude
		}
		if (statusByte & 0x04) != 0 {
			longitude = -longitude
		}

		// ACC Ignition status:
		// Terminal Information is typically at byte 21 or 22/23 depending on 0x22 / 0x12 packet variant
		// Spec: terminal info byte bit 1 indicates ACC status ((byte & 0x02) != 0)
		var ignitionOn bool
		if len(buf) >= 24 {
			// Check byte 21 and byte 23 for ACC bit
			ignitionOn = (buf[21]&0x02) != 0 || (buf[23]&0x02) != 0 || (buf[len(buf)-7]&0x02) != 0
		}

		// Serial number: 2 bytes right before CRC (at len-6 : len-4)
		serial := binary.BigEndian.Uint16(buf[len(buf)-6 : len(buf)-4])

		return &LocationPacket{
			Proto:       protocolNum,
			Timestamp:   timestamp,
			Satellites:  satellites,
			Latitude:    latitude,
			Longitude:   longitude,
			SpeedKmh:    speedKmh,
			HeadingDeg:  headingDeg,
			IgnitionOn:  ignitionOn,
			Serial:      serial,
		}, nil

	case ProtoHeartbeat:
		// Heartbeat Frame:
		// [0:2] 0x78 0x78
		// [2] Length
		// [3] Protocol (0x13)
		// [4] Terminal Information
		// [5] Voltage Level
		// [6] GSM Signal Strength
		// [7:9] Alarm/Language (optional)
		// [len-6:len-4] Serial
		// CRC and Stop
		if len(buf) < 13 {
			return nil, ErrPacketTooShort
		}
		termInfo := buf[4]
		voltage := buf[5]
		gsm := buf[6]
		serial := binary.BigEndian.Uint16(buf[len(buf)-6 : len(buf)-4])

		return &HeartbeatPacket{
			Proto:        protocolNum,
			TerminalInfo: termInfo,
			VoltageLevel: voltage,
			GSMStrength:  gsm,
			Serial:       serial,
		}, nil

	default:
		return nil, fmt.Errorf("%w: 0x%02X", ErrUnknownProtocol, protocolNum)
	}
}

// BuildLoginAck creates the required server acknowledgment frame for a login packet:
// 0x78 0x78 0x05 0x01 [Serial] [CRC] 0x0D 0x0A
func BuildLoginAck(serial uint16) []byte {
	return buildSimpleAck(ProtoLogin, serial)
}

// BuildHeartbeatAck creates the required server acknowledgment frame for a heartbeat packet:
// 0x78 0x78 0x05 0x13 [Serial] [CRC] 0x0D 0x0A
func BuildHeartbeatAck(serial uint16) []byte {
	return buildSimpleAck(ProtoHeartbeat, serial)
}

func buildSimpleAck(proto uint8, serial uint16) []byte {
	// Frame size: Start(2) + Len(1) + Proto(1) + Serial(2) + CRC(2) + Stop(2) = 10 bytes
	ack := make([]byte, 10)
	ack[0] = StartByte1
	ack[1] = StartByte2
	ack[2] = 0x05 // Length from proto to serial = 1 (proto) + 2 (serial) + 2 (CRC) = 5
	ack[3] = proto
	binary.BigEndian.PutUint16(ack[4:6], serial)

	// Compute CRC on [2 : 6] -> ack[2:6] is Length + Proto + Serial
	crc := ComputeCRC(ack[2:6])
	binary.BigEndian.PutUint16(ack[6:8], crc)

	ack[8] = StopByte1
	ack[9] = StopByte2
	return ack
}

// BuildLoginPacket creates a valid GT06 Login packet from an IMEI and serial number.
func BuildLoginPacket(imei string, serial uint16) ([]byte, error) {
	bcd, err := EncodeBCD(imei)
	if err != nil {
		return nil, err
	}

	// Length = Proto(1) + IMEI(8) + Serial(2) + CRC(2) = 13 (0x0D)
	frame := make([]byte, 18)
	frame[0] = StartByte1
	frame[1] = StartByte2
	frame[2] = 0x0D
	frame[3] = ProtoLogin
	copy(frame[4:12], bcd)
	binary.BigEndian.PutUint16(frame[12:14], serial)

	crc := ComputeCRC(frame[2:14])
	binary.BigEndian.PutUint16(frame[14:16], crc)
	frame[16] = StopByte1
	frame[17] = StopByte2

	return frame, nil
}

// BuildLocationPacket creates a valid GT06 GPS Location packet (0x22).
func BuildLocationPacket(t time.Time, lat, lng, speed, heading float64, ignition bool, serial uint16) []byte {
	// 32-byte packet
	// Length = 31 (0x1F) from proto to serial + crc
	frame := make([]byte, 36)
	frame[0] = StartByte1
	frame[1] = StartByte2
	frame[2] = 0x1F // Length = 31 bytes
	frame[3] = ProtoGPSLocation

	// Timestamp (UTC)
	utc := t.UTC()
	frame[4] = byte(utc.Year() % 100)
	frame[5] = byte(utc.Month())
	frame[6] = byte(utc.Day())
	frame[7] = byte(utc.Hour())
	frame[8] = byte(utc.Minute())
	frame[9] = byte(utc.Second())

	// Satellites
	frame[10] = 0xCF // 12 GPS len, 15 satellites

	// Latitude fixed-point
	absLat := lat
	var statusByte byte = 0x20 // GPS real-time
	if lat < 0 {
		absLat = -lat
		statusByte |= 0x08 // South
	}
	latRaw := uint32(absLat * 1800000.0)
	binary.BigEndian.PutUint32(frame[11:15], latRaw)

	// Longitude fixed-point
	absLng := lng
	if lng < 0 {
		absLng = -lng
		statusByte |= 0x04 // West
	}
	lngRaw := uint32(absLng * 1800000.0)
	binary.BigEndian.PutUint32(frame[15:19], lngRaw)

	// Speed (km/h)
	frame[19] = byte(speed)

	// Course (lower 10 bits) + Status flags
	courseRaw := uint16(heading) & 0x03FF
	courseRaw |= (uint16(statusByte) << 8)
	binary.BigEndian.PutUint16(frame[20:22], courseRaw)

	// Terminal Info / ACC status
	if ignition {
		frame[21] |= 0x02 // ACC On
		frame[23] = 0x02
	} else {
		frame[23] = 0x00
	}

	// LBS info filler bytes [24:30]
	frame[24] = 0x01
	frame[25] = 0xCC
	frame[26] = 0x00
	frame[27] = 0x28
	frame[28] = 0x7D
	frame[29] = 0x00

	// Serial number
	binary.BigEndian.PutUint16(frame[30:32], serial)

	// CRC
	crc := ComputeCRC(frame[2:32])
	binary.BigEndian.PutUint16(frame[32:34], crc)

	frame[34] = StopByte1
	frame[35] = StopByte2

	return frame
}

// BuildHeartbeatPacket creates a valid GT06 Heartbeat packet (0x13).
func BuildHeartbeatPacket(terminalInfo, voltage, gsm uint8, serial uint16) []byte {
	// Frame: Start(2) + Length(1) + Proto(1) + Info(1) + Volt(1) + GSM(1) + Serial(2) + CRC(2) + Stop(2) = 13 bytes
	// Length from proto to serial + CRC = 1 + 1 + 1 + 1 + 2 + 2 = 8 (0x08)
	frame := make([]byte, 13)
	frame[0] = StartByte1
	frame[1] = StartByte2
	frame[2] = 0x08
	frame[3] = ProtoHeartbeat
	frame[4] = terminalInfo
	frame[5] = voltage
	frame[6] = gsm
	binary.BigEndian.PutUint16(frame[7:9], serial)

	crc := ComputeCRC(frame[2:9])
	binary.BigEndian.PutUint16(frame[9:11], crc)

	frame[11] = StopByte1
	frame[12] = StopByte2

	return frame
}
