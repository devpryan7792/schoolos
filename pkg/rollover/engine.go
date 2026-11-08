package rollover

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/schoolos/schoolos/pkg/models"
	"github.com/shopspring/decimal"
)

type SessionStatus string

const (
	SessionPlanning SessionStatus = "PLANNING"
	SessionActive   SessionStatus = "ACTIVE"
	SessionFrozen   SessionStatus = "FROZEN"
	SessionArchived SessionStatus = "ARCHIVED"
)

type AcademicSession struct {
	ID        uuid.UUID     `json:"id"`
	TenantID  uuid.UUID     `json:"tenant_id"`
	SchoolID  uuid.UUID     `json:"school_id"`
	Name      string        `json:"name"` // e.g. "2025-2026"
	StartDate time.Time     `json:"start_date"`
	EndDate   time.Time     `json:"end_date"`
	Status    SessionStatus `json:"status"`
}

type ClassGrade struct {
	ID             uuid.UUID `json:"id"`
	Name           string    `json:"name"` // e.g. "Class 5"
	NumericalOrder int       `json:"numerical_order"` // 1 for Class 1, 5 for Class 5, 12 for Class 12
	MaxSectionCap  int       `json:"max_section_cap"`
}

type PromotionCandidate struct {
	StudentID       uuid.UUID       `json:"student_id"`
	AdmissionNumber string          `json:"admission_number"`
	FullName        string          `json:"full_name"`
	CurrentClassID  uuid.UUID       `json:"current_class_id"`
	CurrentOrder    int             `json:"current_order"`
	CurrentSection  string          `json:"current_section"`
	IsPassed        bool            `json:"is_passed"`        // Promoted if true, retained if false
	ArrearsAmount   decimal.Decimal `json:"arrears_amount"`   // Unpaid fees from old session
}

type StudentPromotionResult struct {
	StudentID       uuid.UUID       `json:"student_id"`
	AdmissionNumber string          `json:"admission_number"`
	FullName        string          `json:"full_name"`
	Action          string          `json:"action"` // "PROMOTED", "RETAINED", "GRADUATED_ALUMNI"
	OldClassOrder   int             `json:"old_class_order"`
	NewClassOrder   int             `json:"new_class_order"`
	NewClassName    string          `json:"new_class_name"`
	NewSection      string          `json:"new_section"`
	ArrearsCarried  decimal.Decimal `json:"arrears_carried"`
}

type SessionRolloverResult struct {
	RolloverID           uuid.UUID                `json:"rollover_id"`
	TenantID             uuid.UUID                `json:"tenant_id"`
	SchoolID             uuid.UUID                `json:"school_id"`
	ConcludingSession    string                   `json:"concluding_session"`
	NewSession           string                   `json:"new_session"`
	TotalStudents        int                      `json:"total_students"`
	PromotedCount        int                      `json:"promoted_count"`
	RetainedCount        int                      `json:"retained_count"`
	GraduatedCount       int                      `json:"graduated_count"`
	TotalArrearsCarried  decimal.Decimal          `json:"total_arrears_carried"`
	LedgerTransactionID  uuid.UUID                `json:"ledger_transaction_id"`
	LedgerLines          []models.LedgerEntry     `json:"ledger_lines"`
	PromotionRoster      []StudentPromotionResult `json:"promotion_roster"`
	ExecutedAt           time.Time                `json:"executed_at"`
	AuditHash            string                   `json:"audit_hash"`
	Status               string                   `json:"status"` // "COMPLETED"
}

// ExecuteAcademicSessionRollover executes ROLL-25 transition:
// 1. Validates classes and numerical_order mappings.
// 2. Increments numerical_order by 1 for promoted students.
// 3. Retains repeaters in current grade.
// 4. Marks highest grade (e.g. order 12) as GRADUATED_ALUMNI.
// 5. Aggregates unpaid balance into immutable OPENING_ARREARS_BALANCE double-entry ledger.
func ExecuteAcademicSessionRollover(
	tenantID, schoolID uuid.UUID,
	concludingSession, newSession AcademicSession,
	classCatalog []ClassGrade,
	candidates []PromotionCandidate,
	maxGradeOrder int, // e.g. 12 for K-12 school
) (*SessionRolloverResult, error) {
	if concludingSession.Status == SessionFrozen || concludingSession.Status == SessionArchived {
		return nil, fmt.Errorf("INVALID_STATE: Concluding session %s is already frozen or archived", concludingSession.Name)
	}

	// Map numerical_order -> ClassGrade
	gradeMap := make(map[int]ClassGrade)
	for _, cg := range classCatalog {
		gradeMap[cg.NumericalOrder] = cg
	}

	promotedCount := 0
	retainedCount := 0
	graduatedCount := 0
	totalArrears := decimal.Zero

	roster := make([]StudentPromotionResult, 0, len(candidates))

	for _, cand := range candidates {
		// Aggregate arrears
		if cand.ArrearsAmount.GreaterThan(decimal.Zero) {
			totalArrears = totalArrears.Add(cand.ArrearsAmount)
		}

		// Graduation check
		if cand.CurrentOrder >= maxGradeOrder && cand.IsPassed {
			graduatedCount++
			roster = append(roster, StudentPromotionResult{
				StudentID:       cand.StudentID,
				AdmissionNumber: cand.AdmissionNumber,
				FullName:        cand.FullName,
				Action:          "GRADUATED_ALUMNI",
				OldClassOrder:   cand.CurrentOrder,
				NewClassOrder:   cand.CurrentOrder,
				NewClassName:    "Alumni / Completed",
				NewSection:      "-",
				ArrearsCarried:  cand.ArrearsAmount,
			})
			continue
		}

		if cand.IsPassed {
			// Advance to next grade (numerical_order + 1)
			nextOrder := cand.CurrentOrder + 1
			nextGrade, exists := gradeMap[nextOrder]
			if !exists {
				return nil, fmt.Errorf("MISSING_CLASS: No class found for numerical_order = %d", nextOrder)
			}

			promotedCount++
			roster = append(roster, StudentPromotionResult{
				StudentID:       cand.StudentID,
				AdmissionNumber: cand.AdmissionNumber,
				FullName:        cand.FullName,
				Action:          "PROMOTED",
				OldClassOrder:   cand.CurrentOrder,
				NewClassOrder:   nextOrder,
				NewClassName:    nextGrade.Name,
				NewSection:      cand.CurrentSection, // Retains section letter or defaults
				ArrearsCarried:  cand.ArrearsAmount,
			})
		} else {
			// Retain in same grade
			retainedCount++
			currGrade := gradeMap[cand.CurrentOrder]
			roster = append(roster, StudentPromotionResult{
				StudentID:       cand.StudentID,
				AdmissionNumber: cand.AdmissionNumber,
				FullName:        cand.FullName,
				Action:          "RETAINED",
				OldClassOrder:   cand.CurrentOrder,
				NewClassOrder:   cand.CurrentOrder,
				NewClassName:    currGrade.Name,
				NewSection:      cand.CurrentSection,
				ArrearsCarried:  cand.ArrearsAmount,
			})
		}
	}

	// Generate Double-Entry Opening Arrears Ledger Entry
	// Debit: 1200-Accounts-Receivable-Prior-Arrears (Asset)
	// Credit: 3100-Retained-Earnings-Arrears-Carryforward (Equity)
	txID := uuid.New()
	ledgerLines := []models.LedgerEntry{}

	if totalArrears.GreaterThan(decimal.Zero) {
		receivableAccountID := uuid.MustParse("12000000-0000-0000-0000-000000001200")
		equityAccountID := uuid.MustParse("31000000-0000-0000-0000-000000003100")

		debitLine := models.LedgerEntry{
			ID:            uuid.New(),
			TenantID:      tenantID,
			SchoolID:      schoolID,
			TransactionID: txID,
			AccountID:     receivableAccountID,
			Debit:         totalArrears,
			Credit:        decimal.Zero,
			Narration:     fmt.Sprintf("Opening Arrears Balance brought forward from %s", concludingSession.Name),
			CreatedAt:     time.Now().UTC(),
		}

		creditLine := models.LedgerEntry{
			ID:            uuid.New(),
			TenantID:      tenantID,
			SchoolID:      schoolID,
			TransactionID: txID,
			AccountID:     equityAccountID,
			Debit:         decimal.Zero,
			Credit:        totalArrears,
			Narration:     fmt.Sprintf("Arrears Carryforward equity adjustment for %s", newSession.Name),
			CreatedAt:     time.Now().UTC(),
		}

		ledgerLines = append(ledgerLines, debitLine, creditLine)

		// Strictly enforce double-entry balance: sum(debit) == sum(credit)
		if err := models.ValidateDoubleEntry(ledgerLines); err != nil {
			return nil, fmt.Errorf("DOUBLE_ENTRY_FAILURE: %w", err)
		}
	}

	rolloverID := uuid.New()
	rawProof := fmt.Sprintf("%s|%s|%s|%d|%s", rolloverID, concludingSession.ID, newSession.ID, len(candidates), totalArrears.StringFixed(2))
	hash := sha256.Sum256([]byte(rawProof))

	return &SessionRolloverResult{
		RolloverID:          rolloverID,
		TenantID:            tenantID,
		SchoolID:            schoolID,
		ConcludingSession:   concludingSession.Name,
		NewSession:          newSession.Name,
		TotalStudents:       len(candidates),
		PromotedCount:       promotedCount,
		RetainedCount:       retainedCount,
		GraduatedCount:      graduatedCount,
		TotalArrearsCarried: totalArrears,
		LedgerTransactionID: txID,
		LedgerLines:         ledgerLines,
		PromotionRoster:     roster,
		ExecutedAt:          time.Now().UTC(),
		AuditHash:           hex.EncodeToString(hash[:]),
		Status:              "COMPLETED",
	}, nil
}
