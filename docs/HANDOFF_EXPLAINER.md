# SchoolOS Senior Architect Handoff & Technical Deep-Dive

> **Author:** Lead Systems Architect  
> **Target Audience:** Junior Developers, Implementation Engineers, and Downstream Autonomous AI Agents.  
> **Mandate:** Read this document from start to finish before writing a single line of application code. This document explains the exact purpose of every file, dissects every database table column-by-column, breaks down every algorithm, and outlines the common pitfalls that will break the system if violated.

---

## Table of Contents
1. [Repository Topology & File Map](#1-repository-topology--file-map)
2. [Database Schema Forensic Dissection (Table-by-Table)](#2-database-schema-forensic-dissection-table-by-table)
3. [Algorithmic & Protocol Deep-Dives](#3-algorithmic--protocol-deep-dives)
   * [3.1 The GT06 Binary Telemetry Decoder (Bit-Level Math)](#31-the-gt06-binary-telemetry-decoder-bit-level-math)
   * [3.2 The Double-Entry Fee & Concession Engine](#32-the-double-entry-fee--concession-engine)
   * [3.3 The Offline-First Desktop Sync & ESC/POS Print Protocol](#33-the-offline-first-desktop-sync--escpos-print-protocol)
   * [3.4 The Zero-Hallucination AI Agent Pipeline](#34-the-zero-hallucination-ai-agent-pipeline)
4. [Downstream Implementation Checklist & Critical Invariants](#4-downstream-implementation-checklist--critical-invariants)

---

## 1. Repository Topology & File Map

Understanding how the repository files interconnect is essential before writing code:

```
/home/pryan/code/school/
├── README.md                      # Entry point: System philosophy, architecture diagrams, tech stack.
├── docs/
│   ├── DESIGN.md                  # Master UI/UX design system, design tokens, and EdTech wireframes.
│   ├── SPECIFICATION.md           # Master technical specification (RLS, GT06, Ledgers, Desktop Sync).
│   ├── MODULES_CATALOG.md         # Exhaustive catalog of all 30 business modules.
│   ├── DATABASE_SCHEMA.sql        # Production PostgreSQL 16 + PostGIS DDL with RLS policies.
│   ├── API_CONTRACTS.md           # REST endpoints, WebSocket schemas, GT06 hex frames, and webhooks.
│   ├── ROADMAP_AND_PHASES.md      # Sprint execution roadmap (Nov 8 to Nov 16 working frame).
│   ├── HANDOFF_EXPLAINER.md       # THIS FILE: Line-by-line developer handoff and architectural bible.
│   └── KICKOFF_PROMPT.md          # Master kickoff directive for autonomous AI agents.
```

### How They Connect:
* When designing or building UI components in Next.js, Android (Compose), iOS (SwiftUI), or Desktop, engineers follow [DESIGN.md](file:///home/pryan/code/school/docs/DESIGN.md) for color tokens, typography scales, layout grids, and keyboard flows.
* When building API endpoints in Go, engineers refer to [API_CONTRACTS.md](file:///home/pryan/code/school/docs/API_CONTRACTS.md) for request/response JSON contracts.
* When writing SQL migrations or queries, engineers consult [DATABASE_SCHEMA.sql](file:///home/pryan/code/school/docs/DATABASE_SCHEMA.sql) for foreign keys, constraints, and RLS rules.
* When coding business logic (e.g., how CBSE grading calculates or how caution money refunds work), engineers refer to [MODULES_CATALOG.md](file:///home/pryan/code/school/docs/MODULES_CATALOG.md).
* When implementing low-level networking (the TCP GPS server or SQLite desktop sync), engineers follow [SPECIFICATION.md](file:///home/pryan/code/school/docs/SPECIFICATION.md).

---

## 2. Database Schema Forensic Dissection (Table-by-Table)

The database schema defined in `DATABASE_SCHEMA.sql` is organized into 8 functional clusters. Below is the exact forensic explanation of why each table and column exists.

---

### Cluster 1: Tenancy & Authentication

#### 1. `tenants`
The absolute root boundary of data isolation.
* `id` (`UUID PRIMARY KEY`): Unique tenant identifier (UUIDv7).
* `subdomain` (`VARCHAR(63) UNIQUE`): Subdomain prefix (e.g., `dps-ranchi` in `dps-ranchi.schoolos.in`). Used by reverse proxies to identify the tenant.
* `custom_domain` (`VARCHAR(255) UNIQUE`): Optional white-label domain for larger institutions (e.g., `portal.dpsschool.com`).
* `legal_name` (`VARCHAR(255)`): Legal entity name for invoice footers.
* `is_active` (`BOOLEAN`): Global kill-switch for non-paying schools.

#### 2. `schools`
A single tenant (e.g., "DPS Society") can own multiple physical campuses.
* `tenant_id` (`UUID REFERENCES tenants`): Enforces RLS tenant isolation.
* `affiliation_board` (`VARCHAR(50)`): `'CBSE'`, `'ICSE'`, `'BSEB'`, or `'UP_BOARD'`. Determines which grading strategy class is instantiated.
* `affiliation_number` (`VARCHAR(100)`): Mandatory for government report card footers.
* `school_code` (`VARCHAR(50)`): The 5-digit roll code required for State/BSEB board submissions.

#### 3. `users`
Global identity table. A human (e.g., teacher or parent) exists once here by their verified phone number, even if they have roles across multiple schools.
* `phone` (`VARCHAR(20) UNIQUE`): Primary authentication anchor via OTP.
* `password_hash` (`VARCHAR(255)`): Bcrypt/Argon2id hash for staff web dashboard logins.

#### 4. `user_tenant_roles`
Maps users to specific schools with specific privileges.
* `role` (`ENUM`): `SUPERADMIN`, `PRINCIPAL`, `ACCOUNTANT`, `TEACHER`, `GUARDIAN`, `STUDENT`, etc. Enforces API endpoint RBAC.

---

### Cluster 2: Academic Calendar & Student Information System (SIS)

#### 5. `academic_sessions`
Represents an immutable school year (e.g., April 1, 2025 to March 31, 2026).
* `is_current` (`BOOLEAN`): Exactly one session per school can have `is_current = TRUE`.
* `is_locked` (`BOOLEAN`): When a session ends, the principal locks it. A locked session turns all associated gradebooks, attendance, and fee invoices into read-only immutable archives.

#### 6. `classes` & `sections`
* `classes.numerical_order` (`INT`): Critical for the **Academic Session Rollover Engine**. When batch-promoting students, the system increments `numerical_order` by 1 to find the next grade.
* `sections.capacity` (`INT`): Enforces hard room capacity caps during student admission.

#### 7. `guardians`
Represents the family billing and communication unit.
* `phone` (`VARCHAR(20)`): The phone number receiving WhatsApp alerts, fee receipts, and bus notifications.
* `annual_income` (`NUMERIC(12,2)`): Required for Right to Education (RTE) compliance reporting.

#### 8. `students`
Core student demographic and identity registry.
* `admission_number` (`VARCHAR(50)`): Unique per school. The human-readable identifier printed on ID cards.
* `board_pen` (`VARCHAR(50)`): CBSE Permanent Education Number.
* `state_roll_code` & `state_roll_number`: Mandatory for Bihar/State Board marksheets.
* `aadhaar_number_encrypted` (`TEXT`): Stored with AES-256 encryption for government compliance audits.

#### 9. `student_guardian_links`
Many-to-many junction table establishing family trees.
* `birth_order_in_family` (`INT`): `1` = Eldest child, `2` = Second child, `3` = Third child. **This integer is the mathematical trigger for automated sibling discounts.**

#### 10. `student_enrollments`
Tracks the student's active status within a specific academic year.
* `status` (`ENUM`): `'ACTIVE'`, `'PROMOTED'`, `'DETAINED'`, `'WITHDRAWN'`. Allows historical tracking of student progression over 12+ years.

---

### Cluster 3: Double-Entry Financial Engine

#### 11. `chart_of_accounts`
Standard general ledger accounts based on double-entry accounting.
* `account_type` (`ENUM`): `ASSET`, `LIABILITY`, `EQUITY`, `INCOME`, `EXPENSE`.

#### 12. `fee_heads`
Individual billing items configured by the school.
* `is_refundable` (`BOOLEAN`): If `TRUE` (e.g., Caution Money / Security Deposit), collected funds credit a `LIABILITY` account rather than an `INCOME` account.

#### 13. `fee_concession_rules` & `student_concessions`
The rule engine for discounts.
* `applicable_fee_head_ids` (`UUID[]`): An array of fee head IDs. Ensures that a "Staff Child 100% Waiver" zeroes out Tuition Fee, but does **not** waive Transport or Lab fees.

#### 14. `invoices` & `invoice_items`
* `billing_period` (`VARCHAR(50)`): `'APRIL_2026'`, `'Q1_2026'`.
* `concession_amount` (`NUMERIC(10,2)`): Sum of all approved line-item discounts.
* `net_amount` (`NUMERIC(10,2)`): Net payable: Gross - Concessions + Late Fees.

#### 15. `ledger_entries`
The audit-proof spine of the institution.
* `transaction_id` (`UUID`): Groups balancing debit and credit entries.
* `debit` & `credit` (`NUMERIC(12,2)`): Invariant: For any `transaction_id`, $\sum \text{debits} == \sum \text{credits}$.
* **Immutable Rule:** No `UPDATE` or `DELETE` statements are ever permitted on this table.

#### 16. `payments`
Records money received via Cash, UPI, Card, or Net Banking.
* `idempotency_key` (`VARCHAR(255) UNIQUE`): Prevents duplicate payment creation if a network drop causes a client retry.
* `is_offline_collected` (`BOOLEAN`): Flags whether the fee was collected while the desktop client was offline.

---

### Cluster 4: Transport, IoT & PostGIS Spatial Telemetry

#### 17. `vehicles`
Fleet registry for buses and vans.
* `imei_number` (`VARCHAR(50) UNIQUE`): The 15-digit hardware IMEI mapped to the GT06 tracker installed on the bus.

#### 18. `route_stops`
Geospatial representation of pickup and drop points.
* `location` (`GEOMETRY(Point, 4326)`): PostGIS longitude/latitude coordinate.
* `geofence_radius_meters` (`INT`): Buffer radius (default 500m) used to trigger automated parent proximity alerts.

#### 19. `telemetry_breadcrumbs`
High-frequency historical trajectory log.
* `location` (`GEOMETRY(Point, 4326)`): Real-time bus coordinates.
* `speed_kmh` (`NUMERIC(5,2)`): Evaluated for over-speeding safety violations ($>50\text{ km/h}$).
* `ignition_on` (`BOOLEAN`): Tracks vehicle ACC state to differentiate between idling and transit.

---

### Cluster 5: Attendance, Labs, Library & RLS

#### 20. `student_attendance`
Daily roll-call records.
* `status` (`ENUM`): `'PRESENT'`, `'ABSENT'`, `'LATE'`, `'HALF_DAY'`.
* Unique constraint: `(student_id, attendance_date)` guarantees no double-marking.

#### 21. `staff_biometric_logs`
Direct ingestion buffer from on-premise biometric hardware.
* `punch_type` (`ENUM`): `'CHECK_IN'`, `'CHECK_OUT'`.

#### 22. `library_books` & `book_loans`
* `available_copies` (`INT`): Decremented atomically upon book checkout; incremented upon check-in.
* `fine_accrued` (`NUMERIC(10,2)`): Overdue fines calculated at ₹2/day.

#### 23. `lab_assets` & `lab_breakage_penalties`
* `penalty_amount` (`NUMERIC(10,2)`): Automatically queued as a debit against the student's Caution Money balance.

#### 24. Row-Level Security Loop
The dynamic PL/pgSQL block at the end of `DATABASE_SCHEMA.sql` loops over all 26 tenant tables and attaches the restrictive policy:
```sql
CREATE POLICY tenant_isolation_policy ON <table>
AS RESTRICTIVE
USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
```

---

## 3. Algorithmic & Protocol Deep-Dives

### 3.1 The GT06 Binary Telemetry Decoder (Bit-Level Math)

The Go TCP server receives raw byte buffers from hardware trackers. Here is the exact bit-level decoding logic to implement in Go:

#### 1. Verifying Start & Stop Framing
```go
if len(buf) < 10 || buf[0] != 0x78 || buf[1] != 0x78 {
    return nil, errors.New("invalid GT06 packet header")
}
if buf[len(buf)-2] != 0x0D || buf[len(buf)-1] != 0x0A {
    return nil, errors.New("invalid GT06 packet footer")
}
```

#### 2. Parsing the GPS Coordinate Fixed-Point Representation
In the `0x22` location packet, Latitude and Longitude are stored as 4-byte unsigned big-endian integers.
* **Latitude Formula:**
  $$\text{Latitude}_{\text{degrees}} = \frac{\text{Bytes}[11:15]}{1800000.0}$$
* **Longitude Formula:**
  $$\text{Longitude}_{\text{degrees}} = \frac{\text{Bytes}[15:19]}{1800000.0}$$
* **Directional Bitmask:**
  Byte 20 contains status flags:
  * Bit 3: South Latitude flag ($1 = \text{South}, 0 = \text{North}$). If Bit 3 is set, $\text{Latitude} = -\text{Latitude}$.
  * Bit 2: West Longitude flag ($1 = \text{West}, 0 = \text{East}$). If Bit 2 is set, $\text{Longitude} = -\text{Longitude}$.

#### 3. ACC Ignition Flag
Byte 21 represents Terminal Information:
* Bit 1 indicates ACC status:
  $$\text{IgnitionOn} = (\text{Byte}[21] \ \& \ 0x02) \neq 0$$

---

### 3.2 The Double-Entry Fee & Concession Engine

When an accountant or automated billing run generates invoices, the calculation must execute in this exact sequence:

```
Step 1: Fetch Base Fee Heads for Class 5
  - Tuition Fee: ₹2,500
  - Transport Fee: ₹1,000
  - Exam Fee: ₹500
  Total Base = ₹4,000

Step 2: Fetch Student Active Concessions
  - Sibling Discount Rule: 25% off Tuition Fee only
  - Applicable Heads: [Tuition Fee UUID]

Step 3: Line-Item Discount Evaluation
  - Tuition Fee Concession: ₹2,500 * 0.25 = ₹625
  - Transport Fee Concession: ₹0 (Not in applicable heads)
  - Exam Fee Concession: ₹0 (Not in applicable heads)
  Total Concession = ₹625

Step 4: Net Invoicing
  - Net Payable = ₹4,000 - ₹625 = ₹3,375

Step 5: Ledger Entry Atomic Insertion (transaction_id = T1)
  - Debit: Student Accounts Receivable (Asset)       ₹3,375
  - Debit: Sibling Concession Subsidy (Expense)        ₹625
  - Credit: Tuition Fee Income (Income)             ₹2,500
  - Credit: Transport Fee Income (Income)           ₹1,000
  - Credit: Exam Fee Income (Income)                  ₹500
  Sum Debits (₹4,000) == Sum Credits (₹4,000) -> BALANCED & COMMITTED.
```

---

### 3.3 The Offline-First Desktop Sync & ESC/POS Print Protocol

When internet fails at the school fee counter, the Compose Desktop application executes this resilient state machine:

```
+-------------------------------------------------------------------------------+
|                      OFFLINE CASH RECEIPT STATE MACHINE                       |
+-------------------------------------------------------------------------------+
| 1. Generate Local UUID: client_tx_id = UUIDv7()                               |
| 2. Write to local SQLite:                                                     |
|    INSERT INTO offline_receipt_queue (client_tx_id, student_id, amount, ...)  |
| 3. Decrement local cached student balance.                                    |
| 4. Dispatch raw binary byte stream to USB Thermal Printer:                    |
|    - [ESC @] (Initialize)                                                     |
|    - [ESC a 1] (Center Align)                                                 |
|    - "DELHI PUBLIC SCHOOL\n"                                                  |
|    - [ESC a 0] (Left Align)                                                   |
|    - "Student: Aarav Sharma   Adm: DPS-042\n"                                 |
|    - "Amount Received: INR 4,200.00 (CASH)\n"                                 |
|    - "Status: PROVISIONAL OFFLINE RECEIPT\n"                                  |
|    - [GS V 1] (Paper Cut)                                                     |
| 5. Display green confirmation checkmark to accountant (<300ms total).         |
+-------------------------------------------------------------------------------+
                                        |
                            (When Internet Recovers)
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                      IDEMPOTENT RECONCILIATION WORKER                         |
+-------------------------------------------------------------------------------+
| 1. Query pending records from local SQLite.                                   |
| 2. Post batch payload to `POST /v1/sync/offline-receipts`.                    |
| 3. Central Postgres verifies `idempotency_key = client_tx_id`:                |
|    - If already inserted: Return existing receipt record.                     |
|    - If new: Insert into `payments` + `ledger_entries`, generate RCP number.   |
| 4. Desktop marks local SQLite record as `SYNCED`.                             |
+-------------------------------------------------------------------------------+
```

---

### 3.4 The Zero-Hallucination AI Agent Pipeline

When a parent asks questions via WhatsApp, the AI Agent must operate strictly via **deterministic tool calls**:

```
[Parent WhatsApp: "Mera beta ka fee baaki hai kya?"]
         |
         v
[Meta Webhook] -> [Agent Execution Service]
         |
         v
[Extract Phone: +919876543210]
         |
         v
[LLM Tool-Calling Prompt]
  "Evaluate user query. If asking about fee dues, emit TOOL CALL:
   get_student_fee_dues(phone: '+919876543210')"
         |
         v
[Internal Go Tool Execution]
  SELECT total_outstanding FROM v_student_dues WHERE guardian_phone = '+919876543210';
  Result: ₹4,200 (Invoice: INV-2026-0042)
         |
         v
[Generate Dynamic UPI Deep Link]
  upi://pay?pa=school@icici&pn=School&am=4200.00&tr=INV-2026-0042&cu=INR
         |
         v
[Format WhatsApp Interactive Message]
  "Aarav Sharma ka kul fee dues ₹4,200 hai. 
   Neeche diye gaye button se turant UPI dwara bhugtan karein."
  Button: [Pay ₹4,200 via UPI]
```

---

## 4. Downstream Implementation Checklist & Critical Invariants

Every developer working on this codebase must memorize these non-negotiable rules:

1. **Never Bypass RLS:** Never execute raw SQL queries using the PostgreSQL superuser. All application connections must run through a non-superuser role (e.g., `schoolos_app`) with RLS strictly enabled.
2. **Never Calculate Floats for Money:** Always use fixed-point arithmetic (`NUMERIC(10,2)` in PostgreSQL; integer cents/paise or `shopspring/decimal` in Go). Never use IEEE 754 floating-point numbers (`float32`/`float64`) for financial ledgers.
3. **Never Drop TCP Connections on Bad Packets:** In the GT06 GPS server, if a device sends an unrecognized or corrupted packet, log the hex dump, drain the buffer, and keep the TCP socket open. Budget GPS trackers in rural areas take minutes to re-establish dropped TCP connections.
4. **Never Block Desktop UI on Cloud Calls:** The Compose Desktop counter app must execute all network sync operations inside asynchronous Kotlin Coroutines (`Dispatchers.IO`). The UI must respond instantly even if the cloud API has timed out.
5. **Always Verify Sibling Order by Birth Date:** In the family mapping engine, sibling birth order must be calculated from `date_of_birth` ascending. Never assume the order of admission equals the order of birth.

---

*This document is the permanent engineering baseline. Maintain this architectural fidelity throughout all development phases.*
