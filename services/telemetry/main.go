package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/schoolos/schoolos/pkg/telemetry"
)

func main() {
	port := os.Getenv("TCP_PORT")
	if port == "" {
		port = "5023"
	}
	addr := ":" + port

	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379/0"
	}

	var rdb *redis.Client
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Printf("[GT06 INIT] Warning: Invalid REDIS_URL %s, running in detached mode: %v", redisURL, err)
	} else {
		rdb = redis.NewClient(opt)
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		if err := rdb.Ping(ctx).Err(); err != nil {
			log.Printf("[GT06 INIT] Warning: Redis unavailable (%v). Continuing with direct broadcast logging.", err)
		} else {
			log.Printf("[GT06 INIT] Connected to Redis cluster at %s", opt.Addr)
		}
		cancel()
	}

	server := telemetry.NewTelemetryServer(addr, rdb)
	if err := server.Start(); err != nil {
		log.Fatalf("[GT06 FATAL] Failed to start telemetry server: %v", err)
	}

	// Graceful shutdown trap
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	<-sigChan
	log.Println("[GT06 INIT] Received termination signal. Draining connections...")

	_ = server.Stop()
	if rdb != nil {
		_ = rdb.Close()
	}
	log.Println("[GT06 INIT] Shutdown complete.")
}
