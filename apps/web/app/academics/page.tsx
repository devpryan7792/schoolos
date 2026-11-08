'use client';

import React, { useState } from 'react';
import { 
  GraduationCap, 
  Printer, 
  Download, 
  CheckCircle2, 
  FileText, 
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function AcademicsPage() {
  const [boardType, setBoardType] = useState<'CBSE' | 'BSEB'>('CBSE');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Board Grading & CCE</h1>
            <span className="bg-primary-50 text-primary-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-primary-200">
              Session 2026-2027
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pluggable Academic Boards • CBSE Continuous & Comprehensive Evaluation (CCE) • BSEB State Bilingual Marksheet
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-medium">
            <button
              onClick={() => setBoardType('CBSE')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                boardType === 'CBSE' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500'
              }`}
            >
              CBSE CCE Format
            </button>
            <button
              onClick={() => setBoardType('BSEB')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                boardType === 'BSEB' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500'
              }`}
            >
              BSEB / State Board (द्विभाषी)
            </button>
          </div>

          <button 
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium px-3.5 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report Card
          </button>
        </div>
      </div>

      {/* Marksheet Container (Wireframe 5.5 from DESIGN.md) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs max-w-4xl mx-auto space-y-6">
        {/* Institutional Header */}
        <div className="text-center space-y-1 pb-4 border-b-2 border-slate-900">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {boardType === 'CBSE' ? 'Affiliated to Central Board of Secondary Education, Delhi' : 'बिहार विद्यालय परीक्षा समिति, पटना द्वारा मान्यता प्राप्त'}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            DELHI PUBLIC SCHOOL, RANCHI
          </h2>
          <div className="text-xs text-slate-500">
            Affiliation No: 3430042 • School Code: 08124 • Session: 2026-2027
          </div>
          <div className="inline-block mt-2 bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider">
            {boardType === 'CBSE' ? 'Continuous and Comprehensive Evaluation (CCE) Report Card' : 'प्रगति पत्रक / Bilingual Annual Achievement Marksheet'}
          </div>
        </div>

        {/* Student Demographics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs p-4 bg-slate-50 rounded-xl border border-slate-200 font-sans">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Student Name:</span>
            <span className="font-bold text-slate-900">Aarav Sharma</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Class & Section:</span>
            <span className="font-bold text-slate-900">Class 5-A (Roll 14)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Admission No:</span>
            <span className="font-mono font-bold text-primary-700">DPS-2024-042</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">CBSE PEN / Roll Code:</span>
            <span className="font-mono text-slate-700">PEN-91823019 / 1042</span>
          </div>
        </div>

        {/* Part 1: Scholastic Assessment Table */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
            <span>Part 1: Scholastic Areas (शैक्षणिक क्षेत्र)</span>
            <span className="text-slate-400 text-[10px] font-normal">Term 1 Assessment (100 Marks Max per Subject)</span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Subject</th>
                  <th className="px-3 py-2.5 text-center">FA1 (10)</th>
                  <th className="px-3 py-2.5 text-center">FA2 (10)</th>
                  <th className="px-3 py-2.5 text-center">SA1 (30)</th>
                  <th className="px-3 py-2.5 text-center">Total Term 1 (50)</th>
                  <th className="px-4 py-2.5 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {[
                  { subject: 'English Communicative', fa1: 9, fa2: 8.5, sa1: 27, total: 44.5, grade: 'A1' },
                  { subject: 'Hindi (द्वितीय भाषा)', fa1: 8, fa2: 9, sa1: 26, total: 43.0, grade: 'A2' },
                  { subject: 'Mathematics', fa1: 10, fa2: 10, sa1: 29.5, total: 49.5, grade: 'A1' },
                  { subject: 'General Science', fa1: 9, fa2: 9, sa1: 28, total: 46.0, grade: 'A1' },
                  { subject: 'Social Studies', fa1: 8.5, fa2: 8, sa1: 25.5, total: 42.0, grade: 'A2' },
                ].map((row) => (
                  <tr key={row.subject} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-sans font-semibold text-slate-900">{row.subject}</td>
                    <td className="px-3 py-2.5 text-center tabular-nums text-slate-700">{row.fa1}</td>
                    <td className="px-3 py-2.5 text-center tabular-nums text-slate-700">{row.fa2}</td>
                    <td className="px-3 py-2.5 text-center tabular-nums text-slate-700">{row.sa1}</td>
                    <td className="px-3 py-2.5 text-center tabular-nums font-bold text-slate-900">{row.total}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded">
                        {row.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Part 2: Co-Scholastic & Life Skills */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Part 2: Co-Scholastic Activities & Life Skills (सह-शैक्षणिक)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-slate-500 font-medium">Work Education (Computer)</div>
              <div className="font-bold text-emerald-700 text-sm mt-1">Grade A (Exemplary)</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-slate-500 font-medium">Visual & Performing Arts</div>
              <div className="font-bold text-emerald-700 text-sm mt-1">Grade A</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-slate-500 font-medium">Discipline & Attendance</div>
              <div className="font-bold text-emerald-700 text-sm mt-1">96.5% (A+)</div>
            </div>
          </div>
        </div>

        {/* Signatures & Remarks */}
        <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="text-center space-y-8">
            <div className="border-t border-slate-400 w-36 pt-1">Class Teacher</div>
          </div>
          <div className="text-center space-y-8">
            <div className="border-t border-slate-400 w-36 pt-1">Examination Controller</div>
          </div>
          <div className="text-center space-y-8">
            <div className="border-t border-slate-400 w-36 pt-1 font-bold text-slate-800">Principal Signature</div>
          </div>
        </div>
      </div>
    </div>
  );
}
