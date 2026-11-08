# SchoolOS UI/UX Design System & EdTech Aesthetics Specification

> **Classification:** Master Design Specification & Design Tokens  
> **Target Audience:** Product Designers, Frontend Engineers (Next.js/React), Native Mobile Engineers (Kotlin/Swift), Desktop Engineers (Compose Multiplatform), and AI Agents.  
> **Design Benchmarks:** Linear (information density & keyboard flow), Stripe (financial trust & tabular numerals), Duolingo (tactile mobile engagement & clarity), and Awwwards Site of the Day (modern creative typography, micro-interactions, and visual discipline).

---

## Table of Contents
1. [The Anti-Legacy EdTech Manifesto](#1-the-anti-legacy-edtech-manifesto)
2. [Global Design Tokens & Variables](#2-global-design-tokens--variables)
   * [2.1 Color Matrix & Contrast Assurance](#21-color-matrix--contrast-assurance)
   * [2.2 Typography Scale & Bilingual Font Pairing](#22-typography-scale--bilingual-font-pairing)
   * [2.3 Elevation, Surfaces & Border Radii](#23-elevation-surfaces--border-radii)
   * [2.4 Motion Physics & Animation Curves](#24-motion-physics--animation-curves)
3. [Design System Component Specifications](#3-design-system-component-specifications)
   * [3.1 Buttons & Interactive Controls](#31-buttons--interactive-controls)
   * [3.2 High-Density Data Tables & Broadsheets](#32-high-density-data-tables--broadsheets)
   * [3.3 Status Badges & Financial Indicators](#33-status-badges--financial-indicators)
   * [3.4 Modals, Drawers & Mobile Bottom Sheets](#34-modals-drawers--mobile-bottom-sheets)
   * [3.5 Global Command Palette (Cmd+K / Ctrl+K)](#35-global-command-palette-cmdk--ctrlk)
4. [Platform-Specific Design Implementations](#4-platform-specific-design-implementations)
   * [4.1 Administrative Web Portal (Next.js)](#41-administrative-web-portal-nextjs)
   * [4.2 Native Desktop Counter POS (Compose Multiplatform)](#42-native-desktop-counter-pos-compose-multiplatform)
   * [4.3 Native Android Mobile Client (Jetpack Compose)](#43-native-android-mobile-client-jetpack-compose)
   * [4.4 Native iOS Mobile Client (SwiftUI)](#44-native-ios-mobile-client-swiftui)
5. [Key Screen Blueprints & Wireframes](#5-key-screen-blueprints--wireframes)
   * [5.1 Master Executive Morning Digest (Web)](#51-master-executive-morning-digest-web)
   * [5.2 High-Speed Cash Counter & POS Preview (Desktop)](#52-high-speed-cash-counter--pos-preview-desktop)
   * [5.3 Live Bus Telemetry & Stop Tracker (Mobile)](#53-live-bus-telemetry--stop-tracker-mobile)
   * [5.4 Multi-Account Profile Switcher (Mobile)](#54-multi-account-profile-switcher-mobile)
   * [5.5 Bilingual CCE Marksheet & Report Card (Web/Print)](#55-bilingual-cce-marksheet--report-card-webprint)
   * [5.6 AI WhatsApp & In-App Support Chatbot (Mobile/Web)](#56-ai-whatsapp--in-app-support-chatbot-mobileweb)
6. [Accessibility & Environmental Adaptation (WCAG 2.1 AA)](#6-accessibility--environmental-adaptation-wcag-21-aa)

---

## 1. The Anti-Legacy EdTech Manifesto

Legacy school portals in Tier-2/3 regions (e.g., Parents Alarm, Entab, Fedena) suffer from dated design debt:
* **Spreadsheet Overload:** Unformatted, 50-column data dumps with 10px unreadable fonts.
* **Aggressive Mouse Dependency:** 8 clicks required just to collect a ₹2,000 tuition fee.
* **Low Sunlight Readability:** Mobile webviews that wash out under bright morning sunlight at roadside bus stops.

### The SchoolOS Antidote
1. **Linear-Tier Speed:** Clerks operate without a mouse using pure keyboard shortcuts (`F1`–`F3`, `Ctrl+K`, Numpad).
2. **Stripe-Tier Trust:** Double-entry ledgers and fee receipts use aligned monospace currency (`tabular-nums`), distinct badge states, and instant visual validation.
3. **Duolingo-Tier Mobile Simplicity:** Essential parent information (bus ETA, attendance, fee status) is displayed as bold, tactile cards with large $48\text{dp}$ touch targets.
4. **Hardware-Native Adaptability:** Runs seamlessly on 1366x768 legacy Windows monitors, 720p budget Android screens, and Retina OLED panels.

---

## 2. Global Design Tokens & Variables

### 2.1 Color Matrix & Contrast Assurance

All color combinations meet or exceed **WCAG 2.1 AA standards ($\ge 4.5:1$ for body text, $\ge 3:1$ for large headings and active UI controls)**.

```css
:root {
  /* Brand Primary: Institutional Sapphire */
  --primary-50:  #EFF6FF;
  --primary-100: #DBEAFE;
  --primary-200: #BFDBFE;
  --primary-500: #3B82F6; /* Interactive triggers, links, active borders */
  --primary-600: #2563EB; /* Button backgrounds, primary brand indicators */
  --primary-700: #1D4ED8; /* Hover & active pressed states */
  --primary-900: #1E3A8A; /* Institutional deep brand tone */

  /* Neutral Slate Scale */
  --slate-50:  #F8FAFC; /* Primary application canvas (Light) */
  --slate-100: #F1F5F9; /* Card background, table alternate row fill */
  --slate-200: #E2E8F0; /* Clean borders, dividing rules */
  --slate-300: #CBD5E1; /* Inactive switch tracks, secondary borders */
  --slate-400: #94A3B8; /* Placeholder text, secondary icons */
  --slate-500: #64748B; /* Captions, table column headers */
  --slate-600: #475569; /* Secondary body copy */
  --slate-700: #334155; /* High-emphasis body copy */
  --slate-900: #0F172A; /* Primary headers, dark mode canvas */

  /* Semantic State Tokens */
  --emerald-500: #10B981; /* Paid, Present, Bus On-Time */
  --emerald-50:  #ECFDF5;
  --amber-500:   #F59E0B; /* Fee Due Soon, Student Late, Bus Idling */
  --amber-50:    #FFFBEB;
  --rose-500:    #EF4444; /* Defaulter, Absent, Speed Alert */
  --rose-50:     #FEF2F2;
  --violet-500:  #8B5CF6; /* AI Copilot features, suggestions */
  --violet-50:   #F5F3FF;
}
```

### 2.2 Typography Scale & Bilingual Font Pairing

To guarantee ultra-crisp legibility across varying display densities:
1. **Primary UI Font (English):** `Inter` or `Geist Sans` (high x-height, clear optical kerning).
2. **Numerical & Financial Data:** `JetBrains Mono` or tabular numerals (`font-variant-numeric: tabular-nums`). Essential so that columns of ₹ currency align perfectly on the decimal point.
3. **Bilingual Regional Support (Hindi / Devanagari):** `Noto Sans Devanagari` (harmonized weight and cap-height with Inter for BSEB/CBSE bilingual marksheets).

| Token | CSS Font Size | Line Height | Font Weight | Letter Spacing | Target Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `text-display` | `32px` (`2.0rem`) | `40px` | Bold (`700`) | `-0.02em` | Principal Morning Executive Metrics, Fee Totals |
| `text-h1` | `24px` (`1.5rem`) | `32px` | SemiBold (`600`) | `-0.015em` | Page Titles, Portal Section Headers |
| `text-h2` | `20px` (`1.25rem`) | `28px` | SemiBold (`600`) | `-0.01em` | Modal Headers, Module Navigation Titles |
| `text-h3` | `16px` (`1.0rem`) | `24px` | Medium (`500`) | `0.0em` | Card Titles, Student Roster Names |
| `text-body` | `14px` (`0.875rem`)| `20px` | Regular (`400`) | `0.0em` | Standard Body Copy, Table Cells, Form Labels |
| `text-caption` | `12px` (`0.75rem`) | `16px` | Regular (`400`) | `0.01em` | Timestamps, Secondary Metadata, Helper Text |
| `text-mono` | `13px` (`0.8125rem`)| `18px` | Medium (`500`) | `0.0em` | Currency (₹), Roll Codes, Admission Numbers |

### 2.3 Elevation, Surfaces & Border Radii

* **Grid System:** Strict 4px/8px baseline grid (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`).
* **Corner Radii:**
  * Micro (Badges, Chips, Inputs): `4px` (`rounded-sm` or `rounded-md`).
  * Cards & Panels: `8px` (`rounded-lg`).
  * Modals & Drawers: `16px` (`rounded-2xl`).
  * Floating Action Buttons & Avatars: Full circular `9999px` (`rounded-full`).
* **Shadows:**
  * Flat: `border border-slate-200 bg-white` (Default for high-density tables).
  * Elevation 1: `0 1px 2px 0 rgb(0 0 0 / 0.05)` (Cards, Dropdowns).
  * Elevation 2: `0 10px 15px -3px rgb(0 0 0 / 0.1)` (Command Palette, Modals).

### 2.4 Motion Physics & Animation Curves

* **Easing Curves:**
  * Standard Ease-Out: `cubic-bezier(0.16, 1, 0.3, 1)` (Modals, Dropdowns).
  * Telemetry Lerp: Smooth linear interpolation across 5,000ms duration for bus markers.
  * Tactile Micro-feedback: 150ms spring animation on button taps.

---

## 3. Design System Component Specifications

### 3.1 Buttons & Interactive Controls
* **Primary Button:** High-contrast Sapphire background (`bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium px-4 py-2 rounded-md shadow-sm`).
* **Secondary / Ghost Button:** Slate border (`border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium px-4 py-2 rounded-md`).
* **Danger Button:** Rose background (`bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-md`).
* **Numpad Focus State:** All inputs support high-contrast focus rings (`ring-2 ring-blue-500 ring-offset-2`).

### 3.2 High-Density Data Tables & Broadsheets
* Row height fixed at `40px` with alternating fills (`bg-slate-50/50`).
* Fixed sticky header with uppercase column labels (`text-xs font-semibold text-slate-500 uppercase tracking-wider`).
* Right-aligned monetary numbers with tabular numerals (`tabular-nums font-mono text-right`).
* Sticky left column for student admission number and full name.

### 3.3 Status Badges & Financial Indicators
* **PAID / PRESENT:** `bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-xs px-2.5 py-0.5 rounded-full inline-flex items-center gap-1`.
* **DUE SOON / LATE:** `bg-amber-50 text-amber-700 border border-amber-200 font-medium text-xs px-2.5 py-0.5 rounded-full inline-flex items-center gap-1`.
* **ABSENT / OVERDUE:** `bg-rose-50 text-rose-700 border border-rose-200 font-medium text-xs px-2.5 py-0.5 rounded-full inline-flex items-center gap-1`.

### 3.4 Modals, Drawers & Mobile Bottom Sheets
* Backdrop overlay with 40% opacity black (`bg-black/40 backdrop-blur-sm`).
* Smooth slide-up transition from bottom on mobile devices.
* Accessible `Esc` key dismiss and click-outside handler.

### 3.5 Global Command Palette (`Cmd+K` / `Ctrl+K`)
* Centered floating overlay with instant fuzzy filtering.
* Displays keyboard navigation hints (`Up/Down to navigate`, `Enter to select`, `Esc to dismiss`).
* Search queries route instantly to Student Cards, Bus Fleet Maps, Fee Ledgers, and Staff directories in $<50$ms.

---

## 4. Platform-Specific Design Implementations

### 4.1 Administrative Web Portal (Next.js 15)
* Built with Tailwind CSS and shadcn/ui.
* 240px collapsible sidebar with clear iconography.
* Dashboard widgets designed as responsive cards with clean divider rules and KPI badges.

### 4.2 Native Desktop Counter POS (Compose Multiplatform on Windows)
* High-speed split-pane layout: Left pane for student fee dues; right pane for live 80mm ESC/POS thermal receipt preview.
* Zero mouse dependency: Built entirely around numeric keypad triggers (`F1` Search, `F2` Payment Mode, `F3` Collect & Print).

### 4.3 Native Android Mobile Client (Jetpack Compose)
* High-contrast sunlight readability mode for bus stop parents.
* Minimum touch target of $48\times 48\text{dp}$.
* Header avatar dropdown for instant switching between enrolled siblings.

### 4.4 Native iOS Mobile Client (SwiftUI)
* Full Apple Human Interface Guidelines compliance with Dynamic Type font scaling.
* Native SF Symbols iconography and spring-animated bottom sheet transitions.

---

## 5. Key Screen Blueprints & Wireframes

### 5.1 Master Executive Morning Digest (Web)

```
+----------------------------------------------------------------------------------------------------+
| [SchoolOS Logo] Delhi Public School, Ranchi  | Search (Ctrl+K)              | (Avatar) Principal [v] |
+----------------------------------------------------------------------------------------------------+
| [Sidebar]       | [EXECUTIVE MORNING DIGEST - 08 NOV 2026]                                         |
| - Dashboard     | +-------------------+ +-------------------+ +-------------------+ +------------+ |
| - Students      | | TOTAL PRESENT     | | FEES COLLECTED    | | BUSES EN ROUTE    | | TEACHERS   | |
| - Academics     | | 1,482 / 1,550     | | INR 1,84,500      | | 42 / 42 ACTIVE    | | 4 ON LEAVE | |
| - Fee Ledger    | | [95.6%] (+1.2%)   | | (42 Transactions)| | [0 Delays]        | | [Subst OK] | |
| - Transport     | +-------------------+ +-------------------+ +-------------------+ +------------+ |
| - Biometrics    |                                                                                  |
| - Library       | [LIVE FLEET DISPATCH MAP]                   [CRITICAL ACTION QUEUE]              |
| - Lab Inventory | +-----------------------------------------+ +----------------------------------+ |
| - Reports       | |                                         | | [!] Fee Arrears > 60 Days: 18    | |
| - Settings      | |      [MapLibre Real-Time View]          | |     [Send WhatsApp Reminders]    | |
|                 | |      (o) Bus 12 (32 km/h - On Route)    | | [!] CBSE CCE Marks Pending: 8B   | |
|                 | |      (o) Bus 04 (Stopped at Chowk)      | |     [Alert Class Teacher]        | |
|                 | |                                         | | [!] Science Lab Reagent Low:     | |
|                 | +-----------------------------------------+ |     Hydrochloric Acid (500ml)    | |
|                 |                                             +----------------------------------+ |
+----------------------------------------------------------------------------------------------------+
```

### 5.2 High-Speed Cash Counter & POS Preview (Desktop)

```
+----------------------------------------------------------------------------------------------------+
|  SchoolOS Cash Counter POS  | [F1: Search Student] [F2: Mode: CASH] [F3: PRINT RECEIPT] | [ONLINE]  |
+----------------------------------------------------------------------------------------------------+
|  STUDENT LOOKUP: [ DPS-2024-042                     ]  <-- Scanned Barcode or Typed Admission No    |
+------------------------------------------------------+---------------------------------------------+
|  Student Details:                                    |  PHYSICAL THERMAL RECEIPT PREVIEW (80mm)    |
|  Name   : Aarav Sharma                               |  -----------------------------------------  |
|  Class  : Class 5-A | Roll No: 14                    |           DELHI PUBLIC SCHOOL               |
|  Father : Rajesh Sharma (Ph: 9876543210)             |             RANCHI, JHARKHAND               |
|  Sibling: Ananya Sharma (Class 2-B) [Sibling Disc OK]|  Receipt No: RCP-2026-098234                |
|  --------------------------------------------------  |  Date: 08-Nov-2026 09:14 AM                 |
|  OUTSTANDING FEE INVOICE: NOVEMBER 2026              |  Student: Aarav Sharma (Class 5-A)          |
|  [X] Tuition Fee             :  INR 2,500.00         |  Adm No : DPS-2024-042                      |
|      (-) Sibling Concession  : -INR   625.00         |  -----------------------------------------  |
|  [X] Transport Fee (Zone 2)  :  INR 1,000.00         |  Fee Heads                       Amount     |
|  [X] Science Lab Fee         :  INR 1,000.00         |  Tuition Fee (Net)              1,875.00   |
|  [ ] Annual Exam Fee (Dec)   :  INR   500.00         |  Transport Fee                  1,000.00   |
|  --------------------------------------------------  |  Science Lab Fee                1,000.00   |
|  TOTAL PAYABLE               :  INR 3,875.00         |  -----------------------------------------  |
|  AMOUNT TENDERED (CASH)     : [ 4,000.00          ] |  TOTAL RECEIVED (CASH)        INR 3,875.00  |
|  CHANGE DUE TO PARENT        :  INR   125.00         |  -----------------------------------------  |
|                                                      |  [QR Code: verify.schoolos.in/RCP-098234]   |
|  [ ENTER: COLLECT & PRINT (F3) ]                     |  Thank you!                                 |
+------------------------------------------------------+---------------------------------------------+
```

### 5.3 Live Bus Telemetry & Stop Tracker (Mobile)

```
+-------------------------------------------------------+
|  [App Bar]                                            |
|  (Avatar) Aarav Sharma (Class 5A)  [ v ]  [Notif Bell]|
+-------------------------------------------------------+
|                                                       |
|  +-------------------------------------------------+  |
|  |  BUS ROUTE 14: MORNING PICKUP                   |  |
|  |  Status: EN ROUTE (On Schedule)                 |  |
|  |                                                 |  |
|  |   [ MAPLIBRE VECTOR MAP ]                       |  |
|  |   +-----------------------------------------+   |  |
|  |   |                [Bus Icon] (34 km/h)     |   |  |
|  |   |                     |                   |   |  |
|  |   |                     v                   |   |  |
|  |   |          (Your Stop: Circular Rd Chowk) |   |  |
|  |   +-----------------------------------------+   |  |
|  |                                                 |  |
|  |  Estimated Arrival: 07:18 AM (in 6 minutes)     |  |
|  |  Driver: Ramesh Kumar  |  [ Call Driver ]       |  |
|  |  Vehicle: JH-01-BV-4021 (Bus #14)               |  |
|  +-------------------------------------------------+  |
|                                                       |
|  TODAY'S HIGHLIGHTS                                   |
|  +------------------------+ +-----------------------+ |
|  | ATTENDANCE             | | FEE STATUS            | |
|  | [Checkmark] PRESENT    | | [Checkmark] PAID      | |
|  | Logged: 07:45 AM (Gate)| | Nov 2026 (No Dues)    | |
|  +------------------------+ +-----------------------+ |
|                                                       |
|  RECENT CIRCULARS & HOMEWORK                          |
|  - Science: Complete Chapter 4 Practical Workbook     |
|  - Notice: Annual Sports Meet scheduled on Nov 22     |
+-------------------------------------------------------+
```

### 5.4 Multi-Account Profile Switcher (Mobile)

```
+-------------------------------------------------------+
|  SWITCH ACTIVE STUDENT PROFILE                        |
|  Select a profile to view attendance, fees, & bus     |
|  ---------------------------------------------------  |
|                                                       |
|  (*) AARAV SHARMA (Active)                            |
|      Class 5-A | Roll No: 14                          |
|      Delhi Public School, Ranchi                      |
|      [Status: All Dues Cleared]                       |
|                                                       |
|  ( ) ANANYA SHARMA                                    |
|      Class 2-B | Roll No: 08                          |
|      Delhi Public School, Ranchi                      |
|      [! 1 Invoice Due: INR 2,200.00]                  |
|                                                       |
|  ---------------------------------------------------  |
|  [ + Link Another Student Admission Number ]          |
+-------------------------------------------------------+
```

### 5.5 Bilingual CCE Marksheet & Report Card (Web/Print)

```
+----------------------------------------------------------------------------------------------------+
|                                    DELHI PUBLIC SCHOOL, RANCHI                                     |
|                       Affiliated to CBSE, New Delhi (Affiliation No: 3430042)                      |
|                                  ANNUAL PROGRESS REPORT CARD (2025-26)                             |
|                                      वार्षिक प्रगति प्रतिवेदन                                      |
+----------------------------------------------------------------------------------------------------+
| Student Name (विद्यार्थी का नाम) : Aarav Sharma      Class & Sec (कक्षा/वर्ग) : Class 5-A          |
| Roll No (अनुक्रमांक)             : 14                Admission No (नामांकन सं): DPS-2024-042       |
| Mother's Name (माता का नाम)      : Sunita Sharma     Father's Name (पिता का नाम): Rajesh Sharma    |
+----------------------------------------------------------------------------------------------------+
| SCHOLASTIC AREAS (शैक्षणिक क्षेत्र)                                                                 |
| -------------------------------------------------------------------------------------------------- |
| Subject (विषय)       | Periodic Test (10) | Note Book (5) | Sub Enrichment (5) | Annual (80) | Total |
| English (अंग्रेज़ी)   | 09                 | 05            | 05                 | 72          | 91 A1 |
| Hindi (हिन्दी)       | 08                 | 04            | 05                 | 68          | 85 A2 |
| Mathematics (गणित)   | 10                 | 05            | 05                 | 78          | 98 A1 |
| Science (विज्ञान)    | 09                 | 04            | 04                 | 70          | 87 A2 |
| Social Science (सा.वि)| 08                | 05            | 04                 | 65          | 82 B1 |
+----------------------------------------------------------------------------------------------------+
| Overall Percentage: 88.6% | Overall Grade: A1 | Attendance: 96.2% | Result: PROMOTED TO CLASS 6   |
| Class Teacher Remarks: Excellent academic performance and disciplined conduct throughout the year. |
| [Class Teacher Signature]               [Principal Signature]                  [Official Seal]     |
+----------------------------------------------------------------------------------------------------+
```

### 5.6 AI WhatsApp & In-App Support Chatbot (Mobile/Web)

```
+-------------------------------------------------------+
|  [< Back]  SchoolOS Parent Care Assistant             |
+-------------------------------------------------------+
|                                                       |
|  [Parent - 09:14 AM]                                  |
|  Namaste, Aarav ka bus abhi kahan pahuncha hai?       |
|                                                       |
|  [SchoolOS Care AI - 09:14 AM]                        |
|  Namaste Rajesh Sharma ji!                            |
|  Aarav ki Bus #14 abhi Circular Road Chowk cross      |
|  kar chuki hai aur lagbhag 6 minute (07:18 AM) mein   |
|  aapke pickup stop par pahunch jayegi.                |
|                                                       |
|  [Interactive Map Card: Live Bus 14 Location]         |
|  Speed: 34 km/h | Next Stop: Circular Rd Chowk        |
|  [ View Live Map on App ]                             |
|                                                       |
|  [Parent - 09:15 AM]                                  |
|  Aur fee kitna bacha hua hai?                         |
|                                                       |
|  [SchoolOS Care AI - 09:15 AM]                        |
|  Aarav ka November mahine ka net payable fee          |
|  INR 3,875.00 hai (Sibling discount applied).         |
|  Due Date: 15-Nov-2026.                               |
|                                                       |
|  [ Action Button: Pay INR 3,875 via UPI ]             |
+-------------------------------------------------------+
```

---

## 6. Accessibility & Environmental Adaptation (WCAG 2.1 AA)

1. **Color Blindness Immunity:** Never use color alone to convey state. Every status badge pairs a color with a distinct icon and explicit text label.
2. **Keyboard Focus Rings:** All interactive inputs, buttons, and links display a high-contrast $2\text{px}$ blue focus ring (`ring-2 ring-blue-500 ring-offset-2`) when navigated via `Tab`.
3. **Bilingual Screen Reader Support:** All Devanagari/Hindi form labels include proper `lang="hi"` tags so mobile accessibility screen readers (TalkBack on Android, VoiceOver on iOS) switch pronunciation engines accurately.
4. **Offline Visual Indicators:** When network drops, the application displays an amber status banner: *"Offline Mode — All transactions saved locally and will auto-sync"*.
