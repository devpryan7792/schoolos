'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Bus, 
  Users, 
  CreditCard, 
  GraduationCap, 
  Fingerprint, 
  FileSpreadsheet, 
  ScanLine, 
  CalendarDays, 
  MessageSquare, 
  FileText,
  ArrowRight
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const commands = [
  { name: 'Dashboard & Morning Digest', category: 'Navigation', href: '/', icon: ArrowRight },
  { name: 'Live Bus Fleet Map & Telemetry', category: 'Fleet', href: '/fleet', icon: Bus },
  { name: 'Students Register & SIS Roster', category: 'Students', href: '/students', icon: Users },
  { name: 'Fee Ledger & Cash Counter POS', category: 'Finance', href: '/fees', icon: CreditCard },
  { name: 'Academics & CCE Marksheet', category: 'Academics', href: '/academics', icon: GraduationCap },
  { name: 'Attendance & LAN Biometric Punch', category: 'Attendance', href: '/attendance', icon: Fingerprint },
  { name: 'Smart CSV Student Ingestion (DATA-26)', category: 'Operations', href: '/ingestion', icon: FileSpreadsheet },
  { name: 'Computer Vision OMR Studio', category: 'AI Tools', href: '/omr', icon: ScanLine },
  { name: 'Master Timetable & Substitution', category: 'Operations', href: '/timetable', icon: CalendarDays },
  { name: 'Fee Dunning & WhatsApp Comms', category: 'Communications', href: '/communications', icon: MessageSquare },
  { name: 'Vector Document & PVC ID Studio', category: 'Documents', href: '/documents', icon: FileText },
];

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filtered = commands.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[2px] flex items-start justify-center pt-20 p-4 animate-in fade-in duration-100">
      <div 
        className="w-full max-w-lg bg-canvas rounded-xl shadow-popover border border-hairline overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-hairline bg-canvas">
          <Search className="w-4 h-4 text-ink-faint" />
          <input
            type="text"
            placeholder="Search commands, modules, students..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            autoFocus
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
          />
          <kbd className="text-[10px] font-mono text-ink-faint bg-canvas-chrome border border-hairline px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-ink-faint">
              No matching commands found.
            </div>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href);
                    onClose();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-canvas-chrome text-ink font-semibold' : 'text-ink-secondary hover:bg-canvas-chrome'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 text-ink-muted" />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-ink-faint uppercase tracking-utility">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
