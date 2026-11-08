package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

func TestHealthCheck(t *testing.T) {
	server := NewServer(nil, nil, "secret")
	req := httptest.NewRequest("GET", "/healthz", nil)
	rec := httptest.NewRecorder()

	server.HealthHandler(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}

	var resp map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("invalid json: %v", err)
	}
	if resp["status"] != "healthy" {
		t.Errorf("expected healthy, got %v", resp["status"])
	}
}

func TestPhoneLogin(t *testing.T) {
	server := NewServer(nil, nil, "secret")
	payload := `{"phone": "+919876543210", "password": "SecretPassword123"}`
	req := httptest.NewRequest("POST", "/v1/auth/login/phone", bytes.NewBufferString(payload))
	rec := httptest.NewRecorder()

	server.LoginHandler(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}

	var resp map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("invalid json: %v", err)
	}

	if resp["token"] == nil || resp["token"] == "" {
		t.Error("expected non-empty JWT token")
	}

	profiles, ok := resp["linked_profiles"].([]any)
	if !ok || len(profiles) != 2 {
		t.Errorf("expected 2 linked sibling profiles, got %v", profiles)
	}
}

func TestStudentFeeDuesZeroFloat(t *testing.T) {
	server := NewServer(nil, nil, "secret")
	studentID := uuid.New()
	req := httptest.NewRequest("GET", "/v1/students/"+studentID.String()+"/fee-dues", nil)
	rec := httptest.NewRecorder()

	server.StudentFeeDuesHandler(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}

	type FeeDuesResponse struct {
		StudentID        string          `json:"student_id"`
		TotalOutstanding decimal.Decimal `json:"total_outstanding"`
		UPIIntent        string          `json:"upi_intent"`
	}

	var resp FeeDuesResponse
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal with zero-float decimal: %v", err)
	}

	expectedOutstanding := decimal.NewFromFloat(4200.00)
	if !resp.TotalOutstanding.Equal(expectedOutstanding) {
		t.Errorf("expected %s, got %s", expectedOutstanding, resp.TotalOutstanding)
	}
}

func TestCollectCashCounter(t *testing.T) {
	server := NewServer(nil, nil, "secret")
	reqPayload := CashCollectRequest{
		InvoiceID:      uuid.New(),
		StudentID:      uuid.New(),
		AmountPaid:     decimal.NewFromFloat(4200.00),
		PaymentMode:    "CASH",
		IdempotencyKey: "desktop-pos-12345",
	}

	body, _ := json.Marshal(reqPayload)
	req := httptest.NewRequest("POST", "/v1/payments/collect-cash", bytes.NewBuffer(body))
	rec := httptest.NewRecorder()

	server.CollectCashHandler(rec, req)
	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 201 Created, got %d", rec.Code)
	}

	var resp map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("invalid json: %v", err)
	}

	if resp["receipt_number"] == nil {
		t.Error("expected receipt number in response")
	}
	if resp["status"] != "SETTLED" {
		t.Errorf("expected SETTLED, got %v", resp["status"])
	}
}

func TestOfflineReceiptSync(t *testing.T) {
	server := NewServer(nil, nil, "secret")
	syncPayload := `
	{
		"device_id": "POS-COUNTER-01",
		"batch_id": "batch-20261108-01",
		"transactions": [
			{
				"client_tx_id": "local-tx-99124",
				"invoice_id": "e0a80101-92b5-4b11-9ef0-0a1234567893",
				"student_id": "d1a80101-92b5-4b11-9ef0-0a1234567891",
				"amount": 4200.00,
				"payment_mode": "CASH",
				"collected_at": "2026-11-08T09:14:22Z"
			}
		]
	}`

	req := httptest.NewRequest("POST", "/v1/sync/offline-receipts", bytes.NewBufferString(syncPayload))
	rec := httptest.NewRecorder()

	server.OfflineReceiptSyncHandler(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d", rec.Code)
	}

	var resp map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("invalid json: %v", err)
	}

	if resp["synced_count"].(float64) != 1 {
		t.Errorf("expected 1 synced count, got %v", resp["synced_count"])
	}
}
