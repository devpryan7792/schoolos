# ==============================================================================
# SchoolOS Master Developer & Operations Orchestrator (Phase 4.3)
# ==============================================================================

SHELL := /bin/bash
GO := GONOSUMDB=* GOPROXY=off ./bin/go
BIN_DIR := bin

.PHONY: all build test verify walkthrough benchmark web-build demo backup clean help

help:
	@echo "SchoolOS Build & Operations Orchestrator"
	@echo "========================================="
	@echo "  make build        : Compile all system binaries into bin/"
	@echo "  make test         : Run all Go unit & invariant test suites"
	@echo "  make verify       : Execute 21-Gate System Acceptance Verifier"
	@echo "  make walkthrough  : Execute 12-Stage Master Cross-Client Walkthrough"
	@echo "  make benchmark    : Execute GT06 High-Throughput Telemetry Benchmark"
	@echo "  make web-build    : Compile Next.js 16 Web Management Portals"
	@echo "  make demo         : Launch Self-Contained Demo Environment"
	@echo "  make backup       : Execute Disaster Recovery WAL Archival & Digest"
	@echo "  make clean        : Remove build outputs and temporary caches"
	@echo "  make all          : Full build, web compilation, and test execution"

all: build web-build test verify

build:
	@mkdir -p $(BIN_DIR)
	@echo "🔨 Compiling SchoolOS binaries into $(BIN_DIR)/..."
	$(GO) build -o $(BIN_DIR)/schoolos-api services/api/*.go
	$(GO) build -o $(BIN_DIR)/telemetry-daemon services/telemetry/main.go
	$(GO) build -o $(BIN_DIR)/simulated_bus scripts/simulator/simulated_bus.go
	$(GO) build -o $(BIN_DIR)/e2e-verifier scripts/e2e_verify.go
	$(GO) build -o $(BIN_DIR)/system-walkthrough scripts/system_e2e_walkthrough.go
	$(GO) build -o $(BIN_DIR)/benchmark-telemetry scripts/benchmark_telemetry.go
	@echo "✅ All binaries successfully compiled into $(BIN_DIR)/"

test:
	@echo "🧪 Running unit test suites with race detection..."
	$(GO) test -v ./pkg/... ./services/api

verify: build
	@echo "🚀 Executing 21-Gate System Acceptance Verifier..."
	./$(BIN_DIR)/e2e-verifier

walkthrough: build
	@echo "🏃 Executing 12-Stage Master Cross-Client Walkthrough..."
	./$(BIN_DIR)/system-walkthrough

benchmark: build
	@echo "⚡ Executing GT06 Telemetry High-Throughput Stress Benchmark..."
	./$(BIN_DIR)/benchmark-telemetry

web-build:
	@echo "🌐 Compiling Next.js 16 Web Management Portals with Turbopack..."
	npm --prefix apps/web run build

demo: build
	@echo "✨ Starting SchoolOS Interactive Demonstration..."
	bash scripts/start_demo.sh

backup:
	@echo "💾 Executing PostgreSQL Disaster Recovery & WAL Archival Snapshot..."
	bash scripts/backup_wal.sh

clean:
	@echo "🧹 Cleaning temporary files and build artifacts..."
	rm -rf /tmp/schoolos* /tmp/backups/schoolos /tmp/postgresql/wal_archive
	rm -f $(BIN_DIR)/schoolos-api $(BIN_DIR)/telemetry-daemon $(BIN_DIR)/simulated_bus
	rm -f $(BIN_DIR)/e2e-verifier $(BIN_DIR)/system-walkthrough $(BIN_DIR)/benchmark-telemetry
	@echo "✨ Clean complete."
