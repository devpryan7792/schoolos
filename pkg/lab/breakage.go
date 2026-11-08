package lab

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type LabCategory string

const (
	LabPhysics   LabCategory = "PHYSICS"
	LabChemistry LabCategory = "CHEMISTRY"
	LabBiology   LabCategory = "BIOLOGY"
	LabComputer  LabCategory = "COMPUTER"
)

type LabAsset struct {
	AssetID      uuid.UUID       `json:"asset_id"`
	Barcode      string          `json:"barcode"` // e.g. "LAB-PHY-MIC-04"
	Name         string          `json:"name"`
	Category     LabCategory     `json:"category"`
	Model        string          `json:"model"`
	Cost         decimal.Decimal `json:"cost"`
	IsFunctional bool            `json:"is_functional"`
}

type BreakageIncident struct {
	IncidentID      uuid.UUID       `json:"incident_id"`
	StudentID       uuid.UUID       `json:"student_id"`
	StudentName     string          `json:"student_name"`
	AdmissionNumber string          `json:"admission_number"`
	AssetBarcode    string          `json:"asset_barcode"`
	AssetName       string          `json:"asset_name"`
	Category        LabCategory     `json:"category"`
	DamageDetails   string          `json:"damage_details"`
	ReplacementCost decimal.Decimal `json:"replacement_cost"`
	SupervisorName  string          `json:"supervisor_name"`
	SettlementMode  string          `json:"settlement_mode"` // "CAUTION_MONEY_DEDUCTION" or "INVOICE_BILLING"
	CreatedAt       time.Time       `json:"created_at"`
}

type PenaltySettlementResult struct {
	IncidentID        uuid.UUID       `json:"incident_id"`
	SettlementMode    string          `json:"settlement_mode"`
	DeductionAmount   decimal.Decimal `json:"deduction_amount"`
	RemainingCaution  decimal.Decimal `json:"remaining_caution"`
	InvoiceLineItem   string          `json:"invoice_line_item,omitempty"`
}

// ProcessBreakagePenalty handles debit against caution deposit or invoice dispatch
func ProcessBreakagePenalty(
	incident BreakageIncident,
	currentCautionDeposit decimal.Decimal,
) (PenaltySettlementResult, error) {
	if incident.ReplacementCost.IsZero() || incident.ReplacementCost.IsNegative() {
		return PenaltySettlementResult{}, fmt.Errorf("INVALID_COST: Replacement cost must be positive, got %s", incident.ReplacementCost)
	}

	// 1. If student has sufficient refundable caution money, deduct from deposit
	if currentCautionDeposit.GreaterThanOrEqual(incident.ReplacementCost) {
		remaining := currentCautionDeposit.Sub(incident.ReplacementCost)
		return PenaltySettlementResult{
			IncidentID:       incident.IncidentID,
			SettlementMode:   "CAUTION_MONEY_DEDUCTION",
			DeductionAmount:  incident.ReplacementCost,
			RemainingCaution: remaining,
		}, nil
	}

	// 2. Otherwise dispatch to next fee invoice
	return PenaltySettlementResult{
		IncidentID:       incident.IncidentID,
		SettlementMode:   "INVOICE_BILLING",
		DeductionAmount:  incident.ReplacementCost,
		RemainingCaution: currentCautionDeposit,
		InvoiceLineItem:  fmt.Sprintf("Lab Breakage Penalty: %s (%s)", incident.AssetName, incident.AssetBarcode),
	}, nil
}
