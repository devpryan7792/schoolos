'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Phone, 
  ShieldCheck, 
  Eye, 
  X,
  CreditCard,
  GraduationCap,
  Bus,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { getStudents } from '../../lib/api';

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
    siblingBirthOrder: 2,
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
    transportRoute: 'Route 7 (Albert Ekka)',
    feeStatus: 'OVERDUE',
    feeBalance: '₹8,500.00',
    attendanceStatus: 'ABSENT',
  },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentRecord[]>(mockStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [isLiveSync, setIsLiveSync] = useState(false);

  useEffect(() => {
    getStudents().then(({ students: apiStudents, isLive }) => {
      if (apiStudents && apiStudents.length > 0) {
        setStudents(apiStudents.map((s, idx) => ({
          id: s.id || `std-${idx}`,
          admissionNo: s.admission_no,
          name: s.name,
          cbsePen: s.cbse_pen,
          stateRollCode: s.roll_no,
          className: s.class_name,
          section: s.section,
          guardianName: s.guardian_name,
          guardianPhone: s.guardian_phone,
          siblingBirthOrder: 1,
          siblings: [s.sibling_concession],
          transportRoute: s.bus_route,
          feeStatus: s.fee_status === 'PAID' ? 'PAID' : s.fee_status === 'OVERDUE' ? 'OVERDUE' : 'DUE_SOON',
          feeBalance: typeof s.fee_dues_amount === 'number' ? `₹${s.fee_dues_amount.toFixed(2)}` : `₹${s.fee_dues_amount}`,
          attendanceStatus: 'PRESENT',
        })));
        setIsLiveSync(isLive);
      }
    });
  }, []);

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.guardianPhone.includes(searchQuery)
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink tracking-tight">Student Information Register (SIS)</h1>
            {isLiveSync && (
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
                ● PostgreSQL Live Sync
              </span>
            )}
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            1,550 enrolled students • CBSE Affiliation No. 3430012 • RLS Multi-Tenant Isolated
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-hairline bg-canvas hover:bg-canvas-chrome text-ink-secondary text-xs font-medium transition-colors shadow-whisper">
            <Download className="w-3.5 h-3.5 text-ink-muted" />
            Export CSV
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand hover:bg-brand-hover text-white text-xs font-medium transition-colors shadow-whisper">
            <Plus className="w-3.5 h-3.5" />
            Admit New Student
          </button>
        </div>
      </div>

      {/* Filter & Search Bar (Personio High-Density Utility) */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-ink-faint absolute left-3 top-2.5" />
          <input 
            type="text"
            placeholder="Search by student name, admission no, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-canvas border border-hairline rounded-md text-xs text-ink placeholder:text-ink-faint outline-none focus:border-brand shadow-whisper"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-canvas border border-hairline rounded-md text-xs text-ink-secondary shadow-whisper">
            <Filter className="w-3.5 h-3.5 text-ink-muted" />
            <span>Class: All</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-canvas border border-hairline rounded-md text-xs text-ink-secondary shadow-whisper">
            <span>Fee Status: All</span>
          </div>
        </div>
      </div>

      {/* Personio-Style High-Density Data Table */}
      <div className="bg-canvas border border-hairline rounded-lg shadow-whisper overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas-chrome border-b border-hairline text-ink-faint font-semibold uppercase text-[10px] tracking-utility">
              <tr>
                <th className="py-2.5 px-4">Adm No</th>
                <th className="py-2.5 px-4">Student Name & Identifiers</th>
                <th className="py-2.5 px-4">Class & Section</th>
                <th className="py-2.5 px-4">Guardian Contact</th>
                <th className="py-2.5 px-4">Sibling Concession</th>
                <th className="py-2.5 px-4">Fee Dues Balance</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map((student) => (
                <tr 
                  key={student.id} 
                  className="hover:bg-canvas-subdued/80 transition-colors group cursor-pointer"
                  onClick={() => setSelectedStudent(student)}
                >
                  <td className="py-3 px-4 font-mono font-semibold text-ink text-xs">
                    {student.admissionNo}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-ink text-xs">{student.name}</div>
                    <div className="text-[11px] text-ink-faint font-mono">
                      {student.cbsePen} • Roll: {student.stateRollCode}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-pastel-sky text-pastel-sky-ink px-2 py-0.5 rounded text-[10px] font-semibold border border-transparent">
                      {student.className}-{student.section}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-ink text-xs">{student.guardianName}</div>
                    <div className="text-[11px] text-ink-muted flex items-center gap-1 mt-0.5 font-mono">
                      <Phone className="w-3 h-3 text-ink-faint" /> {student.guardianPhone}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {student.siblingBirthOrder === 2 ? (
                      <span className="bg-pastel-peach text-pastel-peach-ink px-2 py-0.5 rounded text-[10px] font-semibold border border-transparent inline-flex items-center gap-1">
                        Child #2: 20% Off
                      </span>
                    ) : (
                      <span className="text-[11px] text-ink-faint">Standard</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums font-semibold">
                    {student.feeStatus === 'PAID' ? (
                      <span className="text-semantic-success">₹0.00 (Cleared)</span>
                    ) : (
                      <span className="text-semantic-critical">{student.feeBalance}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {student.feeStatus === 'PAID' ? (
                      <span className="bg-semantic-success-bg text-semantic-success px-2 py-0.5 rounded-full text-[10px] font-semibold border border-semantic-success-border inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    ) : student.feeStatus === 'DUE_SOON' ? (
                      <span className="bg-semantic-warning-bg text-semantic-warning px-2 py-0.5 rounded-full text-[10px] font-semibold border border-semantic-warning-border inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Due Soon
                      </span>
                    ) : (
                      <span className="bg-semantic-critical-bg text-semantic-critical px-2 py-0.5 rounded-full text-[10px] font-semibold border border-semantic-critical-border inline-flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Overdue
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStudent(student);
                      }}
                      className="p-1 rounded text-ink-faint hover:text-ink hover:bg-canvas-chrome transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Profile Drawer (Personio Drawer Pattern) */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px] flex justify-end animate-in fade-in duration-100">
          <div className="w-full max-w-md bg-canvas border-l border-hairline shadow-popover h-full flex flex-col p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-pastel-sky text-pastel-sky-ink flex items-center justify-center font-bold text-xs">
                  {selectedStudent.name[0]}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-ink">{selectedStudent.name}</h2>
                  <p className="text-[11px] text-ink-faint font-mono">{selectedStudent.admissionNo}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded text-ink-faint hover:text-ink hover:bg-canvas-chrome transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-lg bg-canvas-chrome border border-hairline space-y-2">
                <div className="font-semibold text-ink-muted text-[11px] uppercase tracking-utility">Academic Details</div>
                <div className="grid grid-cols-2 gap-2 text-ink">
                  <div>
                    <span className="text-ink-faint text-[11px]">Class & Section:</span>
                    <div className="font-semibold">{selectedStudent.className}-{selectedStudent.section}</div>
                  </div>
                  <div>
                    <span className="text-ink-faint text-[11px]">CBSE PEN:</span>
                    <div className="font-mono">{selectedStudent.cbsePen}</div>
                  </div>
                  <div>
                    <span className="text-ink-faint text-[11px]">Assigned Bus:</span>
                    <div>{selectedStudent.transportRoute}</div>
                  </div>
                  <div>
                    <span className="text-ink-faint text-[11px]">Attendance Today:</span>
                    <div className="text-semantic-success font-semibold">{selectedStudent.attendanceStatus}</div>
                  </div>
                </div>
              </div>

              {/* Fee Ledger Snapshot */}
              <div className="p-4 rounded-lg bg-canvas-chrome border border-hairline space-y-2">
                <div className="font-semibold text-ink-muted text-[11px] uppercase tracking-utility">Fee Ledger Snapshot</div>
                <div className="flex justify-between items-center text-ink">
                  <span className="text-ink-muted">Current Balance:</span>
                  <span className="font-mono font-bold text-sm text-semantic-critical">{selectedStudent.feeBalance}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-ink-faint border-t border-hairline pt-2">
                  <span>Admit Card Status:</span>
                  {selectedStudent.feeStatus === 'PAID' ? (
                    <span className="text-semantic-success font-semibold">UNLOCKED</span>
                  ) : (
                    <span className="text-semantic-critical font-semibold">FEE-LOCKED</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
