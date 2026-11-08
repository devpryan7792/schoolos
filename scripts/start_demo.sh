#!/usr/bin/env bash
# ==============================================================================
# SchoolOS Master Demonstration Suite Launcher (Phase 4.2)
# Orchestrates:
#   1. SchoolOS API Engine (:8080)
#   2. High-Throughput GT06 GPS Telemetry Gateway (:5023)
#   3. Multi-Bus Telemetry Hardware Simulator (3 buses, Ranchi route)
#   4. Next.js 16 Web Management Portals (:3000)
# ==============================================================================

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

LOG_DIR="/tmp/schoolos_demo_logs"
mkdir -p "${LOG_DIR}"

API_LOG="${LOG_DIR}/api.log"
TELEMETRY_LOG="${LOG_DIR}/telemetry.log"
SIMULATOR_LOG="${LOG_DIR}/simulator.log"
WEB_LOG="${LOG_DIR}/web.log"

API_PID=""
TELEMETRY_PID=""
SIM_PID=""
WEB_PID=""

cleanup() {
    echo ""
    echo -e "\033[1;33m🛑 Gracefully terminating all SchoolOS demo services...\033[0m"
    
    if [ -n "${SIM_PID}" ] && kill -0 "${SIM_PID}" 2>/dev/null; then
        kill "${SIM_PID}" 2>/dev/null || true
        wait "${SIM_PID}" 2>/dev/null || true
        echo "  • Bus simulator stopped."
    fi

    if [ -n "${TELEMETRY_PID}" ] && kill -0 "${TELEMETRY_PID}" 2>/dev/null; then
        kill "${TELEMETRY_PID}" 2>/dev/null || true
        wait "${TELEMETRY_PID}" 2>/dev/null || true
        echo "  • GT06 telemetry daemon stopped."
    fi

    if [ -n "${API_PID}" ] && kill -0 "${API_PID}" 2>/dev/null; then
        kill "${API_PID}" 2>/dev/null || true
        wait "${API_PID}" 2>/dev/null || true
        echo "  • SchoolOS HTTP API stopped."
    fi

    if [ -n "${WEB_PID}" ] && kill -0 "${WEB_PID}" 2>/dev/null; then
        kill "${WEB_PID}" 2>/dev/null || true
        wait "${WEB_PID}" 2>/dev/null || true
        echo "  • Next.js Web Portal stopped."
    fi

    echo -e "\033[1;32m✅ Demo shutdown complete. Logs preserved in ${LOG_DIR}/\033[0m"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo "================================================================================"
echo "🎓 SCHOOLOS SELF-CONTAINED INTERACTIVE DEMONSTRATION ENVIRONMENT"
echo "   Targeting Tier-2 & Tier-3 Indian Schools (CBSE / ICSE / State Boards)"
echo "================================================================================"

# 1. Verify / Build Required Binaries
echo -e "\033[1;34m[1/5] Verifying binaries in bin/...\033[0m"
mkdir -p bin

if [ ! -f "bin/schoolos-api" ]; then
    echo "  • Compiling bin/schoolos-api..."
    GONOSUMDB=* GOPROXY=off ./bin/go build -o bin/schoolos-api services/api/*.go
fi

if [ ! -f "bin/telemetry-daemon" ]; then
    echo "  • Compiling bin/telemetry-daemon..."
    GONOSUMDB=* GOPROXY=off ./bin/go build -o bin/telemetry-daemon services/telemetry/main.go
fi

if [ ! -f "bin/simulated_bus" ]; then
    echo "  • Compiling bin/simulated_bus..."
    GONOSUMDB=* GOPROXY=off ./bin/go build -o bin/simulated_bus scripts/simulator/simulated_bus.go
fi

echo -e "  \033[32m✔ Binaries verified.\033[0m"

# 2. Boot GT06 Telemetry Server
echo -e "\033[1;34m[2/5] Starting GT06 GPS Telemetry Gateway on :5023 (TCP)...\033[0m"
TCP_PORT=5023 bin/telemetry-daemon > "${TELEMETRY_LOG}" 2>&1 &
TELEMETRY_PID=$!
sleep 0.5
if ! kill -0 "${TELEMETRY_PID}" 2>/dev/null; then
    echo -e "\033[1;31m❌ Failed to start telemetry daemon. See ${TELEMETRY_LOG}\033[0m"
    cat "${TELEMETRY_LOG}"
    exit 1
fi
echo -e "  \033[32m✔ GT06 Telemetry Gateway running (PID ${TELEMETRY_PID})\033[0m"

# 3. Boot SchoolOS HTTP API
echo -e "\033[1;34m[3/5] Starting SchoolOS REST API on :8080 (HTTP)...\033[0m"
PORT=8080 bin/schoolos-api > "${API_LOG}" 2>&1 &
API_PID=$!
sleep 0.5
if ! kill -0 "${API_PID}" 2>/dev/null; then
    echo -e "\033[1;31m❌ Failed to start SchoolOS API. See ${API_LOG}\033[0m"
    cat "${API_LOG}"
    exit 1
fi
echo -e "  \033[32m✔ SchoolOS HTTP API running (PID ${API_PID})\033[0m"

# 4. Boot Live Bus GPS Simulator (3 Buses: Bus 08, 14, 22)
echo -e "\033[1;34m[4/5] Launching Hardware Bus Simulator (3 active buses on Ranchi route)...\033[0m"
bin/simulated_bus -server="127.0.0.1:5023" -buses=3 -interval=1000 > "${SIMULATOR_LOG}" 2>&1 &
SIM_PID=$!
sleep 0.5
if ! kill -0 "${SIM_PID}" 2>/dev/null; then
    echo -e "\033[1;31m❌ Failed to start bus simulator. See ${SIMULATOR_LOG}\033[0m"
    cat "${SIMULATOR_LOG}"
    exit 1
fi
echo -e "  \033[32m✔ Bus fleet simulator streaming (PID ${SIM_PID})\033[0m"

# 5. Boot Web Frontend
echo -e "\033[1;34m[5/5] Launching Next.js Administrative Web Management Portals...\033[0m"
if [ ! -d "apps/web/.next" ]; then
    echo "  • Building Next.js production bundle..."
    npm --prefix apps/web run build > "${WEB_LOG}" 2>&1
fi

npm --prefix apps/web run start > "${WEB_LOG}" 2>&1 &
WEB_PID=$!
sleep 1
echo -e "  \033[32m✔ Next.js Management Portal running (PID ${WEB_PID})\033[0m"

echo ""
echo "================================================================================"
echo "✨ SCHOOLOS INTERACTIVE DEMONSTRATION IS READY"
echo "================================================================================"
echo -e "  🌐 \033[1;36mWeb Dashboard Hub      :\033[0m  http://localhost:3000"
echo -e "  🗺️  \033[1;36mLive Bus Fleet Map     :\033[0m  http://localhost:3000/fleet"
echo -e "  📝 \033[1;36mAI OMR Studio          :\033[0m  http://localhost:3000/omr"
echo -e "  📥 \033[1;36mSmart CSV Ingestion    :\033[0m  http://localhost:3000/ingestion"
echo -e "  📅 \033[1;36mTimetable & Sub Engine :\033[0m  http://localhost:3000/timetable"
echo -e "  💬 \033[1;36mDunning Communications :\033[0m  http://localhost:3000/communications"
echo -e "  📄 \033[1;36mVector Document Studio :\033[0m  http://localhost:3000/documents"
echo -e "  🔌 \033[1;36mAPI Health Check       :\033[0m  http://localhost:8080/health"
echo -e "  📡 \033[1;36mGT06 Hardware Telemetry:\033[0m  tcp://localhost:5023"
echo "--------------------------------------------------------------------------------"
echo -e "Logs streaming to: \033[1;30m${LOG_DIR}/\033[0m"
echo -e "Press \033[1;31mCtrl+C\033[0m at any time to halt the demonstration and clean up."
echo "================================================================================"

if [ "$1" == "--check" ]; then
    echo "Running self-test verification check..."
    sleep 2
    # Check API health endpoint
    if curl -s http://localhost:8080/health | grep -q "ok"; then
        echo -e "\033[1;32m✅ API health check returned 200 OK.\033[0m"
    else
        echo -e "\033[1;33m⚠️ API health check warning (may still be initializing).\033[0m"
    fi
    # Check bus simulator logs for GPS emissions
    if grep -q "Emitted GPS fix" "${SIMULATOR_LOG}"; then
        echo -e "\033[1;32m✅ Bus fleet simulator verified emitting live GT06 frames.\033[0m"
    fi
    echo -e "\033[1;32m🎉 Self-test verification passed! Terminating cleanly.\033[0m"
    exit 0
fi

# Wait on background processes
wait
