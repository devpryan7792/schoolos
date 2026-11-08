'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  CreditCard, 
  Bus, 
  GraduationCap, 
  TrendingUp, 
  AlertTriangle, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Zap,
  MapPin
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Executive Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Morning Digest</h1>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Normal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Sunday, 08 November 2026 • Term 2 Academic Cycle • Delhi Public School, Ranchi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/fleet"
            className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium px-3.5 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Bus className="w-3.5 h-3.5" />
            Open Live Fleet Map
          </Link>
          <Link
            href="/fees"
            className="inline-flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium px-3.5 py-2 rounded-lg transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5 text-slate-500" />
            Cash Counter POS
          </Link>
        </div>
      </div>

      {/* 4 Primary Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Present */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Attendance</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
              1,482 <span className="text-sm font-normal text-slate-400">/ 1,550</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>95.6%</span>
              <span className="text-slate-400 font-normal">(+1.2% vs yesterday)</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Fees Collected Today */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fees Collected Today</span>
            <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono tabular-nums">
              ₹1,84,500<span className="text-xs text-slate-400 font-sans">.00</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary-600" />
              <span>42 Transactions</span>
              <span className="text-slate-400">• Double-Entry Verified</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Active Fleet Buses */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Buses En Route</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Bus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
              42 <span className="text-sm font-normal text-slate-400">/ 42 Active</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <Zap className="w-3.5 h-3.5" />
              <span>0 Delays</span>
              <span className="text-slate-400 font-normal">• GT06 Stream Stable</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Teachers On Duty */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Faculty On Duty</span>
            <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
              78 <span className="text-sm font-normal text-slate-400">/ 82 Staff</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>4 On Leave</span>
              <span className="text-emerald-600 font-medium">• Auto-Substituted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Live Fleet Mini-View & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Fleet Preview Card */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Bus className="w-4 h-4 text-primary-600" />
                  Live Fleet Dispatch Overview
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-frequency GT06 hardware GPS tracking across Ranchi school zones
                </p>
              </div>
              <Link 
                href="/fleet"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                Full Screen Map <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Fleet Mini Broadsheet */}
            <div className="divide-y divide-slate-100">
              {[
                { id: 'BUS-14', reg: 'JH-01-BV-4021', route: 'Route 4: Hinoo Chowk', speed: '34 km/h', nextStop: 'Circular Road Chowk (ETA 3 mins)', status: 'ON_ROUTE', students: 28 },
                { id: 'BUS-08', reg: 'JH-01-AX-9912', route: 'Route 2: Doranda Bazar', speed: '0 km/h', nextStop: 'Boarding at Albert Ekka Chowk', status: 'STOPPED', students: 34 },
                { id: 'BUS-21', reg: 'JH-01-CZ-1045', route: 'Route 7: Birsa Chowk', speed: '41 km/h', nextStop: 'Overbridge Junction (ETA 6 mins)', status: 'ON_ROUTE', students: 31 },
              ].map((bus) => (
                <div key={bus.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center font-bold text-xs">
                      {bus.id.replace('BUS-', '')}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        {bus.reg}
                        <span className="font-mono text-[10px] text-slate-400 font-normal">({bus.id})</span>
                      </div>
                      <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{bus.route}</span> • <span className="font-medium text-slate-700">{bus.nextStop}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-800">{bus.speed}</div>
                      <div className="text-[10px] text-slate-400">{bus.students} Onboard</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      bus.status === 'ON_ROUTE' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {bus.status === 'ON_ROUTE' ? 'En Route' : 'Stationary'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Counter Financial Inflow */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary-600" />
                  Recent Counter Cash Collections
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time ledger audit entries recorded via Compose Desktop counter POS
                </p>
              </div>
              <Link 
                href="/fees"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                View Ledger <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Receipt #</th>
                    <th className="px-4 py-2.5">Student</th>
                    <th className="px-4 py-2.5">Class</th>
                    <th className="px-4 py-2.5">Billing Period</th>
                    <th className="px-4 py-2.5 text-right">Amount</th>
                    <th className="px-4 py-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { rcp: 'RCP-2026-098234', student: 'Aarav Sharma', class: '5-A', period: 'November 2026', amount: '₹4,200.00', mode: 'CASH', time: '09:14 AM' },
                    { rcp: 'RCP-2026-098233', student: 'Rohan Verma', class: '8-C', period: 'November 2026', amount: '₹3,850.00', mode: 'UPI', time: '09:08 AM' },
                    { rcp: 'RCP-2026-098232', student: 'Priya Kumari', class: '10-B', period: 'Q3 Advance', amount: '₹12,400.00', mode: 'POS_CARD', time: '08:55 AM' },
                    { rcp: 'RCP-2026-098231', student: 'Vikram Singh', class: '1-A', period: 'November 2026', amount: '₹2,500.00', mode: 'CASH', time: '08:42 AM' },
                  ].map((row) => (
                    <tr key={row.rcp} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-2.5 font-mono font-medium text-primary-700">{row.rcp}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900">{row.student}</td>
                      <td className="px-4 py-2.5 text-slate-500">{row.class}</td>
                      <td className="px-4 py-2.5 text-slate-500">{row.period}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900 tabular-nums">{row.amount}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Settled ({row.mode})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Critical Action Queue */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Critical Action Queue
              </h2>
              <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200">
                3 Pending
              </span>
            </div>

            <div className="mt-4 space-y-4">
              {/* Action Item 1: Fee Arrears */}
              <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/50 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Fee Arrears &gt; 60 Days: 18 Students</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Total overdue amount: ₹84,200.00</div>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">High</span>
                </div>
                <button className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition-colors">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Trigger WhatsApp UPI Reminders
                </button>
              </div>

              {/* Action Item 2: CCE Marks Pending */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">CBSE CCE Marks Pending</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Class 8-B Science Assessment (Due 5:00 PM)</div>
                  </div>
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded">Medium</span>
                </div>
                <button className="w-full mt-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition-colors">
                  Alert Subject Teacher (Push Notification)
                </button>
              </div>

              {/* Action Item 3: Lab Reagent Low */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Science Lab Reagent Low</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Hydrochloric Acid (HCl): 250ml remaining</div>
                  </div>
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded">Low</span>
                </div>
                <Link 
                  href="/labs"
                  className="w-full mt-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition-colors"
                >
                  Create Reorder Indent
                </Link>
              </div>
            </div>
          </div>

          {/* System Telemetry & RLS Status */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary-600" />
              Security & Engine Integrity
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Row-Level Security (RLS)</span>
                <span className="text-emerald-600 font-bold font-mono">ENFORCED (26/26)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Financial Engine</span>
                <span className="text-emerald-600 font-bold font-mono">ZERO-FLOAT BALANCED</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>GT06 Telemetry Port</span>
                <span className="text-primary-600 font-bold font-mono">:5023 TCP ACTIVE</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Mapping Engine</span>
                <span className="text-slate-700 font-medium font-mono">MapLibre GL (Zero Cost)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
