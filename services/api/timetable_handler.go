package main

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/schoolos/schoolos/pkg/timetable"
)

// TimetableValidateHandler implements POST /v1/timetable/validate (SCHED-05)
func (s *Server) TimetableValidateHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Slots []timetable.TimetableSlot `json:"slots"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	conflicts := timetable.ValidateTimetableHardConstraints(req.Slots)
	isValid := len(conflicts) == 0

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"is_valid":        isValid,
		"total_slots":     len(req.Slots),
		"conflicts_count": len(conflicts),
		"conflicts":       conflicts,
	})
}

// TimetableSubstitutionHandler implements POST /v1/timetable/substitutions/auto-assign (HR-06)
func (s *Server) TimetableSubstitutionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		AbsentTeacherID uuid.UUID `json:"absent_teacher_id"`
		Day             int       `json:"day"` // 1 = Monday
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	if req.AbsentTeacherID == uuid.Nil {
		req.AbsentTeacherID = uuid.MustParse("00000000-0000-0000-0000-000000000101")
	}

	day := timetable.Monday
	if req.Day >= 1 && req.Day <= 6 {
		day = timetable.DayOfWeek(req.Day)
	}

	// Simulated Master Timetable
	masterSchedule := []timetable.TimetableSlot{
		{
			SlotID:       uuid.New(),
			Day:          day,
			PeriodNumber: 2,
			ClassID:      uuid.New(),
			ClassName:    "Class 10",
			SectionName:  "A",
			SubjectName:  "Mathematics",
			TeacherID:    req.AbsentTeacherID,
			TeacherName:  "Mr. Sharma",
			RoomID:       uuid.New(),
			RoomName:     "Room 101",
			RoomCapacity: 45,
			StudentCount: 40,
		},
	}

	// Active Teachers Roster
	allTeachers := []timetable.TeacherProfile{
		{
			TeacherID:           uuid.MustParse("00000000-0000-0000-0000-000000000201"),
			TeacherName:         "Mrs. Anita Verma",
			PrimarySubjects:     []string{"Mathematics", "Statistics"},
			WeeklySubstitutions: 1,
			IsPresent:           true,
		},
		{
			TeacherID:           uuid.MustParse("00000000-0000-0000-0000-000000000202"),
			TeacherName:         "Mr. Rajiv Sen",
			PrimarySubjects:     []string{"English"},
			WeeklySubstitutions: 3,
			IsPresent:           true,
		},
	}

	recs, err := timetable.AutoAssignSubstitutions(req.AbsentTeacherID, day, masterSchedule, allTeachers)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]any{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"success":              true,
		"day":                  day,
		"absent_teacher_id":    req.AbsentTeacherID,
		"total_substitutions":  len(recs),
		"substitutions":        recs,
	})
}
