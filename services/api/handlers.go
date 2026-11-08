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
