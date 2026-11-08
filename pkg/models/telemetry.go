package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// Vehicle represents an active bus, van, or transport unit.
type Vehicle struct {
	ID                 uuid.UUID `json:"id"`
	TenantID           uuid.UUID `json:"tenant_id"`
	SchoolID           uuid.UUID `json:"school_id"`
	RegistrationNumber string    `json:"registration_number"` // E.g., 'JH-01-BV-4021'
	ImeiNumber         *string   `json:"imei_number,omitempty"` // 15-digit GT06 hardware IMEI
	Model              *string   `json:"model,omitempty"`
	SeatingCapacity    int       `json:"seating_capacity"`
	DriverUserID       *uuid.UUID `json:"driver_user_id,omitempty"`
	IsActive           bool      `json:"is_active"`
	CreatedAt          time.Time `json:"created_at"`
}

// Route represents a scheduled transport line.
type Route struct {
	ID          uuid.UUID `json:"id"`
	TenantID    uuid.UUID `json:"tenant_id"`
	SchoolID    uuid.UUID `json:"school_id"`
	Name        string    `json:"name"` // E.g. 'Route 4 - Hinoo Chowk'
	VehicleID   *uuid.UUID `json:"vehicle_id,omitempty"`
	MorningTime *string   `json:"morning_time,omitempty"`
	EveningTime *string   `json:"evening_time,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

// RouteStop represents an individual pickup/drop waypoint on a route.
type RouteStop struct {
	ID                   uuid.UUID `json:"id"`
	TenantID             uuid.UUID `json:"tenant_id"`
	RouteID              uuid.UUID `json:"route_id"`
	StopName             string    `json:"stop_name"`
	SequenceOrder        int       `json:"sequence_order"`
	Latitude             float64   `json:"latitude"`
	Longitude            float64   `json:"longitude"`
	GeofenceRadiusMeters int       `json:"geofence_radius_meters"`
	EstimatedArrivalMins *int      `json:"estimated_arrival_mins,omitempty"`
	CreatedAt            time.Time `json:"created_at"`
}

// TelemetryBreadcrumb represents a persisted GPS location record.
type TelemetryBreadcrumb struct {
	ID          uuid.UUID       `json:"id"`
	TenantID    uuid.UUID       `json:"tenant_id"`
	VehicleID   uuid.UUID       `json:"vehicle_id"`
	Latitude    float64         `json:"latitude"`
	Longitude   float64         `json:"longitude"`
	SpeedKmh    decimal.Decimal `json:"speed_kmh"`
	HeadingDeg  *decimal.Decimal `json:"heading_deg,omitempty"`
	IgnitionOn  bool            `json:"ignition_on"`
	RecordedAt  time.Time       `json:"recorded_at"`
}

// TelemetryCoordinates represents the decoded GPS fix.
type TelemetryCoordinates struct {
	Latitude   float64 `json:"latitude"`
	Longitude  float64 `json:"longitude"`
	SpeedKmh   float64 `json:"speed_kmh"`
	Heading    float64 `json:"heading"`
	IgnitionOn bool    `json:"ignition_on"`
}

// TelemetryUpdate represents real-time vehicle broadcast payload for WebSockets / Redis stream.
type TelemetryUpdate struct {
	Type               string               `json:"type"` // TELEMETRY_UPDATE
	VehicleID          uuid.UUID            `json:"vehicle_id"`
	RegistrationNumber string               `json:"registration_number"`
	RouteID            *uuid.UUID           `json:"route_id,omitempty"`
	Coordinates        TelemetryCoordinates `json:"coordinates"`
	Timestamp          time.Time            `json:"timestamp"`
}
