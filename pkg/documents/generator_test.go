package documents

import (
	"strings"
	"testing"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

func TestCR80CardSVGGeneration(t *testing.T) {
	card := StudentIDCard{
		CardID:            "CARD-001",
		SchoolName:        "Delhi Public School, Ranchi",
		SchoolAffiliation: "CBSE Affiliation No: 3430152",
		StudentID:         uuid.New(),
		AdmissionNumber:   "DPS-2024-042",
		FullName:          "Aarav Sharma",
		ClassName:         "Class 5",
		SectionName:       "A",
		DateOfBirth:       "15/07/2014",
		BloodGroup:        "O+",
		GuardianName:      "Rajesh Sharma",
		EmergencyPhone:    "+91 98765 43210",
		ValidUntil:        "March 2027",
	}

	svg := GenerateCR80CardSVG(card)
	if !strings.Contains(svg, "Aarav Sharma") {
		t.Fatal("Expected student name in SVG output")
	}
	if !strings.Contains(svg, "BLOOD: O+") {
		t.Fatal("Expected blood group in SVG output")
	}
	if !strings.Contains(svg, "DPS-2024-042") {
		t.Fatal("Expected admission number in SVG output")
	}
}

func TestAdmitCardFeeLockRule(t *testing.T) {
	timetable := []ExamScheduleItem{
		{Subject: "Mathematics", Date: "2026-12-01", TimeSlot: "09:00 - 12:00", RoomNo: "104"},
		{Subject: "Science", Date: "2026-12-03", TimeSlot: "09:00 - 12:00", RoomNo: "106"},
	}

	// 1. With outstanding fee dues (₹4,200.00) -> Must be locked
	lockedCard := GenerateAdmitCard(
		"Half-Yearly Examination 2026",
		"Aarav Sharma", "DPS-2024-042", "Class 5", "A", "501", "Campus Center A",
		decimal.NewFromFloat(4200.00),
		"school@icici",
		timetable,
	)

	if !lockedCard.IsLocked {
		t.Fatal("Expected admit card to be locked due to ₹4200 fee dues")
	}
	if !strings.Contains(lockedCard.LockReason, "FEES DUE - ₹4200.00 OUTSTANDING") {
		t.Fatalf("Unexpected lock reason: %s", lockedCard.LockReason)
	}
	if !strings.Contains(lockedCard.UPIUnlockURL, "am=4200.00") {
		t.Fatalf("Expected dynamic UPI unlock URL, got: %s", lockedCard.UPIUnlockURL)
	}

	// 2. With zero fee dues -> Must be unlocked and clean
	cleanCard := GenerateAdmitCard(
		"Half-Yearly Examination 2026",
		"Aarav Sharma", "DPS-2024-042", "Class 5", "A", "501", "Campus Center A",
		decimal.Zero,
		"school@icici",
		timetable,
	)

	if cleanCard.IsLocked {
		t.Fatal("Expected clean admit card to be unlocked")
	}
	if cleanCard.LockReason != "" {
		t.Fatalf("Clean card should have empty lock reason, got: %s", cleanCard.LockReason)
	}
}

func TestTransferCertificateClearanceGate(t *testing.T) {
	subjects := []string{"English", "Hindi", "Mathematics", "Science", "Social Science"}

	// 1. Failing clearance (1 library book pending and ₹350 lab damage)
	blockedClearances := Clearances{
		LibraryPendingBooks: 1,
		LabBreakageDues:     decimal.NewFromFloat(350.00),
		OutstandingFees:     decimal.Zero,
	}

	_, err := IssueTransferCertificate(
		"DPS-2024-042", "Aarav Sharma", "Sunita Sharma", "Rajesh Sharma",
		"15/07/2014", "Class 10",
		subjects,
		blockedClearances,
	)

	if err == nil {
		t.Fatal("Expected error when clearances are unmet, but got nil")
	}
	if !strings.Contains(err.Error(), "CLEARANCE_BLOCKED") {
		t.Fatalf("Expected CLEARANCE_BLOCKED error, got: %v", err)
	}

	// 2. All 3 clearances satisfied (0 books, 0 lab dues, 0 fee dues)
	approvedClearances := Clearances{
		LibraryPendingBooks: 0,
		LabBreakageDues:     decimal.Zero,
		OutstandingFees:     decimal.Zero,
	}

	tc, err := IssueTransferCertificate(
		"DPS-2024-042", "Aarav Sharma", "Sunita Sharma", "Rajesh Sharma",
		"15/07/2014", "Class 10",
		subjects,
		approvedClearances,
	)

	if err != nil {
		t.Fatalf("Expected successful TC issuance, got: %v", err)
	}
	if !tc.IsApproved {
		t.Fatal("Expected TC to be approved")
	}
	if tc.VerificationHash == "" {
		t.Fatal("Expected cryptographic verification hash on issued TC")
	}
}
