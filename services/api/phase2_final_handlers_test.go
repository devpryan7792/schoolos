package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"github.com/schoolos/schoolos/pkg/notifications"
	"github.com/schoolos/schoolos/pkg/timetable"
)

func TestPhase2FinalHandlers(t *testing.T) {
	server := NewServer(nil, nil, "test_jwt_secret")
	tenantID := uuid.New()

	t.Run("POST /v1/timetable/validate detects teacher collision", func(t *testing.T) {
		t1 := uuid.New()
		classA := uuid.New()
		classB := uuid.New()
		room1 := uuid.New()
		room2 := uuid.New()

		// Same teacher in 2 rooms at the same time
		slots := []timetable.TimetableSlot{
			{
				SlotID:       uuid.New(),
				Day:          timetable.Monday,
				PeriodNumber: 1,
				ClassID:      classA,
				ClassName:    "Grade 10",
				SectionName:  "A",
				SubjectID:    uuid.New(),
				SubjectName:  "Mathematics",
				TeacherID:    t1,
				TeacherName:  "R. Sharma",
				RoomID:       room1,
				RoomName:     "Room 101",
				RoomCapacity: 40,
				StudentCount: 35,
				IsHeavySubj:  true,
			},
			{
				SlotID:       uuid.New(),
				Day:          timetable.Monday,
				PeriodNumber: 1,
				ClassID:      classB,
				ClassName:    "Grade 9",
				SectionName:  "B",
				SubjectID:    uuid.New(),
				SubjectName:  "Physics",
				TeacherID:    t1,
				TeacherName:  "R. Sharma",
				RoomID:       room2,
				RoomName:     "Room 102",
				RoomCapacity: 40,
				StudentCount: 35,
				IsHeavySubj:  true,
			},
		}

		body, _ := json.Marshal(map[string]any{"slots": slots})
		req := httptest.NewRequest(http.MethodPost, "/v1/timetable/validate", bytes.NewReader(body))
		w := httptest.NewRecorder()
		server.TimetableValidateHandler(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}

		var resp struct {
			IsValid        bool                          `json:"is_valid"`
			TotalSlots     int                           `json:"total_slots"`
			ConflictsCount int                           `json:"conflicts_count"`
			Conflicts      []timetable.TimetableConflict `json:"conflicts"`
		}
		if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
			t.Fatalf("failed to decode resp: %v", err)
		}

		if resp.IsValid {
			t.Fatalf("expected invalid timetable due to teacher clash, got valid")
		}
		if resp.ConflictsCount == 0 {
			t.Fatalf("expected conflicts count > 0")
		}
	})

	t.Run("POST /v1/timetable/substitutions/auto-assign finds candidates", func(t *testing.T) {
		absentTeacher := uuid.New()
		body, _ := json.Marshal(map[string]any{
			"absent_teacher_id": absentTeacher,
			"day":               1,
		})
		req := httptest.NewRequest(http.MethodPost, "/v1/timetable/substitutions/auto-assign", bytes.NewReader(body))
		w := httptest.NewRecorder()
		server.TimetableSubstitutionHandler(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}

		var resp struct {
			Success         bool `json:"success"`
			AssignmentsMade int  `json:"assignments_made"`
		}
		if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
			t.Fatalf("failed to decode resp: %v", err)
		}
		if !resp.Success {
			t.Fatalf("expected success true")
		}
	})

	t.Run("POST /v1/notifications/dispatch selects Tier 1 native push when FCM token exists", func(t *testing.T) {
		payload := map[string]any{
			"recipient": notifications.RecipientDevice{
				GuardianID:       tenantID,
				GuardianName:     "S. Kumar",
				PhoneNumber:      "+919876543210",
				PushToken:        "fcm_token_valid_12345",
				Platform:         "ANDROID",
				PushAcknowledged: true,
			},
			"title":    "Bus Arrived",
			"body":     "Bus 4 is 200m away from your stop",
			"priority": notifications.PriorityUrgent,
		}

		body, _ := json.Marshal(payload)
		req := httptest.NewRequest(http.MethodPost, "/v1/notifications/dispatch", bytes.NewReader(body))
		w := httptest.NewRecorder()
		server.NotificationDispatchHandler(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}

		var res notifications.NotificationDispatchResult
		if err := json.NewDecoder(w.Body).Decode(&res); err != nil {
			t.Fatalf("failed to decode resp: %v", err)
		}

		if res.SelectedTier != notifications.Tier1NativePush {
			t.Errorf("expected Tier1NativePush, got %s", res.SelectedTier)
		}
		if !res.CostINR.IsZero() {
			t.Errorf("expected zero cost for push, got %s", res.CostINR.String())
		}
	})

	t.Run("POST /v1/notifications/dispatch falls back to Tier 3 SMS when no push token and emergency", func(t *testing.T) {
		payload := map[string]any{
			"recipient": notifications.RecipientDevice{
				GuardianID:       tenantID,
				GuardianName:     "R. Verma",
				PhoneNumber:      "+919876543210",
				PushToken:        "",
				Platform:         "NONE",
				PushAcknowledged: false,
			},
			"title":    "Weather Emergency",
			"body":     "School closed today due to severe rain alert",
			"priority": notifications.PriorityEmergency,
		}

		body, _ := json.Marshal(payload)
		req := httptest.NewRequest(http.MethodPost, "/v1/notifications/dispatch", bytes.NewReader(body))
		w := httptest.NewRecorder()
		server.NotificationDispatchHandler(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
		}

		var res notifications.NotificationDispatchResult
		if err := json.NewDecoder(w.Body).Decode(&res); err != nil {
			t.Fatalf("failed to decode resp: %v", err)
		}

		if res.SelectedTier != notifications.Tier3EmergencySMS {
			t.Errorf("expected Tier3EmergencySMS, got %s", res.SelectedTier)
		}
		if res.CostINR.IsZero() {
			t.Errorf("expected non-zero cost for SMS, got %s", res.CostINR.String())
		}
	})
}
