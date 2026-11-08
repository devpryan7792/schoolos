# SchoolOS Master Roadmap & Implementation Phases

> **Phase 1 Target Window:** November 8, 2026 – November 16, 2026 (Working Frame / Proof-of-Core)  
> **Phase 2 Target Window:** Post-Nov 16 (Full Scale Production & Hardening)

---

## Part 1: The 9-Day Sprint (Nov 8 – Nov 16 Working Frame)

The goal of this sprint is to deliver a fully verifiable, end-to-end working system skeleton demonstrating the core differentiators: **Multi-tenant RLS database**, **GT06 binary GPS packet decoding**, **Live bus map telemetry**, **Offline-capable desktop receipt printing**, and **Student/Guardian profile switching**.

```
+------------------------------------------------------------------------------------+
|                                THE 9-DAY MILESTONE CADENCE                         |
+------------------------------------------------------------------------------------+
| Nov 8 - 9  : Core Foundation (Docker, Postgres PostGIS, Redis, RLS Auth)           |
| Nov 10 - 11: Binary IoT Telemetry Engine (Go GT06 Daemon, Simulator, Redis Stream) |
| Nov 12 - 13: Web Management Portal (Next.js Dashboard, MapLibre Fleet Map)         |
| Nov 14 - 15: Edge Clients (Compose Desktop SQLite & Native Mobile Shells)          |
| Nov 16     : End-to-End Integration Verification & Demonstration                   |
+------------------------------------------------------------------------------------+
```

### Day 1 & Day 2 (Nov 8 – Nov 9): Core Infrastructure & Multi-Tenancy
* **Deliverable 1.1:** `docker-compose.yml` orchestrating PostgreSQL 16 (with PostGIS enabled), Redis 7, and MinIO (local S3 document store).
* **Deliverable 1.2:** Database migration runner applying `DATABASE_SCHEMA.sql`.
* **Deliverable 1.3:** Go backend API scaffold with JWT authentication and middleware executing:
  `SET LOCAL app.current_tenant_id = ?` per request transaction.
* **Verification Gate:**
  * Connect two separate tenant clients (`school-a` and `school-b`).
  * Verify that a query from `school-a` returns 0 rows when attempting to select a student belonging to `school-b`, verified at the PostgreSQL kernel level.

### Day 3 & Day 4 (Nov 10 – Nov 11): High-Throughput GPS TCP Ingestion Engine
* **Deliverable 2.1:** Go TCP server listening on port `5023`.
* **Deliverable 2.2:** Binary packet parser decoding:
  * `0x01` Login frame (validating device IMEI against `vehicles` table).
  * `0x13` Heartbeat frame (responding with acknowledgment).
  * `0x22` / `0x12` GPS location frame (decoding lat, long, speed, heading, ignition status).
* **Deliverable 2.3:** Real-time buffer pipeline:
  * Ingested location pushed to Redis geospatial index (`GEOADD`) and published to Redis channel `vehicle:<id>:stream`.
* **Deliverable 2.4:** Python/Go GPS simulator script emitting realistic GT06 hex packets representing a bus driving along a school route in Ranchi/Patna.
* **Verification Gate:**
  * Run simulator with 45 simulated bus connections.
  * Verify zero dropped TCP connections and $<5$ms latency between packet ingestion and Redis pub/sub broadcast.

### Day 5 & Day 6 (Nov 12 – Nov 13): Administrative Web Management Portal
* **Deliverable 3.1:** Next.js (App Router, Tailwind CSS, shadcn/ui) administration portal adhering to `docs/DESIGN.md`.
* **Deliverable 3.2:** Live Fleet Map using MapLibre GL and OpenStreetMap tiles.
  * Subscribes to backend WebSocket `/v1/ws/vehicles/{id}`.
  * Smoothly renders moving bus markers without Google Maps API keys or per-click costs.
* **Deliverable 3.3:** Core administrative interfaces:
  * Student enrollment and roster manager.
  * Fee structure and invoicing dashboard.
* **Verification Gate:**
  * Open web dashboard; start GPS simulator; watch the bus move smoothly across real street maps with live speed and heading indicators.

### Day 7 & Day 8 (Nov 14 – Nov 15): Native Desktop & Mobile Client Shells
* **Deliverable 4.1:** Compose Multiplatform (Kotlin Desktop) application for Windows:
  * Embedded local SQLite database caching student fee balances.
  * Offline cash fee collection screen generating a simulated thermal print receipt.
  * Idempotent sync worker pushing offline transactions to central PostgreSQL.
* **Deliverable 4.2:** Native Kotlin Android application scaffold:
  * Multi-account profile switcher in top header (Avatar + Dropdown).
  * Live bus tracking screen displaying student's assigned bus and morning pickup stop.
* **Deliverable 4.3:** Native Swift iOS application scaffold:
  * SwiftUI student dashboard and live map view.
* **Verification Gate:**
  * Disconnect internet on desktop client $\rightarrow$ record cash payment $\rightarrow$ reconnect internet $\rightarrow$ verify payment reconciles in central cloud PostgreSQL.

### Day 9 (Nov 16): End-to-End System Integration & Review Milestone
* **Comprehensive Test Execution:**
  1. Multi-tenant onboarding test (Creating a new school tenant via API).
  2. GPS hardware ingestion test (Simulated bus breadcrumbs streaming to Next.js web portal and mobile app simultaneously).
  3. Offline counter collection test (Desktop offline transaction syncing to Postgres and reflecting on the parent mobile app's fee ledger).
  4. Multi-profile switcher test (Tapping profile dropdown smoothly toggling between two siblings).
* **Delivery Artifact:** Self-contained demonstration environment ready for investor and school owner walkthrough.

---

## Part 2: Production Scale & Enterprise Hardening (Post-Nov 16)

Following the Nov 16 proof-of-core milestone, development shifts to full feature expansion across the remaining 25 modules:

```
[Phase 2.1: Academics & Operations]
  - Pluggable Board Engine (CBSE CCE, ICSE, BSEB/State bilingual marksheets)
  - Timetable auto-scheduler and teacher substitution engine
  - Science & Computer Lab inventory and apparatus breakage penalty workflow
  - Library Management System with OpenLibrary ISBN metadata lookup

[Phase 2.2: Autonomous AI Copilot Layer]
  - OpenCV on-device and worker OMR test sheet scanner (100 questions in <1 second)
  - WhatsApp Business Cloud API integration with LangChain / Tool-Calling parent agent
  - Autonomous fee dunning state machine (predictive WhatsApp follow-ups)

[Phase 2.3: Security, Documents & Hardware Deployment]
  - Deterministic vector PDF batch generator (CR80 PVC ID cards, Fee-locked Admit Cards, TCs)
  - On-premise LAN biometric sync service (eSSL, Mantra, Realtime)
  - Hardware tracker bulk flashing & APN deployment scripts for SinoTrack ST-901L
  - High-availability cluster deployment on low-cost Linux VPS
```

---

## Part 3: Operational Quality & Acceptance Gates

Every release candidate must pass these automated quality gates:
1. **Zero-Leaking Multi-Tenancy:** Automated test suite executes cross-tenant query probes; any data leakage halts CI/CD immediately.
2. **Offline Durability:** Desktop SQLite sync must withstand abrupt process crashes and power-off simulations without data corruption.
3. **Telemetry Throughput:** The GT06 daemon must sustain 10,000 pings/second with $<100$MB memory consumption on a single VPS core.
4. **Zero-Vibe Accounting:** Total credits must equal total debits across all ledger entries in every automated integration test run.
