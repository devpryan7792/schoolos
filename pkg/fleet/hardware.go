package fleet

import (
	"fmt"
	"strings"
)

type TelecomCarrier string

const (
	CarrierAirtel TelecomCarrier = "AIRTEL_IOT"
	CarrierJio    TelecomCarrier = "JIO_4G"
	CarrierVi     TelecomCarrier = "VI_BUSINESS"
	CarrierBSNL   TelecomCarrier = "BSNL_M2M"
)

type ST901LProvisioningConfig struct {
	DeviceIMEI            string
	VehicleRegistration   string
	SimCarrier            TelecomCarrier
	ServerHostOrIP        string
	ServerPort            int
	ActiveUploadSecs      int
	StationaryUploadSecs  int
	AdminPhoneNumber      string
	DevicePassword        string // default: "123456"
}

type ProvisioningCommand struct {
	StepNumber  int    `json:"step_number"`
	Purpose     string `json:"purpose"`
	SMSCommand  string `json:"sms_command"`
	ExpectedAck string `json:"expected_ack"`
}

// GenerateSinoTrackSMSSequence builds the official SMS configuration string pipeline for SinoTrack ST-901L / ST-902
func GenerateSinoTrackSMSSequence(cfg ST901LProvisioningConfig) []ProvisioningCommand {
	pwd := cfg.DevicePassword
	if pwd == "" {
		pwd = "123456"
	}
	if cfg.ServerPort <= 0 {
		cfg.ServerPort = 5023
	}
	if cfg.ActiveUploadSecs <= 0 {
		cfg.ActiveUploadSecs = 10
	}
	if cfg.StationaryUploadSecs <= 0 {
		cfg.StationaryUploadSecs = 60
	}

	apn := "airteliot.com"
	switch cfg.SimCarrier {
	case CarrierJio:
		apn = "jionet"
	case CarrierVi:
		apn = "www"
	case CarrierBSNL:
		apn = "bsnlnet"
	}

	commands := []ProvisioningCommand{
		{
			StepNumber:  1,
			Purpose:     "Set Master Admin Phone Number for Authorization",
			SMSCommand:  fmt.Sprintf("admin%s %s", pwd, strings.ReplaceAll(cfg.AdminPhoneNumber, " ", "")),
			ExpectedAck: "admin ok",
		},
		{
			StepNumber:  2,
			Purpose:     "Configure Cellular IoT APN Gateway",
			SMSCommand:  fmt.Sprintf("apn%s %s", pwd, apn),
			ExpectedAck: "apn ok",
		},
		{
			StepNumber:  3,
			Purpose:     "Bind SchoolOS GT06 Binary Telemetry Server Host & Port",
			SMSCommand:  fmt.Sprintf("8050000 %s %d", cfg.ServerHostOrIP, cfg.ServerPort),
			ExpectedAck: "set ip ok",
		},
		{
			StepNumber:  4,
			Purpose:     "Set Active Movement Upload Interval (10s)",
			SMSCommand:  fmt.Sprintf("upload%s %d", pwd, cfg.ActiveUploadSecs),
			ExpectedAck: "upload ok",
		},
		{
			StepNumber:  5,
			Purpose:     "Set IST (UTC+05:30) Hardware Clock Alignment",
			SMSCommand:  "8960000E0530",
			ExpectedAck: "set time ok",
		},
		{
			StepNumber:  6,
			Purpose:     "Request Hardware Status & GSM/GPS Diagnostic Check",
			SMSCommand:  "CXZT",
			ExpectedAck: "BAT:... GPS:OK GSM:OK IP:...",
		},
	}

	return commands
}
