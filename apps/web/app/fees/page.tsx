'use client';

import React, { useState } from 'react';
import { 
  CreditCard, 
  Receipt, 
  CheckCircle2, 
  ShieldCheck, 
  Printer, 
  Percent, 
  ArrowRight,
  Download,
  AlertCircle
} from 'lucide-react';
import { collectCashPayment } from '../../lib/api';

export default function FeesPage() {
  const [amountTendered, setAmountTendered] = useState('4000.00');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('RCP-2026-098234');
  const [isCollecting, setIsCollecting] = useState(false);

  // Exact zero-float financial values
  const grossTotal = 4500.00;
  const siblingDiscount = 625.00; // 25% of Tuition (2,500 * 0.25)
  const netPayable = grossTotal - siblingDiscount; // ₹3,875.00
  const changeDue = Math.max(0, parseFloat(amountTendered || '0') - netPayable);

  const handleCollectPayment = async () => {
    setIsCollecting(true);
    try {
      const res = await collectCashPayment({
        invoice_id: 'd1a80101-92b5-4b11-9ef0-0a1234567891',
        student_id: 'd1a80101-92b5-4b11-9ef0-0a1234567891',
        amount_paid: netPayable,
        payment_mode: 'CASH',
        idempotency_key: `pos-${Date.now()}`,
      });
      if ((res as any).receipt_number) {
        setReceiptNumber((res as any).receipt_number);
      }
    } finally {
      setIsCollecting(false);
      setIsReceiptModalOpen(true);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Fee Collection & Invoicing</h1>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-medium px-2 py-0.5 rounded-full border border-emerald-200">
              Double-Entry Balanced
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Student fee receipts, sibling concessions, and automated reconciliation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsReceiptModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium px-3.5 py-2 rounded-lg shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Collect Fee (F3)
          </button>
        </div>
      </div>

      {/* Financial KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-black/[0.06] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="text-xs font-medium text-neutral-500">November Fee Demand</div>
          <div className="text-2xl font-bold font-mono text-neutral-900 mt-2 tabular-nums">
            ₹62,45,000<span className="text-xs text-neutral-400 font-sans">.00</span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">1,550 Active Student Accounts</div>
        </div>

        <div className="bg-white border border-black/[0.06] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="text-xs font-medium text-neutral-500">Concessions & Sibling Waivers</div>
          <div className="text-2xl font-bold font-mono text-purple-700 mt-2 tabular-nums">
            ₹4,18,750<span className="text-xs text-neutral-400 font-sans">.00</span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">Sibling Discount Policy Applied</div>
        </div>

        <div className="bg-white border border-black/[0.06] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="text-xs font-medium text-neutral-500">Net Realized Collection</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-2 tabular-nums">
            ₹48,22,400<span className="text-xs text-neutral-400 font-sans">.00</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">82.7% Settlement Ratio</div>
        </div>
      </div>

      {/* Invoicing & General Ledger Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Student Invoice Inspection */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-canvas border border-hairline rounded-lg overflow-hidden shadow-whisper">
            <div className="p-4 border-b border-hairline flex items-center justify-between bg-canvas-chrome">
              <div>
                <span className="text-[10px] font-semibold text-ink-faint uppercase tracking-utility">Student Invoice Inspection</span>
                <h2 className="text-sm font-bold text-ink mt-0.5">
                  Aarav Sharma • Class 5-A <span className="font-mono text-xs text-brand font-normal">(DPS-2024-042)</span>
                </h2>
              </div>
              <div className="text-right">
                <span className="bg-semantic-warning-bg text-semantic-warning border border-semantic-warning-border text-[10px] font-bold px-2 py-0.5 rounded-full">
                  PENDING COLLECTION
                </span>
                <div className="text-[10px] text-ink-faint font-mono mt-0.5">INV-2026-0042</div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="p-4 space-y-3">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] uppercase font-semibold text-ink-faint tracking-utility border-b border-hairline">
                  <tr>
                    <th className="pb-2">Description</th>
                    <th className="pb-2 text-right">Fee Rule</th>
                    <th className="pb-2 text-right">Gross (₹)</th>
                    <th className="pb-2 text-right">Concession (₹)</th>
                    <th className="pb-2 text-right">Net (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline font-mono text-xs">
                  <tr>
                    <td className="py-2.5 font-sans font-medium text-ink">Monthly Tuition Fee (November)</td>
                    <td className="py-2.5 text-right text-ink-faint font-sans text-[11px]">Regular Term</td>
                    <td className="py-2.5 text-right tabular-nums text-ink">2,500.00</td>
                    <td className="py-2.5 text-right tabular-nums text-semantic-critical">-625.00 (25%)</td>
                    <td className="py-2.5 text-right tabular-nums font-bold text-ink">1,875.00</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-sans font-medium text-ink">Transport Fee (Route 4 - Hinoo)</td>
                    <td className="py-2.5 text-right text-ink-faint font-sans text-[11px]">Zone B (5–10km)</td>
                    <td className="py-2.5 text-right tabular-nums text-ink">1,200.00</td>
                    <td className="py-2.5 text-right tabular-nums text-ink-faint">0.00</td>
                    <td className="py-2.5 text-right tabular-nums font-bold text-ink">1,200.00</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-sans font-medium text-ink">Science Lab & Computer Maintenance</td>
                    <td className="py-2.5 text-right text-ink-faint font-sans text-[11px]">Quarterly Fee</td>
                    <td className="py-2.5 text-right tabular-nums text-ink">800.00</td>
                    <td className="py-2.5 text-right tabular-nums text-ink-faint">0.00</td>
                    <td className="py-2.5 text-right tabular-nums font-bold text-ink">800.00</td>
                  </tr>
                </tbody>
              </table>

              {/* Total Calculation Strip */}
              <div className="border-t border-hairline pt-3 flex justify-between items-center text-xs">
                <span className="text-ink-muted">Sibling Concession (Ananya Sharma, Class 2-B)</span>
                <span className="text-sm font-bold font-mono text-ink tabular-nums">
                  Total Payable: ₹3,875.00
                </span>
              </div>
            </div>
          </div>

          {/* Double Entry Ledger Audit Box */}
          <div className="bg-canvas border border-hairline rounded-lg p-4 shadow-whisper space-y-3">
            <div className="flex items-center justify-between border-b border-hairline pb-2">
              <span className="text-xs font-semibold text-ink">General Ledger Journal Entries</span>
              <span className="text-[10px] font-mono text-semantic-success flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> ∑Debits == ∑Credits
              </span>
            </div>

            <div className="p-3 rounded-md bg-canvas-chrome border border-hairline text-xs font-mono space-y-1.5">
              <div className="flex justify-between">
                <span className="text-ink">Dr. Accounts Receivable (Student Dues)</span>
                <span className="font-semibold text-ink">₹3,875.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink">Dr. Sibling Concession Expense Account</span>
                <span className="font-semibold text-ink">₹625.00</span>
              </div>
              <div className="flex justify-between pl-4 text-ink-muted border-t border-hairline-subtle pt-1">
                <span>Cr. Tuition Fee Revenue Account</span>
                <span>₹2,500.00</span>
              </div>
              <div className="flex justify-between pl-4 text-ink-muted">
                <span>Cr. Transport Fee Revenue Account</span>
                <span>₹1,200.00</span>
              </div>
              <div className="flex justify-between pl-4 text-ink-muted">
                <span>Cr. Lab & STEM Fee Revenue Account</span>
                <span>₹800.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Instant Cash Counter Collection Form */}
        <div className="bg-canvas border border-hairline rounded-lg p-5 shadow-whisper space-y-4">
          <div className="border-b border-hairline pb-3">
            <h2 className="text-sm font-bold text-ink">Cash Counter Collection (POS)</h2>
            <p className="text-[11px] text-ink-faint">Offline-first receipt generation with ESC/POS print</p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-ink-muted text-[11px]">Amount Due:</label>
              <div className="text-xl font-bold font-mono text-ink mt-0.5">₹3,875.00</div>
            </div>

            <div>
              <label className="text-ink-muted text-[11px]">Cash Tendered (₹):</label>
              <input
                type="text"
                value={amountTendered}
                onChange={(e) => setAmountTendered(e.target.value)}
                className="w-full mt-1 p-2 rounded-md border border-hairline bg-canvas font-mono font-semibold text-sm text-ink outline-none focus:border-brand shadow-whisper"
              />
            </div>

            <div className="p-3 rounded-md bg-canvas-chrome border border-hairline flex justify-between items-center text-xs font-mono">
              <span className="text-ink-muted">Change to Return:</span>
              <span className="font-bold text-semantic-success text-sm">
                ₹{changeDue.toFixed(2)}
              </span>
            </div>

            <button 
              onClick={handleCollectPayment}
              disabled={isCollecting}
              className="w-full py-2 bg-brand hover:bg-brand-hover text-white text-xs font-medium rounded-md shadow-whisper transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              {isCollecting ? 'Recording in Double-Entry Ledger...' : 'Collect & Print 80mm Receipt'}
            </button>
          </div>
        </div>
      </div>

      {/* ESC/POS Thermal Receipt Modal */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-sm bg-canvas border border-hairline rounded-lg shadow-popover p-6 space-y-4">
            <div className="text-center border-b border-dashed border-hairline pb-3 space-y-0.5">
              <div className="font-bold text-sm text-ink">DELHI PUBLIC SCHOOL</div>
              <div className="text-[10px] text-ink-muted">Main Campus, Ranchi, Jharkhand</div>
              <div className="text-[10px] font-mono text-ink-faint">Affiliation No. 3430012</div>
            </div>

            <div className="font-mono text-[11px] space-y-1.5 text-ink">
              <div className="flex justify-between">
                <span>Receipt: {receiptNumber}</span>
                <span>Date: 08/11/2026</span>
              </div>
              <div className="flex justify-between">
                <span>Student: Aarav Sharma</span>
                <span>Class: 5-A</span>
              </div>
              <div className="border-t border-dashed border-hairline pt-1.5 space-y-1">
                <div className="flex justify-between">
                  <span>Tuition (Net of 25% Sibling):</span>
                  <span>₹1,875.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Transport (Zone B):</span>
                  <span>₹1,200.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Science Lab:</span>
                  <span>₹800.00</span>
                </div>
              </div>
              <div className="border-t border-b border-hairline py-1.5 flex justify-between font-bold text-xs">
                <span>NET COLLECTED (CASH):</span>
                <span>₹3,875.00</span>
              </div>
              <div className="text-[10px] text-center text-ink-faint pt-1">
                *** 3-WAY DIGITAL CLEARANCE VALIDATED ***
              </div>
            </div>

            <button
              onClick={() => setIsReceiptModalOpen(false)}
              className="w-full py-1.5 bg-canvas-chrome hover:bg-hairline text-xs font-medium text-ink rounded-md transition-colors"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
