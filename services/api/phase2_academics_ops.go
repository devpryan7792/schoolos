package main

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/schoolos/schoolos/pkg/academics"
	"github.com/schoolos/schoolos/pkg/fleet"
	"github.com/schoolos/schoolos/pkg/lab"
	"github.com/schoolos/schoolos/pkg/library"
	"github.com/shopspring/decimal"
)

// StudentMarksheetHandler implements GET /v1/academics/marksheets/{student_id} (EXAM-23)
func (s *Server) StudentMarksheetHandler(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	studentID := "d1a80101-0000-0000-0000-000000000001"
	if len(parts) >= 4 && parts[3] != "" {
		studentID = parts[3]
	}

	subjects := []academics.SubjectMark{
		{SubjectCode: "041", SubjectName: "Mathematics", HindiName: "गणित", MaxMarks: 100, TheoryMarks: 76, PracMarks: 19},
		{SubjectCode: "086", SubjectName: "Science", HindiName: "विज्ञान", MaxMarks: 100, TheoryMarks: 72, PracMarks: 18},
		{SubjectCode: "184", SubjectName: "English Language & Lit", HindiName: "अंग्रेजी", MaxMarks: 100, TheoryMarks: 85, PracMarks: 0},
		{SubjectCode: "085", SubjectName: "Hindi Course-A", HindiName: "हिंदी", MaxMarks: 100, TheoryMarks: 88, PracMarks: 0},
		{SubjectCode: "087", SubjectName: "Social Science", HindiName: "सामाजिक विज्ञान", MaxMarks: 100, TheoryMarks: 78, PracMarks: 18},
	}

	marksheet := academics.EvaluateMarksheet(
		studentID,
		"DPS-2024-042",
		"Aarav Sharma",
		"07",
		"Class 10",
		"A",
		academics.BoardCBSE,
		subjects,
	)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(marksheet)
}

// LibraryStudentCirculationHandler implements GET /v1/library/circulation/student/{student_id} (LMS-22)
func (s *Server) LibraryStudentCirculationHandler(w http.ResponseWriter, r *http.Request) {
	dueDate := time.Date(2026, 11, 1, 0, 0, 0, 0, time.UTC)
	policy := library.GetCirculationPolicy(library.RoleStudent)
	isOverdue, days, fine := library.CalculateOverdueFine(dueDate, time.Now(), policy)

	activeLoans := []library.BookLoan{
		{
			LoanID:       uuid.New(),
			BookID:       uuid.New(),
			AccessionNo:  "ACC-2026-1042",
			ISBN:         "978-0134685991",
			Title:        "Effective Java (3rd Edition)",
			Author:       "Joshua Bloch",
			BorrowerRole: library.RoleStudent,
			IssuedAt:     dueDate.AddDate(0, 0, -14),
			DueDate:      dueDate,
			FineAmount:   fine,
			IsOverdue:    isOverdue,
		},
	}

	cleared, reason := library.CheckLibraryNoDues(activeLoans, fine)

	resp := map[string]any{
		"student_id":        uuid.New().String(),
		"active_loans":      activeLoans,
		"total_overdue_fee": fine,
		"overdue_days":      days,
		"is_no_dues_clear":  cleared,
		"status_reason":     reason,
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}

// LabBreakageReportHandler implements POST /v1/lab/breakage/report (LAB-21)
func (s *Server) LabBreakageReportHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req lab.BreakageIncident
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	if req.IncidentID == uuid.Nil {
		req.IncidentID = uuid.New()
	}
	req.CreatedAt = time.Now()

	// Default caution money for simulation: ₹5,000.00
	cautionDeposit := decimal.NewFromFloat(5000.00)
	settlement, err := lab.ProcessBreakagePenalty(req, cautionDeposit)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(settlement)
}

// FleetHardwareProvisioningHandler implements POST /v1/fleet/hardware/provisioning-sms (IOT-16)
func (s *Server) FleetHardwareProvisioningHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var cfg fleet.ST901LProvisioningConfig
	if err := json.NewDecoder(r.Body).Decode(&cfg); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	if cfg.ServerHostOrIP == "" {
		cfg.ServerHostOrIP = "iot.schoolos.in"
	}
	if cfg.ServerPort == 0 {
		cfg.ServerPort = 5023
	}

	commands := fleet.GenerateSinoTrackSMSSequence(cfg)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"device_imei":           cfg.DeviceIMEI,
		"vehicle_registration":  cfg.VehicleRegistration,
		"carrier":               cfg.SimCarrier,
		"server_endpoint":       cfg.ServerHostOrIP + ":5023",
		"provisioning_commands": commands,
	})
}
