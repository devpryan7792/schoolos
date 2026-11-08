package ingestion

import (
	"strings"
	"testing"
)

func TestAutoDetectColumnMappings(t *testing.T) {
	headers := []string{"Adm No", "S. Name", "Class", "Sec", "DOB", "Father Contact", "Address"}
	mappings := AutoDetectColumnMappings(headers)

	if mappings[0] != FieldAdmissionNumber {
		t.Fatalf("Expected mappings[0] = admission_number, got: %s", mappings[0])
	}
	if mappings[1] != FieldStudentName {
		t.Fatalf("Expected mappings[1] = student_name, got: %s", mappings[1])
	}
	if mappings[4] != FieldDateOfBirth {
		t.Fatalf("Expected mappings[4] = date_of_birth, got: %s", mappings[4])
	}
	if mappings[5] != FieldGuardianPhone {
		t.Fatalf("Expected mappings[5] = guardian_phone, got: %s", mappings[5])
	}
}

func TestNormalizeIndianPhoneNumber(t *testing.T) {
	tests := []struct {
		input       string
		expected    string
		shouldError bool
	}{
		{"+91 98765 43210", "9876543210", false},
		{"919876543210", "9876543210", false},
		{"09876543210", "9876543210", false},
		{"9876543210", "9876543210", false},
		{"8431100223", "8431100223", false},
		{"7431100223", "7431100223", false},
		{"6431100223", "6431100223", false},
		{"5431100223", "", true}, // Invalid prefix (starts with 5)
		{"12345", "", true},      // Too short
		{"9876543210123", "", true}, // Too long
	}

	for _, tt := range tests {
		res, err := NormalizeIndianPhoneNumber(tt.input)
		if tt.shouldError {
			if err == nil {
				t.Errorf("Input %q should have errored, got %q", tt.input, res)
			}
		} else {
			if err != nil || res != tt.expected {
				t.Errorf("Input %q: expected %q, got %q (err=%v)", tt.input, tt.expected, res, err)
			}
		}
	}
}

func TestNormalizeDateString(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"15/07/2014", "2014-07-15"},
		{"15-07-2014", "2014-07-15"},
		{"15.07.2014", "2014-07-15"},
		{"2014-07-15", "2014-07-15"},
		{"15-Jul-2014", "2014-07-15"},
	}

	for _, tt := range tests {
		res, err := NormalizeDateString(tt.input)
		if err != nil || res != tt.expected {
			t.Errorf("Input %q: expected %q, got %q (err=%v)", tt.input, tt.expected, res, err)
		}
	}
}

func TestProcessCSVIngestionSplitCommit(t *testing.T) {
	// Sample raw CSV with:
	// Row 2: Valid student (Aarav)
	// Row 3: Valid student (Ananya)
	// Row 4: Faulty student (Invalid phone "12345") -> must quarantine
	// Row 5: Faulty student (Duplicate Admission number "DPS-001") -> must quarantine
	// Row 6: Faulty student (Invalid date "bad-date") -> must quarantine
	rawCSV := `Adm No,S. Name,Class,Sec,DOB,Father Contact,Address
DPS-001,Aarav Sharma,Class 5,A,15/07/2014,+91 9876543210,Harmu Colony
DPS-002,Ananya Sharma,Class 2,B,20/11/2017,9876543211,Harmu Colony
DPS-003,Rohan Verma,Class 5,A,10/05/2014,12345,Bariatu
DPS-001,Duplicate Student,Class 5,A,12/12/2014,9876543212,Doranda
DPS-005,Sunita Soren,Class 8,C,invalid-date,9876543213,Morabadi`

	existingDB := map[string]bool{"DPS-999": true}
	res, err := ProcessCSVIngestion(strings.NewReader(rawCSV), existingDB)
	if err != nil {
		t.Fatalf("Failed to process CSV ingestion: %v", err)
	}

	// Total data rows = 5
	if res.TotalRowsRead != 5 {
		t.Fatalf("Expected 5 total rows read, got %d", res.TotalRowsRead)
	}
	// 2 clean rows imported
	if res.ValidRowsImported != 2 {
		t.Fatalf("Expected 2 valid rows imported, got %d", res.ValidRowsImported)
	}
	// 3 faulty rows quarantined
	if res.FaultyRowsCount != 3 {
		t.Fatalf("Expected 3 faulty rows quarantined, got %d", res.FaultyRowsCount)
	}
	// Success rate = 40.0%
	if res.SuccessRatePct != 40.0 {
		t.Fatalf("Expected 40.0%% success rate, got %.1f%%", res.SuccessRatePct)
	}

	// Verify Clean Rows
	aarav := res.ImportedStudents[0]
	if aarav.AdmissionNumber != "DPS-001" || aarav.StudentName != "Aarav Sharma" || aarav.DateOfBirth != "2014-07-15" || aarav.GuardianPhone != "+919876543210" {
		t.Fatalf("Unexpected clean row 1: %+v", aarav)
	}

	// Verify Quarantined Rows have Hindi hints
	if len(res.QuarantinedErrors) != 3 {
		t.Fatalf("Expected 3 quarantined error records, got %d", len(res.QuarantinedErrors))
	}
	err1 := res.QuarantinedErrors[0] // Invalid phone in row 4
	if err1.RowNumber != 4 || !strings.Contains(err1.FaultyColumn, "Guardian Phone") || err1.HindiHint == "" {
		t.Fatalf("Expected row 4 phone error with Hindi hint, got: %+v", err1)
	}

	err2 := res.QuarantinedErrors[1] // Duplicate Adm No in row 5
	if err2.RowNumber != 5 || !strings.Contains(err2.ErrorMessage, "Duplicate") {
		t.Fatalf("Expected duplicate admission error, got: %+v", err2)
	}
}
