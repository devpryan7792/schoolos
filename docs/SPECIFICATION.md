# SchoolOS System Architecture & Technical Specification

> **Classification:** Production Core Technical Specification  
> **Target Audience:** Lead Architects, Backend Engineers, Mobile Developers, Desktop Systems Engineers, and AI Agents.  
> **Scope:** Multi-Tenant Execution, GT06 Binary Telemetry, Double-Entry Financial Engine, Local-First Desktop Offline Sync, Native Mobile Client Architecture, and Autonomous AI Pipelines.

---

## 1. Multi-Tenant Execution & Security Model

SchoolOS enforces strict institutional data isolation within a single shared PostgreSQL database using kernel-level **Row-Level Security (RLS)**.

```
                           [Client Request]
                                  |
                                  v
                    [Reverse Proxy / Go API Router]
                                  |
               Extract Tenant Context from Hostname / JWT
          (e.g., dps-ranchi.schoolos.in -> tenant_id: UUIDv7)
                                  |
                                  v
                     [Database Connection Pool]
                                  |
                   BEGIN TRANSACTION;
                   SET LOCAL app.current_tenant_id = 'c0a80101-92b5-4b11-9ef0-0a1234567890';
                                  |
                   [Execute Application Business Logic]
                   (All SELECT, INSERT, UPDATE, DELETE queries)
                                  |
                   COMMIT;
```

### 1.1 Invariants
1. **Zero Global Queries:** The application connection pool must never issue a data query without executing `SET LOCAL app.current_tenant_id` inside that transaction.
2. **Restrictive Policy:** PostgreSQL enforces:
   ```sql
   CREATE POLICY tenant_isolation_policy ON <table>
   AS RESTRICTIVE
   USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);
   ```
   Even if a developer accidentally omits a `WHERE tenant_id = ?` clause in SQL, PostgreSQL's kernel filters out any row not matching the session's active `tenant_id`.

---

## 2. Low-Latency Binary GPS Ingestion Engine (GT06 Protocol)

To maintain fleet telemetry for thousands of buses across Tier-2/3 regions on a low-cost VPS, SchoolOS bypasses heavy HTTP/JSON overhead in favor of raw TCP binary socket streams.

```
+---------------------------------------------------------------------------------------+
|                              GT06 BINARY PROTOCOL DECODER                             |
+---------------------------------------------------------------------------------------+
| Frame Layout:                                                                         |
| [Start: 2 Bytes (0x78 0x78)]                                                          |
| [Length: 1 Byte]                                                                      |
| [Protocol Number: 1 Byte] (0x01=Login, 0x13=Heartbeat, 0x22=GPS Location)             |
| [Information Content: N Bytes]                                                        |
| [Serial Number: 2 Bytes]                                                              |
| [Error Check / CRC: 2 Bytes]                                                          |
| [Stop: 2 Bytes (0x0D 0x0A)]                                                           |
+---------------------------------------------------------------------------------------+
```

### 2.1 Packet Breakdown

#### A. Login Packet (`0x01`)
* Sent immediately when the GPS tracker powers on and establishes a TCP connection to our daemon on port `5023`.
* Contains the 8-byte BCD (Binary Coded Decimal) encoded IMEI number.
* The daemon validates the IMEI against the `vehicles` table, associates the active TCP socket with that `vehicle_id`, and immediately responds with a Login Confirmation packet (`0x78 0x78 0x05 0x01 [Serial] [CRC] 0x0D 0x0A`).

#### B. GPS Location Packet (`0x22` or `0x12`)
* Sent every 5 to 15 seconds while the vehicle ignition is active.
* Binary payload attributes:
  * **Timestamp (6 Bytes):** Year, Month, Day, Hour, Minute, Second (UTC).
  * **Quantity & Satellite Count (1 Byte):** Upper 4 bits = GPS length, Lower 4 bits = Number of active GPS satellites.
  * **Latitude (4 Bytes):** Fixed-point integer degrees ($Value / 1800000 = \text{Decimal Latitude}$).
  * **Longitude (4 Bytes):** Fixed-point integer degrees ($Value / 1800000 = \text{Decimal Longitude}$).
  * **Speed (1 Byte):** Speed in km/h ($0–255$).
  * **Course & Status (2 Bytes):** Upper 6 bits = Status flags (Differential GPS, GPS Real-time, West/East Longitude, South/North Latitude); Lower 10 bits = Heading course ($0–360^\circ$).
  * **Terminal Information (1 Byte):** Bit 1 = ACC Ignition State ($1 = \text{On}, 0 = \text{Off}$).

### 2.2 Telemetry Storage Pipeline
```
[GT06 TCP Daemon (Go)] 
       |
       v (Sub-millisecond write)
[Redis In-Memory State]
  - GEOADD vehicle_locations <lng> <lat> <vehicle_id>
  - HSET vehicle:<id>:telemetry lat <lat> lng <lng> speed <speed> ignition <acc> updated_at <now>
  - PUBLISH vehicle:<id>:stream <json_payload>
       |
       v (Asynchronous batch queue: Every 30 seconds or on trip completion)
[PostgreSQL PostGIS Table: telemetry_breadcrumbs]
```

---

## 3. Double-Entry Accounting & Concession Ledger

SchoolOS treats school billing with bank-grade financial rigor. Fee management does not mutate invoice amounts directly; all debits and credits flow through balanced ledger transactions.

### 3.1 Financial Rules & Invariants
1. **The Accounting Equation:**
   $$\text{Assets} = \text{Liabilities} + \text{Equity} + (\text{Income} - \text{Expenses})$$
2. **Invoicing Event (Fee Accrual):**
   * **Debit:** Student Accounts Receivable (Asset)
   * **Credit:** Tuition Fee / Transport Fee Income (Income)
3. **Concession / Scholarship Application:**
   * **Debit:** Concession Expense / Scholarship Subsidy (Expense)
   * **Credit:** Student Accounts Receivable (Asset)
4. **Cash Collection at Counter:**
   * **Debit:** School Cash-in-Hand (Asset)
   * **Credit:** Student Accounts Receivable (Asset)
5. **Caution Money (Security Deposit) Receipt:**
   * **Debit:** Bank / Cash (Asset)
   * **Credit:** Caution Money Escrow (Liability - refundable to parent upon student transfer)

### 3.2 Dynamic Concession Engine
Discounts are calculated at the line-item level, not as arbitrary totals:
```
function CalculateInvoice(student, feeHeads, concessionRules):
    invoiceItems = []
    totalGross = 0
    totalConcession = 0

    for head in feeHeads:
        itemAmount = head.standard_amount
        discount = 0

        # Evaluate rules matching this specific fee head
        for rule in concessionRules:
            if head.id in rule.applicable_fee_head_ids:
                if rule.type == "PERCENTAGE":
                    discount += (itemAmount * rule.value / 100.0)
                else if rule.type == "FLAT_AMOUNT":
                    discount += rule.value

        discount = min(discount, itemAmount) # Cap at head total
        netAmount = itemAmount - discount

        invoiceItems.append({
            head_id: head.id,
            gross: itemAmount,
            concession: discount,
            net: netAmount
        })
        totalGross += itemAmount
        totalConcession += discount

    return invoiceItems, totalGross, totalConcession, (totalGross - totalConcession)
```

---

## 4. Local-First Desktop Offline Sync Protocol (Compose Desktop)

The desktop application for front-office reception and cash collection runs natively on Windows via **Compose Multiplatform (Kotlin Desktop)**, backed by an embedded local **SQLite** database.

```
                           ONLINE STATE
[Compose Desktop] <==========================> [Central PostgreSQL Cloud]
                  (Bi-directional HTTPS sync)

                          OFFLINE DISCONNECTION
[Internet Drops]
       |
       v
[Local SQLite Mode Activated]
  1. Cash fee collected at counter.
  2. Local transaction recorded in `offline_receipt_queue`.
  3. Physical ESC/POS thermal receipt printed instantly via USB (<300ms).
  4. Student local balance updated in SQLite cache.
       |
       v
[Internet Reconnected]
       |
       v
[Idempotent Synchronization Replay]
  - Iterates through `offline_receipt_queue` in monotonic creation order.
  - Sends batch payload to `POST /api/v1/sync/offline-receipts` with client UUID.
  - Central Postgres inserts payments and ledger entries.
  - Returns verified server receipt numbers; desktop marks queue items as `SYNCED`.
```

### 4.1 ESC/POS Raw Thermal Printing Specification
The desktop app directly opens the USB printer port (e.g., `COM3`, `LPT1`, or Windows Raw Spooler `\\.\PRN`) and streams raw ESC/POS byte commands:
* Initialize: `0x1B 0x40`
* Center Align: `0x1B 0x61 0x01`
* Double Height/Width (School Name): `0x1D 0x21 0x11`
* Print Itemized Dues Table (Plain ASCII 32 or 48 columns)
* Generate QR Code (UPI Intent String): `0x1D 0x28 0x6B ...`
* Partial Cut: `0x1D 0x56 0x01`

---

## 5. Native Mobile Clients (Kotlin Android & Swift iOS)

### 5.1 Multi-Account / Sibling Switcher
In the mobile application header, the active context is driven by a unified `AccountContextManager`:
```json
{
  "guardian_phone": "+919876543210",
  "active_profile_id": "student-uuid-1",
  "profiles": [
    { "id": "student-uuid-1", "name": "Aarav", "class": "5A"},
    { "id": "student-uuid-2", "name": "Ananya", "class": "2B"}
  ]
}
```
When the user taps the profile switcher dropdown, all downstream view models (Fee Ledger, Attendance, Live Bus Map) observe the change and switch their active entity filters with zero screen re-renders or re-authentication calls.

### 5.2 Battery-Optimized MapLibre Telemetry Rendering
* Uses MapLibre Native SDK (avoiding Google Maps API paywalls).
* Connects to the vehicle WebSocket channel: `wss://api.schoolos.in/v1/ws/vehicles/{vehicle_id}`.
* Implements client-side dead reckoning and linear interpolation (lerp) across GPS coordinates to animate the bus icon smoothly between 5-second updates, preventing battery-draining continuous render loops.

---

## 6. Autonomous Agentic AI Layer

SchoolOS incorporates an autonomous intelligence tier built around strict deterministic boundaries to eliminate hallucination.

```
                              [Incoming Query / Trigger]
                                          |
                                          v
+---------------------------------------------------------------------------------------+
|                              AGENT ROUTING & TOOL ARBITER                             |
+---------------------------------------------------------------------------------------+
| System Prompt: "You are the School Care Assistant. You have NO independent knowledge. |
| You MUST query internal tools to answer any student, fee, bus, or calendar question." |
+---------------------------------------------------------------------------------------+
                                          |
                         +----------------+----------------+
                         |                                 |
                         v                                 v
         [Tool 1: get_student_dues]              [Tool 2: get_bus_location]
                         |                                 |
                         v                                 v
          Queries PostgreSQL Ledger                 Queries Redis Telemetry
                         |                                 |
                         +----------------+----------------+
                                          |
                                          v
+---------------------------------------------------------------------------------------+
| Synthesis: Formulate localized response in parent's language (Hindi / English)        |
| If fee dues exist -> Attach dynamic UPI QR deep-link URL                              |
+---------------------------------------------------------------------------------------+
```

### 6.1 Computer Vision OMR Checking Copilot
1. Teacher snaps photo of 50/100-question physical MCQ sheet using Android/iOS app.
2. OpenCV edge detection locates the four corner registration markers.
3. Perspective warp transforms sheet into a calibrated rectangular grid.
4. Circular bubble regions are extracted and thresholded using Otsu binarization to measure pixel black density.
5. Calculated answers are compared against the master answer key in $<1$ second.
6. Auto-posts marks to `marks_entries` table; flags ambiguous double-bubbled rows for manual teacher confirmation.
