package main

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/schoolos/schoolos/pkg/notifications"
)

// NotificationDispatchHandler implements POST /v1/notifications/dispatch (NOTIF-27)
func (s *Server) NotificationDispatchHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Recipient notifications.RecipientDevice `json:"recipient"`
		Title     string                        `json:"title"`
		Body      string                        `json:"body"`
		Priority  notifications.PriorityLevel   `json:"priority"`
		ActionURL string                        `json:"action_url"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	if req.Recipient.GuardianID == uuid.Nil {
		req.Recipient.GuardianID = uuid.New()
	}
	if req.Priority == "" {
		req.Priority = notifications.PriorityStandard
	}

	res := notifications.DispatchTieredNotification(
		req.Recipient,
		req.Title,
		req.Body,
		req.Priority,
		req.ActionURL,
	)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(res)
}
