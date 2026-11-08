package models

import (
	"time"

	"github.com/google/uuid"
)

// UserRole represents institutional RBAC roles defined in DATABASE_SCHEMA.sql.
type UserRole string

const (
	RoleSuperadmin       UserRole = "SUPERADMIN"
	RolePrincipal        UserRole = "PRINCIPAL"
	RoleVicePrincipal    UserRole = "VICE_PRINCIPAL"
	RoleAccountant       UserRole = "ACCOUNTANT"
	RoleTeacher          UserRole = "TEACHER"
	RoleClerk            UserRole = "CLERK"
	RoleLibrarian        UserRole = "LIBRARIAN"
	RoleLabAssistant     UserRole = "LAB_ASSISTANT"
	RoleTransportManager UserRole = "TRANSPORT_MANAGER"
	RoleDriver           UserRole = "DRIVER"
	RoleGuardian         UserRole = "GUARDIAN"
	RoleStudent          UserRole = "STUDENT"
)

// Tenant represents the top-level institutional isolation boundary.
type Tenant struct {
	ID           uuid.UUID `json:"id"`
	Subdomain    string    `json:"subdomain"`
	CustomDomain *string   `json:"custom_domain,omitempty"`
	LegalName    string    `json:"legal_name"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// School represents a specific physical campus under a tenant.
type School struct {
	ID                uuid.UUID `json:"id"`
	TenantID          uuid.UUID `json:"tenant_id"`
	Name              string    `json:"name"`
	AffiliationBoard  string    `json:"affiliation_board"` // CBSE, ICSE, BSEB, UP_BOARD
	AffiliationNumber *string   `json:"affiliation_number,omitempty"`
	SchoolCode        *string   `json:"school_code,omitempty"`
	TrustName         *string   `json:"trust_name,omitempty"`
	LogoURL           *string   `json:"logo_url,omitempty"`
	AddressLine1      string    `json:"address_line1"`
	AddressLine2      *string   `json:"address_line2,omitempty"`
	City              string    `json:"city"`
	State             string    `json:"state"`
	PostalCode        string    `json:"postal_code"`
	PhonePrimary      string    `json:"phone_primary"`
	EmailPrimary      string    `json:"email_primary"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// User represents a global individual identity.
type User struct {
	ID           uuid.UUID `json:"id"`
	Phone        string    `json:"phone"`
	Email        *string   `json:"email,omitempty"`
	PasswordHash *string   `json:"-"`
	FullName     string    `json:"full_name"`
	AvatarURL    *string   `json:"avatar_url,omitempty"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// UserTenantRole maps users to schools and roles.
type UserTenantRole struct {
	ID        uuid.UUID `json:"id"`
	TenantID  uuid.UUID `json:"tenant_id"`
	SchoolID  uuid.UUID `json:"school_id"`
	UserID    uuid.UUID `json:"user_id"`
	Role      UserRole  `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

// Student represents an enrolled learner.
type Student struct {
	ID              uuid.UUID  `json:"id"`
	TenantID        uuid.UUID  `json:"tenant_id"`
	SchoolID        uuid.UUID  `json:"school_id"`
	AdmissionNumber string     `json:"admission_number"`
	BoardPen        *string    `json:"board_pen,omitempty"`
	StateRollCode   *string    `json:"state_roll_code,omitempty"`
	StateRollNumber *string    `json:"state_roll_number,omitempty"`
	FirstName       string     `json:"first_name"`
	MiddleName      *string    `json:"middle_name,omitempty"`
	LastName        string     `json:"last_name"`
	DateOfBirth     time.Time  `json:"date_of_birth"`
	Gender          string     `json:"gender"`
	BloodGroup      *string    `json:"blood_group,omitempty"`
	CurrentClassID  *uuid.UUID `json:"current_class_id,omitempty"`
	CurrentSectionID *uuid.UUID `json:"current_section_id,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}
