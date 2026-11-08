package gt06

// ComputeCRC calculates the standard GT06 CRC-16/X-25 (CRC-ITU) checksum.
// Polynomial: 0x8408 (bit-reversed 0x1021)
// Initial value: 0xFFFF
// Final XOR: 0xFFFF
func ComputeCRC(data []byte) uint16 {
	crc := uint16(0xFFFF)
	for _, b := range data {
		crc ^= uint16(b)
		for i := 0; i < 8; i++ {
			if (crc & 0x0001) != 0 {
				crc = (crc >> 1) ^ 0x8408
			} else {
				crc >>= 1
			}
		}
	}
	return ^crc & 0xFFFF
}

// VerifyCRC validates that the 2-byte CRC at the end of the packet payload matches ComputeCRC.
func VerifyCRC(packet []byte) bool {
	// Minimum GT06 packet: Start(2) + Length(1) + Proto(1) + Serial(2) + CRC(2) + Stop(2) = 10 bytes
	if len(packet) < 10 {
		return false
	}

	// In GT06, CRC covers from Length byte (index 2) up to right before CRC (len - 4)
	crcData := packet[2 : len(packet)-4]
	expectedCRC := (uint16(packet[len(packet)-4]) << 8) | uint16(packet[len(packet)-3])
	actualCRC := ComputeCRC(crcData)

	return expectedCRC == actualCRC
}
