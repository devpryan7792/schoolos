'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, Bus, CreditCard, Sparkles, X, ArrowRight } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const commandItems = [
  { id: '1', title: 'Aarav Sharma', subtitle: 'DPS-2024-042 • Class 5-A', category: 'Students', href: '/students' },
  { id: '2', title: 'Ananya Sharma', subtitle: 'DPS-2026-118 • Class 2-B', category: 'Students', href: '/students' },
  { id: '3', title: 'Bus 14 (JH-01-BV-4021)', subtitle: 'Route 4: Hinoo Chowk • 32 km/h • On Route', category: 'Fleet', href: '/fleet' },
  { id: '4', title: 'Bus 08 (JH-01-AX-9912)', subtitle: 'Route 2: Doranda Bazar • Stopped', category: 'Fleet', href: '/fleet' },
  { id: '5', title: 'November 2026 Fee Broadsheet', subtitle: 'Total Outstanding: INR 42,500', category: 'Finance', href: '/fees' },
  { id: '6', title: 'Record Cash Collection (POS)', subtitle: 'Counter Cash Receipt Engine', category: 'Finance', href: '/fees' },
  { id: '7', title: 'CBSE CCE Marksheet Generator', subtitle: 'Bilingual Term 1 Assessment', category: 'Academics', href: '/academics' },
  { id: '8', title: 'Self-Service CSV Smart Ingestion', subtitle: 'Split-Commit & Indian Synonyms Engine (DATA-26)', category: 'Operations', href: '/ingestion' },
  { id: '9', title: 'Computer Vision OMR Studio', subtitle: 'Otsu Binarization & Double-Bubble Detection (AGENT-29)', category: 'Academics', href: '/omr' },
  { id: '10', title: 'Master Timetable & Substitution', subtitle: 'Conflict Validator & Absence Reassignment (SCHED-05)', category: 'Academics', href: '/timetable' },
  { id: '11', title: 'Autonomous Fee Dunning & Comms', subtitle: '7-Stage Dunning & Tiered Push/WhatsApp (NOTIF-27)', category: 'Finance', href: '/communications' },
  { id: '12', title: 'Deterministic Vector Document Studio', subtitle: 'CR80 PVC ID, Fee-Locked Admit Card, Clearance TC (DOC-24)', category: 'Operations', href: '/documents' },
];

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredItems = commandItems.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault();
        router.push(filteredItems[selectedIndex].href);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems, router, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-100">
      <div 
        className="w-full max-w-xl bg-white rounded-xl shadow-elevation-2 border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100">
          <Search className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, student name, admission number or route..."
            className="w-full text-sm bg-transparent outline-none placeholder:text-slate-400 text-slate-900"
          />
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching records found.
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    router.push(item.href);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                    isSelected ? 'bg-primary-50 text-primary-900' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {item.category[0]}
                    </span>
                    <div>
                      <div className="font-semibold">{item.title}</div>
                      <div className="text-[11px] text-slate-400">{item.subtitle}</div>
                    </div>
                  </div>
                  {isSelected && <ArrowRight className="w-3.5 h-3.5 text-primary-600" />}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono bg-white border border-slate-200 px-1 rounded">↑↓</kbd> Navigate</span>
            <span><kbd className="font-mono bg-white border border-slate-200 px-1 rounded">Enter</kbd> Open</span>
            <span><kbd className="font-mono bg-white border border-slate-200 px-1 rounded">Esc</kbd> Close</span>
          </div>
          <span className="font-medium text-primary-600">SchoolOS Linear Density</span>
        </div>
      </div>
    </div>
  );
}
