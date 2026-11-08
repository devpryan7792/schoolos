'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Eye,
  X
} from 'lucide-react';

interface StudentRecord {
  id: string;
  admissionNo: string;
  name: string;
  cbsePen: string;
  stateRollCode: string;
  className: string;
  section: string;
  guardianName: string;
  guardianPhone: string;
  siblingBirthOrder: number;
  siblings: string[];
  transportRoute: string;
  feeStatus: 'PAID' | 'DUE_SOON' | 'OVERDUE';
  feeBalance: string;
  attendanceStatus: 'PRESENT' | 'ABSENT' | 'LATE';
}

const mockStudents: StudentRecord[] = [
  {
    id: 'd1a80101-92b5-4b11-9ef0-0a1234567891',
    admissionNo: 'DPS-2024-042',
    name: 'Aarav Sharma',
    cbsePen: 'PEN-91823019',
    stateRollCode: '1042',
    className: 'Class 5',
    section: 'A',
    guardianName: 'Rajesh Sharma',
    guardianPhone: '+91 98765 43210',
    siblingBirthOrder: 1,
    siblings: ['Ananya Sharma (Class 2-B)'],
    transportRoute: 'Route 4 (Hinoo Chowk)',
    feeStatus: 'DUE_SOON',
    feeBalance: '₹4,200.00',
    attendanceStatus: 'PRESENT',
  },
  {
    id: 'd2a80101-92b5-4b11-9ef0-0a1234567892',
    admissionNo: 'DPS-2026-118',
    name: 'Ananya Sharma',
    cbsePen: 'PEN-91823020',
    stateRollCode: '1118',
    className: 'Class 2',
    section: 'B',
    guardianName: 'Rajesh Sharma',
    guardianPhone: '+91 98765 43210',
    siblingBirthOrder: 2, // Second child receives automated 25% sibling concession!
    siblings: ['Aarav Sharma (Class 5-A)'],
    transportRoute: 'Route 4 (Hinoo Chowk)',
    feeStatus: 'PAID',
    feeBalance: '₹0.00',
    attendanceStatus: 'PRESENT',
  },
  {
    id: 'd3a80101-92b5-4b11-9ef0-0a1234567893',
    admissionNo: 'DPS-2022-015',
    name: 'Rohan Verma',
    cbsePen: 'PEN-82019482',
    stateRollCode: '2015',
    className: 'Class 8',
    section: 'C',
    guardianName: 'Manoj Verma',
    guardianPhone: '+91 98765 99012',
    siblingBirthOrder: 1,
    siblings: [],
    transportRoute: 'Route 2 (Doranda Bazar)',
    feeStatus: 'PAID',
    feeBalance: '₹0.00',
    attendanceStatus: 'PRESENT',
  },
  {
    id: 'd4a80101-92b5-4b11-9ef0-0a1234567894',
    admissionNo: 'DPS-2020-008',
    name: 'Priya Kumari',
    cbsePen: 'PEN-71029481',
    stateRollCode: '1008',
    className: 'Class 10',
    section: 'B',
    guardianName: 'Ramesh Singh',
    guardianPhone: '+91 98765 44102',
    siblingBirthOrder: 1,
    siblings: [],
    transportRoute: 'Route 7 (Birsa Chowk)',
    feeStatus: 'OVERDUE',
    feeBalance: '₹8,400.00',
    attendanceStatus: 'ABSENT',
  },
  {
    id: 'd5a80101-92b5-4b11-9ef0-0a1234567895',
    admissionNo: 'DPS-2025-089',
    name: 'Vikram Kumar',
    cbsePen: 'PEN-93019284',
    stateRollCode: '3089',
    className: 'Class 1',
    section: 'A',
    guardianName: 'Sunil Kumar',
    guardianPhone: '+91 98765 11982',
    siblingBirthOrder: 1,
    siblings: [],
    transportRoute: 'Private / Self Walk',
    feeStatus: 'PAID',
    feeBalance: '₹0.00',
    attendanceStatus: 'PRESENT',
  },
];

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [activeStudent, setActiveStudent] = useState<StudentRecord | null>(null);

  const filteredStudents = mockStudents.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.cbsePen.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.guardianPhone.includes(searchQuery);

    const matchesClass = selectedClass === 'ALL' || s.className === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Information System (SIS)</h1>
            <span className="bg-primary-50 text-primary-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-primary-200">
              {mockStudents.length} Enrolled (Session 2026-27)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Institutional Roster • CBSE PEN & BSEB Roll Registry • Family Linkages
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium px-3 py-2 rounded-lg transition-colors">
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Broadsheet CSV
          </button>
          <button className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium px-3.5 py-2 rounded-lg shadow-sm transition-colors">
            <Plus className="w-3.5 h-3.5" />
            New Admission
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, admission no, CBSE PEN, or phone..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-500 outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Class Filter:</span>
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 font-medium text-slate-700 outline-none"
          >
            <option value="ALL">All Classes (Pre-K to 12)</option>
            <option value="Class 1">Class 1</option>
            <option value="Class 2">Class 2</option>
            <option value="Class 5">Class 5</option>
            <option value="Class 8">Class 8</option>
            <option value="Class 10">Class 10</option>
          </select>
        </div>
      </div>

      {/* High-Density Broadsheet Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 select-none">
              <tr className="h-10">
                <th className="px-4 py-2">Admission No</th>
                <th className="px-4 py-2">Student Full Name</th>
                <th className="px-4 py-2">CBSE PEN</th>
                <th className="px-4 py-2">Class / Sec</th>
                <th className="px-4 py-2">Guardian / Phone</th>
                <th className="px-4 py-2 text-center">Sibling Order</th>
                <th className="px-4 py-2">Transport Route</th>
                <th className="px-4 py-2 text-right">Fee Dues</th>
                <th className="px-4 py-2 text-center">Attendance</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student, idx) => (
                <tr 
                  key={student.id} 
                  className={`h-10 hover:bg-slate-50/80 transition-colors ${
                    idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                  }`}
                >
                  <td className="px-4 py-2 font-mono font-bold text-primary-700">
                    {student.admissionNo}
                  </td>
                  <td className="px-4 py-2 font-semibold text-slate-900">
                    {student.name}
                  </td>
                  <td className="px-4 py-2 font-mono text-slate-500 text-[11px]">
                    {student.cbsePen}
                  </td>
                  <td className="px-4 py-2 font-medium text-slate-700">
                    {student.className}-{student.section}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    <div>{student.guardianName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{student.guardianPhone}</div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    {student.siblingBirthOrder === 2 ? (
                      <span className="bg-violet-50 text-violet-700 border border-violet-200 text-[10px] font-bold px-1.5 py-0.5 rounded" title="Eligible for 25% Sibling Concession">
                        2nd Child (25% Disc)
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">1st Child</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {student.transportRoute}
                  </td>
                  <td className="px-4 py-2 text-right font-mono font-bold tabular-nums">
                    {student.feeStatus === 'PAID' ? (
                      <span className="text-slate-400">₹0.00</span>
                    ) : (
                      <span className="text-rose-600">{student.feeBalance}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      student.attendanceStatus === 'PRESENT'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {student.attendanceStatus}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => setActiveStudent(student)}
                      className="p-1 rounded text-slate-400 hover:text-primary-600 hover:bg-slate-100 transition-colors"
                      title="Inspect Student Record"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Slide-Over Drawer */}
      {activeStudent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="w-full max-w-md bg-white h-full shadow-elevation-2 flex flex-col animate-in slide-in-from-right duration-150">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Student Profile</h2>
                <div className="text-xs text-slate-500 font-mono mt-0.5">{activeStudent.admissionNo}</div>
              </div>
              <button 
                onClick={() => setActiveStudent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Demographics Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Demographic Profile</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] text-slate-400">Full Name</div>
                    <div className="font-semibold text-slate-900 text-sm mt-0.5">{activeStudent.name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Enrolled Class</div>
                    <div className="font-semibold text-slate-900 text-sm mt-0.5">{activeStudent.className}-{activeStudent.section}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">CBSE PEN</div>
                    <div className="font-mono text-slate-700 mt-0.5">{activeStudent.cbsePen}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">State Roll Code</div>
                    <div className="font-mono text-slate-700 mt-0.5">{activeStudent.stateRollCode}</div>
                  </div>
                </div>
              </div>

              {/* Family Tree & Sibling Discount Engine (SPECIFICATION.md Section 3.2) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Family Tree & Sibling Engine</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Guardian Name:</span>
                    <span className="font-semibold text-slate-800">{activeStudent.guardianName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Guardian Phone:</span>
                    <span className="font-mono font-medium text-slate-800">{activeStudent.guardianPhone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Family Birth Order:</span>
                    <span className="font-bold text-slate-900">Child #{activeStudent.siblingBirthOrder}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[10px] text-slate-400 mb-1">Linked Siblings in School:</div>
                    {activeStudent.siblings.length > 0 ? (
                      activeStudent.siblings.map(sib => (
                        <div key={sib} className="p-2 rounded bg-slate-50 font-medium text-slate-700 text-xs">
                          {sib}
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400 italic">No registered siblings in DPS Ranchi</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Outstanding Fee Summary */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Financial Status</div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Total Outstanding:</span>
                  <span className="font-mono font-bold text-base text-rose-600">{activeStudent.feeBalance}</span>
                </div>
                <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg transition-colors">
                  Collect Fee via POS Counter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
