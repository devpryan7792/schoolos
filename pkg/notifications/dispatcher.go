package notifications

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type NotificationTier string

const (
	Tier1NativePush          NotificationTier = "NATIVE_PUSH" // FCM / APNs (Zero Cost)
	Tier2WhatsAppInteractive NotificationTier = "WHATSAPP"    // Meta Cloud API (₹0.40 / msg)
	Tier3EmergencySMS        NotificationTier = "TELECOM_SMS" // DLT-compliant SMS (₹0.15 / msg)
)

type PriorityLevel string

const (
	PriorityStandard  PriorityLevel = "STANDARD"  // Fees, homework, announcements
	PriorityUrgent    PriorityLevel = "URGENT"    // Absenteeism, bus arrival
	PriorityEmergency PriorityLevel = "EMERGENCY" // Weather closure, security incident
)

type RecipientDevice struct {
	GuardianID       uuid.UUID `json:"guardian_id"`
	GuardianName     string    `json:"guardian_name"`
	PhoneNumber      string    `json:"phone_number"` // e.g. "+919876543210"
	PushToken        string    `json:"push_token"`   // FCM or APNs token
	Platform         string    `json:"platform"`     // "ANDROID", "IOS", "NONE"
	PushAcknowledged bool      `json:"push_acknowledged"`
}

type NotificationDispatchResult struct {
	DispatchID      uuid.UUID        `json:"dispatch_id"`
	RecipientPhone  string           `json:"recipient_phone"`
	SelectedTier    NotificationTier `json:"selected_tier"`
	Priority        PriorityLevel    `json:"priority"`
	DeliveredAt     time.Time        `json:"delivered_at"`
	CostINR         decimal.Decimal  `json:"cost_inr"`
	SavingsINR      decimal.Decimal  `json:"savings_inr"` // Compared to SMS baseline
	DLTTemplateID   string           `json:"dlt_template_id,omitempty"`
	StatusMessage   string           `json:"status_message"`
}

// Cost baselines in INR (Zero-Cost Invariant 5)
var (
	CostPush     = decimal.Zero
	CostWhatsApp = decimal.NewFromFloat(0.40)
	CostSMS      = decimal.NewFromFloat(0.15)
)

// DispatchTieredNotification enforces Invariant 5: Attempts Tier 1 Native Push first.
func DispatchTieredNotification(
	recipient RecipientDevice,
	title, body string,
	priority PriorityLevel,
	actionURL string,
) NotificationDispatchResult {
	dispatchID := uuid.New()
	now := time.Now().UTC()

	// 1. Emergency priority overrides directly to SMS if push is unconfirmed
	if priority == PriorityEmergency && recipient.PushToken == "" {
		return NotificationDispatchResult{
			DispatchID:     dispatchID,
			RecipientPhone: recipient.PhoneNumber,
			SelectedTier:   Tier3EmergencySMS,
			Priority:       priority,
			DeliveredAt:    now,
			CostINR:        CostSMS,
			SavingsINR:     decimal.Zero,
			DLTTemplateID:  "1107161234567890123", // TRAI DLT Registered Template
			StatusMessage:  fmt.Sprintf("Dispatched DLT emergency broadcast SMS to %s", recipient.PhoneNumber),
		}
	}

	// 2. Invariant 5 (Push-First): If recipient has active native push token, deliver via FCM/APNs for ₹0.00
	if recipient.PushToken != "" {
		savings := CostSMS // Saved 15 paise per push vs SMS
		return NotificationDispatchResult{
			DispatchID:     dispatchID,
			RecipientPhone: recipient.PhoneNumber,
			SelectedTier:   Tier1NativePush,
			Priority:       priority,
			DeliveredAt:    now,
			CostINR:        CostPush,
			SavingsINR:     savings,
			StatusMessage:  fmt.Sprintf("Dispatched zero-cost high-priority native push via %s to token %s...", recipient.Platform, recipient.PushToken[:8]),
		}
	}

	// 3. Tier 2: WhatsApp Cloud API fallback when no mobile push token exists
	if recipient.PhoneNumber != "" {
		return NotificationDispatchResult{
			DispatchID:     dispatchID,
			RecipientPhone: recipient.PhoneNumber,
			SelectedTier:   Tier2WhatsAppInteractive,
			Priority:       priority,
			DeliveredAt:    now,
			CostINR:        CostWhatsApp,
			SavingsINR:     decimal.Zero,
			StatusMessage:  fmt.Sprintf("FCM token missing; dispatched WhatsApp Interactive message to %s with CTA %s", recipient.PhoneNumber, actionURL),
		}
	}

	// 4. Fallback default
	return NotificationDispatchResult{
		DispatchID:     dispatchID,
		RecipientPhone: recipient.PhoneNumber,
		SelectedTier:   Tier3EmergencySMS,
		Priority:       priority,
		DeliveredAt:    now,
		CostINR:        CostSMS,
		SavingsINR:     decimal.Zero,
		DLTTemplateID:  "1107161234567890123",
		StatusMessage:  "Dispatched carrier SMS fallback",
	}
}

// ComputeBatchDispatchSavings aggregates total monetary expenditure saved by push-first routing
func ComputeBatchDispatchSavings(results []NotificationDispatchResult) (totalCost decimal.Decimal, totalSaved decimal.Decimal) {
	totalCost = decimal.Zero
	totalSaved = decimal.Zero

	for _, r := range results {
		totalCost = totalCost.Add(r.CostINR)
		totalSaved = totalSaved.Add(r.SavingsINR)
	}

	return totalCost, totalSaved
}
