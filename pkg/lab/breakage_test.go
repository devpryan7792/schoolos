package lab

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

func TestBreakagePenaltyCautionDeduction(t *testing.T) {
	incident := BreakageIncident{
		IncidentID:      uuid.New(),
		StudentID:       uuid.New(),
		StudentName:     "Aarav Sharma",
		AdmissionNumber: "DPS-2024-042",
		AssetBarcode:    "LAB-PHY-MIC-04",
		AssetName:       "Compound Monocular Microscope Lens",
		Category:        LabPhysics,
		DamageDetails:   "Eyepiece lens cracked during optics experiment",
		ReplacementCost: decimal.NewFromFloat(850.00),
		SupervisorName:  "Mr. P. K. Mishra",
		CreatedAt:       time.Now(),
	}

	// Case 1: Student has ₹5,000 caution deposit -> Deduct ₹850 directly
	cautionDeposit := decimal.NewFromFloat(5000.00)
	res1, err := ProcessBreakagePenalty(incident, cautionDeposit)
	if err != nil {
		t.Fatalf("Unexpected error processing penalty: %v", err)
	}

	if res1.SettlementMode != "CAUTION_MONEY_DEDUCTION" {
		t.Fatalf("Expected CAUTION_MONEY_DEDUCTION, got: %s", res1.SettlementMode)
	}
	expectedRemaining := decimal.NewFromFloat(4150.00)
	if !res1.RemainingCaution.Equal(expectedRemaining) {
		t.Fatalf("Expected ₹4,150 remaining caution, got: %s", res1.RemainingCaution)
	}

	// Case 2: Student has ₹500 caution deposit (< ₹850 cost) -> Route to next invoice billing
	smallCaution := decimal.NewFromFloat(500.00)
	res2, err := ProcessBreakagePenalty(incident, smallCaution)
	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}

	if res2.SettlementMode != "INVOICE_BILLING" {
		t.Fatalf("Expected INVOICE_BILLING, got: %s", res2.SettlementMode)
	}
	if res2.InvoiceLineItem == "" {
		t.Fatal("Expected invoice line item description for fee billing")
	}
}
