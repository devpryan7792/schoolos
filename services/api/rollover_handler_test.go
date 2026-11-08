package main

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestAcademicSessionRolloverAPI(t *testing.T) {
	server := NewServer(nil, nil, "test_jwt_secret")

	// 1. POST Rollover Execution
	req1 := httptest.NewRequest(http.MethodPost, "/v1/academic-sessions/rollover", nil)
	rr1 := httptest.NewRecorder()
	server.AcademicSessionRolloverHandler(rr1, req1)

	if rr1.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for rollover execution, got %d: %s", rr1.Code, rr1.Body.String())
	}
	body := rr1.Body.String()
	if !strings.Contains(body, "2025-2026") || !strings.Contains(body, "2026-2027") {
		t.Fatalf("Expected session names in rollover response, got: %s", body)
	}
	if !strings.Contains(body, "Class 5") || !strings.Contains(body, "total_arrears_carried") {
		t.Fatalf("Expected student promotion to Class 5 and arrears carryforward in response, got: %s", body)
	}

	// 2. GET Rollover Audit Trail
	req2 := httptest.NewRequest(http.MethodGet, "/v1/academic-sessions/rollover/rollover-2026-001/audit", nil)
	rr2 := httptest.NewRecorder()
	server.AcademicSessionAuditHandler(rr2, req2)

	if rr2.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for audit trail, got %d", rr2.Code)
	}
	if !strings.Contains(rr2.Body.String(), "FROZEN_IMMUTABLE") || !strings.Contains(rr2.Body.String(), "audit_seal_hash") {
		t.Fatalf("Expected frozen status and audit hash, got: %s", rr2.Body.String())
	}
}
