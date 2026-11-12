'use client';

import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, 
  Users, 
  CheckCircle2, 
  Clock, 
  Send
} from 'lucide-react';
import { getAttendanceSummary, AttendanceSummary } from '../../lib/api';

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState('Class 5-A');
  const [summary, setSummary] = useState<AttendanceSummary>({
    date: '2026-11-12',
    total_students: 1240,
    present: 1182,
    absent: 42,
    late: 16,
    attendance_pct: 95.3,
    staff_total: 48,
    staff_present: 46,
    biometric_punches_today: 94,
  });

  useEffect(() => {
    getAttendanceSummary().then(setSummary);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink tracking-tight">Attendance & Biometrics</h1>
            <span className="bg-semantic-success-bg text-semantic-success text-[10px] font-semibold px-2 py-0.5 rounded-full border border-semantic-success-border">
              eSSL ADMS LAN Synced
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Student daily roll call • 15-minute shift grace period • Automated WhatsApp absence alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-whisper transition-all">
            <Send className="w-3.5 h-3.5" />
            Dispatch Absence Push Alerts
          </button>
        </div>
      </div>

      {/* KPI Stats (Personio Metric Tiles) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="bg-canvas border border-hairline rounded-lg p-4 shadow-tile">
          <div className="text-[11px] font-semibold text-ink-faint uppercase tracking-utility">Total Present</div>
          <div className="text-xl font-bold text-ink mt-2 tabular-nums">
            {summary.present} <span className="text-xs font-normal text-ink-faint">/ {summary.total_students}</span>
          </div>
          <div className="text-[11px] text-semantic-success font-medium mt-1">{summary.attendance_pct}% Daily Turnout</div>
        </div>

        <div className="bg-canvas border border-hairline rounded-lg p-4 shadow-tile">
          <div className="text-[11px] font-semibold text-ink-faint uppercase tracking-utility">Total Absent</div>
          <div className="text-xl font-bold text-semantic-critical mt-2 tabular-nums">
            {summary.absent} <span className="text-xs font-normal text-ink-faint">Students</span>
          </div>
          <div className="text-[11px] text-semantic-critical font-medium mt-1">Absence Alerts Ready</div>
        </div>

        <div className="bg-canvas border border-hairline rounded-lg p-4 shadow-tile">
          <div className="text-[11px] font-semibold text-ink-faint uppercase tracking-utility">Gate Late Arrivals</div>
          <div className="text-xl font-bold text-semantic-warning mt-2 tabular-nums">
            {summary.late} <span className="text-xs font-normal text-ink-faint">Logged</span>
          </div>
          <div className="text-[11px] text-semantic-warning font-medium mt-1">After 08:00 AM cutoff</div>
        </div>

        <div className="bg-canvas border border-hairline rounded-lg p-4 shadow-tile">
          <div className="text-[11px] font-semibold text-ink-faint uppercase tracking-utility">Staff Biometrics</div>
          <div className="text-xl font-bold text-ink mt-2 tabular-nums">
            {summary.staff_present} <span className="text-xs font-normal text-ink-faint">/ {summary.staff_total}</span>
          </div>
          <div className="text-[11px] text-ink-muted mt-1 font-mono">{summary.biometric_punches_today} ADMS Punches Today</div>
        </div>
      </div>

      {/* Two Column Grid: Class Roster & Staff Biometric Punch Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Roll Call */}
        <div className="lg:col-span-2 bg-canvas border border-hairline rounded-lg overflow-hidden shadow-whisper">
          <div className="p-4 border-b border-hairline flex items-center justify-between bg-canvas-chrome">
            <div>
              <h2 className="text-xs font-bold text-ink tracking-tight flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-brand" />
                Class Roll Call: {selectedClass}
              </h2>
              <div className="text-[11px] text-ink-faint mt-0.5">38 of 40 Present (95.0%)</div>
            </div>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="text-xs border border-hairline rounded-md px-2 py-1 bg-canvas font-medium text-ink outline-none shadow-whisper"
            >
              <option value="Class 5-A">Class 5-A</option>
              <option value="Class 2-B">Class 2-B</option>
              <option value="Class 8-C">Class 8-C</option>
              <option value="Class 10-B">Class 10-B</option>
            </select>
          </div>

          <div className="p-4">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-semibold text-ink-faint tracking-utility border-b border-hairline">
                <tr>
                  <th className="pb-2">Roll No</th>
                  <th className="pb-2">Student Name</th>
                  <th className="pb-2">Clock In Time</th>
                  <th className="pb-2 text-right">Daily Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {[
                  { roll: '01', name: 'Aarav Sharma', time: '07:52 AM', status: 'PRESENT' },
                  { roll: '02', name: 'Ayush Kumar', time: '07:55 AM', status: 'PRESENT' },
                  { roll: '03', name: 'Deepak Soren', time: '08:12 AM', status: 'LATE' },
                  { roll: '04', name: 'Neha Kumari', time: '—', status: 'ABSENT' },
                ].map((s) => (
                  <tr key={s.roll} className="hover:bg-canvas-subdued/80 transition-colors">
                    <td className="py-2.5 font-mono text-ink text-xs">{s.roll}</td>
                    <td className="py-2.5 font-medium text-ink">{s.name}</td>
                    <td className="py-2.5 font-mono text-ink-muted text-[11px]">{s.time}</td>
                    <td className="py-2.5 text-right">
                      {s.status === 'PRESENT' ? (
                        <span className="bg-semantic-success-bg text-semantic-success px-2 py-0.5 rounded-full text-[10px] font-semibold border border-semantic-success-border inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Present
                        </span>
                      ) : s.status === 'LATE' ? (
                        <span className="bg-semantic-warning-bg text-semantic-warning px-2 py-0.5 rounded-full text-[10px] font-semibold border border-semantic-warning-border inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Late (8:12 AM)
                        </span>
                      ) : (
                        <span className="bg-semantic-critical-bg text-semantic-critical px-2 py-0.5 rounded-full text-[10px] font-semibold border border-semantic-critical-border inline-flex items-center gap-1">
                          Absent (Unexcused)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Staff Biometric ADMS Stream */}
        <div className="bg-canvas border border-hairline rounded-lg p-5 shadow-whisper space-y-3">
          <div className="border-b border-hairline pb-2.5">
            <h2 className="text-xs font-bold text-ink flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-brand" />
              Live Staff Biometric Stream
            </h2>
            <p className="text-[11px] text-ink-faint mt-0.5">eSSL Push Protocol `/iclock/cdata`</p>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { name: 'Dr. S. K. Mukherjee', role: 'Physics PGT', time: '07:44 AM', status: 'ON TIME' },
              { name: 'Smt. Anjali Roy', role: 'English TGT', time: '07:51 AM', status: 'ON TIME' },
              { name: 'Sri Alok Nath', role: 'Maths TGT', time: '08:08 AM', status: 'GRACE (8m)' },
              { name: 'Smt. Rekha Verma', role: 'Maths PGT', time: 'LEAVE', status: 'SICK LEAVE' },
            ].map((staff, idx) => (
              <div key={idx} className="p-2.5 rounded-md bg-canvas-chrome border border-hairline flex items-center justify-between">
                <div>
                  <div className="font-semibold text-ink text-xs">{staff.name}</div>
                  <div className="text-[10px] text-ink-faint">{staff.role} • {staff.time}</div>
                </div>
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded font-mono ${
                  staff.status === 'ON TIME' ? 'bg-semantic-success-bg text-semantic-success border border-semantic-success-border' :
                  staff.status.includes('GRACE') ? 'bg-semantic-warning-bg text-semantic-warning border border-semantic-warning-border' :
                  'bg-pastel-lavender text-pastel-lavender-ink'
                }`}>
                  {staff.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
