package main

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestAcademicsAndOperationsAPI(t *testing.T) {
	server := NewServer(nil, nil, "test_jwt_secret")

	// 1. Academics Marksheet
	req1 := httptest.NewRequest(http.MethodGet, "/v1/academics/marksheets/d1a80101-0000-0000-0000-000000000001", nil)
	rr1 := httptest.NewRecorder()
	server.StudentMarksheetHandler(rr1, req1)

	if rr1.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for marksheet, got %d", rr1.Code)
	}
	if !strings.Contains(rr1.Body.String(), "Aarav Sharma") || !strings.Contains(rr1.Body.String(), "A2") {
		t.Fatalf("Expected Aarav Sharma and A2 overall grade, got: %s", rr1.Body.String())
	}

	// 2. Library Circulation
	req2 := httptest.NewRequest(http.MethodGet, "/v1/library/circulation/student/d1a80101-0000-0000-0000-000000000001", nil)
	rr2 := httptest.NewRecorder()
	server.LibraryStudentCirculationHandler(rr2, req2)

	if rr2.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for library, got %d", rr2.Code)
	}
	if !strings.Contains(rr2.Body.String(), "Effective Java") || !strings.Contains(rr2.Body.String(), "total_overdue_fee") {
		t.Fatalf("Expected library book loan details, got: %s", rr2.Body.String())
	}

	// 3. Lab Apparatus Breakage Report
	labPayload := `{
		"student_id": "d1a80101-0000-0000-0000-000000000001",
		"student_name": "Aarav Sharma",
		"admission_number": "DPS-2024-042",
		"asset_barcode": "LAB-PHY-MIC-04",
		"asset_name": "Compound Microscope Eyepiece",
		"category": "PHYSICS",
		"damage_details": "Dropped during focal measurement",
		"replacement_cost": 850.00,
		"supervisor_name": "Mr. Mishra"
	}`
	req3 := httptest.NewRequest(http.MethodPost, "/v1/lab/breakage/report", bytes.NewReader([]byte(labPayload)))
	req3.Header.Set("Content-Type", "application/json")
	rr3 := httptest.NewRecorder()
	server.LabBreakageReportHandler(rr3, req3)

	if rr3.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for lab breakage report, got %d: %s", rr3.Code, rr3.Body.String())
	}
	if !strings.Contains(rr3.Body.String(), "CAUTION_MONEY_DEDUCTION") || !strings.Contains(rr3.Body.String(), "4150") {
		t.Fatalf("Expected caution money deduction, got: %s", rr3.Body.String())
	}

	// 4. SinoTrack Hardware Provisioning SMS
	fleetPayload := `{
		"device_imei": "867204040123456",
		"vehicle_registration": "JH01-DB-4022",
		"carrier": "AIRTEL_IOT",
		"server_host_or_ip": "iot.schoolos.in",
		"server_port": 5023,
		"admin_phone_number": "+919431100223"
	}`
	req4 := httptest.NewRequest(http.MethodPost, "/v1/fleet/hardware/provisioning-sms", bytes.NewReader([]byte(fleetPayload)))
	req4.Header.Set("Content-Type", "application/json")
	rr4 := httptest.NewRecorder()
	server.FleetHardwareProvisioningHandler(rr4, req4)

	if rr4.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for hardware provisioning, got %d", rr4.Code)
	}
	if !strings.Contains(rr4.Body.String(), "8050000 iot.schoolos.in 5023") || !strings.Contains(rr4.Body.String(), "airteliot.com") {
		t.Fatalf("Expected SinoTrack SMS provisioning commands, got: %s", rr4.Body.String())
	}
}
