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
  ShieldCheck,
  FileSpreadsheet,
  ScanLine,
  CalendarDays,
  MessageSquare,
  FileText,
  School,
  Sparkles
} from 'lucide-react';

const coreNavigationItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Live Fleet Telemetry', href: '/fleet', icon: Bus, badge: 'LIVE', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { name: 'Students & SIS', href: '/students', icon: Users },
  { name: 'Fee Ledger & POS', href: '/fees', icon: CreditCard },
  { name: 'Academics & CCE', href: '/academics', icon: GraduationCap },
  { name: 'Attendance & Biometrics', href: '/attendance', icon: Fingerprint },
];

const operationsNavigationItems = [
  { name: 'Smart CSV Ingestion', href: '/ingestion', icon: FileSpreadsheet, badge: 'DATA-26', badgeColor: 'bg-pastel-sky text-pastel-sky-ink border-transparent' },
  { name: 'Computer Vision OMR', href: '/omr', icon: ScanLine, badge: 'AI', badgeColor: 'bg-pastel-lavender text-pastel-lavender-ink border-transparent' },
  { name: 'Master Timetable', href: '/timetable', icon: CalendarDays },
  { name: 'Fee Dunning & Comms', href: '/communications', icon: MessageSquare },
  { name: 'Vector Document Studio', href: '/documents', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-hairline bg-canvas-chrome flex flex-col shrink-0 min-h-screen select-none">
      {/* Brand & Workspace Switcher Header (Notion Paper-Calm Style) */}
      <div className="h-14 px-4 border-b border-hairline flex items-center justify-between bg-canvas">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-md bg-ink text-white flex items-center justify-center font-bold text-xs shadow-whisper">
            <School className="w-4 h-4 text-white" />
          </div>
          <div className="truncate">
            <div className="font-semibold text-ink text-xs tracking-tight flex items-center gap-1.5 leading-none">
              SchoolOS
              <span className="bg-canvas-subdued text-ink-muted text-[10px] font-semibold px-1.5 py-0.5 rounded border border-hairline">
                Core
              </span>
            </div>
            <div className="text-[11px] text-ink-faint truncate mt-0.5">DPS Ranchi • CBSE</div>
          </div>
        </div>
      </div>

      {/* Tenant Context Capsule (Personio Identity Badge) */}
      <div className="px-4 py-2.5 bg-canvas-subdued border-b border-hairline flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-medium text-ink-secondary text-[11px] truncate">
            Session 2026–2027
          </span>
        </div>
        <div className="text-[10px] font-mono text-ink-faint flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-hairline">
          <ShieldCheck className="w-3 h-3 text-brand" />
          RLS ON
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto">
        {/* Core Administrative Register */}
        <div>
          <div className="text-[10px] font-semibold text-ink-faint uppercase tracking-utility px-2.5 mb-1.5">
            Core Modules
          </div>
          <div className="space-y-0.5">
            {coreNavigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white text-ink font-semibold shadow-whisper border border-hairline'
                      : 'text-ink-secondary hover:bg-black/[0.03] hover:text-ink'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-brand' : 'text-ink-muted group-hover:text-ink'}`} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* AI Copilots & Operations Register */}
        <div>
          <div className="text-[10px] font-semibold text-ink-faint uppercase tracking-utility px-2.5 mb-1.5">
            Operations & AI
          </div>
          <div className="space-y-0.5">
            {operationsNavigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white text-ink font-semibold shadow-whisper border border-hairline'
                      : 'text-ink-secondary hover:bg-black/[0.03] hover:text-ink'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-brand' : 'text-ink-muted group-hover:text-ink'}`} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer Profile & Keyboard Shortcut hint */}
      <div className="p-3 border-t border-hairline bg-canvas">
        <div className="flex items-center justify-between text-[11px] text-ink-muted">
          <span className="truncate">DPS Main Campus</span>
          <span className="text-[10px] font-mono bg-canvas-chrome px-1.5 py-0.5 rounded border border-hairline text-ink-faint">
            v2.4
          </span>
        </div>
      </div>
    </aside>
  );
}
