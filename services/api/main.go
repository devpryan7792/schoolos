package main

import (
	"context"
	"database/sql"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/schoolos/schoolos/pkg/db"
)

// CORSMiddleware enables production cross-origin resource sharing for web clients and preflight checks.
func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin == "" {
			origin = "*"
		}
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Tenant-ID, X-Tenant-Domain, Accept, Origin")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "postgres://schoolos_app:schoolos_app_secret@localhost:5432/schoolos?sslmode=disable"
	}

	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379/0"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "schoolos_dev_jwt_super_secret_signing_key_32bytes"
	}

	// Initialize DB pool
	var sqlDB *sql.DB
	pool, err := db.NewPool(db.DefaultConfig(databaseURL))
	if err != nil {
		log.Printf("[API INIT] Warning: Database pool could not be initialized (%v). Starting in detached mode.", err)
	} else {
		sqlDB = pool
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		if err := sqlDB.PingContext(ctx); err != nil {
			log.Printf("[API INIT] Warning: Postgres ping failed (%v). RLS queries will fail until connected.", err)
		} else {
			log.Println("[API INIT] Successfully connected to PostgreSQL with connection pooling")
		}
		cancel()
	}

	// Initialize Redis client
	var rdb *redis.Client
	opt, err := redis.ParseURL(redisURL)
	if err == nil {
		rdb = redis.NewClient(opt)
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		if err := rdb.Ping(ctx).Err(); err != nil {
			log.Printf("[API INIT] Warning: Redis ping failed (%v). Telemetry streams will run in mock mode.", err)
		} else {
			log.Println("[API INIT] Successfully connected to Redis")
		}
		cancel()
	}

	server := NewServer(sqlDB, rdb, jwtSecret)

	mux := http.NewServeMux()

	// Root Index & Healthcheck
	mux.HandleFunc("/", server.RootHandler)
	mux.HandleFunc("/health", server.HealthHandler)
	mux.HandleFunc("/healthz", server.HealthHandler)

	// Auth routes
	mux.HandleFunc("/v1/auth/login/phone", server.LoginHandler)

	// Dashboard & Core Domain Endpoints
	mux.HandleFunc("/v1/dashboard/stats", server.DashboardStatsHandler)
	mux.HandleFunc("/v1/students", server.StudentsHandler)
	mux.HandleFunc("/v1/students/", server.StudentsHandler)
	mux.HandleFunc("/v1/fleet/buses", server.FleetBusesHandler)
	mux.HandleFunc("/v1/attendance/summary", server.AttendanceSummaryHandler)
	mux.HandleFunc("/v1/payments/collect-cash", server.CollectCashHandler)
	mux.HandleFunc("/v1/sync/offline-receipts", server.OfflineReceiptSyncHandler)
	mux.HandleFunc("/v1/ws/vehicles/", server.WebSocketVehicleFeedHandler)

	// WhatsApp Meta Cloud API Webhook routes (docs/API_CONTRACTS.md 5.1)
	mux.HandleFunc("/v1/webhooks/whatsapp", server.WhatsAppWebhookHandler)
	mux.HandleFunc("/webhooks/whatsapp", server.WhatsAppWebhookHandler)

	// AI Computer Vision OMR Evaluation route (AGENT-29 / SPECIFICATION.md 6.1)
	mux.HandleFunc("/v1/omr/evaluate", server.OMREvaluateHandler)

	// Autonomous Dunning & Operations Routes (AGENT-30)
	mux.HandleFunc("/v1/dunning/plans", server.DunningPlansHandler)
	mux.HandleFunc("/v1/reports/principal-digest", server.PrincipalMorningDigestHandler)

	// Deterministic Document Generator Routes (DOC-24)
	mux.HandleFunc("/v1/documents/id-card/", server.StudentIDCardHandler)
	mux.HandleFunc("/v1/documents/admit-card/", server.AdmitCardHandler)
	mux.HandleFunc("/v1/documents/transfer-certificate", server.TransferCertificateHandler)

	// Biometric ADMS / ePush Hardware Sync (ATT-13)
	mux.HandleFunc("/iclock/cdata", server.ADMSBiometricHandler)

	// Academics, Examination & Broadsheet (EXAM-23)
	mux.HandleFunc("/v1/academics/marksheets/", server.StudentMarksheetHandler)

	// Library Circulation & Fines (LMS-22)
	mux.HandleFunc("/v1/library/circulation/student/", server.LibraryStudentCirculationHandler)

	// Science/Computer Lab Apparatus Breakage (LAB-21)
	mux.HandleFunc("/v1/lab/breakage/report", server.LabBreakageReportHandler)

	// SinoTrack ST-901L Hardware SMS Provisioning (IOT-16)
	mux.HandleFunc("/v1/fleet/hardware/provisioning-sms", server.FleetHardwareProvisioningHandler)

	// Academic Session Rollover & Arrears Carry-Forward (ROLL-25)
	mux.HandleFunc("/v1/academic-sessions/rollover", server.AcademicSessionRolloverHandler)
	mux.HandleFunc("/v1/academic-sessions/rollover/", server.AcademicSessionAuditHandler)

	// Self-Service CSV/Excel Smart Ingestion & Split Commit (DATA-26)
	mux.HandleFunc("/v1/ingestion/auto-detect-columns", server.AutoDetectColumnsHandler)
	mux.HandleFunc("/v1/ingestion/upload-csv", server.UploadCSVIngestionHandler)

	// Automated Timetable Validation & Substitution Optimizer (SCHED-05 / HR-06)
	mux.HandleFunc("/v1/timetable/validate", server.TimetableValidateHandler)
	mux.HandleFunc("/v1/timetable/substitutions/auto-assign", server.TimetableSubstitutionHandler)

	// Tiered Cost-Optimized Notification Dispatcher (NOTIF-27)
	mux.HandleFunc("/v1/notifications/dispatch", server.NotificationDispatchHandler)

	// Wrap in RLS Tenant Middleware and CORS
	handler := CORSMiddleware(db.HTTPTenantMiddleware(nil)(mux))

	httpServer := &http.Server{
		Addr:         ":" + port,
		Handler:      handler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("[API] SchoolOS Core Server running on HTTP :%s", port)
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[API FATAL] Server failed: %v", err)
		}
	}()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	<-sigChan
	log.Println("[API] Shutting down HTTP server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_ = httpServer.Shutdown(ctx)
	if sqlDB != nil {
		_ = sqlDB.Close()
	}
	if rdb != nil {
		_ = rdb.Close()
	}
	log.Println("[API] Server exited cleanly.")
}
