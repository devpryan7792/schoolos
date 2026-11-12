'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Smartphone,
  Clock,
  TrendingDown,
  CheckCircle2,
  QrCode,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { dispatchNotification } from '../../lib/api';

interface DunningStudent {
  id: string;
  name: string;
  admissionNo: string;
  className: string;
  amountDue: string;
  daysOverdue: number;
  guardianName: string;
  guardianPhone: string;
  hasApp: boolean;
  pushToken: boolean;
}

const mockDunningStages = [
  {
    stage: '1. Upcoming (T-5)',
    description: 'Advance notice 5 days before due date',
    tier: 'Tier 1 Native Push (₹0.00)',
    tierType: 'push' as const,
    students: [
      { id: '1', name: 'Ishaan Roy', admissionNo: 'DPS-2025-019', className: 'Class 4-B', amountDue: '₹3,500.00', daysOverdue: -5, guardianName: 'Mr. P. Roy', guardianPhone: '+919876500001', hasApp: true, pushToken: true },
    ],
  },
  {
    stage: '2. Due Date (T-0)',
    description: 'Friendly notification on the exact due date',
    tier: 'Tier 1 Native Push (₹0.00)',
    tierType: 'push' as const,
    students: [
      { id: '2', name: 'Tanvi Sen', admissionNo: 'DPS-2024-088', className: 'Class 7-A', amountDue: '₹4,100.00', daysOverdue: 0, guardianName: 'Mrs. K. Sen', guardianPhone: '+919876500002', hasApp: true, pushToken: true },
    ],
  },
  {
    stage: '3. Grace Period (T+5)',
    description: 'Polite reminder with late fine waiver cut-off',
    tier: 'Tier 1 Push / WhatsApp (₹0.00 - ₹0.40)',
    tierType: 'hybrid' as const,
    students: [
      { id: '3', name: 'Aarav Sharma', admissionNo: 'DPS-2024-042', className: 'Class 5-A', amountDue: '₹4,200.00', daysOverdue: 6, guardianName: 'Mr. S. Sharma', guardianPhone: '+919876543210', hasApp: false, pushToken: false },
      { id: '4', name: 'Ananya Verma', admissionNo: 'DPS-2025-110', className: 'Class 3-A', amountDue: '₹3,200.00', daysOverdue: 7, guardianName: 'Mr. R. Verma', guardianPhone: '+919876500004', hasApp: true, pushToken: true },
    ],
  },
  {
    stage: '4. Defaulter 1 (T+15)',
    description: 'WhatsApp Interactive with direct UPI payment button',
    tier: 'Tier 2 WhatsApp (₹0.40)',
    tierType: 'whatsapp' as const,
    students: [
      { id: '5', name: 'Vikram Singh', admissionNo: 'DPS-2023-014', className: 'Class 9-B', amountDue: '₹5,800.00', daysOverdue: 18, guardianName: 'Mr. B. Singh', guardianPhone: '+919876500005', hasApp: false, pushToken: false },
    ],
  },
  {
    stage: '5. Defaulter 2 (T+30)',
    description: 'Bus transportation suspension warning',
    tier: 'Tier 2 WhatsApp / Call (₹0.40)',
    tierType: 'whatsapp' as const,
    students: [
      { id: '6', name: 'Rohan Mehra', admissionNo: 'DPS-2022-091', className: 'Class 10-A', amountDue: '₹8,400.00', daysOverdue: 34, guardianName: 'Mr. D. Mehra', guardianPhone: '+919876500006', hasApp: false, pushToken: false },
    ],
  },
  {
    stage: '6. Final Demand (T+45)',
    description: 'Formal school administration demand notice',
    tier: 'Tier 3 Registered SMS (₹0.15)',
    tierType: 'sms' as const,
    students: [
      { id: '7', name: 'Karan Malhotra', admissionNo: 'DPS-2021-002', className: 'Class 12-Science', amountDue: '₹12,600.00', daysOverdue: 49, guardianName: 'Mrs. S. Malhotra', guardianPhone: '+919876500007', hasApp: false, pushToken: false },
    ],
  },
  {
    stage: '7. Legal Notice (T+60)',
    description: 'Transfer Certificate & admit card withholding',
    tier: 'Executive Physical Letter',
    tierType: 'letter' as const,
    students: [],
  },
];

export default function CommunicationsPage() {
  const [selectedStudent, setSelectedStudent] = useState<DunningStudent>(mockDunningStages[2].students[0]);
  const [isSimulatingDispatch, setIsSimulatingDispatch] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<string | null>(null);

  const handleSimulateDispatch = async () => {
    setIsSimulatingDispatch(true);
    setDispatchResult(null);

    try {
      const res = await dispatchNotification({
        student_id: selectedStudent.id,
        recipient_phone: selectedStudent.guardianPhone,
        amount_due: selectedStudent.amountDue,
        tier: selectedStudent.pushToken ? 'TIER_1_PUSH' : 'TIER_2_WHATSAPP',
        has_app: selectedStudent.hasApp,
      });

      if (selectedStudent.pushToken) {
        setDispatchResult(`Dispatched via Tier 1 Native Push (Cost: ${res.cost || '₹0.00'} • Saved ₹0.15)`);
      } else {
        setDispatchResult(`Dispatched via Tier 2 WhatsApp Interactive (Cost: ${res.cost || '₹0.40'} • Meta Cloud Delivery OK)`);
      }
    } finally {
      setIsSimulatingDispatch(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Notion Quiet Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-hairline pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-canvas-muted border border-hairline flex items-center justify-center text-ink-muted">
              <MessageSquare className="w-4 h-4 text-ink" />
            </div>
            <div>
              <h1 className="text-xl font-semibold -tracking-[0.02em] text-ink">
                Fee Reminders & Automated Communications
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-mono uppercase tracking-[0.06em] text-ink-faint">
                  Cost-Optimal Cascade
                </span>
                <span className="text-hairline-dark">•</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-1.5 py-0.2 rounded bg-semantic-highlight-light text-semantic-highlight border border-semantic-highlight/20">
                  <Sparkles className="w-2.5 h-2.5" /> Multi-Channel Delivery
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-semantic-success-light text-semantic-success border border-semantic-success/20 text-xs font-mono font-medium">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>₹276.30 Saved This Month via Push First</span>
          </div>
        </div>
      </div>

      {/* Personio 3-Tier Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-surface p-4 rounded-lg border border-hairline shadow-whisper flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-semantic-success flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-semantic-success" />
              Tier 1 • Native Push
            </span>
            <span className="text-[11px] font-mono text-ink-muted">₹0.00 / msg</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold -tracking-[0.02em] text-ink font-mono tabular-nums">
              1,842
            </div>
            <div className="text-xs text-ink-faint mt-0.5">
              FCM / APNs direct app notification • 100% Free
            </div>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-lg border border-hairline shadow-whisper flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-semantic-highlight flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-semantic-highlight" />
              Tier 2 • WhatsApp Cloud
            </span>
            <span className="text-[11px] font-mono text-ink-muted">₹0.40 / msg</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold -tracking-[0.02em] text-ink font-mono tabular-nums">
              420
            </div>
            <div className="text-xs text-ink-faint mt-0.5">
              Interactive templates + Dynamic UPI intent buttons
            </div>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-lg border border-hairline shadow-whisper flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-ink-faint" />
              Tier 3 • Telecom SMS
            </span>
            <span className="text-[11px] font-mono text-ink-muted">₹0.15 / msg</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold -tracking-[0.02em] text-ink font-mono tabular-nums">
              64
            </div>
            <div className="text-xs text-ink-faint mt-0.5">
              DLT-compliant template fallback for urgent broadcast
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Dunning Stages on Left, WhatsApp Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kanban Board (2 columns wide) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-ink-muted" />
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                7-Stage Fee Dunning Pipeline
              </h2>
            </div>
            <span className="text-xs font-mono text-ink-faint">
              7 Active Recovery Cases
            </span>
          </div>

          <div className="space-y-2.5">
            {mockDunningStages.map((stg) => (
              <div
                key={stg.stage}
                className="bg-surface rounded-lg border border-hairline p-3.5 shadow-whisper"
              >
                <div className="flex items-center justify-between border-b border-hairline/60 pb-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-ink tracking-tight">
                      {stg.stage}
                    </span>
                    <span className="text-[11px] text-ink-faint hidden sm:inline">
                      — {stg.description}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-canvas-muted text-ink-muted border border-hairline">
                    {stg.tier}
                  </span>
                </div>

                {stg.students.length === 0 ? (
                  <div className="text-xs text-ink-faint italic py-1 pl-1">
                    No active students in this stage (All cleared)
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {stg.students.map((std) => {
                      const isSelected = selectedStudent.id === std.id;
                      return (
                        <div
                          key={std.id}
                          onClick={() => setSelectedStudent(std)}
                          className={`p-2.5 rounded-md border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'border-ink bg-canvas shadow-whisper ring-1 ring-ink'
                              : 'border-hairline hover:border-hairline-dark bg-canvas-subtle/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-ink">{std.name}</span>
                            <span className="font-mono font-semibold text-semantic-critical tabular-nums">
                              {std.amountDue}
                            </span>
                          </div>
                          <div className="text-[11px] text-ink-faint mt-1 flex items-center justify-between">
                            <span>{std.className} • <span className="font-mono">{std.admissionNo}</span></span>
                            <span className="font-mono text-[10px] font-medium">
                              {std.daysOverdue > 0 ? (
                                <span className="text-semantic-critical">+{std.daysOverdue}d overdue</span>
                              ) : std.daysOverdue === 0 ? (
                                <span className="text-semantic-warning">Due today</span>
                              ) : (
                                <span className="text-semantic-success">{Math.abs(std.daysOverdue)}d left</span>
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp & Push Live Preview Device (1 column wide) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-semantic-success" />
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
              WhatsApp Notification Preview
            </h2>
          </div>

          <div className="bg-[#111B21] text-white rounded-xl p-4 shadow-whisper border border-slate-800 space-y-3">
            {/* WhatsApp Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#00A884] flex items-center justify-center font-bold text-white text-xs shadow-sm">
                  DPS
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-100 flex items-center gap-1">
                    DPS Ranchi Accounts
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00A884]" />
                  </div>
                  <div className="text-[10px] text-[#00A884] font-mono">Official Cloud API (Verified)</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Hinglish Bot</span>
            </div>

            {/* Message Bubble */}
            <div className="bg-[#202C33] rounded-lg p-3 text-xs text-slate-200 space-y-2 border border-slate-700/60 shadow-sm">
              <div className="font-semibold text-slate-100">
                Namaste {selectedStudent.guardianName},
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                This is an automated communication from Delhi Public School, Ranchi regarding student{' '}
                <strong className="text-white">{selectedStudent.name}</strong> ({selectedStudent.className}, Adm: <span className="font-mono text-slate-200">{selectedStudent.admissionNo}</span>).
              </p>
              <div className="bg-[#111B21] p-2.5 rounded border border-slate-700 font-mono text-[11px] space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Tuition & Transport Dues:</span>
                  <span className="font-semibold text-white tabular-nums">{selectedStudent.amountDue}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Due Status:</span>
                  <span className="text-semantic-warning font-sans">
                    {selectedStudent.daysOverdue > 0 ? `${selectedStudent.daysOverdue} Days Past Due` : 'Due Date Approaching'}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Tap the secure button below to clear dues instantly via UPI with zero convenience fees:
              </p>

              {/* Dynamic Interactive WhatsApp Buttons */}
              <div className="pt-1.5 space-y-1.5">
                <a
                  href={`upi://pay?pa=school@icici&pn=DPS%20Ranchi&am=${selectedStudent.amountDue.replace(/[^0-9.]/g, '')}&cu=INR`}
                  className="w-full py-2 bg-[#00A884] hover:bg-[#029272] text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5" /> Pay {selectedStudent.amountDue} via UPI
                </a>
                <button
                  type="button"
                  className="w-full py-1.5 bg-[#2A3942] hover:bg-[#32444f] text-slate-300 rounded text-[11px] font-medium text-center transition-colors"
                >
                  View Itemized Fee Breakdown
                </button>
              </div>
            </div>

            {/* Dispatch Action */}
            <div className="pt-1 space-y-2">
              <button
                onClick={handleSimulateDispatch}
                disabled={isSimulatingDispatch}
                className="w-full py-2 bg-ink hover:bg-ink-muted text-white rounded-md text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isSimulatingDispatch ? 'Simulating Tier 1-3 Dispatch Engine...' : 'Trigger Tiered Automated Dispatch'}
              </button>

              {dispatchResult && (
                <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/80 rounded-md text-[11px] text-emerald-300 font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{dispatchResult}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
