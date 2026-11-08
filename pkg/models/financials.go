package models

import (
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

var (
	ErrUnbalancedLedgerEntry = errors.New("unbalanced ledger transaction: sum of debits must equal sum of credits")
	ErrNegativeAmount        = errors.New("financial amounts must not be negative")
	ErrZeroTransactionEntries = errors.New("ledger transaction must contain at least two entries")
)

// AccountType represents double-entry general ledger classifications.
type AccountType string

const (
	AccountAsset     AccountType = "ASSET"
	AccountLiability AccountType = "LIABILITY"
	AccountEquity    AccountType = "EQUITY"
	AccountIncome    AccountType = "INCOME"
	AccountExpense   AccountType = "EXPENSE"
)

// ChartOfAccount represents a ledger account node.
type ChartOfAccount struct {
	ID          uuid.UUID   `json:"id"`
	TenantID    uuid.UUID   `json:"tenant_id"`
	SchoolID    uuid.UUID   `json:"school_id"`
	AccountCode string      `json:"account_code"`
	AccountName string      `json:"account_name"`
	AccountType AccountType `json:"account_type"`
	ParentID    *uuid.UUID  `json:"parent_id,omitempty"`
	IsSystem    bool        `json:"is_system"`
	CreatedAt   time.Time   `json:"created_at"`
}

// FeeHead represents an itemized billing category configured by the school.
type FeeHead struct {
	ID              uuid.UUID       `json:"id"`
	TenantID        uuid.UUID       `json:"tenant_id"`
	SchoolID        uuid.UUID       `json:"school_id"`
	Name            string          `json:"name"`
	GlAccountID     uuid.UUID       `json:"gl_account_id"`
	StandardAmount  decimal.Decimal `json:"standard_amount"`
	IsRefundable    bool            `json:"is_refundable"` // Caution Money escrow vs tuition income
	CreatedAt       time.Time       `json:"created_at"`
}

// ConcessionType defines percentage or flat discount calculation.
type ConcessionType string

const (
	ConcessionPercentage ConcessionType = "PERCENTAGE"
	ConcessionFlatAmount ConcessionType = "FLAT_AMOUNT"
)

// FeeConcessionRule defines automated or administrative discount policies.
type FeeConcessionRule struct {
	ID                    uuid.UUID       `json:"id"`
	TenantID              uuid.UUID       `json:"tenant_id"`
	SchoolID              uuid.UUID       `json:"school_id"`
	Name                  string          `json:"name"`
	Type                  ConcessionType  `json:"type"`
	Value                 decimal.Decimal `json:"value"` // e.g., 25.00 for 25% or 500.00 for flat
	ApplicableFeeHeadIDs  []uuid.UUID     `json:"applicable_fee_head_ids"`
	CreatedAt             time.Time       `json:"created_at"`
}

// Invoice represents a student billing statement.
type Invoice struct {
	ID               uuid.UUID       `json:"id"`
	TenantID         uuid.UUID       `json:"tenant_id"`
	SchoolID         uuid.UUID       `json:"school_id"`
	StudentID        uuid.UUID       `json:"student_id"`
	InvoiceNumber    string          `json:"invoice_number"`
	BillingPeriod    string          `json:"billing_period"`
	DueDate          time.Time       `json:"due_date"`
	GrossAmount      decimal.Decimal `json:"gross_amount"`
	ConcessionAmount decimal.Decimal `json:"concession_amount"`
	LateFeeAmount    decimal.Decimal `json:"late_fee_amount"`
	NetAmount        decimal.Decimal `json:"net_amount"`
	PaidAmount       decimal.Decimal `json:"paid_amount"`
	Status           string          `json:"status"` // PENDING, PARTIALLY_PAID, PAID, CANCELLED
	CreatedAt        time.Time       `json:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at"`
}

// InvoiceItem represents line-item breakdown of fee heads on an invoice.
type InvoiceItem struct {
	ID                 uuid.UUID       `json:"id"`
	TenantID           uuid.UUID       `json:"tenant_id"`
	InvoiceID          uuid.UUID       `json:"invoice_id"`
	FeeHeadID          uuid.UUID       `json:"fee_head_id"`
	GrossAmount        decimal.Decimal `json:"gross_amount"`
	ConcessionDeduction decimal.Decimal `json:"concession_deduction"`
	NetAmount          decimal.Decimal `json:"net_amount"`
	CreatedAt          time.Time       `json:"created_at"`
}

// LedgerEntry represents an immutable double-entry journal line.
// Invariant: For any transaction_id, sum(debit) == sum(credit).
type LedgerEntry struct {
	ID            uuid.UUID       `json:"id"`
	TenantID      uuid.UUID       `json:"tenant_id"`
	SchoolID      uuid.UUID       `json:"school_id"`
	TransactionID uuid.UUID       `json:"transaction_id"`
	AccountID     uuid.UUID       `json:"account_id"`
	Debit         decimal.Decimal `json:"debit"`
	Credit        decimal.Decimal `json:"credit"`
	Narration     string          `json:"narration"`
	ReferenceType *string         `json:"reference_type,omitempty"`
	ReferenceID   *uuid.UUID      `json:"reference_id,omitempty"`
	CreatedAt     time.Time       `json:"created_at"`
}

// Payment records funds received against invoices.
type Payment struct {
	ID                 uuid.UUID       `json:"id"`
	TenantID           uuid.UUID       `json:"tenant_id"`
	SchoolID           uuid.UUID       `json:"school_id"`
	InvoiceID          uuid.UUID       `json:"invoice_id"`
	ReceiptNumber      string          `json:"receipt_number"`
	AmountPaid         decimal.Decimal `json:"amount_paid"`
	PaymentMode        string          `json:"payment_mode"` // CASH, UPI, POS_CARD, NET_BANKING
	TransactionRef     *string         `json:"transaction_ref,omitempty"`
	IdempotencyKey     string          `json:"idempotency_key"`
	IsOfflineCollected bool            `json:"is_offline_collected"`
	CollectedBy        uuid.UUID       `json:"collected_by"`
	CollectedAt        time.Time       `json:"collected_at"`
	CreatedAt          time.Time       `json:"created_at"`
}

// ValidateDoubleEntry enforces that the set of ledger entries for a transaction is strictly balanced:
// sum(debit) == sum(credit) and all individual debit/credit amounts are non-negative.
func ValidateDoubleEntry(entries []LedgerEntry) error {
	if len(entries) < 2 {
		return ErrZeroTransactionEntries
	}

	sumDebit := decimal.Zero
	sumCredit := decimal.Zero
	txID := entries[0].TransactionID

	for i, entry := range entries {
		if entry.TransactionID != txID {
			return fmt.Errorf("inconsistent transaction_id at entry %d: expected %s, got %s", i, txID, entry.TransactionID)
		}
		if entry.Debit.IsNegative() || entry.Credit.IsNegative() {
			return fmt.Errorf("entry %d has negative amount (debit: %s, credit: %s): %w", i, entry.Debit, entry.Credit, ErrNegativeAmount)
		}
		if entry.Debit.IsZero() && entry.Credit.IsZero() {
			return fmt.Errorf("entry %d must have either non-zero debit or non-zero credit", i)
		}
		sumDebit = sumDebit.Add(entry.Debit)
		sumCredit = sumCredit.Add(entry.Credit)
	}

	if !sumDebit.Equal(sumCredit) {
		return fmt.Errorf("%w: debits=%s, credits=%s, diff=%s",
			ErrUnbalancedLedgerEntry, sumDebit.StringFixed(2), sumCredit.StringFixed(2), sumDebit.Sub(sumCredit).StringFixed(2))
	}

	return nil
}

// CalculateLineItemDiscount computes the exact line-item discount based on applicable rules.
// Guaranteed zero-float arithmetic using decimal.Decimal.
func CalculateLineItemDiscount(standardAmount decimal.Decimal, rules []FeeConcessionRule, headID uuid.UUID) decimal.Decimal {
	totalDiscount := decimal.Zero
	hundred := decimal.NewFromInt(100)

	for _, rule := range rules {
		isApplicable := false
		for _, applicableID := range rule.ApplicableFeeHeadIDs {
			if applicableID == headID {
				isApplicable = true
				break
			}
		}

		if !isApplicable {
			continue
		}

		switch rule.Type {
		case ConcessionPercentage:
			// discount = standardAmount * (value / 100)
			ruleDiscount := standardAmount.Mul(rule.Value).Div(hundred).Round(2)
			totalDiscount = totalDiscount.Add(ruleDiscount)
		case ConcessionFlatAmount:
			totalDiscount = totalDiscount.Add(rule.Value)
		}
	}

	// Discount cannot exceed the standard amount
	if totalDiscount.GreaterThan(standardAmount) {
		totalDiscount = standardAmount
	}

	return totalDiscount.Round(2)
}
