package main

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/schoolos/schoolos/pkg/biometric"
	"github.com/schoolos/schoolos/pkg/documents"
	"github.com/schoolos/schoolos/pkg/dunning"
	"github.com/shopspring/decimal"
)

// DunningPlansHandler implements GET /v1/dunning/plans (AGENT-30)
func (s *Server) DunningPlansHandler(w http.ResponseWriter, r *http.Request) {
	today := time.Now()
	dueDate := time.Date(2026, 11, 10, 0, 0, 0, 0, time.UTC)
	gross := decimal.NewFromFloat(4500.00)
	lateFee := decimal.NewFromFloat(200.00)
	concession := decimal.NewFromFloat(500.00)
	netDue := gross.Sub(concession).Add(lateFee)

	plan1 := dunning.DunningPlan{
		InvoiceID:         uuid.MustParse("d1a80101-0000-0000-0000-000000000042"),
		StudentID:         uuid.MustParse("d1a80101-0000-0000-0000-000000000001"),
		StudentName:       "Aarav Sharma",
		AdmissionNumber:   "DPS-2024-042",
		GuardianName:      "Rajesh Sharma",
		GuardianPhone:     "+919876543210",
		DueDate:           dueDate,
		GrossAmount:       gross,
		LateFeeAmount:     lateFee,
		CurrentDues:       netDue,
		CurrentState:      dunning.ComputeDunningState(dueDate, netDue, today),
		ConsecutiveAbsences: 1,
		AcademicTrendDropPct: 3.5,
		IsDropoutRisk:     false,
	}

	headline, msg, upi := dunning.FormatDunningMessage(plan1, "school@icici", "Delhi Public School")

	resp := map[string]any{
		"plans": []map[string]any{
			{
				"student_id":       plan1.StudentID.String(),
				"student_name":     plan1.StudentName,
				"admission_number": plan1.AdmissionNumber,
				"current_state":    plan1.CurrentState,
				"current_dues":     plan1.CurrentDues,
				"due_date":         plan1.DueDate.Format("2006-01-02"),
				"whatsapp_preview": map[string]string{
					"headline": headline,
					"body":     msg,
					"upi_link": upi,
				},
				"dropout_risk": map[string]any{
					"is_at_risk":           plan1.IsDropoutRisk,
					"consecutive_absences": plan1.ConsecutiveAbsences,
				},
			},
		},
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}

// PrincipalMorningDigestHandler implements GET /v1/reports/principal-digest (AGENT-30)
func (s *Server) PrincipalMorningDigestHandler(w http.ResponseWriter, r *http.Request) {
	digest := dunning.GeneratePrincipalDigest(
		decimal.NewFromFloat(184200.00),
		4, 45,      // 4 absent out of 45 staff
		1150, 1200, // 1150 present out of 1200 students (95.8%)
		11, 12,     // 11 active buses out of 12
		2,          // 2 at-risk students
	)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(digest)
}

// StudentIDCardHandler implements GET /v1/documents/id-card/{student_id} (DOC-24)
func (s *Server) StudentIDCardHandler(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	studentID := uuid.New()
	if len(parts) >= 4 {
		if id, err := uuid.Parse(parts[3]); err == nil {
			studentID = id
		}
	}

	card := documents.StudentIDCard{
		CardID:            "CR80-2026-" + studentID.String()[:8],
		SchoolName:        "Delhi Public School, Ranchi",
		SchoolAffiliation: "CBSE Affiliation No: 3430152",
		StudentID:         studentID,
		AdmissionNumber:   "DPS-2024-042",
		FullName:          "Aarav Sharma",
		ClassName:         "Class 5",
		SectionName:       "A",
		DateOfBirth:       "15/07/2014",
		BloodGroup:        "O+",
		GuardianName:      "Rajesh Sharma",
		EmergencyPhone:    "+91 98765 43210",
		Address:           "Harmu Housing Colony, Ranchi, Jharkhand",
		ValidUntil:        "March 2027",
	}

	svg := documents.GenerateCR80CardSVG(card)
	w.Header().Set("Content-Type", "image/svg+xml")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(svg))
}

// AdmitCardHandler implements GET /v1/documents/admit-card/{student_id} (DOC-24)
func (s *Server) AdmitCardHandler(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	studentID := uuid.New()
	if len(parts) >= 4 {
		if id, err := uuid.Parse(parts[3]); err == nil {
			studentID = id
		}
	}
	_ = studentID

	// Check fee lock condition
	outstanding := decimal.NewFromFloat(4200.00)
	if r.URL.Query().Get("simulate_cleared") == "true" {
		outstanding = decimal.Zero
	}

	timetable := []documents.ExamScheduleItem{
		{Subject: "Mathematics", Date: "2026-12-01", TimeSlot: "09:00 - 12:00", RoomNo: "Hall 2"},
		{Subject: "Science", Date: "2026-12-03", TimeSlot: "09:00 - 12:00", RoomNo: "Hall 2"},
		{Subject: "English", Date: "2026-12-05", TimeSlot: "09:00 - 12:00", RoomNo: "Hall 2"},
	}

	admitCard := documents.GenerateAdmitCard(
		"CBSE Half-Yearly Term Exam 2026",
		"Aarav Sharma",
		"DPS-2024-042",
		"Class 5",
		"A",
		"501",
		"DPS Main Campus",
		outstanding,
		"school@icici",
		timetable,
	)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(admitCard)
}

// TransferCertificateHandler implements POST /v1/documents/transfer-certificate (DOC-24)
func (s *Server) TransferCertificateHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	type TCRequest struct {
		AdmissionNumber string `json:"admission_number"`
		StudentName     string `json:"student_name"`
		MotherName      string `json:"mother_name"`
		FatherName      string `json:"father_name"`
		DateOfBirth     string `json:"date_of_birth"`
		ClassLast       string `json:"class_last"`
		Clearances      struct {
			LibraryPendingBooks int             `json:"library_pending_books"`
			LabBreakageDues     decimal.Decimal `json:"lab_breakage_dues"`
			OutstandingFees     decimal.Decimal `json:"outstanding_fees"`
		} `json:"clearances"`
	}

	var req TCRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	clearances := documents.Clearances{
		LibraryPendingBooks: req.Clearances.LibraryPendingBooks,
		LabBreakageDues:     req.Clearances.LabBreakageDues,
		OutstandingFees:     req.Clearances.OutstandingFees,
	}

	subjects := []string{"English", "Hindi", "Mathematics", "Science", "Social Science"}
	tc, err := documents.IssueTransferCertificate(
		req.AdmissionNumber, req.StudentName, req.MotherName, req.FatherName,
		req.DateOfBirth, req.ClassLast,
		subjects,
		clearances,
	)

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusConflict) // 409 Conflict when clearances are unmet
		_ = json.NewEncoder(w).Encode(map[string]any{
			"error":   err.Error(),
			"status":  "CLEARANCE_BLOCKED",
			"blocked": true,
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(tc)
}

// ADMSBiometricHandler implements GET & POST /iclock/cdata (ATT-13)
func (s *Server) ADMSBiometricHandler(w http.ResponseWriter, r *http.Request) {
	policy := biometric.DefaultSchoolShiftPolicy()
	_, _ = biometric.HandleADMSRequest(w, r, policy)
}
