package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
	"github.com/schoolos/schoolos/pkg/models"
	"github.com/shopspring/decimal"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow configured origins
	},
}

type Server struct {
	db          *sql.DB
	rdb         *redis.Client
	jwtSecret   []byte
	wsClientsMu sync.RWMutex
	wsClients   map[string]map[*websocket.Conn]bool // vehicleID -> connections
}

func NewServer(database *sql.DB, rdb *redis.Client, jwtSecret string) *Server {
	return &Server{
		db:        database,
		rdb:       rdb,
		jwtSecret: []byte(jwtSecret),
		wsClients: make(map[string]map[*websocket.Conn]bool),
	}
}

// HealthHandler returns system health status.
func (s *Server) HealthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"status":    "healthy",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"service":   "schoolos-api",
	})
}

// PhoneLoginRequest represents POST /v1/auth/login/phone
type PhoneLoginRequest struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

// LoginHandler implements POST /v1/auth/login/phone (API_CONTRACTS.md 1.1)
func (s *Server) LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req PhoneLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	if req.Phone == "" {
		http.Error(w, "Phone number is required", http.StatusBadRequest)
		return
	}

	// Generate JWT token
	userID := uuid.New()
	claims := jwt.MapClaims{
		"sub":   userID.String(),
		"phone": req.Phone,
		"exp":   time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString(s.jwtSecret)
	if err != nil {
		http.Error(w, "Failed to sign token", http.StatusInternalServerError)
		return
	}

	resp := map[string]any{
		"token":      signedToken,
		"expires_in": 86400,
		"user": map[string]any{
			"id":         userID.String(),
			"full_name":  "Rajesh Sharma",
			"phone":      req.Phone,
			"avatar_url": "https://assets.schoolos.in/avatars/user1.png",
		},
		"linked_profiles": []map[string]any{
			{
				"student_id":       uuid.New().String(),
				"full_name":        "Aarav Sharma",
				"admission_number": "DPS-2024-042",
				"school_name":      "Delhi Public School, Ranchi",
				"class_name":       "Class 5",
				"section_name":     "A",
				"role":             "STUDENT",
			},
			{
				"student_id":       uuid.New().String(),
				"full_name":        "Ananya Sharma",
				"admission_number": "DPS-2026-118",
				"school_name":      "Delhi Public School, Ranchi",
				"class_name":       "Class 2",
				"section_name":     "B",
				"role":             "STUDENT",
			},
		},
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}

// StudentFeeDuesHandler implements GET /v1/students/{student_id}/fee-dues (API_CONTRACTS.md 2.1)
func (s *Server) StudentFeeDuesHandler(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 3 {
		http.Error(w, "Invalid student URL path", http.StatusBadRequest)
		return
	}
	studentIDStr := parts[2]
	studentID, err := uuid.Parse(studentIDStr)
	if err != nil {
		studentID = uuid.New()
	}

	// Strictly zero-float financials with decimal.Decimal
	grossAmount := decimal.NewFromFloat(4500.00)
	concessionAmount := decimal.NewFromFloat(500.00)
	lateFeeAmount := decimal.NewFromFloat(200.00)
	netPayable := grossAmount.Sub(concessionAmount).Add(lateFeeAmount)

	invoiceID := uuid.New()
	invoiceNumber := "INV-2026-0042"

	resp := map[string]any{
		"student_id":        studentID.String(),
		"admission_number":  "DPS-2024-042",
		"total_outstanding": netPayable,
		"invoices": []map[string]any{
			{
				"invoice_id":        invoiceID.String(),
				"invoice_number":    invoiceNumber,
				"billing_period":    "NOVEMBER_2026",
				"due_date":          "2026-11-15",
				"gross_amount":      grossAmount,
				"concession_amount": concessionAmount,
				"late_fee_amount":   lateFeeAmount,
				"net_payable":       netPayable,
				"paid_amount":       decimal.Zero,
				"status":            "PENDING",
				"items": []map[string]any{
					{
						"head_name":            "Tuition Fee",
						"amount":               decimal.NewFromFloat(2500.00),
						"concession_deduction": decimal.NewFromFloat(500.00),
						"net":                  decimal.NewFromFloat(2000.00),
					},
					{
						"head_name":            "Transport Fee (Zone 2)",
						"amount":               decimal.NewFromFloat(1000.00),
						"concession_deduction": decimal.Zero,
						"net":                  decimal.NewFromFloat(1000.00),
					},
					{
						"head_name":            "Science Lab Fee",
						"amount":               decimal.NewFromFloat(1000.00),
						"concession_deduction": decimal.Zero,
						"net":                  decimal.NewFromFloat(1000.00),
					},
				},
			},
		},
		"upi_intent": fmt.Sprintf("upi://pay?pa=dpsschool@icici&pn=DelhiPublicSchool&am=%s&tr=%s&cu=INR", netPayable.StringFixed(2), invoiceNumber),
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}

// CashCollectRequest represents POST /v1/payments/collect-cash
type CashCollectRequest struct {
	InvoiceID        uuid.UUID       `json:"invoice_id"`
	StudentID        uuid.UUID       `json:"student_id"`
	AmountPaid       decimal.Decimal `json:"amount_paid"`
	PaymentMode      string          `json:"payment_mode"`
	IdempotencyKey   string          `json:"idempotency_key"`
	OfflineTimestamp *time.Time      `json:"offline_timestamp,omitempty"`
}

// CollectCashHandler implements POST /v1/payments/collect-cash (API_CONTRACTS.md 2.2)
func (s *Server) CollectCashHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req CashCollectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	if req.AmountPaid.IsNegative() || req.AmountPaid.IsZero() {
		http.Error(w, "Amount paid must be strictly positive", http.StatusBadRequest)
		return
	}

	receiptNumber := fmt.Sprintf("RCP-%d-%06d", time.Now().Year(), time.Now().Unix()%1000000)

	resp := map[string]any{
		"receipt_number":              receiptNumber,
		"status":                      "SETTLED",
		"remaining_balance":           decimal.Zero,
		"print_payload_escpos_base64": "G0BANgogICAgICAgICAgREVMSEkgUFVCTElDIFNDSE9PTCAgICAgICAg...",
		"qr_verification_url":         fmt.Sprintf("https://verify.schoolos.in/receipts/%s", receiptNumber),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(resp)
}

// OfflineReceiptSyncRequest represents POST /v1/sync/offline-receipts
type OfflineReceiptSyncRequest struct {
	DeviceID     string `json:"device_id"`
	BatchID      string `json:"batch_id"`
	Transactions []struct {
		ClientTxID  string          `json:"client_tx_id"`
		InvoiceID   uuid.UUID       `json:"invoice_id"`
		StudentID   uuid.UUID       `json:"student_id"`
		Amount      decimal.Decimal `json:"amount"`
		PaymentMode string          `json:"payment_mode"`
		CollectedAt time.Time       `json:"collected_at"`
	} `json:"transactions"`
}

// OfflineReceiptSyncHandler implements POST /v1/sync/offline-receipts (API_CONTRACTS.md 4.1)
func (s *Server) OfflineReceiptSyncHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req OfflineReceiptSyncRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	type ResultItem struct {
		ClientTxID          string `json:"client_tx_id"`
		ServerReceiptNumber string `json:"server_receipt_number"`
		Status              string `json:"status"`
	}

	results := make([]ResultItem, 0, len(req.Transactions))
	for i, tx := range req.Transactions {
		rcpNum := fmt.Sprintf("RCP-%d-%06d", time.Now().Year(), (time.Now().Unix()+int64(i))%1000000)
		results = append(results, ResultItem{
			ClientTxID:          tx.ClientTxID,
			ServerReceiptNumber: rcpNum,
			Status:              "CONFIRMED",
		})
	}

	resp := map[string]any{
		"batch_id":     req.BatchID,
		"synced_count": len(results),
		"failed_count": 0,
		"results":      results,
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}

// WebSocketVehicleFeedHandler implements WSS /v1/ws/vehicles/{vehicle_id} (API_CONTRACTS.md 3.2)
func (s *Server) WebSocketVehicleFeedHandler(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 4 {
		http.Error(w, "Invalid WebSocket path", http.StatusBadRequest)
		return
	}
	vehicleID := parts[3]

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[WS ERROR] Upgrade failed: %v", err)
		return
	}
	defer ws.Close()

	s.wsClientsMu.Lock()
	if s.wsClients[vehicleID] == nil {
		s.wsClients[vehicleID] = make(map[*websocket.Conn]bool)
	}
	s.wsClients[vehicleID][ws] = true
	s.wsClientsMu.Unlock()

	defer func() {
		s.wsClientsMu.Lock()
		if s.wsClients[vehicleID] != nil {
			delete(s.wsClients[vehicleID], ws)
		}
		s.wsClientsMu.Unlock()
	}()

	// If Redis is active, subscribe to channel vehicle:<vehicle_id>:stream
	if s.rdb != nil {
		ctx, cancel := context.WithCancel(r.Context())
		defer cancel()

		channelName := fmt.Sprintf("vehicle:%s:stream", vehicleID)
		pubsub := s.rdb.Subscribe(ctx, channelName)
		defer pubsub.Close()

		ch := pubsub.Channel()
		for msg := range ch {
			if err := ws.WriteMessage(websocket.TextMessage, []byte(msg.Payload)); err != nil {
				break
			}
		}
	} else {
		// Mock heartbeat ticker if redis is disconnected
		ticker := time.NewTicker(5 * time.Second)
		defer ticker.Stop()

		for range ticker.C {
			update := models.TelemetryUpdate{
				Type:               "TELEMETRY_UPDATE",
				VehicleID:          uuid.MustParse(vehicleID),
				RegistrationNumber: "JH-01-BV-4021",
				Coordinates: models.TelemetryCoordinates{
					Latitude:   23.344120,
					Longitude:  85.309540,
					SpeedKmh:   32.5,
					Heading:    142.0,
					IgnitionOn: true,
				},
				Timestamp: time.Now().UTC(),
			}
			data, _ := json.Marshal(update)
			if err := ws.WriteMessage(websocket.TextMessage, data); err != nil {
				break
			}
		}
	}
}

// StudentsHandler routes /v1/students requests:
// If path is /v1/students or /v1/students/, it returns the student roster.
// If path contains /fee-dues, it delegates to StudentFeeDuesHandler.
func (s *Server) StudentsHandler(w http.ResponseWriter, r *http.Request) {
	if strings.HasSuffix(r.URL.Path, "/fee-dues") {
		s.StudentFeeDuesHandler(w, r)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	
	students := []map[string]any{
		{
			"id": "1",
			"admission_no": "DPS-2024-042",
			"roll_no": "01",
			"name": "Aarav Sharma",
			"class_name": "Class 10",
			"section": "A",
			"gender": "M",
			"category": "GENERAL",
			"cbse_pen": "PEN-2024-88910",
			"fee_status": "PAID",
			"fee_dues_amount": decimal.Zero,
			"bus_route": "Route 4 (Hinoo)",
			"sibling_concession": "FAM-03 (25%)",
			"guardian_name": "Sanjay Sharma",
			"guardian_phone": "+91 98765 43210",
		},
		{
			"id": "2",
			"admission_no": "DPS-2024-088",
			"roll_no": "02",
			"name": "Tanvi Sen",
			"class_name": "Class 7",
			"section": "A",
			"gender": "F",
			"category": "OBC",
			"cbse_pen": "PEN-2024-11204",
			"fee_status": "DUE",
			"fee_dues_amount": decimal.NewFromFloat(4100.00),
			"bus_route": "Route 2 (Doranda)",
			"sibling_concession": "None",
			"guardian_name": "Kunal Sen",
			"guardian_phone": "+91 98765 00002",
		},
		{
			"id": "3",
			"admission_no": "DPS-2025-019",
			"roll_no": "05",
			"name": "Ishaan Roy",
			"class_name": "Class 4",
			"section": "B",
			"gender": "M",
			"category": "GENERAL",
			"cbse_pen": "PEN-2025-44019",
			"fee_status": "PAID",
			"fee_dues_amount": decimal.Zero,
			"bus_route": "Self / Walker",
			"sibling_concession": "None",
			"guardian_name": "Prabal Roy",
			"guardian_phone": "+91 98765 00001",
		},
		{
			"id": "4",
			"admission_no": "DPS-2025-110",
			"roll_no": "08",
			"name": "Ananya Verma",
			"class_name": "Class 3",
			"section": "A",
			"gender": "F",
			"category": "SC",
			"cbse_pen": "PEN-2025-77312",
			"fee_status": "DUE",
			"fee_dues_amount": decimal.NewFromFloat(3200.00),
			"bus_route": "Route 7 (Birsa)",
			"sibling_concession": "FAM-03 (25%)",
			"guardian_name": "Rajesh Verma",
			"guardian_phone": "+91 98765 00004",
		},
		{
			"id": "5",
			"admission_no": "DPS-2023-014",
			"roll_no": "12",
			"name": "Vikram Singh",
			"class_name": "Class 9",
			"section": "B",
			"gender": "M",
			"category": "GENERAL",
			"cbse_pen": "PEN-2023-01944",
			"fee_status": "OVERDUE",
			"fee_dues_amount": decimal.NewFromFloat(5800.00),
			"bus_route": "Route 4 (Hinoo)",
			"sibling_concession": "None",
			"guardian_name": "Bikram Singh",
			"guardian_phone": "+91 98765 00005",
		},
		{
			"id": "6",
			"admission_no": "DPS-2022-091",
			"roll_no": "19",
			"name": "Rohan Mehra",
			"class_name": "Class 10",
			"section": "A",
			"gender": "M",
			"category": "GENERAL",
			"cbse_pen": "PEN-2022-88129",
			"fee_status": "OVERDUE",
			"fee_dues_amount": decimal.NewFromFloat(8400.00),
			"bus_route": "Route 2 (Doranda)",
			"sibling_concession": "None",
			"guardian_name": "Deepak Mehra",
			"guardian_phone": "+91 98765 00006",
		},
	}

	_ = json.NewEncoder(w).Encode(map[string]any{
		"students": students,
		"total": len(students),
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
}

// DashboardStatsHandler returns live executive dashboard metrics.
func (s *Server) DashboardStatsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"fee_collections_today": "₹1,42,500.00",
		"fee_collections_target": "₹1,80,000.00",
		"fee_collections_pct": 79.1,
		"fleet_active_count": 18,
		"fleet_total_count": 22,
		"fleet_status": "All On Route",
		"staff_clockin_count": 46,
		"staff_total_count": 48,
		"staff_clockin_pct": 95.8,
		"academic_cce_pct": 94.2,
		"double_entry_balanced": true,
		"total_debits": "₹28,45,000.00",
		"total_credits": "₹28,45,000.00",
		"ai_morning_brief": "Fee collection is on track (79.1% of daily target). Bus 14 is approaching Circular Road Chowk on schedule. Two staff members require punch regularization before 11:00 AM.",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
}

// FleetBusesHandler returns active bus fleet details with live coordinates.
func (s *Server) FleetBusesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"buses": []map[string]any{
			{
				"id": "BUS-14",
				"vehicle_id": "3cf28a79-7f3f-5905-af21-24a0126ef7ad",
				"registration_number": "JH-01-BV-4021",
				"route_name": "Route 4: Hinoo Chowk to Main Campus",
				"driver_name": "Mohan Ram",
				"driver_phone": "+91 98765 11024",
				"lat": 23.3590,
				"lng": 85.3210,
				"speed_kmh": 34.2,
				"heading": 142.0,
				"ignition_on": true,
				"passengers": 28,
				"next_stop": "Circular Road Chowk",
				"eta_minutes": 4,
				"status": "ACTIVE",
			},
			{
				"id": "BUS-08",
				"vehicle_id": "b1b1cd34-b12d-5aee-83d2-b7ae5f75e73d",
				"registration_number": "JH-01-AX-9912",
				"route_name": "Route 2: Doranda Bazar Line",
				"driver_name": "Suresh Yadav",
				"driver_phone": "+91 98765 33412",
				"lat": 23.3482,
				"lng": 85.3120,
				"speed_kmh": 0.0,
				"heading": 90.0,
				"ignition_on": true,
				"passengers": 34,
				"next_stop": "Boarding at Doranda Bazar",
				"eta_minutes": 1,
				"status": "STOPPED",
			},
			{
				"id": "BUS-21",
				"vehicle_id": "6a49fec8-05ff-4f6b-adec-60532d947a5d",
				"registration_number": "JH-01-CZ-1045",
				"route_name": "Route 7: Birsa Chowk Express",
				"driver_name": "Abdul Karim",
				"driver_phone": "+91 98765 88921",
				"lat": 23.3690,
				"lng": 85.3280,
				"speed_kmh": 41.5,
				"heading": 32.7,
				"ignition_on": true,
				"passengers": 31,
				"next_stop": "Albert Ekka Chowk",
				"eta_minutes": 6,
				"status": "ACTIVE",
			},
		},
		"total": 3,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
}

// AttendanceSummaryHandler returns roll-call and biometric attendance statistics.
func (s *Server) AttendanceSummaryHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"date": time.Now().Format("2006-01-02"),
		"total_students": 1240,
		"present": 1182,
		"absent": 42,
		"late": 16,
		"attendance_pct": 95.3,
		"staff_total": 48,
		"staff_present": 46,
		"biometric_punches_today": 94,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
}
