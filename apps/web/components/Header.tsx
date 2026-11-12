'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Check, Building2, UserCircle2, Activity } from 'lucide-react';
import { API_BASE_URL } from '../lib/api';

interface HeaderProps {
  onOpenCommandPalette: () => void;
}

const mockSiblings = [
  { id: 'student-01', name: 'Aarav Sharma', class: 'Class 5', section: 'A', admNo: 'DPS-2024-042', role: 'STUDENT', active: true },
  { id: 'student-02', name: 'Ananya Sharma', class: 'Class 2', section: 'B', admNo: 'DPS-2026-118', role: 'STUDENT', active: false },
];

export default function Header({ onOpenCommandPalette }: HeaderProps) {
  const [selectedProfile, setSelectedProfile] = useState(mockSiblings[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isApiLive, setIsApiLive] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkApi = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/healthz`, { method: 'GET', signal: AbortSignal.timeout(2000) });
        if (isMounted) setIsApiLive(res.ok);
      } catch {
        if (isMounted) setIsApiLive(false);
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="h-14 border-b border-black/[0.06] bg-white/80 backdrop-blur-md px-5 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Search trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-black/[0.06] bg-[#F5F4F0] text-neutral-500 hover:border-black/[0.12] hover:text-neutral-800 text-xs transition-all w-72 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <Search className="w-3.5 h-3.5 text-neutral-400" />
          <span className="flex-1 text-left text-xs">Search student, bus, fee...</span>
          <kbd className="bg-white border border-black/[0.08] px-1.5 py-0.5 rounded text-[10px] font-mono text-neutral-400 font-semibold shadow-2xs">
            ⌘K
          </kbd>
        </button>

        <div className="hidden lg:flex items-center gap-2 text-xs text-neutral-500 border-l border-black/[0.06] pl-3">
          <Building2 className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-[11px]">Academic Term:</span>
          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-medium border border-emerald-200">
            2026–2027 Active
          </span>
        </div>
      </div>

      {/* Right Actions: API Engine Status, Sibling Context Switcher & Operator Badge */}
      <div className="flex items-center gap-2.5">
        {/* Real-time Go API Connection Indicator */}
        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
          isApiLive
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-neutral-50 text-neutral-500 border-neutral-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isApiLive ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
          <span>{isApiLive ? 'Live Sync' : 'Standby'}</span>
        </div>

        {/* Multi-Account / Sibling Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-black/[0.06] bg-white hover:bg-[#F5F4F0] text-xs transition-colors shadow-2xs"
          >
            <div className="w-5 h-5 rounded-full bg-pastel-sky text-pastel-sky-ink flex items-center justify-center font-bold text-[10px]">
              {selectedProfile.name[0]}
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-medium text-ink leading-tight text-xs flex items-center gap-1.5">
                {selectedProfile.name}
                <span className="text-[10px] text-ink-faint font-normal">
                  ({selectedProfile.class}-{selectedProfile.section})
                </span>
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-ink-faint" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-64 bg-canvas border border-hairline rounded-lg shadow-popover py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 border-b border-hairline-subtle text-[10px] font-semibold text-ink-faint uppercase tracking-utility">
                Switch Student Profile
              </div>
              {mockSiblings.map((sibling) => {
                const isSelected = selectedProfile.id === sibling.id;
                return (
                  <button
                    key={sibling.id}
                    onClick={() => {
                      setSelectedProfile(sibling);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-canvas-chrome transition-colors ${
                      isSelected ? 'bg-canvas-subdued text-ink font-semibold' : 'text-ink-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-pastel-sky text-pastel-sky-ink flex items-center justify-center font-bold text-[10px]">
                        {sibling.name[0]}
                      </div>
                      <div>
                        <div className="text-xs">{sibling.name}</div>
                        <div className="text-[10px] text-ink-faint">
                          {sibling.class}-{sibling.section} • {sibling.admNo}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-brand" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Operator Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-canvas-chrome border border-hairline text-[11px] text-ink-muted">
          <UserCircle2 className="w-3.5 h-3.5 text-ink-faint" />
          <span>Reception Counter #1</span>
        </div>
      </div>
    </header>
  );
}
