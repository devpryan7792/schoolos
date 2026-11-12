'use client';

import React, { useState } from 'react';
import {
  FileText,
  CreditCard,
  Lock,
  Unlock,
  Printer,
  ShieldCheck,
  QrCode,
  CheckCircle2,
  Sparkles,
  Layers,
  Check,
  Building2
} from 'lucide-react';

export default function DocumentsPage() {
  const [docType, setDocType] = useState<'id-card' | 'admit-card' | 'tc'>('id-card');
  const [isFeePaid, setIsFeePaid] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Notion Quiet Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-hairline pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-canvas-muted border border-hairline flex items-center justify-center text-ink-muted">
              <FileText className="w-4 h-4 text-ink" />
            </div>
            <div>
              <h1 className="text-xl font-semibold -tracking-[0.02em] text-ink">
                Batch Deterministic Document Studio
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-ink-faint">
                  Vector Engine • Pixel-Perfect PDF / SVG
                </span>
                <span className="text-hairline-dark">•</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-1.5 py-0.2 rounded bg-semantic-highlight-light text-semantic-highlight border border-semantic-highlight/20">
                  <Sparkles className="w-2.5 h-2.5" /> DOC-24 DETERMINISTIC
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-ink hover:bg-ink-muted text-white rounded-md text-xs font-medium flex items-center gap-1.5 shadow-whisper transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Current Vector Sheet</span>
          </button>
        </div>
      </div>

      {/* Notion Segmented Tab Controls */}
      <div className="flex items-center gap-1.5 p-1 bg-canvas-subtle border border-hairline rounded-lg w-fit">
        <button
          onClick={() => setDocType('id-card')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            docType === 'id-card'
              ? 'bg-surface text-ink shadow-whisper border border-hairline'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          CR80 PVC Student ID Card (85.6 × 53.98mm)
        </button>
        <button
          onClick={() => setDocType('admit-card')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            docType === 'admit-card'
              ? 'bg-surface text-ink shadow-whisper border border-hairline'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          Fee-Locked Exam Admit Card (Hall Ticket)
        </button>
        <button
          onClick={() => setDocType('tc')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            docType === 'tc'
              ? 'bg-surface text-ink shadow-whisper border border-hairline'
              : 'text-ink-muted hover:text-ink'
          }`}
        >
          3-Way Digital Clearance Transfer Certificate
        </button>
      </div>

      {/* Document Canvas Container */}
      <div className="bg-canvas-subtle/50 p-8 rounded-xl border border-hairline flex flex-col items-center justify-center min-h-[520px]">
        {/* DOCUMENT 1: CR80 PVC ID Card */}
        {docType === 'id-card' && (
          <div className="space-y-4">
            <div
              id="print-area"
              className="w-[380px] h-[240px] bg-surface rounded-xl shadow-whisper border border-hairline overflow-hidden flex flex-col justify-between p-4 relative"
              style={{ aspectRatio: '85.6 / 53.98' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-hairline pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-ink text-white font-bold text-xs flex items-center justify-center font-mono">
                    DPS
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-ink tracking-tight">
                      DELHI PUBLIC SCHOOL
                    </div>
                    <div className="text-[9px] text-ink-faint font-medium">RANCHI • CBSE AFFILIATED</div>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-canvas-muted text-ink-muted border border-hairline">
                  AY 2026-27
                </span>
              </div>

              {/* Body */}
              <div className="flex items-center gap-3.5 my-auto">
                {/* Photo Box */}
                <div className="w-20 h-24 bg-canvas-subtle rounded border border-hairline flex flex-col items-center justify-center text-ink-faint shrink-0">
                  <div className="w-10 h-10 rounded-full bg-canvas-muted mb-1" />
                  <span className="text-[8px] font-mono uppercase tracking-[0.06em]">STUDENT PHOTO</span>
                </div>

                {/* Details */}
                <div className="space-y-1 text-xs">
                  <div className="font-semibold text-ink text-sm -tracking-[0.01em]">Aarav Sharma</div>
                  <div className="text-[11px] text-ink-muted">
                    Class: <strong className="text-ink font-semibold">10-A</strong> • Roll: <strong className="text-ink font-semibold">01</strong>
                  </div>
                  <div className="text-[11px] text-ink-muted font-mono">
                    Adm: <strong className="text-ink font-semibold">DPS-2024-042</strong>
                  </div>
                  <div className="text-[11px] text-ink-muted">
                    Blood Group: <strong className="text-semantic-critical font-semibold">O+</strong>
                  </div>
                  <div className="text-[10px] text-ink-faint font-mono pt-0.5">Emergency: +91 98765 43210</div>
                </div>
              </div>

              {/* Footer with Barcode */}
              <div className="border-t border-hairline pt-2 flex items-center justify-between text-[9px] text-ink-faint font-mono">
                <div className="flex gap-0.5 items-end h-5">
                  {[2, 4, 1, 3, 5, 2, 1, 4, 3, 2, 5, 1, 4, 2, 3, 4, 1, 2].map((h, i) => (
                    <div key={i} className="bg-ink w-[2px]" style={{ height: `${h * 4}px` }} />
                  ))}
                </div>
                <span>DPS-2024-042</span>
                <span className="text-[8px] font-sans text-ink-muted">Principal Signature</span>
              </div>
            </div>

            <div className="text-center text-xs text-ink-faint font-mono">
              ISO/IEC 7810 ID-1 standard specification (85.60 mm × 53.98 mm • 300 DPI)
            </div>
          </div>
        )}

        {/* DOCUMENT 2: Fee-Locked Admit Card */}
        {docType === 'admit-card' && (
          <div className="space-y-4 max-w-xl w-full">
            {/* Simulation Toggle */}
            <div className="bg-surface p-3.5 rounded-lg border border-hairline shadow-whisper flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-ink">Simulate Counter Dues Clearance</span>
                <p className="text-[11px] text-ink-faint">Toggle student arrears to test deterministic hall ticket issuance</p>
              </div>
              <button
                onClick={() => setIsFeePaid(!isFeePaid)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isFeePaid
                    ? 'bg-semantic-critical-light text-semantic-critical border border-semantic-critical/20'
                    : 'bg-ink text-white hover:bg-ink-muted shadow-whisper'
                }`}
              >
                {isFeePaid ? 'Revert to Unpaid (₹4,200 Overdue)' : 'Clear Dues (Simulate ₹4,200 Payment)'}
              </button>
            </div>

            {/* Admit Card Paper */}
            <div
              id="print-area"
              className={`bg-surface rounded-lg shadow-whisper border p-6 space-y-4 transition-all ${
                !isFeePaid ? 'border-semantic-critical/40' : 'border-hairline'
              }`}
            >
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <div>
                  <h3 className="font-semibold text-ink text-base -tracking-[0.02em]">
                    CBSE ANNUAL BOARD EXAMINATION 2026-27
                  </h3>
                  <div className="text-xs text-ink-muted">Official Candidate Admit Card / Hall Ticket</div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs px-2 py-1 rounded bg-canvas-muted text-ink border border-hairline font-semibold">
                    DPS-2024-042
                  </span>
                </div>
              </div>

              {!isFeePaid ? (
                // Fee-Locked Red Warning Shield
                <div className="bg-semantic-critical-light/40 border border-semantic-critical/30 rounded-lg p-6 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-semantic-critical/10 text-semantic-critical flex items-center justify-center mx-auto">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-semantic-critical">
                      HALL TICKET WITHHELD: PENDING TERM ARREARS
                    </div>
                    <div className="text-xs text-ink-muted mt-1 max-w-md mx-auto">
                      Under CBSE By-Law Rule 14.2, admit cards are locked until quarterly dues are settled.
                      Outstanding Balance: <strong className="font-mono text-sm text-semantic-critical tabular-nums">₹4,200.00</strong>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="inline-block p-3 bg-surface rounded-lg border border-hairline shadow-whisper text-center">
                      <QrCode className="w-20 h-20 mx-auto text-ink" />
                      <div className="text-[10px] font-mono text-ink-faint mt-1.5">Scan UPI QR to Unlock</div>
                    </div>
                  </div>
                </div>
              ) : (
                // Unlocked Examination Hall Ticket
                <div className="space-y-4">
                  <div className="bg-semantic-success-light border border-semantic-success/20 rounded-md p-3 flex items-center justify-between text-xs text-semantic-success">
                    <div className="flex items-center gap-2">
                      <Unlock className="w-4 h-4 text-semantic-success" />
                      <span className="font-semibold">FEES CLEARED • ADMIT CARD VALIDATED</span>
                    </div>
                    <span className="font-mono font-medium">Receipt: REC-2026-9901</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-ink-faint text-[11px] uppercase tracking-[0.06em]">Candidate Name</div>
                      <div className="font-semibold text-ink mt-0.5">Aarav Sharma</div>
                    </div>
                    <div>
                      <div className="text-ink-faint text-[11px] uppercase tracking-[0.06em]">Class & Roll</div>
                      <div className="font-semibold text-ink mt-0.5">Class 10-A (Roll 01)</div>
                    </div>
                    <div>
                      <div className="text-ink-faint text-[11px] uppercase tracking-[0.06em]">Examination Center</div>
                      <div className="font-semibold text-ink mt-0.5">DPS Ranchi Campus (Center: 34102)</div>
                    </div>
                    <div>
                      <div className="text-ink-faint text-[11px] uppercase tracking-[0.06em]">Center Superintendent</div>
                      <div className="font-mono text-semantic-success font-semibold mt-0.5">DIGITALLY VERIFIED</div>
                    </div>
                  </div>

                  {/* Exam Schedule */}
                  <div className="border border-hairline rounded-lg overflow-hidden text-xs shadow-whisper">
                    <table className="w-full text-left font-mono">
                      <thead className="bg-canvas-subtle border-b border-hairline text-ink-faint text-[11px]">
                        <tr>
                          <th className="p-2.5 font-semibold uppercase tracking-[0.06em]">Date</th>
                          <th className="p-2.5 font-semibold uppercase tracking-[0.06em]">Subject Code & Name</th>
                          <th className="p-2.5 font-semibold uppercase tracking-[0.06em]">Time</th>
                          <th className="p-2.5 text-right font-semibold uppercase tracking-[0.06em]">Hall</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-hairline text-ink">
                        <tr>
                          <td className="p-2.5">15-Feb-2027</td>
                          <td className="p-2.5 font-sans font-medium">041 Mathematics Standard</td>
                          <td className="p-2.5">10:30 AM - 01:30 PM</td>
                          <td className="p-2.5 text-right font-semibold">Hall A</td>
                        </tr>
                        <tr>
                          <td className="p-2.5">18-Feb-2027</td>
                          <td className="p-2.5 font-sans font-medium">086 Science (Theory)</td>
                          <td className="p-2.5">10:30 AM - 01:30 PM</td>
                          <td className="p-2.5 text-right font-semibold">Hall A</td>
                        </tr>
                        <tr>
                          <td className="p-2.5">22-Feb-2027</td>
                          <td className="p-2.5 font-sans font-medium">184 English Language & Lit</td>
                          <td className="p-2.5">10:30 AM - 01:30 PM</td>
                          <td className="p-2.5 text-right font-semibold">Hall B</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DOCUMENT 3: 3-Way Digital Clearance Transfer Certificate */}
        {docType === 'tc' && (
          <div className="max-w-xl w-full bg-surface rounded-lg shadow-whisper border border-hairline p-8 space-y-5">
            <div className="text-center border-b border-hairline pb-4">
              <h2 className="text-base font-semibold text-ink tracking-tight uppercase">
                Delhi Public School, Ranchi
              </h2>
              <div className="text-xs text-ink-muted">CBSE Affiliation No: 3430042 • School Code: 08129</div>
              <div className="text-xs font-semibold text-ink mt-2 uppercase tracking-wider">
                School Leaving / Transfer Certificate (स्थानांतरण प्रमाण पत्र)
              </div>
            </div>

            {/* 3-Way Clearance Gate Checklist */}
            <div className="bg-canvas-subtle border border-hairline rounded-md p-3.5 space-y-2 text-xs">
              <div className="font-semibold text-ink flex items-center justify-between">
                <span>3-Way Digital Department Clearance Status:</span>
                <span className="text-semantic-success font-mono font-medium bg-semantic-success-light border border-semantic-success/20 px-2 py-0.5 rounded text-[10px]">
                  ALL CLEARED
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono pt-1">
                <div className="flex items-center gap-1.5 text-semantic-success">
                  <CheckCircle2 className="w-3.5 h-3.5 text-semantic-success" />
                  <span>Library (0 Books)</span>
                </div>
                <div className="flex items-center gap-1.5 text-semantic-success">
                  <CheckCircle2 className="w-3.5 h-3.5 text-semantic-success" />
                  <span>Lab (₹0 Breakage)</span>
                </div>
                <div className="flex items-center gap-1.5 text-semantic-success">
                  <CheckCircle2 className="w-3.5 h-3.5 text-semantic-success" />
                  <span>Accounts (₹0 Dues)</span>
                </div>
              </div>
            </div>

            {/* Student Legal Details */}
            <div className="space-y-2 text-xs text-ink">
              <div className="flex justify-between border-b border-hairline/60 pb-1.5">
                <span className="text-ink-muted">1. Student Full Name:</span>
                <span className="font-semibold">Aarav Sharma</span>
              </div>
              <div className="flex justify-between border-b border-hairline/60 pb-1.5">
                <span className="text-ink-muted">2. Father&apos;s / Guardian&apos;s Name:</span>
                <span className="font-medium">Sanjay Sharma</span>
              </div>
              <div className="flex justify-between border-b border-hairline/60 pb-1.5">
                <span className="text-ink-muted">3. Admission / Scholar Number:</span>
                <span className="font-mono font-semibold">DPS-2024-042</span>
              </div>
              <div className="flex justify-between border-b border-hairline/60 pb-1.5">
                <span className="text-ink-muted">4. Class in which student last studied:</span>
                <span className="font-semibold">Class 10 (Tenth)</span>
              </div>
              <div className="flex justify-between border-b border-hairline/60 pb-1.5">
                <span className="text-ink-muted">5. School / Board Annual Examination Result:</span>
                <span className="font-semibold text-semantic-success">PASSED (Grade A2)</span>
              </div>
              <div className="flex justify-between border-b border-hairline/60 pb-1.5">
                <span className="text-ink-muted">6. Reason for Leaving School:</span>
                <span>Relocation to another district</span>
              </div>
            </div>

            {/* Digital Verification Seal */}
            <div className="border-t border-hairline pt-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-[10px] text-ink-faint font-mono">
                  SHA-256 Tamper-Evident Verification Hash:
                </div>
                <div className="font-mono text-[9px] text-ink-muted bg-canvas-muted p-1 rounded border border-hairline max-w-xs truncate">
                  e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-ink">Dr. R. K. Mukherjee</div>
                <div className="text-[10px] text-ink-faint">Principal, DPS Ranchi</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
