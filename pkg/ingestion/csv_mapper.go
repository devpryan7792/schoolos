package ingestion

import (
	"encoding/csv"
	"fmt"
	"io"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
)

// Canonical fields expected by SchoolOS Student Information System
type CanonicalField string

const (
	FieldAdmissionNumber CanonicalField = "admission_number"
	FieldStudentName     CanonicalField = "student_name"
	FieldClassName       CanonicalField = "class_name"
	FieldSectionName     CanonicalField = "section_name"
	FieldDateOfBirth     CanonicalField = "date_of_birth"
	FieldGender          CanonicalField = "gender"
	FieldGuardianName    CanonicalField = "guardian_name"
	FieldGuardianPhone   CanonicalField = "guardian_phone"
	FieldAddress         CanonicalField = "address"
	FieldBloodGroup      CanonicalField = "blood_group"
)

// Heuristic synonyms dictionary for Indian school legacy formats
var fieldSynonyms = map[CanonicalField][]string{
	FieldAdmissionNumber: {"admission number", "admission no", "adm no", "reg no", "registration no", "scholar no", "sr no", "roll no", "dakhila no", "admission_no"},
	FieldStudentName:     {"student name", "name of student", "student's name", "name", "full name", "vidyarthi ka naam", "s. name", "s name", "candidate name"},
	FieldClassName:       {"class", "grade", "std", "standard", "kaksha", "class name"},
	FieldSectionName:     {"section", "sec", "sec name", "vibhag"},
	FieldDateOfBirth:     {"date of birth", "dob", "birth date", "janam tithi", "date_of_birth"},
	FieldGender:          {"gender", "sex", "ling"},
	FieldGuardianName:    {"guardian name", "father name", "father's name", "parent name", "guardian", "pita ka naam", "father"},
	FieldGuardianPhone:   {"guardian phone", "father contact", "father mobile", "mobile", "phone", "contact", "whatsapp no", "mobile no", "contact no", "phone no"},
	FieldAddress:         {"address", "residential address", "home address", "pata", "city"},
	FieldBloodGroup:      {"blood group", "blood grp", "bg", "blood"},
}

// AutoDetectColumnMappings matches legacy spreadsheet header names to canonical SchoolOS fields
func AutoDetectColumnMappings(headers []string) map[int]CanonicalField {
	mappings := make(map[int]CanonicalField)
	usedFields := make(map[CanonicalField]bool)

	for colIdx, rawHeader := range headers {
		clean := strings.ToLower(strings.TrimSpace(rawHeader))
		// Clean punctuation
		clean = regexp.MustCompile(`[^a-z0-9\s]`).ReplaceAllString(clean, " ")
		clean = strings.TrimSpace(regexp.MustCompile(`\s+`).ReplaceAllString(clean, " "))

		var matched CanonicalField
		var bestScore int

		for canonical, synonyms := range fieldSynonyms {
			if usedFields[canonical] {
				continue
			}

			// Exact match with canonical name
			if clean == string(canonical) {
				matched = canonical
				bestScore = 100
				break
			}

			for _, syn := range synonyms {
				if clean == syn {
					matched = canonical
					bestScore = 90
					break
				}
				if strings.Contains(clean, syn) && len(syn) > bestScore {
					matched = canonical
					bestScore = len(syn)
				}
			}
		}

		if matched != "" && bestScore >= 3 {
			mappings[colIdx] = matched
			usedFields[matched] = true
		}
	}

	return mappings
}

type CleanStudentRow struct {
	RowNumber       int            `json:"row_number"`
	StudentID       uuid.UUID      `json:"student_id"`
	AdmissionNumber string         `json:"admission_number"`
	StudentName     string         `json:"student_name"`
	ClassName       string         `json:"class_name"`
	SectionName     string         `json:"section_name"`
	DateOfBirth     string         `json:"date_of_birth"` // Normalized YYYY-MM-DD
	Gender          string         `json:"gender"`        // MALE, FEMALE, OTHER
	GuardianName    string         `json:"guardian_name"`
	GuardianPhone   string         `json:"guardian_phone"` // Normalized 10-digit mobile
	Address         string         `json:"address"`
	BloodGroup      string         `json:"blood_group"`
}

type QuarantinedErrorRow struct {
	RowNumber    int    `json:"row_number"`
	FaultyColumn string `json:"faulty_column"`
	InvalidValue string `json:"invalid_value"`
	ErrorMessage string `json:"error_message"`
	HindiHint    string `json:"hindi_hint"`
}

type IngestionJobResult struct {
	JobID             uuid.UUID             `json:"job_id"`
	TotalRowsRead     int                   `json:"total_rows_read"`
	ValidRowsImported int                   `json:"valid_rows_imported"`
	FaultyRowsCount   int                   `json:"faulty_rows_count"`
	SuccessRatePct    float64               `json:"success_rate_pct"`
	ImportedStudents  []CleanStudentRow     `json:"imported_students"`
	QuarantinedErrors []QuarantinedErrorRow `json:"quarantined_errors"`
	ExecutedAt        time.Time             `json:"executed_at"`
}

// NormalizeIndianPhoneNumber extracts standard 10-digit mobile number from strings like "+91 9876543210", "09876543210"
func NormalizeIndianPhoneNumber(raw string) (string, error) {
	digits := regexp.MustCompile(`\D`).ReplaceAllString(raw, "")
	if strings.HasPrefix(digits, "91") && len(digits) == 12 {
		digits = digits[2:]
	} else if strings.HasPrefix(digits, "0") && len(digits) == 11 {
		digits = digits[1:]
	}

	if len(digits) != 10 {
		return "", fmt.Errorf("invalid mobile number length: expected 10 digits, got %d (%s)", len(digits), raw)
	}

	firstDigit := digits[0]
	if firstDigit < '6' || firstDigit > '9' {
		return "", fmt.Errorf("invalid Indian mobile prefix: must start with 6-9, got '%c'", firstDigit)
	}

	return digits, nil
}

// NormalizeDateString standardizes various Indian date formats (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD) to ISO YYYY-MM-DD
func NormalizeDateString(raw string) (string, error) {
	clean := strings.TrimSpace(raw)
	layouts := []string{
		"02/01/2006",
		"02-01-2006",
		"02.01.2006",
		"2006-01-02",
		"2006/01/02",
		"2-1-2006",
		"02-Jan-2006",
		"02-Jan-06",
	}

	for _, l := range layouts {
		if t, err := time.Parse(l, clean); err == nil {
			return t.Format("2006-01-02"), nil
		}
	}

	return "", fmt.Errorf("unrecognized date format: %q (expected DD/MM/YYYY or YYYY-MM-DD)", raw)
}

// ProcessCSVIngestion executes the Split-Commit pipeline: clean rows are staged, invalid rows are quarantined
func ProcessCSVIngestion(r io.Reader, existingAdmissionNumbers map[string]bool) (*IngestionJobResult, error) {
	reader := csv.NewReader(r)
	reader.TrimLeadingSpace = true
	reader.FieldsPerRecord = -1 // Allow variable lengths gracefully

	headers, err := reader.Read()
	if err != nil {
		return nil, fmt.Errorf("failed to read CSV headers: %w", err)
	}

	mappings := AutoDetectColumnMappings(headers)
	if len(mappings) < 2 {
		return nil, fmt.Errorf("INSUFFICIENT_COLUMNS: Auto-detect could not map essential fields (found %d mappings)", len(mappings))
	}

	var imported []CleanStudentRow
	var quarantined []QuarantinedErrorRow

	seenInFile := make(map[string]int) // admNum -> rowNum
	rowNum := 1                        // 1-indexed (header is row 1)

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			continue // skip corrupted line
		}

		rowNum++
		// Extract raw mapped values
		rowValues := make(map[CanonicalField]string)
		for colIdx, canonical := range mappings {
			if colIdx < len(record) {
				rowValues[canonical] = strings.TrimSpace(record[colIdx])
			}
		}

		// Validation 1: Admission Number
		admNum := rowValues[FieldAdmissionNumber]
		if admNum == "" {
			quarantined = append(quarantined, QuarantinedErrorRow{
				RowNumber:    rowNum,
				FaultyColumn: "Admission Number",
				InvalidValue: "",
				ErrorMessage: "Admission Number cannot be blank",
				HindiHint:    "नामांकन संख्या खाली नहीं हो सकती",
			})
			continue
		}

		if firstSeenRow, exists := seenInFile[admNum]; exists {
			quarantined = append(quarantined, QuarantinedErrorRow{
				RowNumber:    rowNum,
				FaultyColumn: "Admission Number",
				InvalidValue: admNum,
				ErrorMessage: fmt.Sprintf("Duplicate Admission Number (already used in row %d)", firstSeenRow),
				HindiHint:    fmt.Sprintf("यह नामांकन संख्या पंक्ति %d में पहले से मौजूद है", firstSeenRow),
			})
			continue
		}

		if existingAdmissionNumbers != nil && existingAdmissionNumbers[admNum] {
			quarantined = append(quarantined, QuarantinedErrorRow{
				RowNumber:    rowNum,
				FaultyColumn: "Admission Number",
				InvalidValue: admNum,
				ErrorMessage: "Admission Number already exists in school database",
				HindiHint:    "यह नामांकन संख्या विद्यालय के डेटाबेस में पहले से दर्ज है",
			})
			continue
		}
		seenInFile[admNum] = rowNum

		// Validation 2: Student Name
		studentName := rowValues[FieldStudentName]
		if studentName == "" {
			quarantined = append(quarantined, QuarantinedErrorRow{
				RowNumber:    rowNum,
				FaultyColumn: "Student Name",
				InvalidValue: "",
				ErrorMessage: "Student Name cannot be blank",
				HindiHint:    "विद्यार्थी का नाम अनिवार्य है",
			})
			continue
		}

		// Validation 3: Date of Birth
		var normDOB string
		if rawDOB := rowValues[FieldDateOfBirth]; rawDOB != "" {
			nd, err := NormalizeDateString(rawDOB)
			if err != nil {
				quarantined = append(quarantined, QuarantinedErrorRow{
					RowNumber:    rowNum,
					FaultyColumn: "Date of Birth",
					InvalidValue: rawDOB,
					ErrorMessage: err.Error(),
					HindiHint:    "जन्म तिथि DD/MM/YYYY प्रारूप में होनी चाहिए (उदा: 15/07/2014)",
				})
				continue
			}
			normDOB = nd
		} else {
			normDOB = "2015-01-01" // default fallback if optional
		}

		// Validation 4: Guardian Phone
		var normPhone string
		if rawPhone := rowValues[FieldGuardianPhone]; rawPhone != "" {
			np, err := NormalizeIndianPhoneNumber(rawPhone)
			if err != nil {
				quarantined = append(quarantined, QuarantinedErrorRow{
					RowNumber:    rowNum,
					FaultyColumn: "Guardian Phone",
					InvalidValue: rawPhone,
					ErrorMessage: err.Error(),
					HindiHint:    "अभिभावक का मोबाइल नंबर 10 अंकों का होना चाहिए (उदा: 9876543210)",
				})
				continue
			}
			normPhone = "+91" + np
		} else {
			normPhone = "+919800000000"
		}

		// Validation 5: Gender Normalization
		gender := strings.ToUpper(rowValues[FieldGender])
		if strings.HasPrefix(gender, "M") || strings.Contains(gender, "BOY") {
			gender = "MALE"
		} else if strings.HasPrefix(gender, "F") || strings.Contains(gender, "GIRL") {
			gender = "FEMALE"
		} else {
			gender = "MALE"
		}

		className := rowValues[FieldClassName]
		if className == "" {
			className = "Class 1"
		}
		sectionName := rowValues[FieldSectionName]
		if sectionName == "" {
			sectionName = "A"
		}

		imported = append(imported, CleanStudentRow{
			RowNumber:       rowNum,
			StudentID:       uuid.New(),
			AdmissionNumber: admNum,
			StudentName:     studentName,
			ClassName:       className,
			SectionName:     sectionName,
			DateOfBirth:     normDOB,
			Gender:          gender,
			GuardianName:    rowValues[FieldGuardianName],
			GuardianPhone:   normPhone,
			Address:         rowValues[FieldAddress],
			BloodGroup:      rowValues[FieldBloodGroup],
		})
	}

	totalRows := len(imported) + len(quarantined)
	successRate := 0.0
	if totalRows > 0 {
		successRate = float64(len(imported)) / float64(totalRows) * 100.0
	}

	return &IngestionJobResult{
		JobID:             uuid.New(),
		TotalRowsRead:     totalRows,
		ValidRowsImported: len(imported),
		FaultyRowsCount:   len(quarantined),
		SuccessRatePct:    successRate,
		ImportedStudents:  imported,
		QuarantinedErrors: quarantined,
		ExecutedAt:        time.Now().UTC(),
	}, nil
}
