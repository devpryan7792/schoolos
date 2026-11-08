'use client';

import React, { useState } from 'react';
import {
  FileText,
  CreditCard,
  Lock,
  Unlock,
  Printer,
  Download,
  ShieldCheck,
  QrCode,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

export default function DocumentsPage() {
  const [docType, setDocType] = useState<'id-card' | 'admit-card' | 'tc'>('id-card');
  const [isFeePaid, setIsFeePaid] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Batch Deterministic Document Studio
            </h1>
            <span className="bg-primary-50 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded border border-primary-200 flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3 text-primary-600" /> DOC-24 Vector PDF/SVG
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Deterministic vector generation for CR80 PVC Student ID cards, Fee-Locked Exam Admit Cards, and 3-Way Digital Clearance Transfer Certificates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print Vector Document
          </button>
        </div>
      </div>

      {/* Document Selector Pills */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setDocType('id-card')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
            docType === 'id-card'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          CR80 PVC Student ID Card (85.6 x 53.98mm)
        </button>
        <button
          onClick={() => setDocType('admit-card')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
            docType === 'admit-card'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Fee-Locked Exam Admit Card (Hall Ticket)
        </button>
        <button
          onClick={() => setDocType('tc')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
            docType === 'tc'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          3-Way Digital Clearance Transfer Certificate
        </button>
      </div>

      {/* Document Canvas Container */}
      <div className="bg-slate-100 p-8 rounded-xl border border-slate-200 flex flex-col items-center justify-center min-h-[500px]">
        {/* DOCUMENT 1: CR80 PVC ID Card */}
        {docType === 'id-card' && (
          <div className="space-y-4">
            <div
              id="print-area"
              className="w-[380px] h-[240px] bg-white rounded-xl shadow-lg border border-slate-300 overflow-hidden flex flex-col justify-between p-4 relative"
              style={{ aspectRatio: '85.6 / 53.98' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-primary-900 text-white font-bold text-xs flex items-center justify-center">
                    DPS
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-900 tracking-tight">
                      DELHI PUBLIC SCHOOL
                    </div>
                    <div className="text-[9px] text-slate-500 font-medium">RANCHI • CBSE AFFILIATED</div>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded border border-primary-200">
                  2026-27
                </span>
              </div>

              {/* Body */}
              <div className="flex items-center gap-3.5 my-auto">
                {/* Photo Box */}
                <div className="w-20 h-24 bg-slate-200 rounded border border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-slate-300 mb-1" />
                  <span className="text-[8px] font-mono">PHOTO</span>
                </div>

                {/* Details */}
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-slate-900 text-sm">Aarav Sharma</div>
                  <div className="text-[11px] text-slate-600 font-medium">Class: <strong>10-A</strong> • Roll: <strong>01</strong></div>
                  <div className="text-[11px] text-slate-600 font-mono">Adm: <strong>DPS-2024-042</strong></div>
                  <div className="text-[11px] text-slate-600">Blood Group: <strong className="text-rose-600">O+</strong></div>
                  <div className="text-[10px] text-slate-500 font-mono pt-0.5">Emergency: +91 98765 43210</div>
                </div>
              </div>

              {/* Footer with Barcode */}
              <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                <div className="flex gap-0.5 items-end h-5">
                  {[2, 4, 1, 3, 5, 2, 1, 4, 3, 2, 5, 1, 4, 2, 3, 4, 1, 2].map((h, i) => (
                    <div key={i} className="bg-slate-800 w-[2px]" style={{ height: `${h * 4}px` }} />
                  ))}
                </div>
                <span>DPS-2024-042</span>
                <span className="text-[8px]">Principal Signature</span>
              </div>
            </div>

            <div className="text-center text-xs text-slate-500 font-mono">
              Dimension: ISO/IEC 7810 ID-1 standard (85.60 mm × 53.98 mm)
            </div>
          </div>
        )}

        {/* DOCUMENT 2: Fee-Locked Admit Card */}
        {docType === 'admit-card' && (
          <div className="space-y-4 max-w-xl w-full">
            {/* Simulation Toggle */}
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Simulate Counter Fee Clearance:</span>
              <button
                onClick={() => setIsFeePaid(!isFeePaid)}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                  isFeePaid
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-emerald-600 text-white shadow-sm'
                }`}
              >
                {isFeePaid ? 'Simulate Revert to Dues Pending' : 'Clear Dues (Pay ₹4,200)'}
              </button>
            </div>

            {/* Admit Card Paper */}
            <div
              id="print-area"
              className={`bg-white rounded-lg shadow-xl border p-6 space-y-4 transition-all ${
                !isFeePaid ? 'border-rose-400 ring-2 ring-rose-200' : 'border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">CBSE ANNUAL BOARD EXAMINATION 2026-27</h3>
                  <div className="text-xs text-slate-500">Official Candidate Admit Card / Hall Ticket</div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-1 rounded border border-slate-200">
                    DPS-2024-042
                  </span>
                </div>
              </div>

              {!isFeePaid ? (
                // Fee-Locked Red Warning Shield
                <div className="bg-rose-50 border-2 border-dashed border-rose-300 rounded-lg p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-rose-900">
                      HALL TICKET WITHHELD: PENDING ARREARS
                    </div>
                    <div className="text-xs text-rose-700 mt-1 max-w-md mx-auto">
                      Per CBSE Rule 14.2, admit cards cannot be issued while term dues are outstanding.
                      Outstanding Amount: <strong className="font-mono text-sm">₹4,200.00</strong>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="inline-block p-3 bg-white rounded-lg border border-rose-200 shadow-sm text-center">
                      <QrCode className="w-20 h-20 mx-auto text-slate-900" />
                      <div className="text-[10px] font-mono text-slate-500 mt-1">Scan UPI QR to Unlock</div>
                    </div>
                  </div>
                </div>
              ) : (
                // Unlocked Examination Hall Ticket
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 flex items-center justify-between text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <Unlock className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold">FEES CLEARED • ADMIT CARD VALIDATED</span>
                    </div>
                    <span className="font-mono text-emerald-700 font-semibold">Receipt: REC-2026-9901</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="text-slate-500">Candidate Name:</div>
                      <div className="font-bold text-slate-900">Aarav Sharma</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Class & Roll:</div>
                      <div className="font-bold text-slate-900">Class 10-A (Roll 01)</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Examination Center:</div>
                      <div className="font-bold text-slate-900">DPS Ranchi Campus (Center Code: 34102)</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Center Superintendent Seal:</div>
                      <div className="font-mono text-emerald-700 font-bold">DIGITALLY VERIFIED</div>
                    </div>
                  </div>

                  {/* Exam Schedule */}
                  <div className="border border-slate-200 rounded overflow-hidden text-xs">
                    <table className="w-full text-left font-mono">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px]">
                        <tr>
                          <th className="p-2">Date</th>
                          <th className="p-2">Subject Code & Name</th>
                          <th className="p-2">Time</th>
                          <th className="p-2 text-right">Room</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        <tr>
                          <td className="p-2">15-Feb-2027</td>
                          <td className="p-2 font-sans font-medium">041 Mathematics</td>
                          <td className="p-2">10:30 AM - 01:30 PM</td>
                          <td className="p-2 text-right font-bold">Hall A</td>
                        </tr>
                        <tr>
                          <td className="p-2">18-Feb-2027</td>
                          <td className="p-2 font-sans font-medium">086 Science (Theory)</td>
                          <td className="p-2">10:30 AM - 01:30 PM</td>
                          <td className="p-2 text-right font-bold">Hall A</td>
                        </tr>
                        <tr>
                          <td className="p-2">22-Feb-2027</td>
                          <td className="p-2 font-sans font-medium">184 English Language</td>
                          <td className="p-2">10:30 AM - 01:30 PM</td>
                          <td className="p-2 text-right font-bold">Hall B</td>
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
          <div className="max-w-xl w-full bg-white rounded-lg shadow-xl border border-slate-300 p-8 space-y-5">
            <div className="text-center border-b-2 border-slate-900 pb-4">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight uppercase">
                Delhi Public School, Ranchi
              </h2>
              <div className="text-xs text-slate-600">CBSE Affiliation No: 3430042 • School Code: 08129</div>
              <div className="text-sm font-bold text-primary-900 mt-2 uppercase tracking-wider underline">
                School Leaving / Transfer Certificate (स्थानांतरण प्रमाण पत्र)
              </div>
            </div>

            {/* 3-Way Clearance Gate Checklist */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-2 text-xs">
              <div className="font-bold text-slate-800 flex items-center justify-between">
                <span>3-Way Digital Department Clearance Status:</span>
                <span className="text-emerald-700 font-mono font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px]">
                  ALL CLEARED
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono pt-1">
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Library (0 Books)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Lab (₹0 Breakage)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Accounts (₹0 Dues)</span>
                </div>
              </div>
            </div>

            {/* Student Legal Details */}
            <div className="space-y-2.5 text-xs text-slate-800">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">1. Student Full Name:</span>
                <span className="font-bold">Aarav Sharma</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">2. Father's / Guardian's Name:</span>
                <span className="font-semibold">Sanjay Sharma</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">3. Admission / Scholar Number:</span>
                <span className="font-mono font-bold">DPS-2024-042</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">4. Class in which student last studied:</span>
                <span className="font-bold">Class 10 (Tenth)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">5. School / Board Annual Examination Result:</span>
                <span className="font-bold text-emerald-700">PASSED (Grade A2)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">6. Reason for Leaving School:</span>
                <span>Relocation to another district</span>
              </div>
            </div>

            {/* Digital Verification Seal */}
            <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 font-mono">
                  SHA-256 Tamper-Evident Verification Seal:
                </div>
                <div className="font-mono text-[9px] text-slate-600 bg-slate-100 p-1 rounded">
                  e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-900">Dr. R. K. Mukherjee</div>
                <div className="text-[10px] text-slate-500">Principal, DPS Ranchi</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
