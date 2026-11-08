# SchoolOS API Contracts & Telemetry Protocol Specifications

> **Protocol Standards:** REST over HTTPS (JSON), WebSockets (JSON/WSS), and Raw TCP Binary (GT06 Protocol).  
> **Base URL:** `https://api.schoolos.in/v1`  
> **Telemetry Ingestion Socket:** `tcp://iot.schoolos.in:5023`

---

## 1. Authentication & Tenant Resolution

Every HTTP request must include:
* `Authorization: Bearer <JWT>`
* `X-Tenant-Domain: <subdomain.schoolos.in>` (or derived automatically from the request Host header).

### 1.1 `POST /auth/login/phone`
Authenticates a user via phone number and password or initiates OTP dispatch.

**Request Payload:**
```json
{
  "phone": "+919876543210",
  "password": "SecretPassword123"
}
```

**Response Payload (`200 OK`):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400,
  "user": {
    "id": "c0a80101-92b5-4b11-9ef0-0a1234567890",
    "full_name": "Rajesh Sharma",
    "phone": "+919876543210",
    "avatar_url": "https://assets.schoolos.in/avatars/user1.png"
  },
  "linked_profiles": [
    {
      "student_id": "d1a80101-92b5-4b11-9ef0-0a1234567891",
      "full_name": "Aarav Sharma",
      "admission_number": "DPS-2024-042",
      "school_name": "Delhi Public School, Ranchi",
      "class_name": "Class 5",
      "section_name": "A",
      "role": "STUDENT"
    },
    {
      "student_id": "d2a80101-92b5-4b11-9ef0-0a1234567892",
      "full_name": "Ananya Sharma",
      "admission_number": "DPS-2026-118",
      "school_name": "Delhi Public School, Ranchi",
      "class_name": "Class 2",
      "section_name": "B",
      "role": "STUDENT"
    }
  ]
}
```

---

## 2. Financial & Fee Management Endpoints

### 2.1 `GET /students/{student_id}/fee-dues`
Returns the itemized outstanding fee ledger and payment history for a student.

**Response Payload (`200 OK`):**
```json
{
  "student_id": "d1a80101-92b5-4b11-9ef0-0a1234567891",
  "admission_number": "DPS-2024-042",
  "total_outstanding": 4200.00,
  "invoices": [
    {
      "invoice_id": "e0a80101-92b5-4b11-9ef0-0a1234567893",
      "invoice_number": "INV-2026-0042",
      "billing_period": "NOVEMBER_2026",
      "due_date": "2026-11-15",
      "gross_amount": 4500.00,
      "concession_amount": 500.00,
      "late_fee_amount": 200.00,
      "net_payable": 4200.00,
      "paid_amount": 0.00,
      "status": "PENDING",
      "items": [
        {
          "head_name": "Tuition Fee",
          "amount": 2500.00,
          "concession_deduction": 500.00,
          "net": 2000.00
        },
        {
          "head_name": "Transport Fee (Zone 2)",
          "amount": 1000.00,
          "concession_deduction": 0.00,
          "net": 1000.00
        },
        {
          "head_name": "Science Lab Fee",
          "amount": 1000.00,
          "concession_deduction": 0.00,
          "net": 1000.00
        }
      ]
    }
  ],
  "upi_intent": "upi://pay?pa=dpsschool@icici&pn=DelhiPublicSchool&am=4200.00&tr=INV-2026-0042&cu=INR"
}
```

### 2.2 `POST /payments/collect-cash` (Desktop Counter Endpoint)
Used by the Compose Desktop application to record cash collected at the counter and generate an authoritative receipt.

**Request Payload:**
```json
{
  "invoice_id": "e0a80101-92b5-4b11-9ef0-0a1234567893",
  "student_id": "d1a80101-92b5-4b11-9ef0-0a1234567891",
  "amount_paid": 4200.00,
  "payment_mode": "CASH",
  "idempotency_key": "desktop-pos-rec-98234-uuid",
  "offline_timestamp": "2026-11-08T09:14:22Z"
}
```

**Response Payload (`201 Created`):**
```json
{
  "receipt_number": "RCP-2026-098234",
  "status": "SETTLED",
  "remaining_balance": 0.00,
  "print_payload_escpos_base64": "G0BANgogICAgICAgICAgREVMSEkgUFVCTElDIFNDSE9PTCAgICAgICAg...",
  "qr_verification_url": "https://verify.schoolos.in/receipts/RCP-2026-098234"
}
```

---

## 3. IoT Telemetry & Real-Time Tracking

### 3.1 Raw GT06 TCP Packet Frame (Port 5023)
The hardware tracker streams raw hexadecimal bytes over TCP:

```
Sample Login Frame (Device to Server):
78 78 0D 01 03 52 38 70 82 00 24 57 00 01 D9 0D 0A

Decoded Login Breakdown:
  0x78 0x78        : Start Bytes
  0x0D             : Packet Length (13 bytes)
  0x01             : Protocol Number (Login)
  03 52 38 70 82 00 24 57 : Terminal IMEI (352387082002457)
  0x00 0x01        : Serial Number (1)
  0xD9             : Error Check CRC
  0x0D 0x0A        : Stop Bytes (\r\n)

Server Acknowledgment Response (Server to Device):
78 78 05 01 00 01 D9 DC 0D 0A
```

```
Sample GPS Location Frame (Device to Server):
78 78 1F 12 1A 0B 08 09 1E 2A CF 02 7A C8 15 08 B3 C5 12 14 01 CC 00 28 7D 00 1E 00 02 8F 0D 0A

Decoded GPS Breakdown:
  0x78 0x78        : Start Bytes
  0x1F             : Length (31 bytes)
  0x12 (or 0x22)   : Protocol Number (Location Data)
  1A 0B 08 09 1E 2A: Timestamp (26-11-08 09:30:42 UTC)
  0xCF             : 12 satellites, GPS length 15
  02 7A C8 15      : Latitude fixed-point (23.3441° N)
  08 B3 C5 12      : Longitude fixed-point (85.3095° E)
  0x14             : Speed (20 km/h)
  0x01 0xCC        : Course Heading (140° Southeast)
  0x00 0x28        : Status & ACC Ignition (Ignition ON)
  0x00 0x02        : Serial Number (2)
  0x8F             : CRC
  0x0D 0x0A        : Stop Bytes
```

### 3.2 WebSocket Live Bus Feed: `WSS /v1/ws/vehicles/{vehicle_id}`
Used by the Next.js admin dashboard and native mobile apps to receive real-time bus coordinates.

**Client Connection:**
```
GET /v1/ws/vehicles/a1a80101-92b5-4b11-9ef0-0a1234567899 HTTP/1.1
Host: api.schoolos.in
Upgrade: websocket
Connection: Upgrade
Authorization: Bearer <JWT>
```

**Server Broadcast Message (Every 5 seconds while vehicle moves):**
```json
{
  "type": "TELEMETRY_UPDATE",
  "vehicle_id": "a1a80101-92b5-4b11-9ef0-0a1234567899",
  "registration_number": "JH-01-BV-4021",
  "route_id": "b1a80101-92b5-4b11-9ef0-0a1234567898",
  "coordinates": {
    "latitude": 23.344120,
    "longitude": 85.309540,
    "speed_kmh": 32.5,
    "heading": 142.0,
    "ignition_on": true
  },
  "active_trip": {
    "next_stop_name": "Circular Road Chowk",
    "eta_seconds": 240,
    "passengers_onboard": 28
  },
  "timestamp": "2026-11-08T09:35:12Z"
}
```

---

## 4. Desktop Local-First Sync Protocol

### 4.1 `POST /sync/offline-receipts`
Batches offline transactions recorded in local SQLite on the school's Windows counter machine.

**Request Payload:**
```json
{
  "device_id": "POS-COUNTER-01",
  "batch_id": "batch-20261108-01",
  "transactions": [
    {
      "client_tx_id": "local-tx-99124",
      "invoice_id": "e0a80101-92b5-4b11-9ef0-0a1234567893",
      "student_id": "d1a80101-92b5-4b11-9ef0-0a1234567891",
      "amount": 4200.00,
      "payment_mode": "CASH",
      "collected_at": "2026-11-08T09:14:22Z"
    }
  ]
}
```

**Response Payload (`200 OK`):**
```json
{
  "batch_id": "batch-20261108-01",
  "synced_count": 1,
  "failed_count": 0,
  "results": [
    {
      "client_tx_id": "local-tx-99124",
      "server_receipt_number": "RCP-2026-098234",
      "status": "CONFIRMED"
    }
  ]
}
```

---

## 5. Agentic AI Integration Contracts

### 5.1 WhatsApp Webhook Receiver: `POST /webhooks/whatsapp`
Receives inbound messages from Meta Cloud API when a parent messages the school's WhatsApp bot.

**Inbound Payload (from Meta):**
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "919876543210",
          "id": "wamid.HBgLM...",
          "timestamp": "1731032400",
          "text": { "body": "Bhaiya fee kitna baaki hai Aarav ka?" },
          "type": "text"
        }]
      }
    }]
  }]
}
```

**Agent Tool Resolution Pipeline:**
```
1. Resolve sender: +919876543210 -> Guardian: Rajesh Sharma
2. Parse intent: CHECK_FEE_DUES
3. Target student: Aarav Sharma (student_id: d1a80101...)
4. Execute Internal Tool: get_student_fee_dues("d1a80101...") -> Dues: ₹4,200
5. Formulate localized Hindi reply:
   "Namaste Rajesh ji, Aarav ka November mahine ka bacha hua fee ₹4,200 hai. 
    Aap neeche diye gaye button se turant UPI dwara bhugtan kar sakte hain."
6. Send WhatsApp Interactive Message with UPI Pay CTA button.
```
