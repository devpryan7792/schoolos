package academics

import (
	"strings"
	"testing"
)

func TestCalculateCBSEGrade(t *testing.T) {
	tests := []struct {
		pct      float64
		expected string
		gp       float64
	}{
		{95.0, "A1", 10.0},
		{85.5, "A2", 9.0},
		{74.0, "B1", 8.0},
		{65.0, "B2", 7.0},
		{55.0, "C1", 6.0},
		{45.0, "C2", 5.0},
		{35.0, "D", 4.0},
		{25.0, "E1", 0.0},
		{15.0, "E2", 0.0},
	}

	for _, tt := range tests {
		g, gp := CalculateCBSEGrade(tt.pct)
		if g != tt.expected || gp != tt.gp {
			t.Errorf("Percentage %.1f: expected (%s, %.1f), got (%s, %.1f)", tt.pct, tt.expected, tt.gp, g, gp)
		}
	}
}

func TestCalculateStateBoardDivision(t *testing.T) {
	div1 := CalculateStateBoardDivision(72.5)
	if !strings.Contains(div1, "1st Division") || !strings.Contains(div1, "प्रथम श्रेणी") {
		t.Fatalf("Expected 1st division with Devanagari translation, got: %s", div1)
	}

	div2 := CalculateStateBoardDivision(52.0)
	if !strings.Contains(div2, "2nd Division") || !strings.Contains(div2, "द्वितीय श्रेणी") {
		t.Fatalf("Expected 2nd division, got: %s", div2)
	}

	div3 := CalculateStateBoardDivision(38.0)
	if !strings.Contains(div3, "3rd Division") || !strings.Contains(div3, "तृतीय श्रेणी") {
		t.Fatalf("Expected 3rd division, got: %s", div3)
	}
}

func TestEvaluateMarksheetAndBroadsheetRanking(t *testing.T) {
	student1Subs := []SubjectMark{
		{SubjectCode: "041", SubjectName: "Mathematics", HindiName: "गणित", MaxMarks: 100, TheoryMarks: 75, PracMarks: 20},
		{SubjectCode: "086", SubjectName: "Science", HindiName: "विज्ञान", MaxMarks: 100, TheoryMarks: 70, PracMarks: 18},
		{SubjectCode: "184", SubjectName: "English", HindiName: "अंग्रेजी", MaxMarks: 100, TheoryMarks: 82, PracMarks: 0},
	}

	m1 := EvaluateMarksheet("s1", "DPS-001", "Aarav Sharma", "01", "Class 10", "A", BoardCBSE, student1Subs)

	if m1.GrandTotal != 265.0 {
		t.Fatalf("Expected Grand Total 265, got %.1f", m1.GrandTotal)
	}
	if m1.Percentage != 88.33 {
		t.Fatalf("Expected percentage 88.33, got %.2f", m1.Percentage)
	}
	if m1.OverallGrade != "A2" {
		t.Fatalf("Expected overall grade A2, got %s", m1.OverallGrade)
	}
	if m1.ResultStatus != "PASSED" {
		t.Fatalf("Expected PASSED, got %s", m1.ResultStatus)
	}

	// Student 2 with lower marks
	student2Subs := []SubjectMark{
		{SubjectCode: "041", SubjectName: "Mathematics", MaxMarks: 100, TheoryMarks: 50, PracMarks: 15},
		{SubjectCode: "086", SubjectName: "Science", MaxMarks: 100, TheoryMarks: 50, PracMarks: 15},
		{SubjectCode: "184", SubjectName: "English", MaxMarks: 100, TheoryMarks: 60, PracMarks: 0},
	}
	m2 := EvaluateMarksheet("s2", "DPS-002", "Rohan Kumar", "02", "Class 10", "A", BoardCBSE, student2Subs)

	ranked := ComputeBroadsheetRanks([]StudentMarksheet{m2, m1})
	// m1 (GrandTotal 265) should be Rank 1, m2 (GrandTotal 190) should be Rank 2
	if ranked[1].Rank != 1 || ranked[0].Rank != 2 {
		t.Fatalf("Expected Aarav Rank 1 and Rohan Rank 2, got Aarav=%d, Rohan=%d", ranked[1].Rank, ranked[0].Rank)
	}
}
