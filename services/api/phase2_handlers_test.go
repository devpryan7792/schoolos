package main

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestDunningPlansAndPrincipalDigestAPI(t *testing.T) {
	server := NewServer(nil, nil, "test_jwt_secret")

	// 1. Dunning plans endpoint
	req1 := httptest.NewRequest(http.MethodGet, "/v1/dunning/plans", nil)
	rr1 := httptest.NewRecorder()
	server.DunningPlansHandler(rr1, req1)

	if rr1.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for dunning plans, got %d", rr1.Code)
	}
	if !strings.Contains(rr1.Body.String(), "Aarav Sharma") || !strings.Contains(rr1.Body.String(), "upi://pay?pa=school@icici") {
		t.Fatalf("Unexpected dunning response: %s", rr1.Body.String())
	}

	// 2. Principal morning digest endpoint
	req2 := httptest.NewRequest(http.MethodGet, "/v1/reports/principal-digest", nil)
	rr2 := httptest.NewRecorder()
	server.PrincipalMorningDigestHandler(rr2, req2)

	if rr2.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for principal digest, got %d", rr2.Code)
	}
	if !strings.Contains(rr2.Body.String(), "184200") {
		t.Fatalf("Expected yesterday fees collected in digest, got: %s", rr2.Body.String())
	}
}

func TestDocumentGeneratorEndpoints(t *testing.T) {
	server := NewServer(nil, nil, "test_jwt_secret")

	// 1. CR80 Student ID Card SVG
	req1 := httptest.NewRequest(http.MethodGet, "/v1/documents/id-card/d1a80101-0000-0000-0000-000000000001", nil)
	rr1 := httptest.NewRecorder()
	server.StudentIDCardHandler(rr1, req1)

	if rr1.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for ID card, got %d", rr1.Code)
	}
	if rr1.Header().Get("Content-Type") != "image/svg+xml" {
		t.Fatalf("Expected image/svg+xml, got %s", rr1.Header().Get("Content-Type"))
	}
	if !strings.Contains(rr1.Body.String(), "<svg") || !strings.Contains(rr1.Body.String(), "Aarav Sharma") {
		t.Fatal("Expected SVG markup with student name")
	}

	// 2. Admit Card with Fee Lock
	req2 := httptest.NewRequest(http.MethodGet, "/v1/documents/admit-card/d1a80101-0000-0000-0000-000000000001", nil)
	rr2 := httptest.NewRecorder()
	server.AdmitCardHandler(rr2, req2)

	if rr2.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for admit card check, got %d", rr2.Code)
	}
	if !strings.Contains(rr2.Body.String(), "FEES DUE") || !strings.Contains(rr2.Body.String(), "is_locked\":true") {
		t.Fatalf("Expected locked admit card due to pending fee, got: %s", rr2.Body.String())
	}

	// 3. Transfer Certificate with Clearance check
	tcReqPayload := `{
		"admission_number": "DPS-2024-042",
		"student_name": "Aarav Sharma",
		"mother_name": "Sunita Sharma",
		"father_name": "Rajesh Sharma",
		"date_of_birth": "15/07/2014",
		"class_last": "Class 10",
		"clearances": {
			"library_pending_books": 0,
			"lab_breakage_dues": 0.00,
			"outstanding_fees": 0.00
		}
	}`
	req3 := httptest.NewRequest(http.MethodPost, "/v1/documents/transfer-certificate", bytes.NewReader([]byte(tcReqPayload)))
	req3.Header.Set("Content-Type", "application/json")
	rr3 := httptest.NewRecorder()
	server.TransferCertificateHandler(rr3, req3)

	if rr3.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for approved TC, got %d: %s", rr3.Code, rr3.Body.String())
	}
	if !strings.Contains(rr3.Body.String(), "verification_hash") || !strings.Contains(rr3.Body.String(), "is_approved\":true") {
		t.Fatalf("Expected approved TC with verification hash, got: %s", rr3.Body.String())
	}

	// 4. TC Blocked when clearance fails
	tcBlockedPayload := `{
		"admission_number": "DPS-2024-042",
		"student_name": "Aarav Sharma",
		"mother_name": "Sunita Sharma",
		"father_name": "Rajesh Sharma",
		"date_of_birth": "15/07/2014",
		"class_last": "Class 10",
		"clearances": {
			"library_pending_books": 2,
			"lab_breakage_dues": 0.00,
			"outstanding_fees": 4200.00
		}
	}`
	req4 := httptest.NewRequest(http.MethodPost, "/v1/documents/transfer-certificate", bytes.NewReader([]byte(tcBlockedPayload)))
	req4.Header.Set("Content-Type", "application/json")
	rr4 := httptest.NewRecorder()
	server.TransferCertificateHandler(rr4, req4)

	if rr4.Code != http.StatusConflict {
		t.Fatalf("Expected 409 Conflict for blocked clearances, got %d", rr4.Code)
	}
	if !strings.Contains(rr4.Body.String(), "CLEARANCE_BLOCKED") {
		t.Fatalf("Expected CLEARANCE_BLOCKED status, got: %s", rr4.Body.String())
	}
}

func TestADMSBiometricAPI(t *testing.T) {
	server := NewServer(nil, nil, "test_jwt_secret")

	// Inbound punch log
	rawLog := "101\t2026-11-08 08:02:15\t0\t1\n"
	req := httptest.NewRequest(http.MethodPost, "/iclock/cdata?SN=ZK-BIOM-01", bytes.NewReader([]byte(rawLog)))
	rr := httptest.NewRecorder()

	server.ADMSBiometricHandler(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d", rr.Code)
	}
	if rr.Body.String() != "OK: 1" {
		t.Fatalf("Expected 'OK: 1' device response, got %s", rr.Body.String())
	}
}
