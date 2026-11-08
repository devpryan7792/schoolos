package gt06

import (
	"bytes"
	"encoding/hex"
	"math"
	"testing"
	"time"
)

func TestCRCVerification(t *testing.T) {
	// Sample ACK frame from API_CONTRACTS.md:
	// 78 78 05 01 00 01 D9 DC 0D 0A
	ackHex := "787805010001D9DC0D0A"
	ackBytes, err := hex.DecodeString(ackHex)
	if err != nil {
		t.Fatalf("failed to decode sample hex: %v", err)
	}

	if !VerifyCRC(ackBytes) {
		t.Errorf("expected CRC to verify on sample ACK packet %s", ackHex)
	}

	// Corrupting one byte must fail CRC
	ackBytes[4] ^= 0xFF
	if VerifyCRC(ackBytes) {
		t.Errorf("corrupted packet unexpectedly passed CRC verification")
	}
}

func TestBuildLoginAck(t *testing.T) {
	serial := uint16(1)
	ack := BuildLoginAck(serial)

	expectedHex := "787805010001d9dc0d0a"
	actualHex := hex.EncodeToString(ack)
	if actualHex != expectedHex {
		t.Errorf("BuildLoginAck mismatch: expected %s, got %s", expectedHex, actualHex)
	}

	if !VerifyCRC(ack) {
		t.Errorf("BuildLoginAck output failed VerifyCRC")
	}
}

func TestLoginPacketEncodeDecode(t *testing.T) {
	imei := "352387082002457"
	serial := uint16(42)

	pktBytes, err := BuildLoginPacket(imei, serial)
	if err != nil {
		t.Fatalf("failed to build login packet: %v", err)
	}

	parsed, err := ParseFrame(pktBytes)
	if err != nil {
		t.Fatalf("failed to parse login packet: %v", err)
	}

	loginPkt, ok := parsed.(*LoginPacket)
	if !ok {
		t.Fatalf("expected *LoginPacket, got %T", parsed)
	}

	if loginPkt.IMEI != imei {
		t.Errorf("expected IMEI %s, got %s", imei, loginPkt.IMEI)
	}
	if loginPkt.SerialNumber() != serial {
		t.Errorf("expected serial %d, got %d", serial, loginPkt.SerialNumber())
	}
}

func TestLocationPacketFixedPointAndDirection(t *testing.T) {
	// Ranchi coordinates: 23.3441° N, 85.3095° E
	now := time.Date(2026, 11, 8, 9, 30, 0, 0, time.UTC)
	lat := 23.3441
	lng := 85.3095
	speed := 35.0
	heading := 142.0
	ignition := true
	serial := uint16(101)

	pktBytes := BuildLocationPacket(now, lat, lng, speed, heading, ignition, serial)

	parsed, err := ParseFrame(pktBytes)
	if err != nil {
		t.Fatalf("failed to parse location packet: %v", err)
	}

	locPkt, ok := parsed.(*LocationPacket)
	if !ok {
		t.Fatalf("expected *LocationPacket, got %T", parsed)
	}

	// Check latitude accuracy to within 0.0001 degrees
	if math.Abs(locPkt.Latitude-lat) > 0.0005 {
		t.Errorf("latitude deviation too large: expected %f, got %f", lat, locPkt.Latitude)
	}
	// Check longitude accuracy to within 0.0001 degrees
	if math.Abs(locPkt.Longitude-lng) > 0.0005 {
		t.Errorf("longitude deviation too large: expected %f, got %f", lng, locPkt.Longitude)
	}

	if locPkt.SpeedKmh != speed {
		t.Errorf("expected speed %f, got %f", speed, locPkt.SpeedKmh)
	}

	if math.Abs(locPkt.HeadingDeg-heading) > 1.0 {
		t.Errorf("expected heading %f, got %f", heading, locPkt.HeadingDeg)
	}

	if !locPkt.IgnitionOn {
		t.Errorf("expected ignition to be ON")
	}
}

func TestStreamFramerResilience(t *testing.T) {
	// Create a stream with:
	// [Garbage bytes] + [Valid Login Frame] + [Garbage noise] + [Valid Location Frame]
	loginPkt, err := BuildLoginPacket("352387082002457", 1)
	if err != nil {
		t.Fatalf("failed to build login: %v", err)
	}

	locPkt := BuildLocationPacket(time.Now(), 23.3441, 85.3095, 30.0, 90.0, true, 2)

	var stream bytes.Buffer
	// Random noise prefix
	stream.Write([]byte{0x00, 0xFF, 0xAA, 0x55, 0x78, 0x01, 0x02})
	// Valid login packet
	stream.Write(loginPkt)
	// Random noise middle
	stream.Write([]byte{0xDE, 0xAD, 0xBE, 0xEF, 0x78, 0x78, 0x01, 0x00})
	// Valid location packet
	stream.Write(locPkt)

	loggedErrors := 0
	framer := NewStreamFramer(&stream, func(msg string, malformedBytes []byte) {
		loggedErrors++
	})

	// Frame 1 should be the Login packet
	p1, _, err := framer.ReadNextFrame()
	if err != nil {
		t.Fatalf("failed to read frame 1: %v", err)
	}
	login, ok := p1.(*LoginPacket)
	if !ok || login.IMEI != "352387082002457" {
		t.Fatalf("expected login packet, got %v", p1)
	}

	// Frame 2 should be the Location packet
	p2, _, err := framer.ReadNextFrame()
	if err != nil {
		t.Fatalf("failed to read frame 2: %v", err)
	}
	loc, ok := p2.(*LocationPacket)
	if !ok || loc.SpeedKmh != 30.0 {
		t.Fatalf("expected location packet, got %v", p2)
	}

	if loggedErrors == 0 {
		t.Errorf("expected framer to log noise/garbage resilience events")
	}
}
