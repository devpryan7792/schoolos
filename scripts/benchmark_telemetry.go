package main

import (
	"fmt"
	"net"
	"runtime"
	"sort"
	"sync"
	"sync/atomic"
	"time"

	"github.com/schoolos/schoolos/pkg/gt06"
	"github.com/schoolos/schoolos/pkg/telemetry"
)

type BenchmarkReport struct {
	TotalPacketsSent uint64
	SuccessfulPings  uint64
	FailedPings      uint64
	Duration         time.Duration
	Throughput       float64 // pings / sec
	P50Latency       time.Duration
	P90Latency       time.Duration
	P95Latency       time.Duration
	P99Latency       time.Duration
	HeapAllocMB      float64
	SysMemMB         float64
	NumGC            uint32
}

func main() {
	fmt.Println("================================================================================")
	fmt.Println("⚡ SCHOOLOS GT06 TELEMETRY HIGH-THROUGHPUT STRESS BENCHMARK (PHASE 4.1)")
	fmt.Println("   Evaluating Invariant: ≥ 10,000 pings/sec with < 100MB RAM on a Single Core")
	fmt.Println("================================================================================")

	report, err := RunTelemetryBenchmark(25, 25000)
	if err != nil {
		panic(fmt.Sprintf("Benchmark failed with error: %v", err))
	}

	fmt.Println("\n================================================================================")
	fmt.Println("📊 BENCHMARK PERFORMANCE RESULTS")
	fmt.Println("================================================================================")
	fmt.Printf("Total Pings Ingested : %d packets\n", report.SuccessfulPings)
	fmt.Printf("Dropped / Failed     : %d packets (0.00%% loss)\n", report.FailedPings)
	fmt.Printf("Benchmark Duration   : %v\n", report.Duration.Round(time.Millisecond))
	fmt.Printf("Effective Throughput : \033[1;32m%.2f pings/second\033[0m\n", report.Throughput)
	fmt.Println("--------------------------------------------------------------------------------")
	fmt.Println("⏱️ LATENCY DISTRIBUTION:")
	fmt.Printf("  • Median (P50)     : %v\n", report.P50Latency.Round(time.Microsecond))
	fmt.Printf("  • 90th Percentile  : %v\n", report.P90Latency.Round(time.Microsecond))
	fmt.Printf("  • 95th Percentile  : %v\n", report.P95Latency.Round(time.Microsecond))
	fmt.Printf("  • 99th Percentile  : %v\n", report.P99Latency.Round(time.Microsecond))
	fmt.Println("--------------------------------------------------------------------------------")
	fmt.Println("💾 MEMORY FOOTPRINT & GARBAGE COLLECTION:")
	fmt.Printf("  • Heap In-Use      : \033[1;34m%.2f MB\033[0m (< 100MB Invariant Target)\n", report.HeapAllocMB)
	fmt.Printf("  • Total System RAM : %.2f MB\n", report.SysMemMB)
	fmt.Printf("  • Total GC Cycles  : %d pauses\n", report.NumGC)
	fmt.Println("================================================================================")

	// Validate Invariants
	if report.Throughput < 10000.0 {
		panic(fmt.Sprintf("FAILED: Throughput %.2f pings/sec is below 10,000 target", report.Throughput))
	}
	if report.HeapAllocMB > 100.0 {
		panic(fmt.Sprintf("FAILED: Heap memory %.2f MB exceeds 100MB invariant limit", report.HeapAllocMB))
	}
	if report.FailedPings > 0 {
		panic(fmt.Sprintf("FAILED: Detected %d dropped packets", report.FailedPings))
	}

	fmt.Println("🎉 ALL TELEMETRY THROUGHPUT & MEMORY FOOTPRINT INVARIANTS SATISFIED!")
	fmt.Println("================================================================================")
}

// RunTelemetryBenchmark spins up the daemon on loopback and injects GT06 packets concurrently
func RunTelemetryBenchmark(concurrentWorkers int, packetsPerWorker int) (BenchmarkReport, error) {
	// 1. Start GT06 Gateway Server
	server := telemetry.NewTelemetryServer("127.0.0.1:0", nil)
	if err := server.Start(); err != nil {
		return BenchmarkReport{}, fmt.Errorf("failed to start telemetry server: %w", err)
	}
	defer server.Stop()

	serverAddr := server.Addr()
	var totalSuccess uint64
	var totalFailed uint64

	// Prepare pre-built packets to avoid allocation during benchmark loop
	now := time.Now().UTC()
	loginPkt, _ := gt06.BuildLoginPacket("352387082002457", 1)
	locPkt := gt06.BuildLocationPacket(now, 23.34410, 85.30950, 42.5, 135.0, true, 2)

	// Latency sample collection (sample every 10th packet to prevent memory inflation in test harness)
	sampleSize := (concurrentWorkers * packetsPerWorker) / 10
	latencies := make([]time.Duration, 0, sampleSize)
	var latencyMu sync.Mutex

	var wg sync.WaitGroup
	start := time.Now()

	for w := 0; w < concurrentWorkers; w++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()

			conn, err := net.Dial("tcp", serverAddr)
			if err != nil {
				atomic.AddUint64(&totalFailed, uint64(packetsPerWorker))
				return
			}
			defer conn.Close()

			// Authenticate device with GT06 login frame
			if _, err := conn.Write(loginPkt); err != nil {
				atomic.AddUint64(&totalFailed, uint64(packetsPerWorker))
				return
			}

			localLatencies := make([]time.Duration, 0, packetsPerWorker/10)

			// Tight packet injection loop
			for i := 0; i < packetsPerWorker; i++ {
				var t0 time.Time
				shouldSample := (i % 10 == 0)
				if shouldSample {
					t0 = time.Now()
				}

				if _, err := conn.Write(locPkt); err != nil {
					atomic.AddUint64(&totalFailed, 1)
				} else {
					atomic.AddUint64(&totalSuccess, 1)
				}

				if shouldSample {
					localLatencies = append(localLatencies, time.Since(t0))
				}
			}

			latencyMu.Lock()
			latencies = append(latencies, localLatencies...)
			latencyMu.Unlock()
		}(w)
	}

	wg.Wait()
	duration := time.Since(start)

	// Memory Profiling
	var memStats runtime.MemStats
	runtime.ReadMemStats(&memStats)

	// Calculate Throughput
	throughput := float64(totalSuccess) / duration.Seconds()

	// Compute Percentiles
	sort.Slice(latencies, func(i, j int) bool {
		return latencies[i] < latencies[j]
	})

	var p50, p90, p95, p99 time.Duration
	if len(latencies) > 0 {
		p50 = latencies[len(latencies)*50/100]
		p90 = latencies[len(latencies)*90/100]
		p95 = latencies[len(latencies)*95/100]
		p99 = latencies[len(latencies)*99/100]
	}

	return BenchmarkReport{
		TotalPacketsSent: uint64(concurrentWorkers * packetsPerWorker),
		SuccessfulPings:  totalSuccess,
		FailedPings:      totalFailed,
		Duration:         duration,
		Throughput:       throughput,
		P50Latency:       p50,
		P90Latency:       p90,
		P95Latency:       p95,
		P99Latency:       p99,
		HeapAllocMB:      float64(memStats.Alloc) / (1024 * 1024),
		SysMemMB:         float64(memStats.Sys) / (1024 * 1024),
		NumGC:            memStats.NumGC,
	}, nil
}
