'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  CreditCard, 
  Bus, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  MapPin,
  Clock,
  Fingerprint
} from 'lucide-react';
import { getDashboardStats, DashboardStats } from '../lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    fee_collections_today: '₹1,42,500.00',
    fee_collections_target: '₹1,80,000.00',
    fee_collections_pct: 79.1,
    fleet_active_count: 18,
    fleet_total_count: 22,
    fleet_status: 'All On Route',
    staff_clockin_count: 46,
    staff_total_count: 48,
    staff_clockin_pct: 95.8,
    academic_cce_pct: 94.2,
    double_entry_balanced: true,
    total_debits: '₹28,45,000.00',
    total_credits: '₹28,45,000.00',
    ai_morning_brief: 'Fee collection is on track (79.1% of daily target). Bus 14 is approaching Circular Road Chowk on schedule. Two staff members require punch regularization before 11:00 AM.',
    is_live: false,
  });

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, []);
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Executive Morning Welcome Banner (Notion Paper-Calm Style) */}
      <div className="bg-white border border-black/[0.06] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">
              Good morning, Principal Sharma 👋
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1 flex items-center gap-2">
            <span>Delhi Public School, Ranchi</span>
            <span className="text-neutral-300">•</span>
            <span>Academic Term 2</span>
            <span className="text-neutral-300">•</span>
            <span>Wednesday, Nov 12, 2026</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/fees"
            className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium px-3.5 py-2 rounded-lg shadow-sm transition-all"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Collect Fee (F2)
          </Link>
          <Link
            href="/fleet"
            className="inline-flex items-center gap-1.5 border border-black/[0.08] bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-medium px-3.5 py-2 rounded-lg transition-colors shadow-2xs"
          >
            <Bus className="w-3.5 h-3.5 text-neutral-500" />
            Live Bus Map
          </Link>
          <Link
            href="/attendance"
            className="inline-flex items-center gap-1.5 border border-black/[0.08] bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-medium px-3.5 py-2 rounded-lg transition-colors shadow-2xs"
          >
            <Fingerprint className="w-3.5 h-3.5 text-neutral-500" />
            Attendance
          </Link>
        </div>
      </div>

      {/* 4 Primary Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Attendance */}
        <div className="bg-white border border-black/[0.06] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Student Attendance</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-neutral-900 tracking-tight tabular-nums">
              1,482 <span className="text-xs font-normal text-neutral-400">/ 1,550</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>95.6% turnout</span>
              <span className="text-neutral-400 font-normal text-[11px]">• 68 on leave</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Fees Collected Today */}
        <div className="bg-white border border-black/[0.06] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Today's Fee Collection</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-neutral-900 tracking-tight font-mono tabular-nums">
              {stats.fee_collections_today}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-neutral-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px]">{stats.fee_collections_pct}% of daily target ({stats.fee_collections_target})</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Active Fleet Buses */}
        <div className="bg-white border border-black/[0.06] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Bus Fleet Status</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Bus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-neutral-900 tracking-tight tabular-nums">
              18 / 18 <span className="text-xs font-normal text-neutral-400">On Route</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium">All morning routes running on time</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Biometric Staff Clock-In */}
        <div className="bg-white border border-black/[0.06] rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Staff & Faculty</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Fingerprint className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-neutral-900 tracking-tight tabular-nums">
              74 / 76 <span className="text-xs font-normal text-neutral-400">Present</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-700 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[11px]">2 late check-ins (within grace)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Active Fleet Snapshot & Accounts Reconciliation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Fleet Status */}
        <div className="lg:col-span-2 bg-white border border-black/[0.06] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 tracking-tight">Active Bus Routes</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Live GPS tracking for 18 morning pickup routes</p>
            </div>
            <Link
              href="/fleet"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              Open Live Fleet Map <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {[
              { id: 'BUS-08', driver: 'Manoj Kumar', route: 'Hinoo ➔ Main Road', speed: '34 km/h', status: 'En Route', location: 'Doranda Chowk' },
              { id: 'BUS-14', driver: 'Rajesh Oraon', route: 'Doranda ➔ Overbridge', speed: '28 km/h', status: 'En Route', location: 'Overbridge Junction' },
              { id: 'BUS-22', driver: 'Sunil Mahto', route: 'Circular Road ➔ School Gate', speed: '18 km/h', status: 'Arriving', location: 'School North Gate' },
            ].map((bus) => (
              <div 
                key={bus.id}
                className="flex items-center justify-between p-3.5 rounded-lg bg-[#FAF9F7] border border-black/[0.04] hover:border-black/[0.1] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-black/[0.06] flex items-center justify-center font-semibold text-xs text-neutral-800 shadow-2xs">
                    {bus.id.replace('BUS-', '#')}
                  </div>
                  <div>
                    <div className="font-medium text-xs text-neutral-900 flex items-center gap-2">
                      <span>{bus.driver}</span>
                      <span className="text-neutral-400">•</span>
                      <span className="text-neutral-600 font-normal">{bus.id}</span>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-medium px-2 py-0.5 rounded-full border border-emerald-200">
                        {bus.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3 text-neutral-400" />
                      <span>{bus.route}</span>
                      <span className="text-neutral-300">•</span>
                      <span className="text-neutral-600 font-medium">{bus.location}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-semibold text-neutral-900">{bus.speed}</div>
                  <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 justify-end mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> GPS Live
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Daily Accounts & Fee Reconciliation */}
        <div className="bg-white border border-black/[0.06] rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
          <div className="border-b border-black/[0.06] pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-neutral-900 tracking-tight">Today's Fee Accounts</h2>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-medium px-2 py-0.5 rounded-full border border-emerald-200">
                Books Balanced
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">Reconciled double-entry books (₹0.00 discrepancy)</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-lg bg-[#FAF9F7] border border-black/[0.04] space-y-2 text-[11px]">
              <div className="flex justify-between text-neutral-600">
                <span>Tuition Fees Invoiced:</span>
                <span className="text-neutral-900 font-semibold font-mono">₹2,10,000.00</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Sibling Concessions Applied:</span>
                <span className="text-amber-700 font-semibold font-mono">-₹25,500.00</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Cash Receipts Banked:</span>
                <span className="text-emerald-700 font-semibold font-mono">₹1,84,500.00</span>
              </div>
              <div className="border-t border-black/[0.06] pt-2 flex justify-between font-bold text-neutral-900">
                <span>Balance Difference:</span>
                <span className="text-emerald-600 font-mono">₹0.00 (Balanced)</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                All 42 transactions recorded with complete audit trails and sequential receipt numbers.
              </span>
            </div>

            <Link
              href="/fees"
              className="w-full text-center block py-2 rounded-lg border border-black/[0.08] bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-800 transition-colors shadow-2xs"
            >
              Open Fee Counter & Receipts
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
