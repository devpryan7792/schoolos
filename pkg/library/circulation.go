package library

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type BorrowerRole string

const (
	RoleStudent BorrowerRole = "STUDENT"
	RoleStaff   BorrowerRole = "STAFF"
)

type CirculationPolicy struct {
	MaxBooksAllowed int
	LoanPeriodDays  int
	FinePerDayINR   decimal.Decimal
}

// DefaultPolicies provides standard loan policies for Students & Teachers
func GetCirculationPolicy(role BorrowerRole) CirculationPolicy {
	if role == RoleStaff {
		return CirculationPolicy{
			MaxBooksAllowed: 5,
			LoanPeriodDays:  30,
			FinePerDayINR:   decimal.Zero, // Faculty exempt from daily fines
		}
	}
	// Student policy
	return CirculationPolicy{
		MaxBooksAllowed: 2,
		LoanPeriodDays:  14,
		FinePerDayINR:   decimal.NewFromFloat(2.00), // ₹2.00 per day overdue
	}
}

type BookLoan struct {
	LoanID       uuid.UUID
	BookID       uuid.UUID
	AccessionNo  string
	ISBN         string
	Title        string
	Author       string
	BorrowerID   uuid.UUID
	BorrowerRole BorrowerRole
	BorrowerName string
	IssuedAt     time.Time
	DueDate      time.Time
	ReturnedAt   *time.Time
	FineAmount   decimal.Decimal
	IsOverdue    bool
}

// IssueBook checks loan quotas and computes due date
func IssueBook(
	bookID uuid.UUID,
	accessionNo, isbn, title, author string,
	borrowerID uuid.UUID,
	role BorrowerRole,
	borrowerName string,
	activeLoansCount int,
	issueTime time.Time,
) (*BookLoan, error) {
	policy := GetCirculationPolicy(role)
	if activeLoansCount >= policy.MaxBooksAllowed {
		return nil, fmt.Errorf("MAX_QUOTA_EXCEEDED: %s cannot borrow more than %d books simultaneously (currently has %d)", role, policy.MaxBooksAllowed, activeLoansCount)
	}

	dueDate := issueTime.AddDate(0, 0, policy.LoanPeriodDays)

	return &BookLoan{
		LoanID:       uuid.New(),
		BookID:       bookID,
		AccessionNo:  accessionNo,
		ISBN:         isbn,
		Title:        title,
		Author:       author,
		BorrowerID:   borrowerID,
		BorrowerRole: role,
		BorrowerName: borrowerName,
		IssuedAt:     issueTime,
		DueDate:      dueDate,
		FineAmount:   decimal.Zero,
		IsOverdue:    false,
	}, nil
}

// CalculateOverdueFine computes late return fine using fixed-point decimal arithmetic
func CalculateOverdueFine(dueDate time.Time, returnDate time.Time, policy CirculationPolicy) (isOverdue bool, overdueDays int, fine decimal.Decimal) {
	if !returnDate.After(dueDate) {
		return false, 0, decimal.Zero
	}

	days := int(returnDate.Sub(dueDate).Hours() / 24)
	if days <= 0 {
		return false, 0, decimal.Zero
	}

	fine = policy.FinePerDayINR.Mul(decimal.NewFromInt(int64(days)))
	return true, days, fine
}

// CheckLibraryNoDues verifies whether student has any unreturned books or unpaid fines
func CheckLibraryNoDues(activeLoans []BookLoan, unpaidFines decimal.Decimal) (isCleared bool, reason string) {
	if len(activeLoans) > 0 {
		return false, fmt.Sprintf("LIBRARY_HOLD: %d active books still issued and not returned", len(activeLoans))
	}
	if unpaidFines.GreaterThan(decimal.Zero) {
		return false, fmt.Sprintf("LIBRARY_HOLD: ₹%s in unpaid library fines outstanding", unpaidFines.StringFixed(2))
	}
	return true, "Library No-Dues Verified"
}
