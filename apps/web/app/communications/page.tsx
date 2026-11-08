'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  ShieldCheck,
  Smartphone,
  PhoneCall,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  DollarSign,
  QrCode,
  Users
} from 'lucide-react';

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
    students: [
      { id: '1', name: 'Ishaan Roy', admissionNo: 'DPS-2025-019', className: 'Class 4-B', amountDue: '₹3,500.00', daysOverdue: -5, guardianName: 'Mr. P. Roy', guardianPhone: '+919876500001', hasApp: true, pushToken: true },
    ],
  },
  {
    stage: '2. Due Date (T-0)',
    description: 'Friendly notification on the exact due date',
    tier: 'Tier 1 Native Push (₹0.00)',
    students: [
      { id: '2', name: 'Tanvi Sen', admissionNo: 'DPS-2024-088', className: 'Class 7-A', amountDue: '₹4,100.00', daysOverdue: 0, guardianName: 'Mrs. K. Sen', guardianPhone: '+919876500002', hasApp: true, pushToken: true },
    ],
  },
  {
    stage: '3. Grace Period (T+5)',
    description: 'Polite reminder with late fine waiver cut-off',
    tier: 'Tier 1 Push / WhatsApp (₹0.00 - ₹0.40)',
    students: [
      { id: '3', name: 'Aarav Sharma', admissionNo: 'DPS-2024-042', className: 'Class 5-A', amountDue: '₹4,200.00', daysOverdue: 6, guardianName: 'Mr. S. Sharma', guardianPhone: '+919876543210', hasApp: false, pushToken: false },
      { id: '4', name: 'Ananya Verma', admissionNo: 'DPS-2025-110', className: 'Class 3-A', amountDue: '₹3,200.00', daysOverdue: 7, guardianName: 'Mr. R. Verma', guardianPhone: '+919876500004', hasApp: true, pushToken: true },
    ],
  },
  {
    stage: '4. Defaulter 1 (T+15)',
    description: 'WhatsApp Interactive with direct UPI payment button',
    tier: 'Tier 2 WhatsApp (₹0.40)',
    students: [
      { id: '5', name: 'Vikram Singh', admissionNo: 'DPS-2023-014', className: 'Class 9-B', amountDue: '₹5,800.00', daysOverdue: 18, guardianName: 'Mr. B. Singh', guardianPhone: '+919876500005', hasApp: false, pushToken: false },
    ],
  },
  {
    stage: '5. Defaulter 2 (T+30)',
    description: 'Bus transportation suspension warning',
    tier: 'Tier 2 WhatsApp / Call (₹0.40)',
    students: [
      { id: '6', name: 'Rohan Mehra', admissionNo: 'DPS-2022-091', className: 'Class 10-A', amountDue: '₹8,400.00', daysOverdue: 34, guardianName: 'Mr. D. Mehra', guardianPhone: '+919876500006', hasApp: false, pushToken: false },
    ],
  },
  {
    stage: '6. Final Demand (T+45)',
    description: 'Formal school administration demand notice',
    tier: 'Tier 3 Registered SMS (₹0.15)',
    students: [
      { id: '7', name: 'Karan Malhotra', admissionNo: 'DPS-2021-002', className: 'Class 12-Science', amountDue: '₹12,600.00', daysOverdue: 49, guardianName: 'Mrs. S. Malhotra', guardianPhone: '+919876500007', hasApp: false, pushToken: false },
    ],
  },
  {
    stage: '7. Legal Notice (T+60)',
    description: 'Transfer Certificate & admit card withholding',
    tier: 'Executive Physical Letter',
    students: [],
  },
];

export default function CommunicationsPage() {
  const [selectedStudent, setSelectedStudent] = useState<DunningStudent>(mockDunningStages[2].students[0]);
  const [isSimulatingDispatch, setIsSimulatingDispatch] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<string | null>(null);

  const handleSimulateDispatch = (tier: string) => {
    setIsSimulatingDispatch(true);
    setDispatchResult(null);

    setTimeout(() => {
      setIsSimulatingDispatch(false);
      if (selectedStudent.pushToken) {
        setDispatchResult('Dispatched via Tier 1 Native Push (Cost: ₹0.00 • Saved ₹0.15)');
      } else {
        setDispatchResult('Dispatched via Tier 2 WhatsApp Interactive (Cost: ₹0.40 • Delivered to Meta API)');
      }
    }, 500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Autonomous Fee Dunning & Communications Hub
            </h1>
            <span className="bg-primary-50 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded border border-primary-200 flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3 text-primary-600" /> AGENT-30 / NOTIF-27
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Zero-cost Push First delivery (Invariant 5) with progressive WhatsApp AI dunning and dynamic UPI payment links.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" /> ₹276.30 Saved This Month via Push
          </div>
        </div>
      </div>

      {/* Tiered Cost Architecture KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Tier 1: Native Push First
            </span>
            <span className="text-xs font-mono font-bold text-emerald-600">₹0.00 / msg</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-3 font-mono">1,842 Messages</div>
          <div className="text-xs text-slate-500 mt-1">
            FCM / APNs direct app notification • 100% Zero Cost
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
              Tier 2: WhatsApp Meta Cloud
            </span>
            <span className="text-xs font-mono font-bold text-primary-600">₹0.40 / msg</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-3 font-mono">420 Messages</div>
          <div className="text-xs text-slate-500 mt-1">
            Rich interactive templates + dynamic UPI buttons
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Tier 3: Telecom SMS
            </span>
            <span className="text-xs font-mono font-bold text-slate-600">₹0.15 / msg</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-3 font-mono">64 Messages</div>
          <div className="text-xs text-slate-500 mt-1">
            DLT-compliant template fallback for weather/emergency
          </div>
        </div>
      </div>

      {/* Main Grid: Dunning Stages on Left, WhatsApp Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kanban Board (2 columns wide) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary-600" /> 7-Stage Fee Dunning Pipeline
            </h2>
            <span className="text-xs text-slate-500">7 Active Cases Tracked</span>
          </div>

          <div className="space-y-3">
            {mockDunningStages.map((stg) => (
              <div
                key={stg.stage}
                className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <div>
                    <span className="font-bold text-xs text-slate-900">{stg.stage}</span>
                    <span className="text-[11px] text-slate-500 ml-2">{stg.description}</span>
                  </div>
                  <span className="text-[10px] font-mono text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                    {stg.tier}
                  </span>
                </div>

                {stg.students.length === 0 ? (
                  <div className="text-xs text-slate-400 italic py-1">No students in this tier</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {stg.students.map((std) => (
                      <div
                        key={std.id}
                        onClick={() => setSelectedStudent(std)}
                        className={`p-3 rounded-md border text-xs cursor-pointer transition-all ${
                          selectedStudent.id === std.id
                            ? 'border-primary-500 bg-primary-50/50 shadow-sm ring-1 ring-primary-500'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{std.name}</span>
                          <span className="font-mono font-bold text-rose-600">{std.amountDue}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                          <span>{std.className} • {std.admissionNo}</span>
                          <span className="font-mono">
                            {std.daysOverdue > 0 ? `+${std.daysOverdue}d late` : `${std.daysOverdue}d left`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp & Push Live Preview Device (1 column wide) */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-emerald-600" /> WhatsApp Copilot Simulation
          </h2>

          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white text-xs">
                  WA
                </div>
                <div>
                  <div className="text-xs font-bold">DPS Ranchi Accounts Bot</div>
                  <div className="text-[10px] text-emerald-400">Official Meta Cloud API</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Verified</span>
            </div>

            {/* Message Bubble */}
            <div className="bg-slate-800 rounded-lg p-3.5 text-xs text-slate-200 space-y-2 border border-slate-700">
              <div className="font-semibold text-white">
                Namaste {selectedStudent.guardianName},
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                This is a gentle reminder from Delhi Public School, Ranchi regarding{' '}
                <strong className="text-white">{selectedStudent.name}</strong> ({selectedStudent.className}, Adm: {selectedStudent.admissionNo}).
              </p>
              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-700 font-mono text-[11px] space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Tuition & Transport Dues:</span>
                  <span className="font-bold text-white">{selectedStudent.amountDue}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Due Status:</span>
                  <span className="text-amber-400">Pending Review</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Tap the button below to clear dues instantly via UPI without transaction fees:
              </p>

              {/* Dynamic Interactive WhatsApp Buttons */}
              <div className="pt-2 space-y-1.5">
                <a
                  href={`upi://pay?pa=school@icici&pn=DPS%20Ranchi&am=${selectedStudent.amountDue.replace(/[^0-9.]/g, '')}&cu=INR`}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5" /> Pay {selectedStudent.amountDue} via UPI
                </a>
                <button
                  type="button"
                  className="w-full py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-[11px] font-semibold text-center"
                >
                  View Itemized Fee Receipt
                </button>
              </div>
            </div>

            {/* Dispatch Action */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => handleSimulateDispatch('auto')}
                disabled={isSimulatingDispatch}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                {isSimulatingDispatch ? 'Routing through Tier 1-3 Dispatcher...' : 'Dispatch Tiered Notification'}
              </button>

              {dispatchResult && (
                <div className="p-2.5 bg-emerald-950/80 border border-emerald-800 rounded-md text-[11px] text-emerald-300 font-mono flex items-center gap-1.5">
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
