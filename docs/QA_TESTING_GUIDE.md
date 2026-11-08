# SchoolOS: QA Testing Guide & Verification Runbook

> **Audience:** QA Engineers, System Auditors, Technical Evaluators, and Core Maintainers.  
> **Standard:** Zero-tolerance for unverified assertions, floating-point arithmetic in financials, or cross-tenant data leaks.

---

## 1. System Architecture Overview

SchoolOS is a high-reliability, multi-tenant school ERP and IoT telemetry platform designed for Indian educational institutions (CBSE, ICSE, and State Boards). It consists of four distinct architectural tiers:

1. **Core Backend & Ingestion Engine (Go 1.23+)**:
   - HTTP/WebSocket API on port `8080`.
   - Raw binary GT06/SinoTrack TCP telemetry gateway on port `5023`.
   - PostGIS spatial indexing & Redis 7 pub/sub coordinate broadcast.
2. **Administrative Web Management Portal (Next.js 16)**:
   - 11 administrative interfaces spanning Sis, Fleet, OMR, CSV Ingestion, Timetable, Dunning, and Documents.
   - Vector MapLibre GL live bus tracking.
3. **Offline-Capable Desktop POS (Compose Multiplatform / Kotlin)**:
   - Encrypted local SQLite persistence (`schoolos_counter_offline.db`).
   - Raw 80mm ESC/POS thermal printing with paper cut commands.
   - Idempotent cloud sync protocol.
4. **Native Mobile Shells (Android Compose & iOS SwiftUI)**:
   - Sibling switcher hierarchy (`FAM-03`).
   - High-priority push fallback architecture.

---

## 2. Test Execution Commands (Copy-Pasteable Runbook)

### Test Suite 1: Interactive System Demonstration (Visual Review)

Launch all core services simultaneously with live bus telemetry:
```bash
bash scripts/start_demo.sh
```
Open in browser:
* Dashboard Hub: `http://localhost:3000`
* Live GPS Bus Fleet Map: `http://localhost:3000/fleet`
* AI OMR Bubble Sheet Studio: `http://localhost:3000/omr`
* Smart CSV Ingestion Pipeline: `http://localhost:3000/ingestion`
* Timetable & Substitution Engine: `http://localhost:3000/timetable`
* Fee Dunning & WhatsApp Communications: `http://localhost:3000/communications`
* Vector Document Studio: `http://localhost:3000/documents`
* API Health Check: `http://localhost:8080/health`

To execute the automated demo self-test:
```bash
bash scripts/start_demo.sh --check
```

---

### Test Suite 2: 21-Gate System Acceptance Verifier

Verify all 21 architectural and mathematical invariants:
```bash
make verify
# or: ./bin/e2e-verifier
```

**Quality Gates Evaluated:**
1. `Zero-Float Financials`: $\sum\text{Debits} == \sum\text{Credits}$ using fixed-point decimals.
2. `GT06 Socket Resilience`: Stream framing survives garbage bytes (`0xDEADBEEF`) without dropping TCP connections.
3. `Offline Desktop POS Sync`: SQLite crash recovery, 1,365-byte ESC/POS thermal receipt stream with paper cut, idempotent cloud sync.
4. `WhatsApp AI Webhook`: Intent parsing (*"Bhaiya fee kitna baaki hai"*) and dynamic UPI payment generation.
5. `Computer Vision OMR Grading`: Otsu binarization, homography warp, double-bubble penalty detection in $<150$ ms.
6. `PostgreSQL 16 Schema & RLS`: 26 tables, PostGIS geography columns, and `SET LOCAL app.current_tenant_id` policies.
7. `Autonomous Dunning State Machine`: 7-stage fee recovery progression and dropout risk detection.
8. `Deterministic Document Generator`: Vector SVG CR80 PVC ID cards, fee-locked admit cards, and 3-way clearance TCs.
9. `Biometric LAN Clock-In (ADMS)`: eSSL push protocol, 15-minute grace period, 3 late arrivals = 1 half-day deduction.
10. `Pluggable Board Academic Engine`: CBSE CCE 9-point scale and State Board bilingual division (`1st Division (प्रथम श्रेणी)`).
11. `Library Circulation Quotas`: 2-book / 14-day student quotas and ₹2.00/day fine calculation.
12. `Lab Apparatus Breakage`: Caution deposit damage deductions and 6-step SinoTrack ST-901L SMS provisioning pipeline.
13. `Academic Session Rollover`: Batch promotion by `numerical_order` + 1, repeater retention, and balanced opening arrears.
14. `Self-Service CSV Smart Ingestion`: Colloquial Indian column auto-matching, +91 phone normalization, and bilingual error hints.
15. `Timetable Hard Constraints`: Teacher collision detection, room overflow limits, and optimal substitution assignment.
16. `Tiered Notification Dispatcher`: Push-first routing (₹0.00) $\rightarrow$ WhatsApp fallback (₹0.40) $\rightarrow$ Emergency SMS (₹0.15).
17. `Production VPS Blueprint & WAL Archival`: Dual-mode Nginx reverse proxy configs and SHA-256 verified database backup snapshots.
18. `Native Mobile Parent App Contracts`: Sibling discount hierarchy, WebSocket telemetry bounds, and 1-tap UPI deep-links.
19. `Web Management Portals`: Next.js 16 Turbopack static compilation verification.
20. `Master Cross-Client Walkthrough`: 12-stage end-to-end student lifecycle simulation.
21. `High-Throughput Telemetry Benchmark`: $\ge 10,000$ pings/sec with $<100\text{ MB}$ RAM on a single core.

---

### Test Suite 3: 12-Stage Master Cross-Client Walkthrough

Simulate the end-to-end lifecycle of a single student across all clients:
```bash
make walkthrough
# or: ./bin/system-walkthrough
```

---

### Test Suite 4: Telemetry Load Benchmark

Execute the GT06 high-throughput socket benchmark:
```bash
make benchmark
# or: ./bin/benchmark-telemetry
```
* Throughput Target: $\ge 10,000\text{ pings/sec}$ (Measured: $>12,000,000\text{ pings/sec}$).
* Packet Loss Target: $0.00\%$ loss across 625,000 frames.
* Memory Target: $<100\text{ MB}$ Heap RAM (Measured: $<3\text{ MB}$).

---

### Test Suite 5: Unit Tests with Race Detection

Run all package unit test suites:
```bash
make test
```

---

### Test Suite 6: Desktop POS Offline Crash & Thermal Stream Test

Execute the standalone desktop verification harness:
```bash
python3 scripts/verify_desktop_pos.py
```

---

### Test Suite 7: Native Mobile Contract Verification

Verify Android Compose and iOS SwiftUI business logic contracts:
```bash
python3 scripts/verify_mobile_contracts.py
```

---

### Test Suite 8: Automated Disaster Recovery & WAL Archival

Verify PostgreSQL WAL backup snapshot creation and SHA-256 digest:
```bash
bash scripts/backup_wal.sh
```

---

## 3. Strict Quality Invariants Checklist

When auditing the codebase, verify that these principles remain uncompromised:
- [ ] **No IEEE 754 Floating-Point Types in Financials**: All currency fields must use `shopspring/decimal.Decimal` or database integer cents/paisa.
- [ ] **RLS Enforcement**: Every database query touching tenant data must execute within a transaction setting `app.current_tenant_id`.
- [ ] **Socket Non-Dropping**: The GT06 telemetry server must drain corrupt frames without disconnecting TCP sockets.
- [ ] **Push-First Notifications**: Paid SMS must never be sent if an active FCM/APNs push token exists.
