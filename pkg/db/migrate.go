package db

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// ExpectedRLSTables lists all 26 tenant tables that must have Row-Level Security enabled.
var ExpectedRLSTables = []string{
	"schools", "academic_sessions", "classes", "sections", "subjects",
	"guardians", "students", "student_guardian_links", "student_enrollments",
	"chart_of_accounts", "fee_heads", "fee_concession_rules", "student_concessions",
	"invoices", "invoice_items", "ledger_entries", "payments",
	"vehicles", "routes", "route_stops", "student_attendance", "staff_biometric_logs",
	"library_books", "book_loans", "lab_assets", "lab_breakage_penalties",
}

// MigrationResult summarizes the outcome of schema migration.
type MigrationResult struct {
	AppliedStatements int
	RLSTablesVerified int
	Duration          time.Duration
}

// ApplySchemaFromFile reads an SQL migration script and executes it against the database.
func ApplySchemaFromFile(ctx context.Context, db *sql.DB, schemaPath string) (*MigrationResult, error) {
	absPath, err := filepath.Abs(schemaPath)
	if err != nil {
		return nil, fmt.Errorf("invalid schema path: %w", err)
	}

	content, err := os.ReadFile(absPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read schema file at %s: %w", absPath, err)
	}

	return ApplySchema(ctx, db, string(content))
}

// ApplySchema executes raw SQL schema definition and verifies RLS policies.
func ApplySchema(ctx context.Context, db *sql.DB, schemaSQL string) (*MigrationResult, error) {
	start := time.Now()

	// Execute schema migration
	if _, err := db.ExecContext(ctx, schemaSQL); err != nil {
		return nil, fmt.Errorf("failed to execute schema DDL: %w", err)
	}

	// Verify RLS policies on all expected tables
	verifiedCount, err := VerifyRLSStatus(ctx, db)
	if err != nil {
		return nil, fmt.Errorf("RLS policy verification failed: %w", err)
	}

	return &MigrationResult{
		RLSTablesVerified: verifiedCount,
		Duration:          time.Since(start),
	}, nil
}

// VerifyRLSStatus queries PostgreSQL catalog to verify that RLS is active on all 26 tenant tables.
func VerifyRLSStatus(ctx context.Context, db *sql.DB) (int, error) {
	query := `
		SELECT relname, relrowsecurity, relforcerowsecurity
		FROM pg_class
		JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
		WHERE pg_namespace.nspname = 'public'
		  AND relkind = 'r'
		  AND relname = ANY($1);
	`

	rows, err := db.QueryContext(ctx, query, ExpectedRLSTables)
	if err != nil {
		return 0, fmt.Errorf("failed to inspect pg_class for RLS: %w", err)
	}
	defer rows.Close()

	verified := make(map[string]bool)
	for rows.Next() {
		var (
			tableName string
			rlsEnabled bool
			rlsForced  bool
		)
		if err := rows.Scan(&tableName, &rlsEnabled, &rlsForced); err != nil {
			return 0, fmt.Errorf("failed to scan table RLS row: %w", err)
		}

		if !rlsEnabled {
			return 0, fmt.Errorf("table %s is missing row-level security (relrowsecurity = false)", tableName)
		}
		verified[tableName] = true
	}

	if err := rows.Err(); err != nil {
		return 0, err
	}

	// Check if any expected tables were missing
	var missing []string
	for _, expected := range ExpectedRLSTables {
		if !verified[expected] {
			missing = append(missing, expected)
		}
	}

	if len(missing) > 0 {
		return len(verified), fmt.Errorf("tables missing or not found in schema: %s", strings.Join(missing, ", "))
	}

	return len(verified), nil
}
