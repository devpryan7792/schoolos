'use client';

import React, { useState } from 'react';
import { 
  GraduationCap, 
  Printer, 
  Award,
  ArrowRight
} from 'lucide-react';

export default function AcademicsPage() {
  const [boardType, setBoardType] = useState<'CBSE' | 'BSEB'>('CBSE');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink tracking-tight">Academic Board Grading & CCE</h1>
            <span className="bg-pastel-sky text-pastel-sky-ink text-[10px] font-semibold px-2 py-0.5 rounded-full border border-transparent">
              Session 2026–2027
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Pluggable Academic Boards • CBSE 9-point CCE grading • State Board (BSEB) bilingual broadsheet
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Switcher (Notion Tab Style) */}
          <div className="flex rounded-md border border-hairline p-0.5 bg-canvas-chrome text-xs font-medium shadow-whisper">
            <button
              onClick={() => setBoardType('CBSE')}
              className={`px-3 py-1 rounded transition-all ${
                boardType === 'CBSE' ? 'bg-canvas text-ink shadow-whisper font-semibold' : 'text-ink-muted'
              }`}
            >
              CBSE CCE
            </button>
            <button
              onClick={() => setBoardType('BSEB')}
              className={`px-3 py-1 rounded transition-all ${
                boardType === 'BSEB' ? 'bg-canvas text-ink shadow-whisper font-semibold' : 'text-ink-muted'
              }`}
            >
              State Board (द्विभाषी)
            </button>
          </div>

          <button 
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-whisper transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Marksheet
          </button>
        </div>
      </div>

      {/* Marksheet Container (Notion Document Aesthetics) */}
      <div className="bg-canvas border border-hairline rounded-lg p-6 shadow-whisper max-w-3xl mx-auto space-y-5">
        {/* Institutional Header */}
        <div className="text-center space-y-1 pb-4 border-b border-hairline">
          <div className="text-[10px] font-semibold uppercase tracking-utility text-ink-faint">
            {boardType === 'CBSE' ? 'Affiliated to Central Board of Secondary Education, Delhi' : 'बिहार विद्यालय परीक्षा समिति, पटना द्वारा मान्यता प्राप्त'}
          </div>
          <h2 className="text-lg font-bold tracking-tight text-ink">
            DELHI PUBLIC SCHOOL, RANCHI
          </h2>
          <div className="text-[11px] text-ink-muted font-mono">
            Affiliation No: 3430042 • School Code: 08124 • Session: 2026–2027
          </div>
          <div className="inline-block mt-2 bg-ink text-white text-[10px] font-bold px-2.5 py-0.5 rounded font-mono uppercase tracking-wider">
            {boardType === 'CBSE' ? 'CCE Continuous Achievement Marksheet' : 'प्रगति पत्रक / Bilingual Annual Marksheet'}
          </div>
        </div>

        {/* Student Demographics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3.5 bg-canvas-chrome rounded-md border border-hairline font-sans">
          <div>
            <span className="text-ink-faint block text-[10px] uppercase tracking-utility">Student Name:</span>
            <span className="font-semibold text-ink">Aarav Sharma</span>
          </div>
          <div>
            <span className="text-ink-faint block text-[10px] uppercase tracking-utility">Class & Section:</span>
            <span className="font-semibold text-ink">Class 5-A (Roll 14)</span>
          </div>
          <div>
            <span className="text-ink-faint block text-[10px] uppercase tracking-utility">Admission No:</span>
            <span className="font-mono font-semibold text-brand">DPS-2024-042</span>
          </div>
          <div>
            <span className="text-ink-faint block text-[10px] uppercase tracking-utility">CBSE PEN / Roll:</span>
            <span className="font-mono text-ink">PEN-91823019 / 1042</span>
          </div>
        </div>

        {/* Scholastic Subject Table (Personio High-Density Rows) */}
        <div className="border border-hairline rounded-md overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-canvas-chrome border-b border-hairline text-ink-faint font-semibold uppercase text-[10px] tracking-utility font-sans">
              <tr>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3 text-right">Max</th>
                <th className="py-2.5 px-3 text-right">Term 1</th>
                <th className="py-2.5 px-3 text-right">Term 2</th>
                <th className="py-2.5 px-3 text-right">Total</th>
                <th className="py-2.5 px-3 text-right">{boardType === 'CBSE' ? 'Grade' : 'श्रेणी'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {[
                { subject: 'English Communicative', code: '101', max: 100, t1: 44, t2: 45, total: 89, grade: 'A2' },
                { subject: 'Hindi Course-A (हिन्दी)', code: '002', max: 100, t1: 46, t2: 47, total: 93, grade: 'A1' },
                { subject: 'Mathematics (गणित)', code: '041', max: 100, t1: 48, t2: 50, total: 98, grade: 'A1' },
                { subject: 'Science & Tech (विज्ञान)', code: '086', max: 100, t1: 43, t2: 44, total: 87, grade: 'A2' },
                { subject: 'Social Sciences (सामाजिक)', code: '087', max: 100, t1: 45, t2: 46, total: 91, grade: 'A1' },
              ].map((row) => (
                <tr key={row.code} className="hover:bg-canvas-subdued transition-colors text-xs">
                  <td className="py-2 px-3 font-sans font-medium text-ink">
                    {row.subject} <span className="text-[10px] text-ink-faint font-mono">({row.code})</span>
                  </td>
                  <td className="py-2 px-3 text-right text-ink-faint">{row.max}</td>
                  <td className="py-2 px-3 text-right text-ink-muted">{row.t1}</td>
                  <td className="py-2 px-3 text-right text-ink-muted">{row.t2}</td>
                  <td className="py-2 px-3 text-right font-bold text-ink">{row.total}</td>
                  <td className="py-2 px-3 text-right">
                    <span className="bg-pastel-mint text-pastel-mint-ink font-bold text-[10px] px-1.5 py-0.5 rounded border border-transparent font-sans">
                      {boardType === 'CBSE' ? row.grade : 'प्रथम (1st)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Academic Result Summary Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-canvas-chrome rounded-md border border-hairline text-xs gap-3 font-sans">
          <div>
            <span className="text-[10px] font-semibold text-ink-faint uppercase tracking-utility">Grand Total:</span>
            <div className="text-sm font-bold text-ink font-mono mt-0.5">
              458 / 500 <span className="text-semantic-success text-xs font-sans">(91.6%)</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-semibold text-ink-faint uppercase tracking-utility">
              {boardType === 'CBSE' ? 'Overall CCE Grade Point:' : 'अंतिम परीक्षाफल (Final Result):'}
            </span>
            <div className="text-sm font-bold text-ink mt-0.5">
              {boardType === 'CBSE' ? 'Grade A1 • CGPA 9.6' : '1st Division (प्रथम श्रेणी • उत्तीर्ण)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
