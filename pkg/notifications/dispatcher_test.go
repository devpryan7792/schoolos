package notifications

import (
	"testing"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

func TestTieredNotificationPushFirstRouting(t *testing.T) {
	// 1. Recipient with active FCM Android token -> Tier 1 Native Push (Cost: ₹0.00)
	parentWithFCM := RecipientDevice{
		GuardianID:   uuid.New(),
		GuardianName: "Rajesh Sharma",
		PhoneNumber:  "+919876543210",
		PushToken:    "fcm_token_sample_abc123456789",
		Platform:     "ANDROID",
	}

	res1 := DispatchTieredNotification(parentWithFCM, "Fee Reminder", "November fee due", PriorityStandard, "https://portal.schoolos.in/fees")
	if res1.SelectedTier != Tier1NativePush {
		t.Fatalf("Expected Tier 1 Native Push, got: %s", res1.SelectedTier)
	}
	if !res1.CostINR.IsZero() {
		t.Fatalf("Expected ₹0.00 cost for native push, got: %s", res1.CostINR)
	}
	if !res1.SavingsINR.Equal(decimal.NewFromFloat(0.15)) {
		t.Fatalf("Expected ₹0.15 savings compared to SMS, got: %s", res1.SavingsINR)
	}

	// 2. Recipient without mobile app token -> Fallback to Tier 2 WhatsApp
	parentNoApp := RecipientDevice{
		GuardianID:   uuid.New(),
		GuardianName: "Sunita Soren",
		PhoneNumber:  "+919876543211",
		PushToken:    "",
		Platform:     "NONE",
	}

	res2 := DispatchTieredNotification(parentNoApp, "Fee Reminder", "November fee due", PriorityStandard, "https://portal.schoolos.in/fees")
	if res2.SelectedTier != Tier2WhatsAppInteractive {
		t.Fatalf("Expected Tier 2 WhatsApp Interactive fallback, got: %s", res2.SelectedTier)
	}
	if !res2.CostINR.Equal(decimal.NewFromFloat(0.40)) {
		t.Fatalf("Expected ₹0.40 cost for WhatsApp, got: %s", res2.CostINR)
	}

	// 3. Emergency broadcast to recipient without app -> Direct DLT-compliant SMS
	res3 := DispatchTieredNotification(parentNoApp, "School Closed", "Heavy rain holiday", PriorityEmergency, "")
	if res3.SelectedTier != Tier3EmergencySMS {
		t.Fatalf("Expected Tier 3 Emergency SMS for critical alert, got: %s", res3.SelectedTier)
	}
	if res3.DLTTemplateID == "" {
		t.Fatal("Expected TRAI DLT template ID on emergency telecom SMS")
	}

	// 4. Batch savings calculation
	cost, saved := ComputeBatchDispatchSavings([]NotificationDispatchResult{res1, res2, res3})
	// res1: cost 0, saved 0.15
	// res2: cost 0.40, saved 0
	// res3: cost 0.15, saved 0
	// total cost = 0.55, total saved = 0.15
	if !cost.Equal(decimal.NewFromFloat(0.55)) || !saved.Equal(decimal.NewFromFloat(0.15)) {
		t.Fatalf("Batch summary mismatch: cost=%s, saved=%s", cost, saved)
	}
}
