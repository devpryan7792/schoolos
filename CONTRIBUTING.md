# Contributing to SchoolOS

Thank you for your interest in contributing to SchoolOS.

SchoolOS is a mission-critical platform powering financial ledgers, biometric clock-ins, bus telemetry, and exam evaluation for schools. To protect the integrity of educational and financial data, all contributions must adhere to strict engineering standards.

---

## Code of Architecture & Invariants

Before writing or submitting any code, familiarize yourself with these non-negotiable rules:

1. **Audit Immutability & Zero-Float Financials:**
   - Floating-point primitives (`float32`, `float64`, `Float`, `Double`) are strictly prohibited in financial code.
   - All monetary calculations must use fixed-point decimal arithmetic via `github.com/shopspring/decimal`.
   - Historical ledger entries are immutable. Adjustments must be appending journal entries with full audit trails.
   - Total debits must equal total credits ($\sum\text{Debits} == \sum\text{Credits}$) on every ledger transaction.

2. **Multi-Tenant Isolation:**
   - All database queries accessing school data must execute within a session where `SET LOCAL app.current_tenant_id = ?` is set.
   - Kernel-level PostgreSQL Row-Level Security (RLS) is the source of truth. Never bypass RLS via superuser connections in production application code.

3. **Socket Resilience (GT06/SinoTrack IoT):**
   - The GT06 telemetry daemon must never close or drop a TCP connection due to corrupt, noisy, or malformed bytes. The stream framer must advance past invalid bytes until the next valid header (`0x7878`) is located.

4. **Zero-Cost First (Notifications):**
   - Paid SMS dispatch must never precede native push notifications. If a valid push token exists for a student/guardian, Tier 1 Push (₹0.00 cost) must be selected.

---

## Development Workflow

### 1. Prerequisites
- **Go**: Version `1.23` or higher.
- **Node.js**: Version `20` or higher (with `npm`).
- **Python**: Version `3.11` or higher.
- **Docker**: For running PostgreSQL 16 PostGIS and Redis 7 services.

### 2. Building and Testing
Use the root `Makefile` to orchestrate common development tasks:

```bash
# Compile all binaries into bin/
make build

# Run unit tests across all packages with race detection
make test

# Execute the 21-Gate System Acceptance Verifier
make verify

# Run the 12-stage end-to-end system walkthrough
make walkthrough

# Run the high-throughput telemetry benchmark
make benchmark

# Build the Next.js 16 Web Management Portals
make web-build

# Launch the interactive demonstration environment
make demo
```

### 3. Acceptance Gates
All pull requests must pass:
1. `make test` with zero race conditions (`-race`).
2. `make verify` (all 21 system quality gates must report `PASS`).
3. Next.js 16 production build with zero TypeScript errors.

---

## Pull Request Guidelines

1. **Focused Scope:** Keep PRs targeted to a specific bug fix, performance enhancement, or module capability. Avoid massive, unrelated refactors.
2. **Deterministic Tests:** Every new endpoint, model, or parser must include corresponding automated unit tests.
3. **Commit Messages:** Use conventional commit messages:
   - `feat(telemetry): add support for GT06 alarm packet 0x16`
   - `fix(ledger): correct rounding on multi-child concession`
   - `test(omr): add edge-case test for faint bubble fill`
