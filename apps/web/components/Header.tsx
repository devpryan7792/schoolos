'use client';

import React, { useState } from 'react';
import { Search, Bell, ChevronDown, User, Sparkles, Building2 } from 'lucide-react';

interface HeaderProps {
  onOpenCommandPalette: () => void;
}

const mockSiblings = [
  { id: 'student-01', name: 'Aarav Sharma', class: 'Class 5', section: 'A', admNo: 'DPS-2024-042', role: 'STUDENT' },
  { id: 'student-02', name: 'Ananya Sharma', class: 'Class 2', section: 'B', admNo: 'DPS-2026-118', role: 'STUDENT' },
];

export default function Header({ onOpenCommandPalette }: HeaderProps) {
  const [selectedProfile, setSelectedProfile] = useState(mockSiblings[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search trigger */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:text-slate-800 text-xs transition-colors w-72"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="flex-1 text-left">Search students, bus, fees...</span>
          <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 font-semibold shadow-xs">
            Ctrl+K
          </kbd>
        </button>

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium border-l border-slate-200 pl-4">
          <Building2 className="w-3.5 h-3.5 text-primary-600" />
          <span>Academic Session:</span>
          <span className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold border border-primary-200">
            2026-2027 (ACTIVE)
          </span>
        </div>
      </div>

      {/* Right Actions: Sibling Context Switcher & Profile */}
      <div className="flex items-center gap-3">
        {/* Multi-Account / Sibling Switcher (SPECIFICATION.md Section 5.1) */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-bold text-[10px]">
              {selectedProfile.name[0]}
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-semibold text-slate-800 leading-tight">
                {selectedProfile.name}
              </div>
              <div className="text-[10px] text-slate-500">
                {selectedProfile.class}-{selectedProfile.section} • {selectedProfile.admNo}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-elevation-2 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Switch Student Profile (Family Unit)
              </div>
              {mockSiblings.map((sibling) => (
                <button
                  key={sibling.id}
                  onClick={() => {
                    setSelectedProfile(sibling);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    selectedProfile.id === sibling.id ? 'bg-primary-50 text-primary-900 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <div>{sibling.name}</div>
                    <div className="text-[10px] text-slate-400">{sibling.class}-{sibling.section} • {sibling.admNo}</div>
                  </div>
                  {selectedProfile.id === sibling.id && (
                    <span className="w-2 h-2 rounded-full bg-primary-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        {/* User Identity */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
            RS
          </div>
          <div className="hidden md:block text-left text-xs">
            <div className="font-semibold text-slate-900 leading-tight">Rajesh Sharma</div>
            <div className="text-[10px] text-slate-400">Principal / Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
}
