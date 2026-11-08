package models

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

func TestBalancedDoubleEntryLedger(t *testing.T) {
	tenantID := uuid.New()
	schoolID := uuid.New()
	txID := uuid.New()
	accReceivable := uuid.New()
	accTuitionIncome := uuid.New()
	accTransportIncome := uuid.New()
	accConcessionExpense := uuid.New()

	// Invoicing Scenario:
	// Tuition Fee: ₹2,500.00
	// Transport Fee: ₹1,000.00
	// Concession Subsidy (Expense): ₹500.00
	// Student Receivable: ₹3,000.00
	// Total Debits: ₹3,000 + ₹500 = ₹3,500.00
	// Total Credits: ₹2,500 + ₹1,000 = ₹3,500.00
	entries := []LedgerEntry{
		{
			ID:            uuid.New(),
			TenantID:      tenantID,
			SchoolID:      schoolID,
			TransactionID: txID,
			AccountID:     accReceivable,
			Debit:         decimal.NewFromFloat(3000.00),
			Credit:        decimal.Zero,
			Narration:     "Student net dues for November 2026",
			CreatedAt:     time.Now(),
		},
		{
			ID:            uuid.New(),
			TenantID:      tenantID,
			SchoolID:      schoolID,
			TransactionID: txID,
			AccountID:     accConcessionExpense,
			Debit:         decimal.NewFromFloat(500.00),
			Credit:        decimal.Zero,
			Narration:     "Sibling discount subsidy",
			CreatedAt:     time.Now(),
		},
		{
			ID:            uuid.New(),
			TenantID:      tenantID,
			SchoolID:      schoolID,
			TransactionID: txID,
			AccountID:     accTuitionIncome,
			Debit:         decimal.Zero,
			Credit:        decimal.NewFromFloat(2500.00),
			Narration:     "November tuition fee income",
			CreatedAt:     time.Now(),
		},
		{
			ID:            uuid.New(),
			TenantID:      tenantID,
			SchoolID:      schoolID,
			TransactionID: txID,
			AccountID:     accTransportIncome,
			Debit:         decimal.Zero,
			Credit:        decimal.NewFromFloat(1000.00),
			Narration:     "November transport fee income",
			CreatedAt:     time.Now(),
		},
	}

	err := ValidateDoubleEntry(entries)
	if err != nil {
		t.Fatalf("expected balanced ledger to pass, got: %v", err)
	}
}

func TestUnbalancedLedgerRejection(t *testing.T) {
	tenantID := uuid.New()
	schoolID := uuid.New()
	txID := uuid.New()

	entries := []LedgerEntry{
		{
			ID:            uuid.New(),
			TenantID:      tenantID,
			SchoolID:      schoolID,
			TransactionID: txID,
			AccountID:     uuid.New(),
			Debit:         decimal.NewFromFloat(3000.00),
			Credit:        decimal.Zero,
			Narration:     "Debit entry",
			CreatedAt:     time.Now(),
		},
		{
			ID:            uuid.New(),
			TenantID:      tenantID,
			SchoolID:      schoolID,
			TransactionID: txID,
			AccountID:     uuid.New(),
			Debit:         decimal.Zero,
			Credit:        decimal.NewFromFloat(2500.00), // Off by ₹500!
			Narration:     "Unbalanced credit entry",
			CreatedAt:     time.Now(),
		},
	}

	err := ValidateDoubleEntry(entries)
	if err == nil {
		t.Fatal("expected error for unbalanced ledger entries, but got nil")
	}
}

func TestNegativeLedgerAmountRejection(t *testing.T) {
	txID := uuid.New()
	entries := []LedgerEntry{
		{
			TransactionID: txID,
			Debit:         decimal.NewFromFloat(-100.00),
			Credit:        decimal.Zero,
		},
		{
			TransactionID: txID,
			Debit:         decimal.Zero,
			Credit:        decimal.NewFromFloat(-100.00),
		},
	}

	err := ValidateDoubleEntry(entries)
	if err == nil {
		t.Fatal("expected error for negative ledger amounts, but got nil")
	}
}

func TestLineItemDiscountCalculation(t *testing.T) {
	tuitionHeadID := uuid.New()
	transportHeadID := uuid.New()

	// 25% discount applicable only to Tuition Head
	rules := []FeeConcessionRule{
		{
			Name:                 "Sibling 25% Waiver",
			Type:                 ConcessionPercentage,
			Value:                decimal.NewFromFloat(25.00),
			ApplicableFeeHeadIDs: []uuid.UUID{tuitionHeadID},
		},
	}

	// 1. Tuition discount: 2500 * 0.25 = 625.00
	tuitionBase := decimal.NewFromFloat(2500.00)
	tuitionDiscount := CalculateLineItemDiscount(tuitionBase, rules, tuitionHeadID)
	expectedTuitionDiscount := decimal.NewFromFloat(625.00)
	if !tuitionDiscount.Equal(expectedTuitionDiscount) {
		t.Errorf("tuition discount expected %s, got %s", expectedTuitionDiscount, tuitionDiscount)
	}

	// 2. Transport discount: must be 0 because transportHeadID is not in ApplicableFeeHeadIDs
	transportBase := decimal.NewFromFloat(1000.00)
	transportDiscount := CalculateLineItemDiscount(transportBase, rules, transportHeadID)
	if !transportDiscount.IsZero() {
		t.Errorf("transport discount expected 0, got %s", transportDiscount)
	}

	// 3. Discount cap: if rule is ₹3,000 flat discount on a ₹2,500 fee, cap at ₹2,500
	flatRules := []FeeConcessionRule{
		{
			Name:                 "Scholarship Excess",
			Type:                 ConcessionFlatAmount,
			Value:                decimal.NewFromFloat(3000.00),
			ApplicableFeeHeadIDs: []uuid.UUID{tuitionHeadID},
		},
	}
	cappedDiscount := CalculateLineItemDiscount(tuitionBase, flatRules, tuitionHeadID)
	if !cappedDiscount.Equal(tuitionBase) {
		t.Errorf("capped discount expected %s, got %s", tuitionBase, cappedDiscount)
	}
}
