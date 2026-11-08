package library

import (
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

func TestBookLoanQuotaEnforcement(t *testing.T) {
	borrowerID := uuid.New()
	bookID := uuid.New()
	now := time.Now()

	// 1. Student borrowing 1st book -> Allowed (due in 14 days)
	loan1, err := IssueBook(bookID, "ACC-1001", "978-0134685991", "Effective Java", "Joshua Bloch", borrowerID, RoleStudent, "Aarav Sharma", 0, now)
	if err != nil {
		t.Fatalf("Expected student loan to succeed, got %v", err)
	}
	expectedDue := now.AddDate(0, 0, 14)
	if loan1.DueDate.Day() != expectedDue.Day() {
		t.Fatalf("Expected due date in 14 days, got %v", loan1.DueDate)
	}

	// 2. Student with 2 active loans trying to borrow a 3rd -> Quota Exceeded error
	_, errQuota := IssueBook(bookID, "ACC-1002", "978-0132350884", "Clean Code", "Robert Martin", borrowerID, RoleStudent, "Aarav Sharma", 2, now)
	if errQuota == nil || !strings.Contains(errQuota.Error(), "MAX_QUOTA_EXCEEDED") {
		t.Fatalf("Expected MAX_QUOTA_EXCEEDED error, got: %v", errQuota)
	}

	// 3. Faculty allowed up to 5 books with 30-day loan
	facultyLoan, errFac := IssueBook(bookID, "ACC-1003", "978-0132350884", "Clean Code", "Robert Martin", uuid.New(), RoleStaff, "Dr. H. C. Verma", 4, now)
	if errFac != nil {
		t.Fatalf("Faculty 5th loan should be permitted, got %v", errFac)
	}
	expectedFacDue := now.AddDate(0, 0, 30)
	if facultyLoan.DueDate.Day() != expectedFacDue.Day() {
		t.Fatalf("Faculty due date should be 30 days, got %v", facultyLoan.DueDate)
	}
}

func TestOverdueFineCalculationZeroFloat(t *testing.T) {
	policy := GetCirculationPolicy(RoleStudent) // ₹2.00 / day
	dueDate := time.Date(2026, 11, 1, 0, 0, 0, 0, time.UTC)

	// Returned 7 days late on Nov 8
	returnDate := time.Date(2026, 11, 8, 12, 0, 0, 0, time.UTC)
	isOverdue, days, fine := CalculateOverdueFine(dueDate, returnDate, policy)

	if !isOverdue || days != 7 {
		t.Fatalf("Expected 7 days overdue, got %d (isOverdue=%v)", days, isOverdue)
	}
	// 7 days * ₹2.00 = ₹14.00
	expectedFine := decimal.NewFromFloat(14.00)
	if !fine.Equal(expectedFine) {
		t.Fatalf("Expected ₹14.00 fine, got: %s", fine)
	}
}

func TestLibraryNoDuesCheck(t *testing.T) {
	// Blocked by unpaid fine
	cleared1, reason1 := CheckLibraryNoDues([]BookLoan{}, decimal.NewFromFloat(14.00))
	if cleared1 || !strings.Contains(reason1, "unpaid library fines") {
		t.Fatalf("Expected library hold on unpaid fine, got: %v, %s", cleared1, reason1)
	}

	// Cleared
	cleared2, _ := CheckLibraryNoDues([]BookLoan{}, decimal.Zero)
	if !cleared2 {
		t.Fatal("Expected clean library status with 0 books and 0 fines")
	}
}
