package main

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestCSVIngestionAPI(t *testing.T) {
	server := NewServer(nil, nil, "test_jwt_secret")

	// 1. Auto-detect columns endpoint
	headerPayload := `{"headers": ["Reg No", "Vidyarthi ka Naam", "Kaksha", "Sec", "DOB", "Mobile", "Pata"]}`
	req1 := httptest.NewRequest(http.MethodPost, "/v1/ingestion/auto-detect-columns", strings.NewReader(headerPayload))
	req1.Header.Set("Content-Type", "application/json")
	rr1 := httptest.NewRecorder()

	server.AutoDetectColumnsHandler(rr1, req1)
	if rr1.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for auto-detect, got %d", rr1.Code)
	}
	body1 := rr1.Body.String()
	if !strings.Contains(body1, "admission_number") || !strings.Contains(body1, "student_name") || !strings.Contains(body1, "guardian_phone") {
		t.Fatalf("Expected detected mappings for colloquial Indian headers, got: %s", body1)
	}

	// 2. CSV Upload Split Commit endpoint
	sampleCSV := `Adm No,S. Name,Class,Sec,DOB,Father Contact,Address
DPS-101,Aarav Sharma,Class 5,A,15/07/2014,+91 9876543210,Harmu
DPS-102,Bad Phone Student,Class 5,A,15/07/2014,12345,Bariatu`

	req2 := httptest.NewRequest(http.MethodPost, "/v1/ingestion/upload-csv", bytes.NewReader([]byte(sampleCSV)))
	req2.Header.Set("Content-Type", "text/csv")
	rr2 := httptest.NewRecorder()

	server.UploadCSVIngestionHandler(rr2, req2)
	if rr2.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for CSV upload, got %d: %s", rr2.Code, rr2.Body.String())
	}
	body2 := rr2.Body.String()
	if !strings.Contains(body2, "DPS-101") || !strings.Contains(body2, "valid_rows_imported\":1") || !strings.Contains(body2, "faulty_rows_count\":1") {
		t.Fatalf("Expected split commit with 1 valid imported and 1 faulty quarantined, got: %s", body2)
	}
}
