package dunning

import (
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

func TestDunningStateTransitions(t *testing.T) {
	dueDate := time.Date(2026, 11, 10, 0, 0, 0, 0, time.UTC)
	dueAmount := decimal.NewFromFloat(4200.00)

	// 1. Upcoming due (5 days prior: Nov 5)
	state1 := ComputeDunningState(dueDate, dueAmount, time.Date(2026, 11, 5, 0, 0, 0, 0, time.UTC))
	if state1 != StateUpcomingDue {
		t.Fatalf("Expected %s, got %s", StateUpcomingDue, state1)
	}

	// 2. Due Date Today (Nov 10)
	state2 := ComputeDunningState(dueDate, dueAmount, time.Date(2026, 11, 10, 0, 0, 0, 0, time.UTC))
	if state2 != StateDueDateToday {
		t.Fatalf("Expected %s, got %s", StateDueDateToday, state2)
	}

	// 3. Grace Period (Nov 12: +2 days)
	state3 := ComputeDunningState(dueDate, dueAmount, time.Date(2026, 11, 12, 0, 0, 0, 0, time.UTC))
	if state3 != StateGracePeriod {
		t.Fatalf("Expected %s, got %s", StateGracePeriod, state3)
	}

	// 4. Dunning Stage 1 (Nov 15: +5 days)
	state4 := ComputeDunningState(dueDate, dueAmount, time.Date(2026, 11, 15, 0, 0, 0, 0, time.UTC))
	if state4 != StateDunningStage1 {
		t.Fatalf("Expected %s, got %s", StateDunningStage1, state4)
	}

	// 5. Dunning Stage 2 (Nov 19: +9 days)
	state5 := ComputeDunningState(dueDate, dueAmount, time.Date(2026, 11, 19, 0, 0, 0, 0, time.UTC))
	if state5 != StateDunningStage2 {
		t.Fatalf("Expected %s, got %s", StateDunningStage2, state5)
	}

	// 6. Late Fee Levied (Nov 25: +15 days)
	state6 := ComputeDunningState(dueDate, dueAmount, time.Date(2026, 11, 25, 0, 0, 0, 0, time.UTC))
	if state6 != StateLateFeeLevied {
		t.Fatalf("Expected %s, got %s", StateLateFeeLevied, state6)
	}

	// 7. Exam Admit Card Locked (Dec 20: +40 days)
	state7 := ComputeDunningState(dueDate, dueAmount, time.Date(2026, 12, 20, 0, 0, 0, 0, time.UTC))
	if state7 != StateAdmitCardLocked {
		t.Fatalf("Expected %s, got %s", StateAdmitCardLocked, state7)
	}

	// 8. Settled (0 due)
	state8 := ComputeDunningState(dueDate, decimal.Zero, time.Date(2026, 11, 15, 0, 0, 0, 0, time.UTC))
	if state8 != StateSettled {
		t.Fatalf("Expected %s, got %s", StateSettled, state8)
	}
}

func TestDunningMessageAndUPILink(t *testing.T) {
	plan := DunningPlan{
		InvoiceID:       uuid.New(),
		StudentID:       uuid.New(),
		StudentName:     "Aarav Sharma",
		AdmissionNumber: "DPS-2024-042",
		GuardianName:    "Rajesh Sharma",
		GuardianPhone:   "919876543210",
		DueDate:         time.Date(2026, 11, 10, 0, 0, 0, 0, time.UTC),
		GrossAmount:     decimal.NewFromFloat(4500.00),
		LateFeeAmount:   decimal.NewFromFloat(200.00),
		CurrentDues:     decimal.NewFromFloat(4200.00),
		CurrentState:    StateDunningStage2,
	}

	headline, msg, upi := FormatDunningMessage(plan, "school@icici", "Delhi Public School")

	if !strings.Contains(headline, "Final Notice") {
		t.Fatalf("Expected 'Final Notice' in headline, got: %s", headline)
	}
	if !strings.Contains(msg, "₹200.00 late fee") {
		t.Fatalf("Expected late fee disclosure in message, got: %s", msg)
	}
	if !strings.Contains(upi, "am=4200.00") || !strings.Contains(upi, "pa=school@icici") {
		t.Fatalf("Expected valid UPI parameters, got: %s", upi)
	}
}

func TestDropoutRiskEvaluation(t *testing.T) {
	// 5 days absent -> High risk
	risk1, reason1 := EvaluateDropoutRisk(5, 5.0)
	if !risk1 || !strings.Contains(reason1, "Critical Attendance Risk") {
		t.Fatalf("Expected attendance risk flagged, got: %v, %s", risk1, reason1)
	}

	// 25% score drop -> High risk
	risk2, reason2 := EvaluateDropoutRisk(1, 25.0)
	if !risk2 || !strings.Contains(reason2, "Academic Attrition Risk") {
		t.Fatalf("Expected academic risk flagged, got: %v, %s", risk2, reason2)
	}

	// Normal student
	risk3, _ := EvaluateDropoutRisk(1, 4.0)
	if risk3 {
		t.Fatal("Normal student should not be flagged as dropout risk")
	}
}

func TestPrincipalMorningDigest(t *testing.T) {
	digest := GeneratePrincipalDigest(
		decimal.NewFromFloat(184200.00),
		4, 45,      // 4 absent out of 45 staff
		1150, 1200, // 1150 present out of 1200 students (95.8%)
		11, 12,     // 11 active buses out of 12
		2,          // 2 at-risk students
	)

	if !digest.YesterdayFeeCollected.Equal(decimal.NewFromFloat(184200.00)) {
		t.Fatalf("Unexpected fee collection total: %s", digest.YesterdayFeeCollected)
	}
	if len(digest.CriticalAlerts) != 3 {
		t.Fatalf("Expected 3 critical operational alerts, got %d", len(digest.CriticalAlerts))
	}
}
