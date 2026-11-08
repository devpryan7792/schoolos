package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestWhatsAppWebhookVerification(t *testing.T) {
	server := NewServer(nil, nil, "test_jwt_secret")

	// 1. Valid handshake
	req := httptest.NewRequest(http.MethodGet, "/v1/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=schoolos_wa_verify_token_prod_2026&hub.challenge=test_challenge_12345", nil)
	rr := httptest.NewRecorder()

	server.WhatsAppWebhookHandler(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d", rr.Code)
	}
	if rr.Body.String() != "test_challenge_12345" {
		t.Fatalf("Expected challenge body 'test_challenge_12345', got %q", rr.Body.String())
	}

	// 2. Invalid verify token
	reqBad := httptest.NewRequest(http.MethodGet, "/v1/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=test_challenge_12345", nil)
	rrBad := httptest.NewRecorder()

	server.WhatsAppWebhookHandler(rrBad, reqBad)
	if rrBad.Code != http.StatusForbidden {
		t.Fatalf("Expected 403 Forbidden for bad token, got %d", rrBad.Code)
	}
}

func TestWhatsAppDeterministicFeeDuesTool(t *testing.T) {
	server := NewServer(nil, nil, "test_jwt_secret")

	// Parent query: "Bhaiya fee kitna baaki hai Aarav ka?"
	metaPayload := WhatsAppWebhookPayload{
		Object: "whatsapp_business_account",
		Entry: []WhatsAppWebhookEntry{
			{
				ID: "WHATSAPP_BUS_ACC_01",
				Changes: []WhatsAppWebhookChange{
					{
						Field: "messages",
						Value: WhatsAppValue{
							MessagingProduct: "whatsapp",
							Messages: []WhatsAppMessage{
								{
									From:      "919876543210",
									ID:        "wamid.HBgLM1234567890",
									Timestamp: "1731032400",
									Type:      "text",
									Text: struct {
										Body string `json:"body"`
									}{
										Body: "Bhaiya fee kitna baaki hai Aarav ka?",
									},
								},
							},
						},
					},
				},
			},
		},
	}

	payloadBytes, err := json.Marshal(metaPayload)
	if err != nil {
		t.Fatalf("Failed to marshal payload: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/v1/webhooks/whatsapp", bytes.NewReader(payloadBytes))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	server.WhatsAppWebhookHandler(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d", rr.Code)
	}

	// Direct tool invocation check
	resp := server.processInboundWhatsAppMessage(metaPayload.Entry[0].Changes[0].Value.Messages[0])
	if resp == nil {
		t.Fatal("Expected outbound interactive response, got nil")
	}

	if resp.Interactive == nil {
		t.Fatal("Expected interactive message response")
	}

	bodyText := resp.Interactive.Body.Text
	if !strings.Contains(bodyText, "₹4200.00") && !strings.Contains(bodyText, "4200") {
		t.Fatalf("Expected net payable ₹4200 in response body, got: %s", bodyText)
	}
	if !strings.Contains(bodyText, "upi://pay?pa=school@icici") {
		t.Fatalf("Expected dynamic UPI deep link in response, got: %s", bodyText)
	}

	// Check action button
	if len(resp.Interactive.Action.Buttons) == 0 {
		t.Fatal("Expected interactive CTA buttons")
	}
	btnTitle := resp.Interactive.Action.Buttons[0].Reply.Title
	if !strings.Contains(btnTitle, "Pay ₹4200 via UPI") {
		t.Fatalf("Expected button title 'Pay ₹4200 via UPI', got: %s", btnTitle)
	}
}

func TestWhatsAppDeterministicBusETATool(t *testing.T) {
	server := NewServer(nil, nil, "test_jwt_secret")

	// Parent query: "Bus kahan pahunchi?"
	msg := WhatsAppMessage{
		From:      "919876543210",
		ID:        "wamid.HBgLM987654321",
		Timestamp: "1731032500",
		Type:      "text",
		Text: struct {
			Body string `json:"body"`
		}{
			Body: "Bus kahan tak pahunchi abhi?",
		},
	}

	resp := server.processInboundWhatsAppMessage(msg)
	if resp == nil || resp.Interactive == nil {
		t.Fatal("Expected interactive response for bus inquiry")
	}

	bodyText := resp.Interactive.Body.Text
	if !strings.Contains(bodyText, "BUS-04") {
		t.Fatalf("Expected bus BUS-04 in response, got: %s", bodyText)
	}
	if !strings.Contains(bodyText, "Doranda Chowk") {
		t.Fatalf("Expected stop Doranda Chowk in response, got: %s", bodyText)
	}
	if !strings.Contains(bodyText, "6 mins") {
		t.Fatalf("Expected ETA in response, got: %s", bodyText)
	}
}

func TestWhatsAppDeterministicAbsenceTool(t *testing.T) {
	server := NewServer(nil, nil, "test_jwt_secret")

	// Parent query: "Aarav bimar hai, aaj school nahi aayega"
	msg := WhatsAppMessage{
		From:      "919876543210",
		ID:        "wamid.HBgLM11223344",
		Timestamp: "1731032600",
		Type:      "text",
		Text: struct {
			Body string `json:"body"`
		}{
			Body: "Aarav bimar hai, aaj school nahi aayega please chutti mark kar dijiye",
		},
	}

	resp := server.processInboundWhatsAppMessage(msg)
	if resp == nil || resp.Interactive == nil {
		t.Fatal("Expected interactive response for absence inquiry")
	}

	bodyText := resp.Interactive.Body.Text
	if !strings.Contains(bodyText, "LEAVE_APPLIED") {
		t.Fatalf("Expected status LEAVE_APPLIED in response, got: %s", bodyText)
	}
	if !strings.Contains(bodyText, "Anita Verma") {
		t.Fatalf("Expected teacher acknowledgement, got: %s", bodyText)
	}
}
