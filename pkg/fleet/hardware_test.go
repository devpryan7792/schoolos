package fleet

import (
	"strings"
	"testing"
)

func TestSinoTrackProvisioningSMSCommands(t *testing.T) {
	cfg := ST901LProvisioningConfig{
		DeviceIMEI:          "867204040123456",
		VehicleRegistration: "JH01-DB-4022",
		SimCarrier:          CarrierAirtel,
		ServerHostOrIP:      "iot.schoolos.in",
		ServerPort:          5023,
		ActiveUploadSecs:    10,
		AdminPhoneNumber:    "+919431100223",
		DevicePassword:      "123456",
	}

	cmds := GenerateSinoTrackSMSSequence(cfg)
	if len(cmds) != 6 {
		t.Fatalf("Expected 6 provisioning SMS commands, got %d", len(cmds))
	}

	// Step 1: Admin bind
	if !strings.Contains(cmds[0].SMSCommand, "admin123456 +919431100223") {
		t.Fatalf("Step 1 admin mismatch: %s", cmds[0].SMSCommand)
	}

	// Step 2: Airtel APN
	if cmds[1].SMSCommand != "apn123456 airteliot.com" {
		t.Fatalf("Step 2 APN mismatch: %s", cmds[1].SMSCommand)
	}

	// Step 3: Server port 5023
	if !strings.Contains(cmds[2].SMSCommand, "8050000 iot.schoolos.in 5023") {
		t.Fatalf("Step 3 IP:Port binding mismatch: %s", cmds[2].SMSCommand)
	}

	// Step 4: 10s upload
	if cmds[3].SMSCommand != "upload123456 10" {
		t.Fatalf("Step 4 upload interval mismatch: %s", cmds[3].SMSCommand)
	}

	// Step 5: Timezone IST
	if cmds[4].SMSCommand != "8960000E0530" {
		t.Fatalf("Step 5 timezone mismatch: %s", cmds[4].SMSCommand)
	}
}
