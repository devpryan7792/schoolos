package db

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
)

type mockTenantResolver struct {
	mapping map[string]uuid.UUID
}

func (m *mockTenantResolver) ResolveTenantID(ctx context.Context, identifier string) (uuid.UUID, error) {
	if id, ok := m.mapping[identifier]; ok {
		return id, nil
	}
	return uuid.Nil, ErrMissingTenantID
}

func TestTenantContextHelpers(t *testing.T) {
	expectedID := uuid.New()
	ctx := WithTenantContext(context.Background(), expectedID)

	extracted, err := TenantFromContext(ctx)
	if err != nil {
		t.Fatalf("expected to extract tenant ID, got error: %v", err)
	}
	if extracted != expectedID {
		t.Errorf("expected %s, got %s", expectedID, extracted)
	}

	// Missing tenant ID
	emptyCtx := context.Background()
	_, err = TenantFromContext(emptyCtx)
	if err == nil {
		t.Error("expected error when tenant ID is missing from context")
	}

	// Nil tenant ID
	nilCtx := WithTenantContext(context.Background(), uuid.Nil)
	_, err = TenantFromContext(nilCtx)
	if err == nil {
		t.Error("expected error when tenant ID is uuid.Nil")
	}
}

func TestHTTPTenantMiddleware(t *testing.T) {
	dpsTenantID := uuid.New()
	resolver := &mockTenantResolver{
		mapping: map[string]uuid.UUID{
			"dps-ranchi": dpsTenantID,
		},
	}

	middleware := HTTPTenantMiddleware(resolver)

	handler := middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tenantID, err := TenantFromContext(r.Context())
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		w.Header().Set("X-Resolved-Tenant", tenantID.String())
		w.WriteHeader(http.StatusOK)
	}))

	// Case 1: Resolving via X-Tenant-Domain header
	req1 := httptest.NewRequest("GET", "/api/v1/students", nil)
	req1.Header.Set("X-Tenant-Domain", "dps-ranchi.schoolos.in")
	rec1 := httptest.NewRecorder()
	handler.ServeHTTP(rec1, req1)

	if rec1.Code != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d: %s", rec1.Code, rec1.Body.String())
	}
	if rec1.Header().Get("X-Resolved-Tenant") != dpsTenantID.String() {
		t.Errorf("expected tenant %s, got %s", dpsTenantID, rec1.Header().Get("X-Resolved-Tenant"))
	}

	// Case 2: Direct X-Tenant-ID UUID header
	customUUID := uuid.New()
	req2 := httptest.NewRequest("GET", "/api/v1/students", nil)
	req2.Header.Set("X-Tenant-ID", customUUID.String())
	rec2 := httptest.NewRecorder()
	handler.ServeHTTP(rec2, req2)

	if rec2.Code != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d", rec2.Code)
	}
	if rec2.Header().Get("X-Resolved-Tenant") != customUUID.String() {
		t.Errorf("expected tenant %s, got %s", customUUID, rec2.Header().Get("X-Resolved-Tenant"))
	}
}
