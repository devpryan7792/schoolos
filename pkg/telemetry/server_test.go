package telemetry

import (
	"encoding/hex"
	"io"
	"net"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/schoolos/schoolos/pkg/gt06"
)

func TestTelemetryTCPServerE2E(t *testing.T) {
	// Bind on dynamic port for parallel testing
	server := NewTelemetryServer("127.0.0.1:0", nil)

	testIMEI := "352387082002457"
	testVehicleID := uuid.New()
	server.RegisterVehicleMapping(testIMEI, testVehicleID)

	if err := server.Start(); err != nil {
		t.Fatalf("failed to start server: %v", err)
	}
	defer server.Stop()

	serverAddr := server.listener.Addr().String()

	// Dial TCP client
	conn, err := net.Dial("tcp", serverAddr)
	if err != nil {
		t.Fatalf("failed to connect to server: %v", err)
	}
	defer conn.Close()

	// 1. Send Login Frame
	loginPkt, err := gt06.BuildLoginPacket(testIMEI, 1)
	if err != nil {
		t.Fatalf("failed to build login packet: %v", err)
	}

	if _, err := conn.Write(loginPkt); err != nil {
		t.Fatalf("failed to write login packet: %v", err)
	}

	// Read Login ACK from server
	ackBuf := make([]byte, 10)
	_ = conn.SetReadDeadline(time.Now().Add(2 * time.Second))
	if _, err := io.ReadFull(conn, ackBuf); err != nil {
		t.Fatalf("failed to read login ACK: %v", err)
	}

	if !gt06.VerifyCRC(ackBuf) {
		t.Errorf("login ACK CRC failed: hex=%s", hex.EncodeToString(ackBuf))
	}
	if ackBuf[3] != gt06.ProtoLogin {
		t.Errorf("expected ACK protocol 0x01, got 0x%02X", ackBuf[3])
	}

	// 2. Send Heartbeat Frame
	hbFrame := gt06.BuildHeartbeatPacket(0x01, 0x04, 0x03, 2)

	if _, err := conn.Write(hbFrame); err != nil {
		t.Fatalf("failed to write heartbeat: %v", err)
	}

	hbAckBuf := make([]byte, 10)
	_ = conn.SetReadDeadline(time.Now().Add(2 * time.Second))
	if _, err := io.ReadFull(conn, hbAckBuf); err != nil {
		t.Fatalf("failed to read heartbeat ACK: %v", err)
	}
	if hbAckBuf[3] != gt06.ProtoHeartbeat {
		t.Errorf("expected heartbeat ACK protocol 0x13, got 0x%02X", hbAckBuf[3])
	}

	// 3. Resilience Test (Invariant 4):
	// Inject corrupt garbage noise directly into the live TCP socket
	garbage := []byte{0xDE, 0xAD, 0xBE, 0xEF, 0x78, 0x00, 0x12, 0x34, 0x56, 0x78}
	if _, err := conn.Write(garbage); err != nil {
		t.Fatalf("failed to write garbage bytes: %v", err)
	}

	// 4. Immediately send valid Location Packet right after garbage
	locPkt := gt06.BuildLocationPacket(time.Now(), 23.3441, 85.3095, 42.5, 135.0, true, 3)
	if _, err := conn.Write(locPkt); err != nil {
		t.Fatalf("failed to write location packet: %v", err)
	}

	// Sleep briefly to allow server processing
	time.Sleep(100 * time.Millisecond)

	// Verify socket is STILL OPEN and operational!
	// Send another heartbeat to verify two-way communication survived without disconnection
	if _, err := conn.Write(hbFrame); err != nil {
		t.Fatalf("connection was dropped after malformed frame! Invariant 4 violated: %v", err)
	}

	_ = conn.SetReadDeadline(time.Now().Add(2 * time.Second))
	if _, err := io.ReadFull(conn, hbAckBuf); err != nil {
		t.Fatalf("failed to receive ACK on retained socket: %v", err)
	}
}
