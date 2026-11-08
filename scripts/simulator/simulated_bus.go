package main

import (
	"encoding/hex"
	"flag"
	"fmt"
	"io"
	"log"
	"math"
	"net"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/schoolos/schoolos/pkg/gt06"
)

// GPSWaypoint represents a latitude/longitude point along a school bus route.
type GPSWaypoint struct {
	Lat   float64
	Lng   float64
	Speed float64 // km/h
}

// RanchiRoute represents realistic waypoints along Ranchi school bus routes.
var RanchiRoute = []GPSWaypoint{
	{Lat: 23.3441, Lng: 85.3095, Speed: 25.0}, // Hinoo Chowk
	{Lat: 23.3482, Lng: 85.3120, Speed: 32.0}, // Birsa Chowk
	{Lat: 23.3530, Lng: 85.3165, Speed: 38.5}, // Doranda Bazar
	{Lat: 23.3590, Lng: 85.3210, Speed: 42.0}, // Rajendra Chowk
	{Lat: 23.3645, Lng: 85.3255, Speed: 28.0}, // Overbridge
	{Lat: 23.3690, Lng: 85.3280, Speed: 30.0}, // Main Road
	{Lat: 23.3740, Lng: 85.3315, Speed: 35.0}, // Albert Ekka Chowk
	{Lat: 23.3795, Lng: 85.3340, Speed: 26.0}, // Circular Road
	{Lat: 23.3830, Lng: 85.3360, Speed: 15.0}, // School Gate Stop
}

func calculateBearing(lat1, lng1, lat2, lng2 float64) float64 {
	y := math.Sin((lng2-lng1)*math.Pi/180.0) * math.Cos(lat2*math.Pi/180.0)
	x := math.Cos(lat1*math.Pi/180.0)*math.Sin(lat2*math.Pi/180.0) -
		math.Sin(lat1*math.Pi/180.0)*math.Cos(lat2*math.Pi/180.0)*math.Cos((lng2-lng1)*math.Pi/180.0)
	bearing := math.Atan2(y, x) * 180.0 / math.Pi
	if bearing < 0 {
		bearing += 360.0
	}
	return bearing
}

// RunBusSimulation connects to the GT06 server and simulates a single bus.
func RunBusSimulation(serverAddr string, imei string, interval time.Duration, loops int, stopChan <-chan struct{}) error {
	conn, err := net.Dial("tcp", serverAddr)
	if err != nil {
		return fmt.Errorf("[%s] Failed to dial %s: %w", imei, serverAddr, err)
	}
	defer conn.Close()
	log.Printf("[%s] Connected to GT06 telemetry server at %s", imei, serverAddr)

	// 1. Send Login Frame
	serial := uint16(1)
	loginFrame, err := gt06.BuildLoginPacket(imei, serial)
	if err != nil {
		return fmt.Errorf("[%s] Failed to build login packet: %w", imei, err)
	}

	if _, err := conn.Write(loginFrame); err != nil {
		return fmt.Errorf("[%s] Failed to send login frame: %w", imei, err)
	}
	log.Printf("[%s] Sent GT06 Login packet (Serial=%d, Hex=%s)", imei, serial, hex.EncodeToString(loginFrame))

	// Await Login ACK
	ackBuf := make([]byte, 10)
	_ = conn.SetReadDeadline(time.Now().Add(5 * time.Second))
	if _, err := io.ReadFull(conn, ackBuf); err != nil {
		return fmt.Errorf("[%s] Failed to receive Login ACK: %w", imei, err)
	}

	if !gt06.VerifyCRC(ackBuf) || ackBuf[3] != gt06.ProtoLogin {
		return fmt.Errorf("[%s] Invalid Login ACK received: %s", imei, hex.EncodeToString(ackBuf))
	}
	log.Printf("[%s] Received verified Login ACK from server (Hex=%s)", imei, hex.EncodeToString(ackBuf))

	// Reset read deadline
	_ = conn.SetReadDeadline(time.Time{})

	// 2. Stream GPS Location packets
	loopCount := 0
	for {
		for i := 0; i < len(RanchiRoute)-1; i++ {
			select {
			case <-stopChan:
				log.Printf("[%s] Stopping simulation cleanly", imei)
				return nil
			default:
			}

			w1 := RanchiRoute[i]
			w2 := RanchiRoute[i+1]
			heading := calculateBearing(w1.Lat, w1.Lng, w2.Lat, w2.Lng)

			serial++
			locFrame := gt06.BuildLocationPacket(time.Now(), w1.Lat, w1.Lng, w1.Speed, heading, true, serial)

			if _, err := conn.Write(locFrame); err != nil {
				return fmt.Errorf("[%s] Failed to send location packet: %w", imei, err)
			}

			log.Printf("[%s] Emitted GPS fix: Lat=%.5f, Lng=%.5f, Speed=%.1f km/h, Heading=%.1f° (Serial=%d)",
				imei, w1.Lat, w1.Lng, w1.Speed, heading, serial)

			// Send periodic heartbeat every 5 location updates
			if serial%5 == 0 {
				hbSerial := serial + 1000
				hbFrame := gt06.BuildHeartbeatPacket(0x01, 0x04, 0x04, hbSerial)
				_, _ = conn.Write(hbFrame)
				// Read heartbeat ACK
				hbAck := make([]byte, 10)
				_ = conn.SetReadDeadline(time.Now().Add(2 * time.Second))
				_, _ = io.ReadFull(conn, hbAck)
				_ = conn.SetReadDeadline(time.Time{})
			}

			time.Sleep(interval)
		}

		loopCount++
		if loops > 0 && loopCount >= loops {
			log.Printf("[%s] Completed %d route loops. Simulation finished.", imei, loops)
			break
		}
	}

	return nil
}

func main() {
	serverAddr := flag.String("server", "127.0.0.1:5023", "Target GT06 TCP server address")
	busCount := flag.Int("buses", 1, "Number of concurrent buses to simulate")
	intervalMs := flag.Int("interval", 1000, "Interval between GPS fixes in milliseconds")
	loops := flag.Int("loops", 0, "Number of route loops (0 = continuous until interrupt)")
	flag.Parse()

	log.Printf("Starting SchoolOS Vehicle Telemetry Simulator (Target: %s, Buses: %d)", *serverAddr, *busCount)

	stopChan := make(chan struct{})
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		<-sigChan
		log.Println("Received interrupt. Signaling all simulated buses to halt...")
		close(stopChan)
	}()

	var wg sync.WaitGroup
	baseIMEI := int64(352387082002450)

	for b := 0; b < *busCount; b++ {
		imei := fmt.Sprintf("%015d", baseIMEI+int64(b))
		wg.Add(1)
		go func(busIMEI string, delay time.Duration) {
			defer wg.Done()
			time.Sleep(delay) // Stagger startup
			interval := time.Duration(*intervalMs) * time.Millisecond
			if err := RunBusSimulation(*serverAddr, busIMEI, interval, *loops, stopChan); err != nil {
				log.Printf("[%s] Simulator error: %v", busIMEI, err)
			}
		}(imei, time.Duration(b*150)*time.Millisecond)
	}

	wg.Wait()
	log.Println("All bus simulations completed.")
}
