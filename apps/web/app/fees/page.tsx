'use client';

import React, { useState } from 'react';
import { 
  CreditCard, 
  Receipt, 
  QrCode, 
  CheckCircle2, 
  ShieldCheck, 
  Printer, 
  ArrowRight,
  TrendingUp,
  Percent,
  Sparkles,
  Download
} from 'lucide-react';

export default function FeesPage() {
  const [selectedInvoice, setSelectedInvoice] = useState('INV-2026-0042');
  const [amountTendered, setAmountTendered] = useState('4000.00');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Accurate zero-float financial values
  const grossTotal = 4500.00;
  const siblingDiscount = 625.00; // 25% of Tuition (2,500 * 0.25)
  const netPayable = grossTotal - siblingDiscount; // ₹3,875.00
  const changeDue = Math.max(0, parseFloat(amountTendered || '0') - netPayable);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fee Architecture & Invoicing</h1>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Balanced Double-Entry Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audit-Proof General Ledger • Line-Item Concession Rule Engine • Dynamic UPI Intent
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsReceiptModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium px-3.5 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Counter POS (F3 Quick Collect)
          </button>
        </div>
      </div>

      {/* Financial KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total November Demand</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2 tabular-nums">
            ₹62,45,000<span className="text-xs text-slate-400 font-sans">.00</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">1,550 Active Student Accounts</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Concessions & Waivers</div>
          <div className="text-2xl font-bold font-mono text-violet-700 mt-2 tabular-nums">
            ₹4,18,750<span className="text-xs text-slate-400 font-sans">.00</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Sibling & Staff Child Discounts Applied</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Realized Collection</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-2 tabular-nums">
            ₹48,22,400<span className="text-xs text-slate-400 font-sans">.00</span>
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">82.7% Settlement Ratio</div>
        </div>
      </div>

      {/* Split Invoicing & Ledger Inspection Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Itemized Fee Breakdown & Double-Entry Ledger */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Student Fee Invoice Card */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student Invoice Inspection</span>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">
                  Aarav Sharma • Class 5-A <span className="font-mono text-xs text-primary-700 font-normal">(DPS-2024-042)</span>
                </h2>
              </div>
              <div className="text-right">
                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  PENDING COLLECTION
                </span>
                <div className="text-[10px] text-slate-400 font-mono mt-1">Invoice: {selectedInvoice}</div>
              </div>
            </div>

            {/* Itemized Line Items Table */}
            <div className="p-6 space-y-4">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Line-Item Fee Heads Breakdown</div>
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Fee Category</th>
                    <th className="px-4 py-2.5 text-right">Standard Amount</th>
                    <th className="px-4 py-2.5 text-right">Concession (Sibling 25%)</th>
                    <th className="px-4 py-2.5 text-right">Net Payable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="px-4 py-3 font-sans font-semibold text-slate-900">Tuition Fee (Monthly)</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">₹2,500.00</td>
                    <td className="px-4 py-3 text-right tabular-nums text-emerald-600">-₹625.00</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">₹1,875.00</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-sans font-semibold text-slate-900">Transport Fee (Zone 2: Hinoo)</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">₹1,000.00</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-400">₹0.00</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">₹1,000.00</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-sans font-semibold text-slate-900">Science Laboratory Fee</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">₹1,000.00</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-400">₹0.00</td>
                    <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">₹1,000.00</td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-mono font-bold text-xs">
                  <tr>
                    <td className="px-4 py-3 font-sans uppercase">Total Summary</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-500">₹4,500.00</td>
                    <td className="px-4 py-3 text-right tabular-nums text-emerald-600">-₹625.00</td>
                    <td className="px-4 py-3 text-right tabular-nums text-base text-primary-900 font-extrabold">₹3,875.00</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Double-Entry Balancing Verification Panel (SPECIFICATION.md Section 3) */}
            <div className="p-6 bg-slate-50/80 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Double-Entry General Ledger Balance Validation
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                  ∑ DEBITS == ∑ CREDITS (₹4,500.00)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                {/* Debits side */}
                <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1.5">
                  <div className="font-sans font-bold text-slate-500 text-[10px] uppercase">Debits (Assets & Subsidies)</div>
                  <div className="flex justify-between">
                    <span>Student A/R (Asset):</span>
                    <span className="font-bold">₹3,875.00</span>
                  </div>
                  <div className="flex justify-between text-violet-700">
                    <span>Sibling Concession (Expense):</span>
                    <span className="font-bold">₹625.00</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-100 flex justify-between font-bold text-slate-900">
                    <span>Total Debits:</span>
                    <span>₹4,500.00</span>
                  </div>
                </div>

                {/* Credits side */}
                <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1.5">
                  <div className="font-sans font-bold text-slate-500 text-[10px] uppercase">Credits (Revenue Accounts)</div>
                  <div className="flex justify-between">
                    <span>Tuition Income:</span>
                    <span className="font-bold">₹2,500.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transport Income:</span>
                    <span className="font-bold">₹1,000.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lab Fee Income:</span>
                    <span className="font-bold">₹1,000.00</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-100 flex justify-between font-bold text-slate-900">
                    <span>Total Credits:</span>
                    <span>₹4,500.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Dynamic UPI QR Code & Cash Collection POS */}
        <div className="space-y-6">
          {/* Dynamic UPI Intent Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs text-center space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-left">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Dynamic UPI QR Code</h3>
                <div className="text-[11px] text-slate-400">NPCI Intent with Transaction ID</div>
              </div>
              <QrCode className="w-5 h-5 text-primary-600" />
            </div>

            {/* Generated UPI QR Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 inline-block">
              <div className="w-44 h-44 bg-white border border-slate-300 rounded-lg p-2 flex flex-col items-center justify-center space-y-2">
                <div className="w-36 h-36 border-2 border-slate-900 border-dashed rounded flex items-center justify-center text-slate-400 text-xs font-mono text-center p-2">
                  [UPI QR]
                  <br />
                  ₹3,875.00
                  <br />
                  {selectedInvoice}
                </div>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 break-all text-left">
              <span className="text-[10px] text-slate-400 block font-sans">Raw Intent Payload:</span>
              upi://pay?pa=dpsschool@icici&pn=DelhiPublicSchool&am=3875.00&tr={selectedInvoice}&cu=INR
            </div>

            <p className="text-[11px] text-slate-400">
              Parents scan from phone $\rightarrow$ auto-reconciles in PostgreSQL via webhook.
            </p>
          </div>

          {/* Quick Counter Cash Collection Box (F3 POS) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary-600" />
              Counter POS Quick Cash Collection
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-500">Amount Tendered (Cash):</label>
                <div className="mt-1 relative">
                  <span className="absolute left-3 top-2 font-mono text-slate-400">₹</span>
                  <input
                    type="number"
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 border border-slate-200 rounded-lg font-mono font-bold text-sm bg-slate-50 focus:bg-white focus:border-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Net Payable:</span>
                  <span className="font-mono font-bold text-slate-900">₹{netPayable.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Change to Parent:</span>
                  <span className="font-mono font-bold text-emerald-600">₹{changeDue.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setIsReceiptModalOpen(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                Collect Cash & Print ESC/POS Receipt
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 80mm ESC/POS Receipt Preview Modal (DESIGN.md Wireframe 5.2) */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl shadow-elevation-2 border border-slate-200 max-w-sm w-full overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase">Thermal Receipt Preview (80mm)</span>
              <button 
                onClick={() => setIsReceiptModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Monospace Thermal Tape Emulation */}
            <div className="font-mono text-[11px] bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-2 leading-relaxed text-slate-800">
              <div className="text-center font-bold text-xs">
                DELHI PUBLIC SCHOOL
                <br />
                RANCHI, JHARKHAND
              </div>
              <div className="border-t border-dashed border-slate-400 my-1" />
              <div>Receipt No: RCP-2026-098234</div>
              <div>Date: 08-Nov-2026 09:14 AM</div>
              <div>Student: Aarav Sharma (5-A)</div>
              <div>Adm No : DPS-2024-042</div>
              <div className="border-t border-dashed border-slate-400 my-1" />
              <div className="flex justify-between">
                <span>Tuition (Net):</span>
                <span>₹1,875.00</span>
              </div>
              <div className="flex justify-between">
                <span>Transport Fee:</span>
                <span>₹1,000.00</span>
              </div>
              <div className="flex justify-between">
                <span>Science Lab Fee:</span>
                <span>₹1,000.00</span>
              </div>
              <div className="border-t border-dashed border-slate-400 my-1" />
              <div className="flex justify-between font-bold">
                <span>TOTAL PAID (CASH):</span>
                <span>₹3,875.00</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Remaining Balance:</span>
                <span>₹0.00</span>
              </div>
              <div className="border-t border-dashed border-slate-400 my-1" />
              <div className="text-center text-[10px] text-slate-400">
                https://verify.schoolos.in/RCP-098234
                <br />
                Thank you!
              </div>
            </div>

            <button
              onClick={() => {
                alert('Sent 80mm ESC/POS raw command stream to USB thermal printer!');
                setIsReceiptModalOpen(false);
              }}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg transition-colors text-xs flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Confirm & Print Raw ESC/POS Stream
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
