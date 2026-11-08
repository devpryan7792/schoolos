# SchoolOS: Next-Generation Multi-Tenant School ERP & IoT Telemetry Platform

[![CI Pipeline](https://github.com/schoolos/schoolos/actions/workflows/ci.yml/badge.svg)](.github/workflows/ci.yml)
[![Quality Gates](https://img.shields.io/badge/Quality%20Gates-21%2F21%20Passing-brightgreen)](docs/QA_TESTING_GUIDE.md)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Go Version](https://img.shields.io/badge/Go-1.23%2B-00ADD8?logo=go)](go.mod)
[![Next.js](https://img.shields.io/badge/Next.js-16%20Turbopack-black?logo=next.js)](apps/web)

> **Target Market:** Tier-2 and Tier-3 private educational institutions (CBSE, ICSE, State Boards / BSEB).  
> **Core Architectural Pillars:** Extreme self-hostability on low-cost VPS, offline-first native desktop resilience, low-latency binary IoT telemetry, strict PostgreSQL Row-Level Security (RLS) multi-tenancy, world-class modern EdTech UI/UX design, and an integrated autonomous Agentic AI layer.
>
> 📖 **Auditor / QA Runbook:** See the comprehensive [QA Testing & Verification Guide](docs/QA_TESTING_GUIDE.md) to inspect and verify every architectural invariant.

---

## 1. System Vision & Philosophy

SchoolOS is engineered as a direct, superior alternative to legacy school communication portals (e.g., Parents Alarm, Entab, Fedena). Incumbent platforms suffer from architectural debt: fragile cloud-only architectures that collapse when school broadband drops, unreliable push notifications on budget Android smartphones, chaotic fee ledger race conditions, dated and clunky interfaces, and expensive proprietary GPS hardware locks.

SchoolOS resolves these fundamental flaws through a zero-compromise engineering model:
1. **Local-First Counter Resilience:** Gate attendance and cash fee collection never halt, even during complete internet blackouts, powered by an offline-capable native desktop client.
2. **Open-Protocol IoT Transport:** Ingests raw GT06/SinoTrack binary telemetry over TCP from standard \$12 4G trackers, alongside a zero-capex smartphone Driver App.
3. **Audit-Proof Double-Entry Financials:** Concessions, sibling discounts, caution money deposits, and mid-term refunds are tracked in an immutable, double-entry ledger.
4. **World-Class EdTech Design System:** High-density, tactile, accessible design inspired by premier modern SaaS (Linear, Stripe, Duolingo, Masterclass) crafted for high readability on budget Android screens and low-spec school counter monitors.
5. **Autonomous Agentic Copilots:** Replaces manual administrative friction with local-edge OMR sheet grading, 24/7 WhatsApp Parent Care, and predictive fee collection agents.

---

## 2. High-Level System Architecture

```
                                      CLIENT TIER
+---------------------------------------------------------------------------------------+
|  Web Management Portal  |   Counter & Gate Client   |    Native Mobile Applications   |
|   (Next.js App Router)  | (Compose Desktop Kotlin)  | (Kotlin Android / Swift iOS)    |
|   Principals / Teachers |   Accountants / Reception | Parents / Students / Drivers    |
+-------------------------+---------------------------+---------------------------------+
             |                          |                              |
             | HTTPS (REST/gRPC)        | HTTPS (Bi-directional Sync)  | HTTPS / WSS / Push (FCM/APNs)
             v                          v                              v
+---------------------------------------------------------------------------------------+
|                                    API & INGESTION TIER                               |
+---------------------------------------------------------------------------------------+
|  [Core Business API Server] (Go / Golang)                                             |
|  - Multi-tenant routing & RBAC enforcement                                            |
|  - Financial transaction engine & PDF generation                                      |
|  - Student lifecycle & Academic Board grading rules                                   |
|                                                                                       |
|  [High-Throughput GPS Telemetry Daemon] (Go / TCP Gateway)                            |
|  - Listens on TCP Port 5023 for binary GT06 / SinoTrack packets                       |
|  - Validates IMEI, decodes lat/long/speed/ignition state, pushes to Redis buffer       |
|                                                                                       |
|  [Agentic AI Execution Service] (Python / Go Async Worker)                            |
|  - OpenCV OMR evaluation pipeline                                                     |
|  - WhatsApp Conversational Agent with Tool Calling                                    |
|  - Autonomous fee dunning scheduler                                                  |
+---------------------------------------------------------------------------------------+
             |                                                  |
             v                                                  v
+----------------------------------------+     +----------------------------------------+
|         STORAGE TIER (PostgreSQL 16)   |     |        STREAM & CACHE TIER (Redis 7)   |
+----------------------------------------+     +----------------------------------------+
| - Multi-tenant Row-Level Security (RLS)|     | - Real-time vehicle coordinate buffer  |
| - PostGIS spatial indexing & routes    |     | - WebSocket pub/sub for live tracking  |
| - Immutable financial double-entry     |     | - Idempotency lock keys & session state|
| - Offline sync transaction queue       |     | - High-priority notification queues    |
+----------------------------------------+     +----------------------------------------+
```

---

## 3. Technology Stack Matrix

| Layer | Technology | Version | Purpose & Strategic Rationale |
| :--- | :--- | :--- | :--- |
| **Backend Core API** | **Go (Golang)** | `1.23+` | Single native static binary, sub-50MB RAM footprint, high concurrent I/O throughput. |
| **GPS Ingestion Gateway** | **Go (Net / TCP)** | `1.23+` | Decodes high-frequency GT06/SinoTrack binary frames over raw TCP sockets with zero GC pauses. |
| **Primary Database** | **PostgreSQL + PostGIS** | `16.x` | ACID compliance for accounting ledgers; PostGIS for bus route geofencing; kernel-level RLS. |
| **Telemetry & Cache** | **Redis** | `7.x` | Fast in-memory vehicle location buffering; Pub/Sub messaging to client WebSockets. |
| **Web Portal** | **Next.js** | `15.x (App Router)` | Fast server-side rendering for administrative dashboards; Tailwind CSS + shadcn/ui. |
| **Desktop Counter App** | **Compose Multiplatform** | `Kotlin 2.0+` | Native Windows executable for school reception/gate; offline SQLite storage; raw ESC/POS USB thermal printing. |
| **Android Client** | **Native Kotlin (Android)** | `Target SDK 35` | Jetpack Compose; high-priority FCM background service; MapLibre vector maps. |
| **iOS Client** | **Native Swift (iOS)** | `iOS 17+` | SwiftUI; APNs background wake; MapLibre/Apple Maps integration. |
| **Edge AI Vision** | **OpenCV / CoreML / TFLite**| Modern | Client-side and worker-side optical mark recognition (OMR) test sheet evaluation. |
| **Design System** | **SchoolOS Design Tokens** | `v1.0` | Accessible, high-contrast, linear-density UI token framework detailed in `docs/DESIGN.md`. |

---

## 4. Master Specification Index

The complete architecture, database schemas, API contracts, design system, and roadmap are documented across dedicated specifications in the `/docs` directory:

1. [**UI/UX Design System & EdTech Aesthetics**](file:///home/pryan/code/school/docs/DESIGN.md): Comprehensive design tokens, color palette, typography scale, layout grids, micro-interactions, and interface design guidelines.
2. [**The 30-Module Comprehensive Catalog**](file:///home/pryan/code/school/docs/MODULES_CATALOG.md): Complete functional, data, and edge-case requirements for all 30 system modules (700+ lines).
3. [**System Architecture & Technical Specification**](file:///home/pryan/code/school/docs/SPECIFICATION.md): Deep-dive into multi-tenancy RLS, telemetry decoding, accounting ledgers, and offline sync.
4. [**Production Database DDL & Integrity Rules**](file:///home/pryan/code/school/docs/DATABASE_SCHEMA.sql): Production PostgreSQL DDL with RLS policies, indexes, and constraints.
5. [**API & Binary Telemetry Protocols**](file:///home/pryan/code/school/docs/API_CONTRACTS.md): REST endpoints, WebSocket event specifications, and GT06 hex packet schemas.
6. [**Senior Architect Handoff & Technical Deep-Dive**](file:///home/pryan/code/school/docs/HANDOFF_EXPLAINER.md): Line-by-line developer handoff and architectural bible explaining every table and algorithm.
7. [**Development Roadmap & Milestone Execution**](file:///home/pryan/code/school/docs/ROADMAP_AND_PHASES.md): Phased timeline targeting the Nov 16 working frame and production rollout.
8. [**Master Kickstart Directive**](file:///home/pryan/code/school/docs/KICKOFF_PROMPT.md): System prompt for autonomous agent sessions.

---

## 5. Developer & Contributor Golden Rules

All contributors, engineers, and AI agents operating on this codebase must strictly adhere to these principles:
* **Rule 1 (Audit Immutability):** Never mutate historical ledger transactions or academic session gradebooks. All corrections must be appending adjustments with audit trails.
* **Rule 2 (Tenant Isolation):** Every SQL query touching school data must resolve the active `tenant_id` via PostgreSQL RLS or explicit session variables. No cross-tenant data leaks are tolerated.
* **Rule 3 (Offline-First Graceful Degradation):** The desktop cash counter and attendance interfaces must remain 100% operational when internet connectivity drops to zero.
* **Rule 4 (Zero-Cost First):** Push notifications and on-device processing must always precede paid telecom SMS or third-party paid APIs.
* **Rule 5 (Design Integrity):** Never ship low-contrast, unaligned, or cluttered UI components. Adhere strictly to the design tokens in `docs/DESIGN.md`.

---

## 6. System Verification & Acceptance Gates (21/21 Passed)

SchoolOS includes an automated 21-gate acceptance test harness, developer orchestrator, stress benchmarks, and interactive demonstration suite verifying every architectural contract, mathematical invariant, and failure mode:

```bash
# 1. Developer Orchestrator (Single-Command Workflows)
make help          # View all available targets
make build         # Compile all system binaries into bin/
make test          # Run all Go unit and invariant test suites
make verify        # Execute the 21-Gate System Acceptance Verifier
make walkthrough   # Execute 12-Stage Master Cross-Client Walkthrough
make benchmark     # Execute GT06 Telemetry Stress Benchmark (10k+ pings/sec)
make web-build     # Compile Next.js 16 Web Management Portals
make demo          # Launch Self-Contained Interactive Demonstration Suite
make backup        # Run automated disaster recovery database WAL backup
```

### Self-Contained Interactive Demonstration (Day 9 Review Milestone)

Launch the full SchoolOS ecosystem with a single command:

```bash
bash scripts/start_demo.sh
```

This coordinates and boots:
* **SchoolOS HTTP REST API** (`http://localhost:8080`)
* **GT06 Binary Hardware Telemetry Daemon** (`tcp://localhost:5023`)
* **Multi-Bus GPS Fleet Hardware Simulator** (Buses 08, 14, 22 on Ranchi city route)
* **Next.js 16 Administrative Web Management Portals** (`http://localhost:3000`)
  - Web Management Hub: `http://localhost:3000`
  - Live GPS Fleet Map: `http://localhost:3000/fleet`
  - Computer Vision OMR Studio: `http://localhost:3000/omr`
  - Smart CSV Ingestion Engine: `http://localhost:3000/ingestion`
  - Master Timetable & Substitutions: `http://localhost:3000/timetable`
  - Dunning & WhatsApp Communications: `http://localhost:3000/communications`
  - Vector Document Studio: `http://localhost:3000/documents`

### Production VPS Deployment & Disaster Recovery

```bash
# Deploy all production services (Postgres 16 PostGIS, Redis 7 AOF, MinIO, API, Telemetry, Nginx)
docker compose -f docker-compose.prod.yml up -d --build

# Run automated disaster recovery database WAL backup snapshot
bash scripts/backup_wal.sh
```
