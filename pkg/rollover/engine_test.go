package rollover

import (
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

func TestAcademicSessionRolloverPromotionAndArrears(t *testing.T) {
	tenantID := uuid.New()
	schoolID := uuid.New()

	concludingSession := AcademicSession{
		ID:        uuid.New(),
		TenantID:  tenantID,
		SchoolID:  schoolID,
		Name:      "2025-2026",
		StartDate: time.Date(2025, 4, 1, 0, 0, 0, 0, time.UTC),
		EndDate:   time.Date(2026, 3, 31, 0, 0, 0, 0, time.UTC),
		Status:    SessionActive,
	}

	newSession := AcademicSession{
		ID:        uuid.New(),
		TenantID:  tenantID,
		SchoolID:  schoolID,
		Name:      "2026-2027",
		StartDate: time.Date(2026, 4, 1, 0, 0, 0, 0, time.UTC),
		EndDate:   time.Date(2027, 3, 31, 0, 0, 0, 0, time.UTC),
		Status:    SessionPlanning,
	}

	// Class catalog from Class 1 to 12
	catalog := []ClassGrade{
		{ID: uuid.New(), Name: "Class 1", NumericalOrder: 1, MaxSectionCap: 40},
		{ID: uuid.New(), Name: "Class 2", NumericalOrder: 2, MaxSectionCap: 40},
		{ID: uuid.New(), Name: "Class 3", NumericalOrder: 3, MaxSectionCap: 40},
		{ID: uuid.New(), Name: "Class 4", NumericalOrder: 4, MaxSectionCap: 40},
		{ID: uuid.New(), Name: "Class 5", NumericalOrder: 5, MaxSectionCap: 40},
		{ID: uuid.New(), Name: "Class 10", NumericalOrder: 10, MaxSectionCap: 45},
		{ID: uuid.New(), Name: "Class 11", NumericalOrder: 11, MaxSectionCap: 45},
		{ID: uuid.New(), Name: "Class 12", NumericalOrder: 12, MaxSectionCap: 45},
	}

	candidates := []PromotionCandidate{
		// 1. Aarav Sharma in Class 4 -> Passed -> Promoted to Class 5 with ₹4,200 arrears
		{
			StudentID:       uuid.New(),
			AdmissionNumber: "DPS-2024-042",
			FullName:        "Aarav Sharma",
			CurrentOrder:    4,
			CurrentSection:  "A",
			IsPassed:        true,
			ArrearsAmount:   decimal.NewFromFloat(4200.00),
		},
		// 2. Rohan Kumar in Class 4 -> Failed -> Retained in Class 4 with ₹0 arrears
		{
			StudentID:       uuid.New(),
			AdmissionNumber: "DPS-2024-089",
			FullName:        "Rohan Kumar",
			CurrentOrder:    4,
			CurrentSection:  "B",
			IsPassed:        false,
			ArrearsAmount:   decimal.Zero,
		},
		// 3. Priya Singh in Class 12 -> Passed -> Graduated as Alumni with ₹1,500 library fine arrears
		{
			StudentID:       uuid.New(),
			AdmissionNumber: "DPS-2021-003",
			FullName:        "Priya Singh",
			CurrentOrder:    12,
			CurrentSection:  "A",
			IsPassed:        true,
			ArrearsAmount:   decimal.NewFromFloat(1500.00),
		},
	}

	result, err := ExecuteAcademicSessionRollover(
		tenantID, schoolID,
		concludingSession, newSession,
		catalog,
		candidates,
		12, // Max grade
	)

	if err != nil {
		t.Fatalf("Failed to execute academic session rollover: %v", err)
	}

	// 1. Verify Promotion Counts
	if result.TotalStudents != 3 {
		t.Fatalf("Expected 3 total students, got %d", result.TotalStudents)
	}
	if result.PromotedCount != 1 {
		t.Fatalf("Expected 1 promoted, got %d", result.PromotedCount)
	}
	if result.RetainedCount != 1 {
		t.Fatalf("Expected 1 retained, got %d", result.RetainedCount)
	}
	if result.GraduatedCount != 1 {
		t.Fatalf("Expected 1 graduated, got %d", result.GraduatedCount)
	}

	// 2. Verify Actions and Numerical Order Advancements
	rosterMap := make(map[string]StudentPromotionResult)
	for _, r := range result.PromotionRoster {
		rosterMap[r.AdmissionNumber] = r
	}

	// Aarav: 4 -> 5, "Class 5"
	aarav := rosterMap["DPS-2024-042"]
	if aarav.Action != "PROMOTED" || aarav.NewClassOrder != 5 || aarav.NewClassName != "Class 5" {
		t.Fatalf("Aarav promotion mismatch: %+v", aarav)
	}

	// Rohan: retained in Class 4
	rohan := rosterMap["DPS-2024-089"]
	if rohan.Action != "RETAINED" || rohan.NewClassOrder != 4 || rohan.NewClassName != "Class 4" {
		t.Fatalf("Rohan retention mismatch: %+v", rohan)
	}

	// Priya: graduated as alumni
	priya := rosterMap["DPS-2021-003"]
	if priya.Action != "GRADUATED_ALUMNI" || priya.NewClassName != "Alumni / Completed" {
		t.Fatalf("Priya graduation mismatch: %+v", priya)
	}

	// 3. Verify Arrears Carryforward Zero-Float Summation
	// 4200.00 + 1500.00 = 5700.00
	expectedArrears := decimal.NewFromFloat(5700.00)
	if !result.TotalArrearsCarried.Equal(expectedArrears) {
		t.Fatalf("Expected ₹5,700.00 arrears carried, got: %s", result.TotalArrearsCarried)
	}

	// 4. Verify Double-Entry Accounting Invariant (Debits == Credits)
	if len(result.LedgerLines) != 2 {
		t.Fatalf("Expected 2 balanced ledger lines for opening arrears, got %d", len(result.LedgerLines))
	}
	sumDebit := result.LedgerLines[0].Debit
	sumCredit := result.LedgerLines[1].Credit
	if !sumDebit.Equal(sumCredit) || !sumDebit.Equal(expectedArrears) {
		t.Fatalf("Ledger unbalanced: Debit=%s, Credit=%s", sumDebit, sumCredit)
	}

	// 5. Verify Cryptographic Audit Proof Hash
	if result.AuditHash == "" || len(result.AuditHash) != 64 {
		t.Fatalf("Expected 64-char SHA256 audit hash, got: %s", result.AuditHash)
	}
}

func TestFrozenSessionCannotRollover(t *testing.T) {
	concludingSession := AcademicSession{
		ID:     uuid.New(),
		Name:   "2024-2025",
		Status: SessionFrozen, // Already frozen!
	}
	newSession := AcademicSession{ID: uuid.New(), Name: "2025-2026"}

	_, err := ExecuteAcademicSessionRollover(
		uuid.New(), uuid.New(),
		concludingSession, newSession,
		nil, nil, 12,
	)

	if err == nil || !strings.Contains(err.Error(), "INVALID_STATE") {
		t.Fatalf("Expected INVALID_STATE error for frozen session rollover, got: %v", err)
	}
}
