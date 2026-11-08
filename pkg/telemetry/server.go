package telemetry

import (
	"context"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"github.com/schoolos/schoolos/pkg/gt06"
	"github.com/schoolos/schoolos/pkg/models"
)

// TelemetryServer manages the GT06 TCP gateway on port 5023.
type TelemetryServer struct {
	addr        string
	rdb         *redis.Client
	listener    net.Listener
	mu          sync.RWMutex
	sessions    map[string]*DeviceSession
	vehicleMap  map[string]uuid.UUID // IMEI -> vehicle_id mapping cache
	shutdownCtx context.Context
	shutdownFn  context.CancelFunc
	wg          sync.WaitGroup
}

// DeviceSession holds the state of an active TCP connection with a GPS tracker.
type DeviceSession struct {
	conn       net.Conn
	imei       string
	vehicleID  uuid.UUID
	lastActive time.Time
	mu         sync.Mutex
}

// NewTelemetryServer initializes the GT06 ingestion gateway.
func NewTelemetryServer(addr string, rdb *redis.Client) *TelemetryServer {
	ctx, cancel := context.WithCancel(context.Background())
	return &TelemetryServer{
		addr:        addr,
		rdb:         rdb,
		sessions:    make(map[string]*DeviceSession),
		vehicleMap:  make(map[string]uuid.UUID),
		shutdownCtx: ctx,
		shutdownFn:  cancel,
	}
}

// RegisterVehicleMapping maps an IMEI number to a known vehicle UUID.
func (s *TelemetryServer) RegisterVehicleMapping(imei string, vehicleID uuid.UUID) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.vehicleMap[imei] = vehicleID
}

// Start begins listening on the configured TCP port.
func (s *TelemetryServer) Start() error {
	l, err := net.Listen("tcp", s.addr)
	if err != nil {
		return fmt.Errorf("failed to bind GT06 TCP socket on %s: %w", s.addr, err)
	}
	s.listener = l
	log.Printf("[GT06 GATEWAY] Listening for binary telemetry on TCP %s", s.addr)

	s.wg.Add(1)
	go s.acceptLoop()
	return nil
}

// Addr returns the listening address of the server
func (s *TelemetryServer) Addr() string {
	if s.listener != nil {
		return s.listener.Addr().String()
	}
	return s.addr
}

// Stop shuts down the listener and closes all active sessions gracefully.
func (s *TelemetryServer) Stop() error {
	s.shutdownFn()
	if s.listener != nil {
		_ = s.listener.Close()
	}

	s.mu.Lock()
	for _, sess := range s.sessions {
		sess.mu.Lock()
		_ = sess.conn.Close()
		sess.mu.Unlock()
	}
	s.sessions = make(map[string]*DeviceSession)
	s.mu.Unlock()

	s.wg.Wait()
	log.Println("[GT06 GATEWAY] Telemetry server stopped cleanly")
	return nil
}

func (s *TelemetryServer) acceptLoop() {
	defer s.wg.Done()
	for {
		conn, err := s.listener.Accept()
		if err != nil {
			select {
			case <-s.shutdownCtx.Done():
				return
			default:
				log.Printf("[GT06 GATEWAY] Accept error: %v", err)
				continue
			}
		}

		s.wg.Add(1)
		go s.HandleConnection(conn)
	}
}

// HandleConnection processes frames from a single GPS client socket
func (s *TelemetryServer) HandleConnection(conn net.Conn) {
	defer s.wg.Done()
	defer conn.Close()

	remoteAddr := conn.RemoteAddr().String()
	log.Printf("[GT06 GATEWAY] Device connected from %s", remoteAddr)

	session := &DeviceSession{
		conn:       conn,
		lastActive: time.Now(),
	}

	// Resilient Stream Framer that never closes the socket on malformed bytes
	framer := gt06.NewStreamFramer(conn, func(msg string, malformedBytes []byte) {
		log.Printf("[GT06 MALFORMED RESILIENCE] [%s] %s: hex=%s", remoteAddr, msg, hex.EncodeToString(malformedBytes))
	})

	for {
		select {
		case <-s.shutdownCtx.Done():
			return
		default:
		}

		// Set read deadline to detect broken / dead sockets after 5 minutes of total silence
		_ = conn.SetReadDeadline(time.Now().Add(5 * time.Minute))

		packet, raw, err := framer.ReadNextFrame()
		if err != nil {
			if errors.Is(err, io.EOF) {
				log.Printf("[GT06 GATEWAY] Device %s disconnected cleanly (EOF)", remoteAddr)
			} else {
				select {
				case <-s.shutdownCtx.Done():
				default:
					log.Printf("[GT06 GATEWAY] Socket closed [%s]: %v", remoteAddr, err)
				}
			}
			s.removeSession(session)
			return
		}

		session.mu.Lock()
		session.lastActive = time.Now()
		session.mu.Unlock()

		if err := s.processPacket(session, packet, raw); err != nil {
			log.Printf("[GT06 PROCESS ERROR] [%s] %v", remoteAddr, err)
			// Invariant 4: Even if packet processing fails, we DO NOT drop the connection!
		}
	}
}

func (s *TelemetryServer) processPacket(sess *DeviceSession, pkt gt06.Packet, raw []byte) error {
	switch p := pkt.(type) {
	case *gt06.LoginPacket:
		sess.mu.Lock()
		sess.imei = p.IMEI

		// Resolve or auto-generate deterministic vehicle UUID
		s.mu.RLock()
		vID, exists := s.vehicleMap[p.IMEI]
		s.mu.RUnlock()

		if !exists {
			// Generate deterministic namespace UUIDv5 for unmapped test vehicles
			vID = uuid.NewSHA1(uuid.NameSpaceOID, []byte(p.IMEI))
			s.mu.Lock()
			s.vehicleMap[p.IMEI] = vID
			s.mu.Unlock()
		}
		sess.vehicleID = vID
		sess.mu.Unlock()

		s.mu.Lock()
		s.sessions[p.IMEI] = sess
		s.mu.Unlock()

		log.Printf("[GT06 LOGIN] Device authenticated: IMEI=%s -> VehicleID=%s (Serial=%d)", p.IMEI, vID, p.Serial)

		// Send Login Acknowledgment: 0x78 0x78 0x05 0x01 [Serial] [CRC] 0x0D 0x0A
		ack := gt06.BuildLoginAck(p.Serial)
		sess.mu.Lock()
		_, err := sess.conn.Write(ack)
		sess.mu.Unlock()
		if err != nil {
			return fmt.Errorf("failed to send login ACK: %w", err)
		}
		return nil

	case *gt06.HeartbeatPacket:
		log.Printf("[GT06 HEARTBEAT] Keepalive received from IMEI=%s (Serial=%d, GSM=%d, Volt=%d)",
			sess.imei, p.Serial, p.GSMStrength, p.VoltageLevel)

		ack := gt06.BuildHeartbeatAck(p.Serial)
		sess.mu.Lock()
		_, err := sess.conn.Write(ack)
		sess.mu.Unlock()
		if err != nil {
			return fmt.Errorf("failed to send heartbeat ACK: %w", err)
		}
		return nil

	case *gt06.LocationPacket:
		sess.mu.Lock()
		vID := sess.vehicleID
		imei := sess.imei
		sess.mu.Unlock()

		if vID == uuid.Nil {
			// If device did not send login first, assign fallback deterministic UUID from IMEI or socket
			vID = uuid.NewSHA1(uuid.NameSpaceOID, []byte("unidentified-"+sess.conn.RemoteAddr().String()))
		}

		return s.broadcastLocation(vID, imei, p)

	default:
		log.Printf("[GT06 GATEWAY] Ignored unhandled packet protocol 0x%02X", pkt.Protocol())
		return nil
	}
}

func (s *TelemetryServer) broadcastLocation(vID uuid.UUID, imei string, loc *gt06.LocationPacket) error {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	telemetry := models.TelemetryUpdate{
		Type:               "TELEMETRY_UPDATE",
		VehicleID:          vID,
		RegistrationNumber: fmt.Sprintf("BUS-%s", imei),
		Coordinates: models.TelemetryCoordinates{
			Latitude:   loc.Latitude,
			Longitude:  loc.Longitude,
			SpeedKmh:   loc.SpeedKmh,
			Heading:    loc.HeadingDeg,
			IgnitionOn: loc.IgnitionOn,
		},
		Timestamp: loc.Timestamp,
	}

	payloadJSON, err := json.Marshal(telemetry)
	if err != nil {
		return fmt.Errorf("failed to marshal telemetry payload: %w", err)
	}

	if s.rdb != nil {
		pipe := s.rdb.Pipeline()

		// 1. GEOADD vehicle_locations <longitude> <latitude> <vehicle_id>
		pipe.GeoAdd(ctx, "vehicle_locations", &redis.GeoLocation{
			Name:      vID.String(),
			Longitude: loc.Longitude,
			Latitude:  loc.Latitude,
		})

		// 2. HSET vehicle:<id>:telemetry
		telemetryKey := fmt.Sprintf("vehicle:%s:telemetry", vID)
		pipe.HSet(ctx, telemetryKey, map[string]any{
			"lat":        loc.Latitude,
			"lng":        loc.Longitude,
			"speed":      loc.SpeedKmh,
			"heading":    loc.HeadingDeg,
			"ignition":   loc.IgnitionOn,
			"updated_at": loc.Timestamp.Format(time.RFC3339),
			"imei":       imei,
		})

		// 3. PUBLISH vehicle:<id>:stream <json_payload>
		vehicleChan := fmt.Sprintf("vehicle:%s:stream", vID)
		pipe.Publish(ctx, vehicleChan, payloadJSON)

		// 4. Global broadcast channel for fleet dashboards
		pipe.Publish(ctx, "telemetry:events", payloadJSON)

		_, err = pipe.Exec(ctx)
		if err != nil {
			return fmt.Errorf("redis telemetry pipeline failed: %w", err)
		}
	}

	log.Printf("[GT06 LOCATION] Vehicle=%s (Lat=%.5f, Lng=%.5f, Speed=%.1f km/h, Heading=%.1f°, Ignition=%v)",
		vID, loc.Latitude, loc.Longitude, loc.SpeedKmh, loc.HeadingDeg, loc.IgnitionOn)

	return nil
}

func (s *TelemetryServer) removeSession(sess *DeviceSession) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if sess.imei != "" {
		delete(s.sessions, sess.imei)
	}
}
