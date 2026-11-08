'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Bus, 
  Users, 
  CreditCard, 
  GraduationCap, 
  Fingerprint, 
  BookOpen, 
  FlaskConical, 
  Settings, 
  ShieldCheck,
  ChevronRight,
  FileSpreadsheet,
  ScanLine,
  CalendarDays,
  MessageSquare,
  FileText,
  Sparkles
} from 'lucide-react';

const coreNavigationItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Live Fleet Telemetry', href: '/fleet', icon: Bus, badge: 'LIVE' },
  { name: 'Students & SIS', href: '/students', icon: Users },
  { name: 'Fee Ledger & Invoicing', href: '/fees', icon: CreditCard },
  { name: 'Academics & Grading', href: '/academics', icon: GraduationCap },
  { name: 'Attendance & Biometrics', href: '/attendance', icon: Fingerprint },
];

const operationsAndAINavigationItems = [
  { name: 'Smart CSV Ingestion', href: '/ingestion', icon: FileSpreadsheet, badge: 'DATA-26' },
  { name: 'Computer Vision OMR', href: '/omr', icon: ScanLine, badge: 'AI' },
  { name: 'Master Timetable', href: '/timetable', icon: CalendarDays },
  { name: 'Dunning & Comms Hub', href: '/communications', icon: MessageSquare },
  { name: 'Vector Document Studio', href: '/documents', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm">
            OS
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
              SchoolOS
              <span className="bg-primary-50 text-primary-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-primary-200">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">Enterprise Core</div>
          </div>
        </div>
      </div>

      {/* Tenant Context Capsule */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-700 truncate max-w-[170px]">
            DPS Ranchi (Main Campus)
          </span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="System Operational" />
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 font-mono">
          <ShieldCheck className="w-3 h-3 text-primary-600" /> RLS Isolated
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Core Modules
          </div>
          <div className="space-y-1">
            {coreNavigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Operations & AI Copilots
          </div>
          <div className="space-y-1">
            {operationsAndAINavigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-primary-50 text-primary-600 border border-primary-200 text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Bottom Footer Info */}
      <div className="p-4 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <div>
          <span className="font-mono text-[11px]">v1.0.0-rc2</span>
          <div className="text-[10px] text-slate-400">GT06 Telemetry Gateway</div>
        </div>
        <div className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded border border-slate-200 font-mono">
          :5023 TCP
        </div>
      </div>
    </aside>
  );
}
