'use client';

import React, { useState } from 'react';
import { 
  Fingerprint, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Send
} from 'lucide-react';

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState('Class 5-A');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance & Biometrics</h1>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Biometric Buffer
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Student Daily Roll Call • Staff Biometric Punch Logs (eSSL / Mantra) • Automated Absence Push Alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium px-3.5 py-2 rounded-lg shadow-sm transition-colors">
            <Send className="w-3.5 h-3.5" />
            Dispatch Absence Alerts (WhatsApp & Push)
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Present</div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            1,482 <span className="text-xs font-normal text-slate-400">/ 1,550</span>
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">95.6% Daily Turnout</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Absent</div>
          <div className="text-2xl font-bold text-rose-600 mt-2 tabular-nums">
            48 <span className="text-xs font-normal text-slate-400">Students</span>
          </div>
          <div className="text-xs text-rose-600 font-medium mt-1">Absence Alerts Ready</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Late Arrivals (Gate)</div>
          <div className="text-2xl font-bold text-amber-600 mt-2 tabular-nums">
            20 <span className="text-xs font-normal text-slate-400">Logged</span>
          </div>
          <div className="text-xs text-amber-600 font-medium mt-1">After 08:00 AM cut-off</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Staff Biometric Check-ins</div>
          <div className="text-2xl font-bold text-primary-900 mt-2 tabular-nums">
            78 <span className="text-xs font-normal text-slate-400">/ 82</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">eSSL Biometric LAN synced</div>
        </div>
      </div>

      {/* Two Column Grid: Class Roster & Real-Time Biometric Punch Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Class Roll Call */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-600" />
                Class Roll Call: {selectedClass}
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">38 of 40 Present (95.0%)</div>
            </div>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 font-medium text-slate-700 outline-none"
            >
              <option value="Class 5-A">Class 5-A</option>
              <option value="Class 2-B">Class 2-B</option>
              <option value="Class 8-C">Class 8-C</option>
              <option value="Class 10-B">Class 10-B</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Roll #</th>
                  <th className="px-4 py-2.5">Admission No</th>
                  <th className="px-4 py-2.5">Student Name</th>
                  <th className="px-4 py-2.5">Recorded Time</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { roll: 14, adm: 'DPS-2024-042', name: 'Aarav Sharma', time: '07:52 AM', status: 'PRESENT' },
                  { roll: 15, adm: 'DPS-2024-043', name: 'Aditya Gupta', time: '07:48 AM', status: 'PRESENT' },
                  { roll: 16, adm: 'DPS-2024-044', name: 'Alok Nath', time: '08:06 AM', status: 'LATE' },
                  { roll: 17, adm: 'DPS-2024-045', name: 'Aniket Raj', time: '—', status: 'ABSENT' },
                  { roll: 18, adm: 'DPS-2024-046', name: 'Ayush Kumar', time: '07:55 AM', status: 'PRESENT' },
                ].map((row) => (
                  <tr key={row.adm} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-slate-500">{row.roll}</td>
                    <td className="px-4 py-2.5 font-mono font-medium text-primary-700">{row.adm}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">{row.name}</td>
                    <td className="px-4 py-2.5 text-slate-500 font-mono">{row.time}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        row.status === 'PRESENT'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : row.status === 'LATE'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-Time Staff Biometric Punch Feed */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-primary-600" />
              Live Staff Biometric Stream
            </h2>
            <span className="text-[10px] font-mono text-slate-400">eSSL LAN</span>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Dr. Anita Roy', role: 'PGT Chemistry', punch: 'CHECK_IN', time: '07:44:12 AM', terminal: 'Gate 1 Biometric' },
              { name: 'R. K. Mishra', role: 'TGT Mathematics', punch: 'CHECK_IN', time: '07:48:02 AM', terminal: 'Staff Room Sensor' },
              { name: 'Suman Sinha', role: 'PRT Hindi', punch: 'CHECK_IN', time: '07:51:30 AM', terminal: 'Gate 1 Biometric' },
              { name: 'Mohan Ram', role: 'Bus Driver (Route 4)', punch: 'CHECK_IN', time: '06:30:15 AM', terminal: 'Transport Depot' },
              { name: 'Neelam Jha', role: 'Librarian', punch: 'CHECK_IN', time: '07:58:20 AM', terminal: 'Library Sensor' },
            ].map((staff, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{staff.name}</div>
                  <div className="text-[10px] text-slate-400">{staff.role} • {staff.terminal}</div>
                </div>
                <div className="text-right">
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {staff.punch}
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{staff.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
