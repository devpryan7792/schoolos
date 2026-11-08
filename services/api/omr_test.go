package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestOMREvaluateAPI(t *testing.T) {
	server := NewServer(nil, nil, "test_jwt_secret")

	reqBody := OMREvaluateRequest{
		ExamID:         "EXAM-TERM1-MATH-2026",
		StudentID:      "d1a80101-0000-0000-0000-000000000001",
		StudentName:    "Aarav Sharma",
		AdmissionNum:   "DPS-2024-042",
		Subject:        "Mathematics",
		TotalQuestions: 50,
		MasterKey:      "ABCDABCDABCDABCDABCDABCDABCDABCDABCDABCDABCDABCDAB",
		PositiveMarks:  4.0,
		NegativeMarks:  1.0,
		DoubleBubbles:  []int{49},
		Unattempted:    []int{50},
		MarkedAnswers: map[int]string{
			1: "A",
			2: "B",
			3: "C",
			4: "D",
			5: "A",
			6: "B",
			7: "C",
			8: "D",
		},
	}

	payload, err := json.Marshal(reqBody)
	if err != nil {
		t.Fatalf("Failed to marshal request: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/v1/omr/evaluate", bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	server.OMREvaluateHandler(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d: %s", rr.Code, rr.Body.String())
	}

	var resp OMREvaluateResponse
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if resp.TotalQuestions != 50 {
		t.Fatalf("Expected 50 total questions, got %d", resp.TotalQuestions)
	}
	if resp.Ambiguous != 1 {
		t.Fatalf("Expected 1 ambiguous question flagged, got %d", resp.Ambiguous)
	}
	if resp.Unattempted != 1 {
		t.Fatalf("Expected 1 unattempted question, got %d", resp.Unattempted)
	}
	if resp.Status != "FLAGGED_FOR_REVIEW" {
		t.Fatalf("Expected status FLAGGED_FOR_REVIEW due to double-bubble, got %s", resp.Status)
	}
	if resp.EvaluationTimeMs >= 1000.0 {
		t.Fatalf("Evaluation took >= 1000ms: %f ms", resp.EvaluationTimeMs)
	}
}
