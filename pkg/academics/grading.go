package academics

import (
	"fmt"
	"math"
)

type EducationalBoard string

const (
	BoardCBSE  EducationalBoard = "CBSE"  // Central Board of Secondary Education
	BoardICSE  EducationalBoard = "ICSE"  // Council for the Indian School Certificate Examinations
	BoardState EducationalBoard = "BSEB"  // State Board (e.g. Bihar BSEB, Jharkhand JAC)
)

type GradeResult struct {
	Percentage  float64
	Grade       string
	GradePoint  float64
	Division    string // "1st Division", "2nd Division", "3rd Division", "Failed"
	Status      string // "PASSED", "COMPARTMENT", "FAILED"
	Description string
}

type SubjectMark struct {
	SubjectCode string  `json:"subject_code"`
	SubjectName string  `json:"subject_name"`
	HindiName   string  `json:"hindi_name"` // e.g. "गणित"
	MaxMarks    float64 `json:"max_marks"`
	TheoryMarks float64 `json:"theory_marks"`
	PracMarks   float64 `json:"prac_marks"`
	TotalMarks  float64 `json:"total_marks"`
	Grade       string  `json:"grade"`
	GradePoint  float64 `json:"grade_point"`
	IsPassed    bool    `json:"is_passed"`
}

type StudentMarksheet struct {
	StudentID       string        `json:"student_id"`
	AdmissionNumber string        `json:"admission_number"`
	StudentName     string        `json:"student_name"`
	RollNumber      string        `json:"roll_number"`
	ClassName       string        `json:"class_name"`
	SectionName     string        `json:"section_name"`
	Board           EducationalBoard `json:"board"`
	Subjects        []SubjectMark `json:"subjects"`
	GrandTotal      float64       `json:"grand_total"`
	MaxTotal        float64       `json:"max_total"`
	Percentage      float64       `json:"percentage"`
	OverallGrade    string        `json:"overall_grade"`
	GPA             float64       `json:"gpa"`
	Division        string        `json:"division"`
	ResultStatus    string        `json:"result_status"`
	Rank            int           `json:"rank,omitempty"`
}

// CalculateCBSEGrade computes CBSE 9-point scale grade and grade point from percentage (0-100)
// A1: 91-100 (10.0), A2: 81-90 (9.0), B1: 71-80 (8.0), B2: 61-70 (7.0)
// C1: 51-60 (6.0), C2: 41-50 (5.0), D: 33-40 (4.0), E1: 21-32 (Fail), E2: 0-20 (Fail)
func CalculateCBSEGrade(pct float64) (grade string, gp float64) {
	switch {
	case pct >= 91.0:
		return "A1", 10.0
	case pct >= 81.0:
		return "A2", 9.0
	case pct >= 71.0:
		return "B1", 8.0
	case pct >= 61.0:
		return "B2", 7.0
	case pct >= 51.0:
		return "C1", 6.0
	case pct >= 41.0:
		return "C2", 5.0
	case pct >= 33.0:
		return "D", 4.0
	case pct >= 21.0:
		return "E1", 0.0
	default:
		return "E2", 0.0
	}
}

// CalculateStateBoardDivision calculates 1st, 2nd, 3rd Division for BSEB / JAC State Boards
// 1st Div: >= 60%, 2nd Div: 45% - 59.9%, 3rd Div: 33% - 44.9%, Fail: < 33%
func CalculateStateBoardDivision(pct float64) string {
	switch {
	case pct >= 60.0:
		return "1st Division (प्रथम श्रेणी)"
	case pct >= 45.0:
		return "2nd Division (द्वितीय श्रेणी)"
	case pct >= 33.0:
		return "3rd Division (तृतीय श्रेणी)"
	default:
		return "Failed (अनुत्तीर्ण)"
	}
}

// EvaluateMarksheet evaluates student marks according to the school's affiliated board
func EvaluateMarksheet(
	studentID, admNum, name, rollNum, className, secName string,
	board EducationalBoard,
	subjects []SubjectMark,
) StudentMarksheet {
	grandTotal := 0.0
	maxTotal := 0.0
	totalGP := 0.0
	failedCount := 0

	evaluatedSubjects := make([]SubjectMark, len(subjects))
	for i, sub := range subjects {
		total := sub.TheoryMarks + sub.PracMarks
		sub.TotalMarks = total
		grandTotal += total
		maxTotal += sub.MaxMarks

		pct := (total / sub.MaxMarks) * 100.0
		grade, gp := CalculateCBSEGrade(pct)
		sub.Grade = grade
		sub.GradePoint = gp
		sub.IsPassed = pct >= 33.0

		if !sub.IsPassed {
			failedCount++
		}
		totalGP += gp
		evaluatedSubjects[i] = sub
	}

	overallPct := 0.0
	if maxTotal > 0 {
		overallPct = math.Round((grandTotal/maxTotal)*10000) / 100.0
	}

	overallGrade, _ := CalculateCBSEGrade(overallPct)
	gpa := 0.0
	if len(subjects) > 0 {
		gpa = math.Round((totalGP/float64(len(subjects)))*100) / 100.0
	}

	division := CalculateStateBoardDivision(overallPct)

	status := "PASSED"
	if failedCount == 1 {
		status = "COMPARTMENT"
	} else if failedCount > 1 {
		status = "FAILED"
	}

	return StudentMarksheet{
		StudentID:       studentID,
		AdmissionNumber: admNum,
		StudentName:     name,
		RollNumber:      rollNum,
		ClassName:       className,
		SectionName:     secName,
		Board:           board,
		Subjects:        evaluatedSubjects,
		GrandTotal:      grandTotal,
		MaxTotal:        maxTotal,
		Percentage:      overallPct,
		OverallGrade:    overallGrade,
		GPA:             gpa,
		Division:        division,
		ResultStatus:    status,
	}
}

// ComputeBroadsheetRanks calculates ranks and class statistics across all marksheet entries
func ComputeBroadsheetRanks(marksheets []StudentMarksheet) []StudentMarksheet {
	// Simple in-place ranking based on GrandTotal descending
	n := len(marksheets)
	for i := 0; i < n; i++ {
		rank := 1
		for j := 0; j < n; j++ {
			if marksheets[j].GrandTotal > marksheets[i].GrandTotal {
				rank++
			}
		}
		marksheets[i].Rank = rank
	}
	return marksheets
}

// FormatBilingualSubject returns Hindi/English bilingual formatting for State Board transcripts
func FormatBilingualSubject(english, hindi string) string {
	if hindi == "" {
		return english
	}
	return fmt.Sprintf("%s (%s)", english, hindi)
}
