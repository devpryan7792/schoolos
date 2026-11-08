package db

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	_ "github.com/lib/pq"
)

var (
	ErrMissingTenantID   = errors.New("missing tenant_id: strict RLS requires tenant context")
	ErrInvalidTenantID   = errors.New("invalid tenant_id format")
	ErrTenantContextType = errors.New("context value for tenant_id is not a valid uuid.UUID")
)

type contextKey string

const (
	tenantIDContextKey contextKey = "schoolos.tenant_id"
	tenantSubdomainKey contextKey = "schoolos.tenant_subdomain"
)

// Config represents database connection pool settings.
type Config struct {
	URL             string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
	ConnMaxIdleTime time.Duration
}

// DefaultConfig returns production-ready connection pool settings.
func DefaultConfig(databaseURL string) Config {
	return Config{
		URL:             databaseURL,
		MaxOpenConns:    25,
		MaxIdleConns:    10,
		ConnMaxLifetime: 15 * time.Minute,
		ConnMaxIdleTime: 5 * time.Minute,
	}
}

// NewPool initializes a managed PostgreSQL connection pool.
func NewPool(cfg Config) (*sql.DB, error) {
	db, err := sql.Open("postgres", cfg.URL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	maxOpen := cfg.MaxOpenConns
	if maxOpen <= 0 {
		maxOpen = 25
	}
	maxIdle := cfg.MaxIdleConns
	if maxIdle <= 0 {
		maxIdle = 10
	}
	connMaxLifetime := cfg.ConnMaxLifetime
	if connMaxLifetime <= 0 {
		connMaxLifetime = 15 * time.Minute
	}
	connMaxIdleTime := cfg.ConnMaxIdleTime
	if connMaxIdleTime <= 0 {
		connMaxIdleTime = 5 * time.Minute
	}

	db.SetMaxOpenConns(maxOpen)
	db.SetMaxIdleConns(maxIdle)
	db.SetConnMaxLifetime(connMaxLifetime)
	db.SetConnMaxIdleTime(connMaxIdleTime)

	return db, nil
}

// WithTenantContext attaches a tenant UUID to the context.
func WithTenantContext(ctx context.Context, tenantID uuid.UUID) context.Context {
	return context.WithValue(ctx, tenantIDContextKey, tenantID)
}

// TenantFromContext extracts the tenant UUID from the context.
func TenantFromContext(ctx context.Context) (uuid.UUID, error) {
	val := ctx.Value(tenantIDContextKey)
	if val == nil {
		return uuid.Nil, ErrMissingTenantID
	}
	tenantID, ok := val.(uuid.UUID)
	if !ok {
		return uuid.Nil, ErrTenantContextType
	}
	if tenantID == uuid.Nil {
		return uuid.Nil, ErrMissingTenantID
	}
	return tenantID, nil
}

// WithTenantTx executes a transaction with strict Row-Level Security (RLS) enforcement.
// Invariant 1: It executes "SET LOCAL app.current_tenant_id = ?" immediately after BEGIN
// before invoking the business callback. If tenantID is nil, it immediately returns an error.
func WithTenantTx(ctx context.Context, db *sql.DB, tenantID uuid.UUID, fn func(tx *sql.Tx) error) error {
	if tenantID == uuid.Nil {
		return fmt.Errorf("refusing to execute tenant transaction: %w", ErrMissingTenantID)
	}

	tx, err := db.BeginTx(ctx, &sql.TxOptions{
		Isolation: sql.LevelReadCommitted,
	})
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback()
			panic(p)
		}
	}()

	// Strict RLS isolation invariant:
	// Set session parameter app.current_tenant_id inside the active transaction.
	// This activates PostgreSQL kernel-level RLS policy on all tenant tables.
	setTenantSQL := fmt.Sprintf("SET LOCAL app.current_tenant_id = '%s'", tenantID.String())
	if _, err := tx.ExecContext(ctx, setTenantSQL); err != nil {
		_ = tx.Rollback()
		return fmt.Errorf("failed to enforce RLS tenant context (%s): %w", tenantID, err)
	}

	// Execute application business logic inside tenant boundary
	if err := fn(tx); err != nil {
		if rbErr := tx.Rollback(); rbErr != nil && !errors.Is(rbErr, sql.ErrTxDone) {
			return fmt.Errorf("tx failed (%v); rollback also failed: %w", err, rbErr)
		}
		return err
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit tenant transaction: %w", err)
	}

	return nil
}

// ExecInTenant runs a write query within a verified tenant transaction.
func ExecInTenant(ctx context.Context, db *sql.DB, query string, args ...any) (sql.Result, error) {
	tenantID, err := TenantFromContext(ctx)
	if err != nil {
		return nil, err
	}

	var res sql.Result
	err = WithTenantTx(ctx, db, tenantID, func(tx *sql.Tx) error {
		var execErr error
		res, execErr = tx.ExecContext(ctx, query, args...)
		return execErr
	})

	return res, err
}

// TenantResolver provides tenant UUID lookup by subdomain or custom domain.
type TenantResolver interface {
	ResolveTenantID(ctx context.Context, identifier string) (uuid.UUID, error)
}

// HTTPTenantMiddleware inspects HTTP headers (X-Tenant-Domain, Host) or query params
// to resolve and bind the tenant context to the HTTP request.
func HTTPTenantMiddleware(resolver TenantResolver) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// 1. Check explicit X-Tenant-Domain or X-Tenant-ID header
			tenantHeader := r.Header.Get("X-Tenant-ID")
			if tenantHeader != "" {
				parsed, err := uuid.Parse(tenantHeader)
				if err == nil && parsed != uuid.Nil {
					ctx := WithTenantContext(r.Context(), parsed)
					next.ServeHTTP(w, r.WithContext(ctx))
					return
				}
			}

			// 2. Check X-Tenant-Domain header
			domainHeader := r.Header.Get("X-Tenant-Domain")
			if domainHeader == "" {
				// 3. Fallback to Host header (e.g., dps-ranchi.schoolos.in)
				host := r.Host
				if colonIdx := strings.Index(host, ":"); colonIdx != -1 {
					host = host[:colonIdx]
				}
				domainHeader = host
			}

			// Extract subdomain (e.g. "dps-ranchi" from "dps-ranchi.schoolos.in")
			parts := strings.Split(domainHeader, ".")
			subdomain := parts[0]
			if subdomain == "localhost" || subdomain == "api" || subdomain == "127" {
				// Dev fallback or direct IP
				subdomain = "default"
			}

			if resolver != nil {
				tenantID, err := resolver.ResolveTenantID(r.Context(), subdomain)
				if err == nil && tenantID != uuid.Nil {
					ctx := WithTenantContext(r.Context(), tenantID)
					next.ServeHTTP(w, r.WithContext(ctx))
					return
				}
			}

			next.ServeHTTP(w, r)
		})
	}
}
