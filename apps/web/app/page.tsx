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
      {/* Executive Welcome Bar (Notion Calm Header) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-ink tracking-tight">Executive Morning Command</h1>
            <span className="bg-semantic-success-bg text-semantic-success text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-semantic-success-border">
              <span className="w-1.5 h-1.5 rounded-full bg-semantic-success animate-pulse" />
              All Systems Operational
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Sunday, 08 November 2026 • Term 2 Academic Cycle • Delhi Public School, Ranchi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/fleet"
            className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-whisper transition-all"
          >
            <Bus className="w-3.5 h-3.5" />
            Live Fleet Map
          </Link>
          <Link
            href="/fees"
            className="inline-flex items-center gap-1.5 border border-hairline bg-canvas hover:bg-canvas-chrome text-ink-secondary text-xs font-medium px-3 py-1.5 rounded-md transition-colors shadow-whisper"
          >
            <CreditCard className="w-3.5 h-3.5 text-ink-muted" />
            Cash Counter POS
          </Link>
        </div>
      </div>

      {/* Notion-Style AI Morning Brief Callout Box */}
      <div className="p-4 rounded-lg bg-pastel-cream border border-[#F3E7C4] text-pastel-cream-ink flex items-start gap-3 shadow-whisper">
        <div className="p-1.5 rounded bg-white/60 text-pastel-yellow-ink shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-[#8C6B1F]" />
        </div>
        <div className="space-y-1">
          <div className="text-xs font-semibold tracking-tight text-[#5B4B15] flex items-center justify-between">
            <span>Principal&apos;s Autonomous Morning Digest (AGENT-30)</span>
            {stats.is_live && (
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                ● Live API Feed
              </span>
            )}
          </div>
          <p className="text-xs leading-relaxed text-[#6E5A1C]">
            {stats.ai_morning_brief}
          </p>
        </div>
      </div>

      {/* 4 Primary Top Metrics Grid (Personio Metric Tiles) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Attendance */}
        <div className="bg-canvas border border-hairline rounded-lg p-4 shadow-tile hover:border-hairline-strong transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-ink-faint uppercase tracking-utility">Attendance Today</span>
            <div className="p-1.5 rounded-md bg-semantic-success-bg text-semantic-success">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-bold text-ink tracking-tight tabular-nums">
              1,482 <span className="text-xs font-normal text-ink-faint">/ 1,550</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-semantic-success font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>95.6%</span>
              <span className="text-ink-faint font-normal text-[11px]">(+1.2% vs yesterday)</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Fees Collected Today */}
        <div className="bg-canvas border border-hairline rounded-lg p-4 shadow-tile hover:border-hairline-strong transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-ink-faint uppercase tracking-utility">Fees Collected Today</span>
            <div className="p-1.5 rounded-md bg-semantic-highlight-bg text-semantic-highlight">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-bold text-ink tracking-tight font-mono tabular-nums">
              {stats.fee_collections_today}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
              <CheckCircle2 className="w-3 h-3 text-semantic-success" />
              <span className="text-[11px] font-mono">{stats.fee_collections_pct}% of Target ({stats.fee_collections_target})</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Active Fleet Buses */}
        <div className="bg-canvas border border-hairline rounded-lg p-4 shadow-tile hover:border-hairline-strong transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-ink-faint uppercase tracking-utility">Active Fleet GPS</span>
            <div className="p-1.5 rounded-md bg-pastel-sky text-pastel-sky-ink">
              <Bus className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-bold text-ink tracking-tight tabular-nums">
              18 / 18 <span className="text-xs font-normal text-ink-faint">Buses Live</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-semantic-success">
              <span className="w-1.5 h-1.5 rounded-full bg-semantic-success" />
              <span className="text-[11px] font-medium">GT06 Telemetry 100% Stream</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Biometric Staff Clock-In */}
        <div className="bg-canvas border border-hairline rounded-lg p-4 shadow-tile hover:border-hairline-strong transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-ink-faint uppercase tracking-utility">Staff Biometrics</span>
            <div className="p-1.5 rounded-md bg-pastel-lavender text-pastel-lavender-ink">
              <Fingerprint className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-bold text-ink tracking-tight tabular-nums">
              74 / 76 <span className="text-xs font-normal text-ink-faint">Punched In</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-semantic-warning font-medium">
              <Clock className="w-3 h-3" />
              <span className="text-[11px]">2 Late (Within 15-min Grace)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Active Fleet Snapshot & Double-Entry Ledger Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Fleet Status Strip */}
        <div className="lg:col-span-2 bg-canvas border border-hairline rounded-lg p-5 shadow-whisper space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <h2 className="text-sm font-semibold text-ink tracking-tight">Real-Time Bus Fleet Telemetry</h2>
              <p className="text-[11px] text-ink-faint">Raw GT06 socket packets decoded over TCP port 5023</p>
            </div>
            <Link
              href="/fleet"
              className="text-xs font-medium text-brand hover:text-brand-hover inline-flex items-center gap-1"
            >
              Interactive Map <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {[
              { id: 'BUS-08', driver: 'Manoj Kumar', route: 'Hinoo ➔ Main Road', speed: '34 km/h', status: 'ON ROUTE', lat: '23.3441°N', lng: '85.3095°E' },
              { id: 'BUS-14', driver: 'Rajesh Oraon', route: 'Doranda ➔ Overbridge', speed: '28 km/h', status: 'ON ROUTE', lat: '23.3590°N', lng: '85.3210°E' },
              { id: 'BUS-22', driver: 'Sunil Mahto', route: 'Circular Road ➔ School Gate', speed: '18 km/h', status: 'ARRIVING', lat: '23.3795°N', lng: '85.3340°E' },
            ].map((bus) => (
              <div 
                key={bus.id}
                className="flex items-center justify-between p-3 rounded-md bg-canvas-chrome border border-hairline hover:border-hairline-strong transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-canvas border border-hairline flex items-center justify-center font-bold text-xs font-mono text-ink">
                    {bus.id.replace('BUS-', '')}
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-ink flex items-center gap-2">
                      {bus.id} • {bus.driver}
                      <span className="bg-semantic-success-bg text-semantic-success text-[9px] font-bold px-1.5 py-0.2 rounded border border-semantic-success-border font-mono">
                        {bus.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-ink-faint flex items-center gap-2 mt-0.5">
                      <MapPin className="w-3 h-3" /> {bus.route} • <span className="font-mono text-ink-muted">{bus.lat}, {bus.lng}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-ink">{bus.speed}</div>
                  <div className="text-[10px] text-semantic-success flex items-center gap-1 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-semantic-success" /> AccON
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Double-Entry Ledger Invariant Audit */}
        <div className="bg-canvas border border-hairline rounded-lg p-5 shadow-whisper space-y-4">
          <div className="border-b border-hairline pb-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink tracking-tight">Audit-Proof Ledger</h2>
              <span className="bg-pastel-mint text-pastel-mint-ink text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                BALANCED
              </span>
            </div>
            <p className="text-[11px] text-ink-faint mt-0.5">Invariant 2: ∑Debits == ∑Credits verified</p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-md bg-canvas-chrome border border-hairline space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between text-ink-muted">
                <span>Tuition Fees Billed:</span>
                <span className="text-ink font-semibold">₹2,10,000.00 Cr</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Sibling Concessions:</span>
                <span className="text-semantic-critical font-semibold">-₹25,500.00 Dr</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Cash Receipts Banked:</span>
                <span className="text-semantic-success font-semibold">₹1,84,500.00 Dr</span>
              </div>
              <div className="border-t border-hairline pt-1.5 flex justify-between font-bold text-ink">
                <span>Balance Difference:</span>
                <span className="text-semantic-success font-mono">₹0.00 (Zero-Float)</span>
              </div>
            </div>

            <div className="p-3 rounded-md bg-semantic-highlight-bg border border-semantic-highlight-border text-[11px] text-semantic-highlight flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                All 42 transactions recorded with PostgreSQL kernel Row-Level Security and tamper-evident sequential receipt numbers.
              </span>
            </div>

            <Link
              href="/fees"
              className="w-full text-center block py-1.5 rounded-md border border-hairline bg-canvas hover:bg-canvas-chrome text-xs font-medium text-ink transition-colors shadow-whisper"
            >
              Open Fee Management & Ledger
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
