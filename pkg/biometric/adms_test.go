package biometric

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestADMSHandshakeAndPunches(t *testing.T) {
	policy := DefaultSchoolShiftPolicy()

	// 1. GET Handshake
	getReq := httptest.NewRequest(http.MethodGet, "/iclock/cdata?SN=ESSL-ZK-100234&options=all", nil)
	rrGet := httptest.NewRecorder()

	_, err := HandleADMSRequest(rrGet, getReq, policy)
	if err != nil {
		t.Fatalf("Failed GET handshake: %v", err)
	}
	if !strings.Contains(rrGet.Body.String(), "GET OPTION FROM: ESSL-ZK-100234") {
		t.Fatalf("Expected handshake config response, got: %s", rrGet.Body.String())
	}

	// 2. POST Punch Upload: 3 Punches (1 on-time, 2 late)
	rawPunches := `101	2026-11-08 08:05:12	0	1
102	2026-11-08 08:24:35	0	20
103	2026-11-08 08:35:00	0	1`

	postReq := httptest.NewRequest(http.MethodPost, "/iclock/cdata?SN=ESSL-ZK-100234&table=ATTLOG", strings.NewReader(rawPunches))
	rrPost := httptest.NewRecorder()

	count, err := HandleADMSRequest(rrPost, postReq, policy)
	if err != nil {
		t.Fatalf("Failed POST punch ingest: %v", err)
	}
	if count != 3 {
		t.Fatalf("Expected 3 punches, got %d", count)
	}
	if rrPost.Body.String() != "OK: 3" {
		t.Fatalf("Expected 'OK: 3' ACK, got: %s", rrPost.Body.String())
	}

	// Test punch details
	punches, _ := ParseADMSPunches("ESSL-ZK-100234", rawPunches, policy)
	if len(punches) != 3 {
		t.Fatalf("Expected 3 parsed punches, got %d", len(punches))
	}

	// 101 arrived at 08:05:12 (within 15 min grace period) -> NOT LATE
	if punches[0].IsLate {
		t.Fatal("Punch 101 (08:05) should NOT be marked as late")
	}

	// 102 arrived at 08:24:35 (after 08:15) -> LATE
	if !punches[1].IsLate || punches[1].LateMinutes != 24 {
		t.Fatalf("Punch 102 should be marked late with 24 min delay, got %v (%d mins)", punches[1].IsLate, punches[1].LateMinutes)
	}

	// 103 arrived at 08:35:00 -> LATE
	if !punches[2].IsLate || punches[2].LateMinutes != 35 {
		t.Fatalf("Punch 103 should be marked late with 35 min delay, got %v (%d mins)", punches[2].IsLate, punches[2].LateMinutes)
	}
}

func TestLatePenaltyDeductions(t *testing.T) {
	staffID := uuid.New()

	// 4 late check-ins in the month
	punches := []BiometricPunch{
		{UserPIN: "101", Timestamp: time.Date(2026, 11, 2, 8, 25, 0, 0, time.UTC), PunchType: PunchCheckIn, IsLate: true},
		{UserPIN: "101", Timestamp: time.Date(2026, 11, 3, 8, 20, 0, 0, time.UTC), PunchType: PunchCheckIn, IsLate: true},
		{UserPIN: "101", Timestamp: time.Date(2026, 11, 4, 8, 30, 0, 0, time.UTC), PunchType: PunchCheckIn, IsLate: true},
		{UserPIN: "101", Timestamp: time.Date(2026, 11, 5, 8, 18, 0, 0, time.UTC), PunchType: PunchCheckIn, IsLate: true},
		{UserPIN: "101", Timestamp: time.Date(2026, 11, 6, 8, 10, 0, 0, time.UTC), PunchType: PunchCheckIn, IsLate: false},
	}

	lateCount, halfDays := ComputeLateClockInPenalties(staffID, punches)
	if lateCount != 4 {
		t.Fatalf("Expected 4 late check-ins, got %d", lateCount)
	}
	// 4 late / 3 = 1 half-day deduction
	if halfDays != 1 {
		t.Fatalf("Expected 1 half-day deduction, got %d", halfDays)
	}
}
