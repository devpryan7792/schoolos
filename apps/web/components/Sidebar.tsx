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

const navigationGroups = [
  {
    group: 'Overview',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Students & SIS', href: '/students', icon: Users },
      { name: 'Attendance & Biometrics', href: '/attendance', icon: Fingerprint },
    ],
  },
  {
    group: 'Finance & Accounts',
    items: [
      { name: 'Fee Counter & Invoicing', href: '/fees', icon: CreditCard },
      { name: 'Reminders & WhatsApp', href: '/communications', icon: MessageSquare },
    ],
  },
  {
    group: 'Academics & Exams',
    items: [
      { name: 'Master Timetable', href: '/timetable', icon: CalendarDays },
      { name: 'Grades & Broadsheet', href: '/academics', icon: GraduationCap },
      { name: 'OMR Sheet Scanner', href: '/omr', icon: ScanLine },
      { name: 'Documents & Certificates', href: '/documents', icon: FileText },
    ],
  },
  {
    group: 'Operations',
    items: [
      { name: 'Live Bus Fleet GPS', href: '/fleet', icon: Bus, badge: 'LIVE', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      { name: 'Data Import (CSV)', href: '/ingestion', icon: FileSpreadsheet },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-black/[0.06] bg-[#FBFBFA] flex flex-col shrink-0 min-h-screen select-none">
      {/* Brand & School Context Header */}
      <div className="h-14 px-4 border-b border-black/[0.06] flex items-center justify-between bg-[#FAF9F7]/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            <School className="w-4 h-4 text-white" />
          </div>
          <div className="truncate">
            <div className="font-semibold text-neutral-900 text-xs tracking-tight flex items-center gap-1.5 leading-none">
              SchoolOS
              <span className="bg-neutral-100 text-neutral-600 text-[10px] font-medium px-1.5 py-0.5 rounded border border-black/[0.05]">
                DPS Ranchi
              </span>
            </div>
            <div className="text-[11px] text-neutral-400 truncate mt-0.5">Academic Session 2026–27</div>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-3.5 space-y-4 overflow-y-auto">
        {navigationGroups.map((group) => (
          <div key={group.group}>
            <div className="text-[11px] font-medium text-neutral-400 px-2.5 mb-1">
              {group.group}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                      isActive
                        ? 'bg-white text-neutral-900 font-semibold shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-black/[0.06]'
                        : 'text-neutral-600 hover:bg-black/[0.03] hover:text-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Profile & Campus */}
      <div className="p-3 border-t border-black/[0.06] bg-[#FAF9F7]/40">
        <div className="flex items-center justify-between text-[11px] text-neutral-500">
          <span className="truncate">Main Campus • CBSE Affiliated</span>
          <span className="text-[10px] font-mono bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-400">
            v2.4
          </span>
        </div>
      </div>
    </aside>
  );
}
