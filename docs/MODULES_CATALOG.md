# Master Catalog of 30 System Modules: SchoolOS Core

> **Classification:** Full Enterprise System Capabilities Catalog  
> **Target Audience:** Solution Architects, Backend Engineers, Frontend Developers, Mobile Engineers, QA Specialists, and Autonomous Coding Agents.  
> **Scope:** Comprehensive functional, data, algorithmic, and failure-mode specifications for all 30 production modules.

---

## Complete Index of Modules

1. [ORG-01: Multi-Tenant Organization & School Provisioning](#org-01-multi-tenant-organization--school-provisioning)
2. [SIS-02: Student Information System (SIS) & Full Lifecycle](#sis-02-student-information-system-sis--full-lifecycle)
3. [FAM-03: Guardian & Family Mapping with Sibling Hierarchy](#fam-03-guardian--family-mapping-with-sibling-hierarchy)
4. [ACAD-04: Pluggable Board Academic & Grading Engine](#acad-04-pluggable-board-academic--grading-engine)
5. [SCHED-05: Dynamic Timetable & Master Scheduling](#sched-05-dynamic-timetable--master-scheduling)
6. [HR-06: Teacher Substitution & Leave Management](#hr-06-teacher-substitution--leave-management)
7. [FIN-07: Double-Entry Fee Ledger & Invoicing Engine](#fin-07-double-entry-fee-ledger--invoicing-engine)
8. [FIN-08: Concessions, Waivers & Scholarship Rules](#fin-08-concessions-waivers--scholarship-rules)
9. [FIN-09: Multi-Channel Fee Collection & Gateway Settlement](#fin-09-multi-channel-fee-collection--gateway-settlement)
10. [POS-10: Native Desktop Cash Counter & Thermal Printing](#pos-10-native-desktop-cash-counter--thermal-printing)
11. [FIN-11: Caution Money, Breakage & Refund Accounting](#fin-11-caution-money-breakage--refund-accounting)
12. [ATT-12: Student Attendance (Daily, Period & Gate Biometric)](#att-12-student-attendance-daily-period--gate-biometric)
13. [ATT-13: Staff Biometric Attendance & LAN Hardware Sync](#att-13-staff-biometric-attendance--lan-hardware-sync)
14. [HR-14: Staff Payroll, Leave Quotas & Deductions](#hr-14-staff-payroll-leave-quotas--deductions)
15. [FLEET-15: Vehicle Fleet & Driver Records Management](#fleet-15-vehicle-fleet--driver-records-management)
16. [IOT-16: GT06/SinoTrack Binary GPS Ingestion Daemon](#iot-16-gt06sinotrack-binary-gps-ingestion-daemon)
17. [IOT-17: Zero-Capex Smartphone Driver Tracking App](#iot-17-zero-capex-smartphone-driver-tracking-app)
18. [IOT-18: Real-Time Bus Telemetry, ETA & Geofencing](#iot-18-real-time-bus-telemetry-eta--geofencing)
19. [FLEET-19: Multi-Stop Route & Dynamic Zone Fee Allocation](#fleet-19-multi-stop-route--dynamic-zone-fee-allocation)
20. [LAB-20: Science & Computer Lab Asset Inventory](#lab-20-science--computer-lab-asset-inventory)
21. [LAB-21: Lab Apparatus Breakage & Student Penalty Billing](#lab-21-lab-apparatus-breakage--student-penalty-billing)
22. [LMS-22: Library Management System (Barcode/ISBN/OpenLibrary)](#lms-22-library-management-system-barcodeisbnopenlibrary)
23. [EXAM-23: Examination Scheduling, Marks Entry & Tabulation](#exam-23-examination-scheduling-marks-entry--tabulation)
24. [DOC-24: Batch Deterministic Document Generator](#doc-24-batch-deterministic-document-generator)
25. [ROLL-25: Academic Session Rollover & Arrears Carry-Forward](#roll-25-academic-session-rollover--arrears-carry-forward)
26. [DATA-26: Self-Service CSV/Excel Smart Ingestion Pipeline](#data-26-self-service-csvexcel-smart-ingestion-pipeline)
27. [NOTIF-27: Tiered Notification Dispatcher](#notif-27-tiered-notification-dispatcher)
28. [AGENT-28: AI Parent Care Agent (WhatsApp & In-App Conversational)](#agent-28-ai-parent-care-agent-whatsapp--in-app-conversational)
29. [AGENT-29: AI Computer Vision OMR & Exam Grading Copilot](#agent-29-ai-computer-vision-omr--exam-grading-copilot)
30. [AGENT-30: Predictive Operations & Autonomous Dunning Agent](#agent-30-predictive-operations--autonomous-dunning-agent)

---

## Detailed Specifications for All 30 Modules

### ORG-01: Multi-Tenant Organization & School Provisioning
* **Domain:** Core Governance & Multi-Tenancy
* **Objective:** Isolates distinct educational institutions on shared cloud infrastructure while allowing trusts and educational societies to manage multiple campuses from a single administrative login.
* **Functional Capabilities:**
  * Subdomain routing (e.g., `dps-patna.schoolos.in`) and optional custom CNAME domain mapping (e.g., `portal.dpspatna.com`).
  * Institutional Profile: School crest/logo, affiliation codes (CBSE/ICSE/BSEB), trust tax registration numbers, and financial year start month (April vs January).
  * Strict Role-Based Access Control (RBAC): Hierarchical privileges spanning SuperAdmin, Trustee, Principal, Vice-Principal, Accountant, Teacher, Clerk, Librarian, Lab Assistant, Transport Supervisor, Driver, Guardian, and Student.
* **Database Entities:** `tenants`, `schools`, `user_tenant_roles`.
* **Invariants:**
  * Every tenant provisioning triggers a database transaction that registers the default Chart of Accounts and default Academic Session.
  * No database record belonging to one `tenant_id` can ever be exposed to another tenant; this is enforced by PostgreSQL Row-Level Security (RLS).
* **Tier-3 Edge Case:** Multi-campus trusts where a teacher teaches Physics at Campus A on Mondays/Wednesdays and Campus B on Tuesdays/Thursdays. Handled cleanly via multiple rows in `user_tenant_roles` tied to a single unified `users` record.

---

### SIS-02: Student Information System (SIS) & Full Lifecycle
* **Domain:** Student Administration
* **Objective:** Centralized tracking of student identity, demographics, enrollment records, medical profiles, and document archives from first admission inquiry to alumni status.
* **Functional Capabilities:**
  * Multi-format student identifiers: School Admission Number, National PEN (Permanent Education Number), State Board Roll Code + Roll Number.
  * Comprehensive Demographics: Legal name, gender, date of birth, blood group, mother tongue, caste category (General/OBC/SC/ST for state scholarship compliance), Aadhaar number (encrypted at rest with AES-256).
  * Emergency Contacts: Multiple verified telephone numbers, authorized guardian pickup lists, medical alerts (asthma, food allergies, diabetic needs).
  * Document Vault: Cloud storage for scanned Birth Certificates, Transfer Certificates from previous schools, and caste certificates.
* **Database Entities:** `students`, `student_enrollments`, `student_documents`, `student_medical_records`.
* **Lifecycle State Machine:**
  $$\text{ENQUIRY} \longrightarrow \text{REGISTERED} \longrightarrow \text{ENROLLED} \longrightarrow \text{ACTIVE} \longrightarrow \left[ \begin{array}{l} \text{ALUMNI} \\ \text{TRANSFERRED\_OUT} \\ \text{SUSPENDED} \end{array} \right]$$
* **Edge Case:** Mid-year stream switching (e.g., a Class 11 student switching from Science to Commerce). The system records the transition without corrupting earlier term attendance or fee ledgers.

---

### FAM-03: Guardian & Family Mapping with Sibling Hierarchy
* **Domain:** Family Ledger & Identity
* **Objective:** Solves the primary parent complaint in Tier-2/3 schools by consolidating multiple children under one family login, enabling single-transaction fee payments and automatic sibling discounts.
* **Functional Capabilities:**
  * The primary family anchor is the `guardians` record, authenticated via OTP sent to the parent's mobile phone.
  * Dynamic Sibling Hierarchy: Sibling order is determined strictly by verified `date_of_birth` ascending:
    * Child 1: Eldest (Standard base fee).
    * Child 2: Second Child (Triggers automated sibling discount, e.g., 20% off tuition).
    * Child 3+: Third Child (Triggers higher discount, e.g., 50% off tuition).
  * Unified Mobile Context Switcher: The parent app header features a subtle profile switcher (Avatar + Chevron) that smoothly toggles context between siblings without re-authenticating.
* **Database Entities:** `guardians`, `student_guardian_links`.
* **Invariants:**
  * When two parents share custody or when an uncle acts as local guardian, multiple guardians can link to a student with explicit `is_primary_contact` and `can_pay_fees` permission flags.

---

### ACAD-04: Pluggable Board Academic & Grading Engine
* **Domain:** Curriculum & Evaluation
* **Objective:** Supports varied grading guidelines across CBSE, ICSE, and State Boards (BSEB, UP Board) using a pluggable Strategy Pattern.
* **Functional Capabilities:**
  * **CBSE Strategy:** Continuous & Comprehensive Evaluation (CCE); periodic tests (best 2 of 3), half-yearly, and annual exams; 9-point grading scale (`A1` to `E`); co-scholastic grades (Work Education, Art, Physical Health).
  * **ICSE Strategy:** Explicit 80/20 or 70/30 theory/practical splits; pass mark thresholds at 33% (ICSE) and 35% (ISC); subject clustering (History/Civics/Geography grouped under Social Studies).
  * **State Board / BSEB Strategy:** Percentage-based division grading (1st Division $\ge 60\%$, 2nd Division $\ge 45\%$, 3rd Division $\ge 30\%$); automated grace marks allocation (up to 5 marks for borderline failures in a single subject); bilingual Hindi/English marksheets.
* **Database Entities:** `academic_boards`, `classes`, `sections`, `subjects`, `grading_scales`, `assessment_criteria`.

---

### SCHED-05: Dynamic Timetable & Master Scheduling
* **Domain:** Operations & Scheduling
* **Objective:** Generates conflict-free class timetables, period allocations, and room assignments.
* **Functional Capabilities:**
  * Visual drag-and-drop grid scheduling (Monday through Saturday, 6 to 9 periods/day).
  * Hard Constraints Engine:
    * A teacher cannot be scheduled in two locations simultaneously.
    * A physical room or science lab cannot exceed maximum student capacity.
    * Subject limits: Maximum consecutive periods for heavy subjects (Math, Physics) capped at 2.
  * Soft Constraints Engine: Balanced teacher workload distribution across the academic week.
* **Database Entities:** `timetables`, `timetable_slots`, `classroom_locations`, `subject_teachers`.
* **Edge Case:** Combined sections for common activities (e.g., Physical Education or Moral Science where Sections 10A and 10B share the playground simultaneously).

---

### HR-06: Teacher Substitution & Leave Management
* **Domain:** Staff & Faculty Operations
* **Objective:** Resolves daily teacher absences automatically before the morning bell rings.
* **Functional Capabilities:**
  * Mobile teacher leave request and instant administrative approval workflow.
  * Autonomous Substitution Optimizer:
    * Scans the master timetable when a teacher reports sick.
    * Identifies free teachers during those specific periods.
    * Ranks candidate teachers based on subject compatibility (e.g., another Science teacher first) and lowest weekly substitution load.
  * Pushes immediate high-priority push notifications to assigned substitute teachers with attached lesson notes.
* **Database Entities:** `teacher_leaves`, `substitutions`, `teacher_workloads`.

---

### FIN-07: Double-Entry Fee Ledger & Invoicing Engine
* **Domain:** Core Accounting
* **Objective:** Serves as the immutable financial backbone of the institution, preventing ledger corruption and tracking all debits and credits.
* **Functional Capabilities:**
  * Standard Chart of Accounts: Assets, Liabilities, Incomes, and Expenses.
  * Double-entry bookkeeping: Every fee accrued debits Accounts Receivable and credits Income; every payment debits Cash/Bank and credits Accounts Receivable.
  * Recurring invoice generator: Supports Monthly, Bi-Monthly, Quarterly, and Annual fee schedules.
  * Automated late-fee calculation: Dynamic rules (e.g., ₹20/day after the 10th of the month or flat ₹250 penalty).
* **Database Entities:** `chart_of_accounts`, `fee_heads`, `invoices`, `invoice_items`, `ledger_entries`.
* **Invariants:**
  * Zero-float rule: All financial math uses PostgreSQL `NUMERIC(10,2)`.
  * Ledger entries are append-only. Corrections require explicit reversing journal entries.

---

### FIN-08: Concessions, Waivers & Scholarship Rules
* **Domain:** Fee Administration
* **Objective:** Enforces rule-based discounts without manual calculation errors by clerks.
* **Functional Capabilities:**
  * Configurable concession categories:
    * Staff Child (100% tuition waiver).
    * Sibling Concession (e.g., 20% on Child 2, 50% on Child 3).
    * Right to Education (RTE) quota (100% full fee waiver, tagged for government reimbursement claims).
    * Merit/Sports scholarships.
  * Selective Fee-Head Targeting: Discounts apply strictly to specified fee heads (e.g., Tuition Fee is waived, but Bus and Exam fees remain payable).
  * Principal Approval Audit: Any manual discretionary discount requires authentication and leaves an immutable audit log.
* **Database Entities:** `fee_concession_rules`, `student_concessions`.

---

### FIN-09: Multi-Channel Fee Collection & Gateway Settlement
* **Domain:** Payments & Banking
* **Objective:** Collects online fee payments via UPI, Debit/Credit Cards, and Net Banking, with instant automated ledger settlement.
* **Functional Capabilities:**
  * Integrated with major payment gateways (Razorpay, Cashfree, PayU, UPI QR Intent).
  * Idempotent Webhook Listener: Safely handles dropped connections, duplicate webhooks, and retry storms using Redis distributed locks.
  * Instant Digital Receipt: Generates a signed PDF receipt with verification QR code as soon as the gateway confirms payment.
  * Automatic fee reconciliation: Differentiates gross payment, gateway convenience charges, and net settlement to the school bank account.
* **Database Entities:** `payments`, `payment_transactions`, `settlement_batches`.

---

### POS-10: Native Desktop Cash Counter & Thermal Printing
* **Domain:** Point of Sale (POS)
* **Objective:** Provides a blisteringly fast, 100% offline-capable fee collection workstation for front-office receptionists.
* **Functional Capabilities:**
  * Built with Compose Multiplatform (Kotlin Desktop) for native Windows execution.
  * Local SQLite storage caches active student rosters and current fee balances.
  * Numpad-first workflow: Front-office staff collect cash, apply change, and issue receipts using keyboard shortcuts (`F1` to `F3`) without touching a mouse.
  * Direct USB raw printing: Emits ESC/POS byte streams to 58mm or 80mm thermal receipt printers in $<300$ms.
  * Idempotent background sync: Automatically pushes queued offline receipts to central PostgreSQL when broadband returns.
* **Database Entities (Local):** `offline_receipt_queue`, `local_fee_due_cache`.

---

### FIN-11: Caution Money, Breakage & Refund Accounting
* **Domain:** Deposits & Refunds
* **Objective:** Manages refundable security deposits, damage deductions, and withdrawal settlements.
* **Functional Capabilities:**
  * Collects caution money during admission, holding it in a `LIABILITY` escrow account.
  * Automatic deductions pipeline: Aggregates unpaid library fines, science lab apparatus breakage, and outstanding bus fees.
  * Generates the official Net Refund Voucher and No-Dues Clearance slip required for School Leaving Certificates (SLC/TC).
* **Database Entities:** `caution_deposits`, `breakage_records`, `refund_vouchers`.

---

### ATT-12: Student Attendance (Daily, Period & Gate Biometric)
* **Domain:** Attendance & Safety
* **Objective:** Multi-channel attendance logging with rapid parent notification.
* **Functional Capabilities:**
  * Teacher mobile app: Rapid one-tap roll-call grid (Present, Absent, Late, Half-Day).
  * School gate turnstile integration: Captures RFID card taps or facial recognition scans via local LAN sockets.
  * Instant Absence Dispatch: Automatically queues high-priority push notifications and WhatsApp alerts for parents within 15 minutes of roll call.
  * CBSE/ICSE 75% attendance threshold monitoring: Alerts school counselors when a student approaches dangerous absenteeism levels.
* **Database Entities:** `student_attendance`, `attendance_sessions`, `gate_logs`.

---

### ATT-13: Staff Biometric Attendance & LAN Hardware Sync
* **Domain:** Staff & Faculty Operations
* **Objective:** Integrates physical biometric clocks (eSSL, Mantra, Realtime) into the cloud ERP.
* **Functional Capabilities:**
  * Local LAN socket daemon running inside the Native Desktop client pulls punch logs directly from biometric devices via TCP/IP.
  * Grace period logic: Configurable late arrival policies (e.g., 3 late clock-ins = half-day leave deduction).
  * Real-time staff presence dashboard displayed on the Principal's morning dashboard.
* **Database Entities:** `staff_biometric_logs`, `biometric_devices`, `shift_rules`.

---

### HR-14: Staff Payroll, Leave Quotas & Deductions
* **Domain:** Human Resources
* **Objective:** Computes monthly staff compensation, statutory compliance, and salary slip distribution.
* **Functional Capabilities:**
  * Base salary components: Basic Pay, Dearness Allowance (DA), House Rent Allowance (HRA), Transport Allowance.
  * Statutory deductions: Provident Fund (PF), Employee State Insurance (ESI), Professional Tax (PT), and TDS income tax deductions.
  * Auto-deduction for unpaid leaves beyond annual quota.
  * One-click batch salary slip PDF generation and private dispatch to teacher mobile apps.
* **Database Entities:** `salary_structures`, `payroll_batches`, `staff_payslips`.

---

### FLEET-15: Vehicle Fleet & Driver Records Management
* **Domain:** Transport & Compliance
* **Objective:** Tracks school buses, vans, safety documentation, and driver compliance.
* **Functional Capabilities:**
  * Vehicle asset register: Registration number, engine/chassis number, seating capacity, fuel type.
  * Safety compliance tracker: Automated alerts for expiring Fitness Certificates, Pollution (PUC), Commercial Insurance, and Road Permits.
  * Driver & conductor profiles: Commercial driving license verification, police background verification records, blood group, emergency contact.
* **Database Entities:** `vehicles`, `vehicle_documents`, `drivers`, `maintenance_logs`.

---

### IOT-16: GT06/SinoTrack Binary GPS Ingestion Daemon
* **Domain:** IoT & Network Telemetry
* **Objective:** High-throughput raw TCP socket ingestion service for hardware GPS tracking devices.
* **Functional Capabilities:**
  * Written in Go; listens on TCP Port `5023`.
  * Decodes GT06 / SinoTrack binary hex frames:
    * `0x01` (Login): Extracts IMEI, authenticates device against `vehicles` table, responds with server ACK.
    * `0x13` (Heartbeat): Maintains TCP socket connection.
    * `0x22` / `0x12` (GPS Location): Unpacks 4-byte unsigned big-endian fixed-point coordinates ($\text{Degrees} = \text{Bytes} / 1800000.0$), speed ($0–255\text{ km/h}$), heading ($0–360^\circ$), and ACC ignition state.
  * Pushes latest state into Redis geospatial index (`GEOADD`) in $<1\text{ms}$.
* **Database Entities:** `gps_devices`, `telemetry_breadcrumbs`.

---

### IOT-17: Zero-Capex Smartphone Driver Tracking App
* **Domain:** Mobile Transport Alternative
* **Objective:** Enables real-time bus tracking without purchasing dedicated GPS hardware.
* **Functional Capabilities:**
  * Lightweight native Android app running on the driver's or conductor's smartphone.
  * Trip lifecycle: Driver selects assigned route $\rightarrow$ taps "Start Morning Trip" $\rightarrow$ app activates a battery-optimized Foreground Service transmitting GPS coordinates every 5 seconds $\rightarrow$ driver taps "End Trip".
  * Auto-sleep mode: Stops GPS pings if the vehicle remains stationary for $>15$ minutes.
* **Database Entities:** `driver_sessions`, `driver_trips`.

---

### IOT-18: Real-Time Bus Telemetry, ETA & Geofencing
* **Domain:** Spatial Computing & Parent UX
* **Objective:** Delivers live bus tracking on vector maps and proactive arrival notifications to parents.
* **Functional Capabilities:**
  * MapLibre GL vector map integration with zero Google Maps API licensing costs.
  * WebSocket broadcasting: Parents receive live coordinate streams with client-side interpolation (lerp) for smooth marker movement.
  * PostGIS Spatial Geofencing: Automatically detects when a bus enters the 1.5km radius of a student's pickup stop and dispatches an alert: *"School Bus is 5 minutes away"*.
* **Database Entities:** `geofences`, `bus_stops`, `geofence_events`.

---

### FLEET-19: Multi-Stop Route & Dynamic Zone Fee Allocation
* **Domain:** Transport Logistics & Billing
* **Objective:** Optimizes bus pickup routes and computes distance-based transport fees.
* **Functional Capabilities:**
  * Sequential stop builder: Designates morning pickup and afternoon drop-off times for each stop.
  * Distance-based fee slabs: Zone 1 (0–3km), Zone 2 (3–7km), Zone 3 (7–12km) with automatic fee assignment.
  * Vacation auto-suspension: Automatically excludes transport charges during summer break months (e.g., June) without affecting tuition billing.
* **Database Entities:** `routes`, `route_stops`, `transport_fee_slabs`.

---

### LAB-20: Science & Computer Lab Asset Inventory
* **Domain:** Asset & Consumable Management
* **Objective:** Tracks capital laboratory apparatus and consumable chemicals across Physics, Chemistry, Biology, and Computer Labs.
* **Functional Capabilities:**
  * Capital asset register: Microscopes, spectrometers, oscilloscopes, and computers with unique barcode labels.
  * Reagent & consumable stock management: Minimum reorder threshold alerts for chemicals, acids, and glassware.
  * Lab occupancy logs: Records which teacher and class is utilizing the lab during each period.
* **Database Entities:** `lab_categories`, `lab_assets`, `consumable_stocks`.

---

### LAB-21: Lab Apparatus Breakage & Student Penalty Billing
* **Domain:** Accountability & Billing
* **Objective:** Enforces financial accountability for damaged lab apparatus.
* **Functional Capabilities:**
  * Lab assistants record breakage incidents via mobile app: Student ID, Asset Barcode, Incident Details, Replacement Cost.
  * Automatic financial dispatch: Queues a debit against the student's refundable Caution Money or adds an itemized penalty to the next monthly fee bill.
  * Generates an incident slip requiring student and supervising teacher signatures.
* **Database Entities:** `breakage_incidents`, `lab_breakage_penalties`.

---

### LMS-22: Library Management System (Barcode/ISBN/OpenLibrary)
* **Domain:** Library Automation
* **Objective:** Comprehensive tracking of books, circulation, and overdue fines.
* **Functional Capabilities:**
  * Barcode & QR code scanning for accession numbers.
  * Auto-metadata fetch: Queries OpenLibrary API using ISBN to auto-populate title, author, publisher, and cover image.
  * Circulation engine: Role-based loan rules (Students: 2 books for 14 days; Teachers: 5 books for 30 days).
  * Automated overdue fine calculation (e.g., ₹2/day) with auto-block on issuing new books until fines are cleared.
  * Verifies "No Dues" status prior to issuing School Leaving Certificates.
* **Database Entities:** `library_books`, `book_copies`, `book_loans`, `library_fines`.

---

### EXAM-23: Examination Scheduling, Marks Entry & Tabulation
* **Domain:** Academics & Examination
* **Objective:** Coordinates the examination lifecycle from datesheet creation to master marks tabulation.
* **Functional Capabilities:**
  * Examination configuration: Periodic Assessments, Half-Yearly, Pre-Board, and Final Annual Exams.
  * Exam hall allocation and seating plan generator.
  * Spreadsheet-style marks entry portal for teachers with numerical range validation ($0 \le \text{Marks} \le \text{Max}$).
  * Generates Master Tabulation Registers (Broadsheets) with statistical distribution (highest, lowest, class average).
* **Database Entities:** `exams`, `exam_schedules`, `marks_entries`, `tabulation_sheets`.

---

### DOC-24: Batch Deterministic Document Generator
* **Domain:** Document Generation
* **Objective:** Produces pixel-perfect, vector-quality PDF documents for administrative and legal compliance.
* **Functional Capabilities:**
  * **Batch PVC Student ID Cards:** Formats 8–10 CR80 cards per A4 sheet with school crest, student photo, blood group, barcode, and aligned crop lines for cutting machines.
  * **Exam Admit Cards (Hall Tickets):** Generates exam pass with timetable and photo. **Fee-Lock Rule:** If outstanding dues $> ₹0$, the system watermarks the card as *"FEES DUE - CONTACT OFFICE"* or halts generation.
  * **Transfer Certificate (TC / SLC):** Government-compliant counter-foil layout with serial security stamp, issued only after digital clearance from Library, Labs, and Accounts.
* **Database Entities:** `document_templates`, `generated_documents`, `document_audit_logs`.

---

### ROLL-25: Academic Session Rollover & Arrears Carry-Forward
* **Domain:** Academic Year Transition
* **Objective:** Safely transitions the entire school to the new academic year without historical data loss.
* **Functional Capabilities:**
  * Freezes the concluding academic session: Gradebooks, attendance, and fee invoices become immutable snapshots.
  * Batch Promotion Engine: Advances eligible students to the next grade (e.g., Class 4A $\rightarrow$ Class 5A) while retaining repeaters.
  * Arrears Carry-Forward: Aggregates unpaid balances from the old session and posts them as an immutable `OPENING_ARREARS_BALANCE` entry in the new session's ledger.
* **Database Entities:** `academic_sessions`, `session_rollover_logs`, `student_promotions`.

---

### DATA-26: Self-Service CSV/Excel Smart Ingestion Pipeline
* **Domain:** Customer Onboarding
* **Objective:** Reduces school onboarding time from 2 weeks to 30 minutes.
* **Functional Capabilities:**
  * Drag-and-drop file upload (`.xlsx`, `.csv`).
  * Intelligent visual column mapper: Heuristic auto-matching of school column names (`"S. Name"` $\rightarrow$ `student_name`, `"Father Contact"` $\rightarrow$ `guardian_phone`).
  * Client-side WebAssembly sandbox validation: Verifies date formats, checks duplicate admission numbers, validates 10-digit mobile numbers.
  * Split commit: Imports clean rows directly; generates an annotated `Errors_To_Fix.xlsx` with exact row numbers and error descriptions for the school clerk.
* **Database Entities:** `data_import_jobs`, `import_column_mappings`, `import_error_logs`.

---

### NOTIF-27: Tiered Notification Dispatcher
* **Domain:** Multi-Channel Communication
* **Objective:** Delivers emergency, attendance, and fee alerts at the lowest possible cost.
* **Functional Capabilities:**
  * **Tier 1 (Zero-Cost):** High-priority native mobile push notifications (FCM data messages on Android; APNs on iOS).
  * **Tier 2 (Interactive):** WhatsApp Cloud API fallback with interactive buttons ("Pay via UPI", "Download Receipt").
  * **Tier 3 (Emergency):** DLT-compliant SMS fallback for critical emergency school closures.
  * Delivery receipt tracking: Logs whether messages were delivered, read, or failed.
* **Database Entities:** `notifications`, `device_tokens`, `delivery_receipts`.

---

### AGENT-28: AI Parent Care Agent (WhatsApp & In-App Conversational)
* **Domain:** Autonomous AI Customer Service
* **Objective:** Resolves 80%+ of repetitive parent queries 24/7 without school staff intervention.
* **Functional Capabilities:**
  * Multilingual natural language understanding: Hindi, Hinglish, Bengali, and English.
  * Strict Tool-Calling Architecture (Zero Hallucination):
    * *"Aarav ka fee kitna baaki hai?"* $\rightarrow$ Invokes `get_student_fee_dues(phone)`.
    * *"Bus abhi kahan hai?"* $\rightarrow$ Invokes `get_live_bus_location(route_id)`.
  * Generates immediate dynamic UPI payment deep-links inside the WhatsApp conversation.
* **Database Entities:** `agent_chat_sessions`, `agent_tool_calls`, `agent_audit_logs`.

---

### AGENT-29: AI Computer Vision OMR & Exam Grading Copilot
* **Domain:** Academic Assessment Automation
* **Objective:** Eliminates manual grading of periodic multiple-choice tests for teachers.
* **Functional Capabilities:**
  * Uses OpenCV on-device (mobile app) or on worker nodes to locate sheet corner registration markers.
  * Applies perspective warping and Otsu thresholding to evaluate bubble fill density.
  * Evaluates 100 questions in $<1$ second with $99.8\%$ accuracy.
  * Automatically populates the teacher's gradebook in `marks_entries` and flags ambiguous double-bubbled rows for teacher review.
* **Database Entities:** `omr_templates`, `omr_evaluations`, `question_analytics`.

---

### AGENT-30: Predictive Operations & Autonomous Dunning Agent
* **Domain:** Predictive School Operations
* **Objective:** Proactively monitors fee collection, student dropout risks, and daily administrative bottlenecks.
* **Functional Capabilities:**
  * Smart Dunning Workflows: Sends respectful, progressive WhatsApp reminders before applying late-fee penalties.
  * Dropout Risk Detection: Flags students with 5+ consecutive unexcused absences or sudden drops in academic marks.
  * Principal Morning Digest: Generates a 60-second executive summary card detailing yesterday's fee collection, today's staff absences, bus fleet status, and pending approvals.
* **Database Entities:** `dunning_schedules`, `risk_alerts`, `executive_digests`.
