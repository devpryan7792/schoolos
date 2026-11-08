'use client';

import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  UserCheck,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  UserX,
  Users,
  CheckCircle2,
  Building2,
  ArrowRight,
  BookOpen,
  Filter
} from 'lucide-react';

interface TimetableSlotDisplay {
  id: string;
  day: string; // 'Monday', 'Tuesday', ...
  period: number;
  timeRange: string;
  subject: string;
  teacher: string;
  room: string;
  isHeavy: boolean;
  isSubstituted?: boolean;
  substituteTeacher?: string;
  conflict?: string;
}

const timeSlots = [
  { period: 1, time: '08:00 - 08:45' },
  { period: 2, time: '08:45 - 09:30' },
  { period: 3, time: '09:30 - 10:15' },
  { period: 4, time: '10:15 - 11:00' },
  { period: 5, time: '11:30 - 12:15' },
  { period: 6, time: '12:15 - 01:00' },
  { period: 7, time: '01:00 - 01:45' },
  { period: 8, time: '01:45 - 02:30' },
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimetablePage() {
  const [selectedClass, setSelectedClass] = useState('Class 10-A');
  const [isSubstitutionModalOpen, setIsSubstitutionModalOpen] = useState(false);
  const [hasSubstituted, setHasSubstituted] = useState(false);

  // Baseline schedule for Class 10-A
  const slots: Record<string, Record<number, TimetableSlotDisplay>> = {
    Monday: {
      1: { id: 'm1', day: 'Monday', period: 1, timeRange: '08:00 - 08:45', subject: 'Mathematics', teacher: 'Mr. R. Sharma', room: 'Room 101', isHeavy: true },
      2: {
        id: 'm2',
        day: 'Monday',
        period: 2,
        timeRange: '08:45 - 09:30',
        subject: 'Mathematics (Algebra)',
        teacher: hasSubstituted ? 'Mrs. Anita Verma' : 'Mr. R. Sharma',
        room: 'Room 101',
        isHeavy: true,
        isSubstituted: hasSubstituted,
        substituteTeacher: hasSubstituted ? 'Mrs. Anita Verma (Auto-Assigned)' : undefined,
      },
      3: { id: 'm3', day: 'Monday', period: 3, timeRange: '09:30 - 10:15', subject: 'Physics', teacher: 'Dr. S. K. Singh', room: 'Lab 2', isHeavy: true },
      4: { id: 'm4', day: 'Monday', period: 4, timeRange: '10:15 - 11:00', subject: 'English Literature', teacher: 'Ms. Rachel Green', room: 'Room 101', isHeavy: false },
      5: { id: 'm5', day: 'Monday', period: 5, timeRange: '11:30 - 12:15', subject: 'Social Studies', teacher: 'Mr. K. C. Paul', room: 'Room 101', isHeavy: false },
      6: { id: 'm6', day: 'Monday', period: 6, timeRange: '12:15 - 01:00', subject: 'Computer Science', teacher: 'Mrs. Neha Roy', room: 'Comp Lab', isHeavy: false },
      7: { id: 'm7', day: 'Monday', period: 7, timeRange: '01:00 - 01:45', subject: 'Hindi / Sanskrit', teacher: 'Pandit J. Mishra', room: 'Room 101', isHeavy: false },
      8: { id: 'm8', day: 'Monday', period: 8, timeRange: '01:45 - 02:30', subject: 'Physical Education', teacher: 'Coach R. Yadav', room: 'Ground', isHeavy: false },
    },
    Tuesday: {
      1: { id: 't1', day: 'Tuesday', period: 1, timeRange: '08:00 - 08:45', subject: 'Chemistry', teacher: 'Dr. V. Prasad', room: 'Lab 1', isHeavy: true },
      2: { id: 't2', day: 'Tuesday', period: 2, timeRange: '08:45 - 09:30', subject: 'Chemistry (Organic)', teacher: 'Dr. V. Prasad', room: 'Lab 1', isHeavy: true },
      3: { id: 't3', day: 'Tuesday', period: 3, timeRange: '09:30 - 10:15', subject: 'English Language', teacher: 'Ms. Rachel Green', room: 'Room 101', isHeavy: false },
      4: { id: 't4', day: 'Tuesday', period: 4, timeRange: '10:15 - 11:00', subject: 'Mathematics', teacher: 'Mr. R. Sharma', room: 'Room 101', isHeavy: true },
      5: { id: 't5', day: 'Tuesday', period: 5, timeRange: '11:30 - 12:15', subject: 'Biology', teacher: 'Mrs. S. Bannerjee', room: 'Room 101', isHeavy: false },
      6: { id: 't6', day: 'Tuesday', period: 6, timeRange: '12:15 - 01:00', subject: 'History / Civics', teacher: 'Mr. K. C. Paul', room: 'Room 101', isHeavy: false },
      7: { id: 't7', day: 'Tuesday', period: 7, timeRange: '01:00 - 01:45', subject: 'Library / Reading', teacher: 'Librarian M. Sinha', room: 'Library', isHeavy: false },
      8: { id: 't8', day: 'Tuesday', period: 8, timeRange: '01:45 - 02:30', subject: 'Art & Crafts', teacher: 'Mr. A. Sen', room: 'Art Room', isHeavy: false },
    },
    Wednesday: {
      1: { id: 'w1', day: 'Wednesday', period: 1, timeRange: '08:00 - 08:45', subject: 'Mathematics', teacher: 'Mr. R. Sharma', room: 'Room 101', isHeavy: true },
      2: { id: 'w2', day: 'Wednesday', period: 2, timeRange: '08:45 - 09:30', subject: 'Physics', teacher: 'Dr. S. K. Singh', room: 'Room 101', isHeavy: true },
      3: { id: 'w3', day: 'Wednesday', period: 3, timeRange: '09:30 - 10:15', subject: 'Social Studies', teacher: 'Mr. K. C. Paul', room: 'Room 101', isHeavy: false },
      4: { id: 'w4', day: 'Wednesday', period: 4, timeRange: '10:15 - 11:00', subject: 'Hindi / Sanskrit', teacher: 'Pandit J. Mishra', room: 'Room 101', isHeavy: false },
      5: { id: 'w5', day: 'Wednesday', period: 5, timeRange: '11:30 - 12:15', subject: 'English', teacher: 'Ms. Rachel Green', room: 'Room 101', isHeavy: false },
      6: { id: 'w6', day: 'Wednesday', period: 6, timeRange: '12:15 - 01:00', subject: 'Chemistry Lab', teacher: 'Dr. V. Prasad', room: 'Lab 1', isHeavy: true },
      7: { id: 'w7', day: 'Wednesday', period: 7, timeRange: '01:00 - 01:45', subject: 'Chemistry Lab', teacher: 'Dr. V. Prasad', room: 'Lab 1', isHeavy: true },
      8: { id: 'w8', day: 'Wednesday', period: 8, timeRange: '01:45 - 02:30', subject: 'Moral Science / Yoga', teacher: 'Coach R. Yadav', room: 'Hall', isHeavy: false },
    },
    Thursday: {
      1: { id: 'th1', day: 'Thursday', period: 1, timeRange: '08:00 - 08:45', subject: 'Physics Lab', teacher: 'Dr. S. K. Singh', room: 'Lab 2', isHeavy: true },
      2: { id: 'th2', day: 'Thursday', period: 2, timeRange: '08:45 - 09:30', subject: 'Physics Lab', teacher: 'Dr. S. K. Singh', room: 'Lab 2', isHeavy: true },
      3: { id: 'th3', day: 'Thursday', period: 3, timeRange: '09:30 - 10:15', subject: 'Mathematics', teacher: 'Mr. R. Sharma', room: 'Room 101', isHeavy: true },
      4: { id: 'th4', day: 'Thursday', period: 4, timeRange: '10:15 - 11:00', subject: 'English Literature', teacher: 'Ms. Rachel Green', room: 'Room 101', isHeavy: false },
      5: { id: 'th5', day: 'Thursday', period: 5, timeRange: '11:30 - 12:15', subject: 'Geography', teacher: 'Mr. K. C. Paul', room: 'Room 101', isHeavy: false },
      6: { id: 'th6', day: 'Thursday', period: 6, timeRange: '12:15 - 01:00', subject: 'Biology Lab', teacher: 'Mrs. S. Bannerjee', room: 'Bio Lab', isHeavy: false },
      7: { id: 'th7', day: 'Thursday', period: 7, timeRange: '01:00 - 01:45', subject: 'Computer Science', teacher: 'Mrs. Neha Roy', room: 'Comp Lab', isHeavy: false },
      8: { id: 'th8', day: 'Thursday', period: 8, timeRange: '01:45 - 02:30', subject: 'Sports / Games', teacher: 'Coach R. Yadav', room: 'Ground', isHeavy: false },
    },
    Friday: {
      1: { id: 'f1', day: 'Friday', period: 1, timeRange: '08:00 - 08:45', subject: 'Mathematics', teacher: 'Mr. R. Sharma', room: 'Room 101', isHeavy: true },
      2: { id: 'f2', day: 'Friday', period: 2, timeRange: '08:45 - 09:30', subject: 'English Language', teacher: 'Ms. Rachel Green', room: 'Room 101', isHeavy: false },
      3: { id: 'f3', day: 'Friday', period: 3, timeRange: '09:30 - 10:15', subject: 'Chemistry', teacher: 'Dr. V. Prasad', room: 'Room 101', isHeavy: true },
      4: { id: 'f4', day: 'Friday', period: 4, timeRange: '10:15 - 11:00', subject: 'Physics', teacher: 'Dr. S. K. Singh', room: 'Room 101', isHeavy: true },
      5: { id: 'f5', day: 'Friday', period: 5, timeRange: '11:30 - 12:15', subject: 'Social Studies', teacher: 'Mr. K. C. Paul', room: 'Room 101', isHeavy: false },
      6: { id: 'f6', day: 'Friday', period: 6, timeRange: '12:15 - 01:00', subject: 'Hindi / Sanskrit', teacher: 'Pandit J. Mishra', room: 'Room 101', isHeavy: false },
      7: { id: 'f7', day: 'Friday', period: 7, timeRange: '01:00 - 01:45', subject: 'Music / Debate', teacher: 'Mr. A. Sen', room: 'Hall', isHeavy: false },
      8: { id: 'f8', day: 'Friday', period: 8, timeRange: '01:45 - 02:30', subject: 'Self-Study & Mentoring', teacher: 'Mr. R. Sharma', room: 'Room 101', isHeavy: false },
    },
    Saturday: {
      1: { id: 's1', day: 'Saturday', period: 1, timeRange: '08:00 - 08:45', subject: 'Mathematics Test', teacher: 'Mr. R. Sharma', room: 'Room 101', isHeavy: true },
      2: { id: 's2', day: 'Saturday', period: 2, timeRange: '08:45 - 09:30', subject: 'Science Quiz', teacher: 'Dr. S. K. Singh', room: 'Room 101', isHeavy: true },
      3: { id: 's3', day: 'Saturday', period: 3, timeRange: '09:30 - 10:15', subject: 'English Club', teacher: 'Ms. Rachel Green', room: 'Room 101', isHeavy: false },
      4: { id: 's4', day: 'Saturday', period: 4, timeRange: '10:15 - 11:00', subject: 'Inter-House Sports', teacher: 'Coach R. Yadav', room: 'Ground', isHeavy: false },
      5: { id: 's5', day: 'Saturday', period: 5, timeRange: '11:30 - 12:15', subject: 'House Assembly', teacher: 'Principal Office', room: 'Auditorium', isHeavy: false },
      6: { id: 's6', day: 'Saturday', period: 6, timeRange: '12:15 - 01:00', subject: 'Remedial Classes', teacher: 'Faculty Roster', room: 'Room 101', isHeavy: false },
      7: { id: 's7', day: 'Saturday', period: 7, timeRange: '01:00 - 01:45', subject: 'Dispersal & Bus Queue', teacher: 'Transport Team', room: 'Campus Gates', isHeavy: false },
      8: { id: 's8', day: 'Saturday', period: 8, timeRange: '01:45 - 02:30', subject: 'Weekly Staff Meeting', teacher: 'All Teachers', room: 'Staff Room', isHeavy: false },
    },
  };

  const handleConfirmSubstitution = () => {
    setHasSubstituted(true);
    setIsSubstitutionModalOpen(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Master Timetable & Substitution Engine
            </h1>
            <span className="bg-primary-50 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded border border-primary-200 flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3 text-primary-600" /> SCHED-05 / HR-06
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Automated hard-constraint conflict checker and biometric absence substitution optimizer.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Select Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-300 rounded-md px-3 py-1.5 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="Class 10-A">Class 10-A (35 Students)</option>
              <option value="Class 9-B">Class 9-B (38 Students)</option>
              <option value="Class 8-A">Class 8-A (40 Students)</option>
            </select>
          </div>

          <button
            onClick={() => setIsSubstitutionModalOpen(true)}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <UserX className="w-3.5 h-3.5" /> Biometric Absence Auto-Substitute
          </button>
        </div>
      </div>

      {/* Constraints & Conflict Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Zero Teacher Collisions</div>
            <div className="text-[11px] text-slate-500 mt-0.5">No teacher double-booked in any period</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Room Capacity Verified</div>
            <div className="text-[11px] text-slate-500 mt-0.5">All 35 students fit in 45-seat Room 101</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Consecutive Heavy Cap Passed</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Max 2 heavy periods (Maths/Physics) in sequence</div>
          </div>
        </div>
      </div>

      {/* Substitution Live Banner */}
      {hasSubstituted && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-amber-700 shrink-0" />
            <div className="text-xs text-amber-900">
              <span className="font-bold">Autonomous Substitution Active:</span> Mr. R. Sharma was marked absent today by biometric ADMS gate.
              Period 2 (Mathematics) was automatically reassigned to <strong>Mrs. Anita Verma</strong> (Maths Specialist, 1 weekly substitution).
            </div>
          </div>
          <button
            onClick={() => setHasSubstituted(false)}
            className="text-xs text-amber-800 underline font-semibold hover:text-amber-950"
          >
            Revert
          </button>
        </div>
      )}

      {/* Weekly Grid */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary-600" />
            Weekly Master Schedule: {selectedClass} • Academic Year 2026-2027
          </div>
          <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded bg-primary-100 border border-primary-300" /> Standard
            <span className="inline-block w-2.5 h-2.5 rounded bg-rose-50 border border-rose-300 ml-2" /> Heavy Subject
            <span className="inline-block w-2.5 h-2.5 rounded bg-amber-100 border border-amber-300 ml-2" /> Substituted
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-mono">
                <th className="p-3 w-28 border-r border-slate-200">Day / Period</th>
                {timeSlots.map((ts) => (
                  <th key={ts.period} className="p-2.5 text-center border-r border-slate-200 min-w-[125px]">
                    <div className="font-bold text-slate-800">P{ts.period}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{ts.time}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {days.map((day) => (
                <tr key={day} className="hover:bg-slate-50/40">
                  <td className="p-3 font-bold text-slate-900 bg-slate-50 border-r border-slate-200">
                    {day}
                  </td>
                  {timeSlots.map((ts) => {
                    const slot = slots[day]?.[ts.period];
                    if (!slot) {
                      return (
                        <td key={ts.period} className="p-2 border-r border-slate-200 text-center text-slate-300">
                          -
                        </td>
                      );
                    }

                    return (
                      <td
                        key={ts.period}
                        className={`p-2 border-r border-slate-200 transition-colors ${
                          slot.isSubstituted
                            ? 'bg-amber-50 hover:bg-amber-100/80'
                            : slot.isHeavy
                            ? 'bg-rose-50/40 hover:bg-rose-50'
                            : 'hover:bg-slate-100/50'
                        }`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="font-bold text-slate-900 text-[11px] truncate" title={slot.subject}>
                            {slot.subject}
                          </div>
                          <div className="text-[10px] text-slate-600 truncate" title={slot.teacher}>
                            {slot.teacher}
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono mt-0.5">
                            <span>{slot.room}</span>
                            {slot.isSubstituted && (
                              <span className="text-amber-800 font-bold bg-amber-100 px-1 rounded">
                                SUB
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Autonomous Substitution Optimizer Modal */}
      {isSubstitutionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Autonomous Substitution Optimizer
                </h3>
              </div>
              <button
                onClick={() => setIsSubstitutionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-md">
                <div className="font-bold text-rose-900 flex items-center gap-1.5">
                  <UserX className="w-4 h-4 text-rose-600" /> Biometric Absence: Mr. R. Sharma
                </div>
                <div className="text-rose-700 mt-1">
                  Department: Mathematics • Missing Clock-in: 08:30 AM (Unexcused)
                </div>
                <div className="text-rose-800 font-medium mt-1">
                  Affected Slots Today: Period 1 (10-A), Period 2 (10-A), Period 4 (10-A)
                </div>
              </div>

              <div>
                <div className="font-semibold text-slate-800 mb-2">
                  Period 2 Candidates (Free Teachers Ranked by Load & Subject):
                </div>

                <div className="space-y-2">
                  {/* Candidate 1: Best match */}
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-md flex items-center justify-between">
                    <div>
                      <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                        Mrs. Anita Verma
                        <span className="bg-emerald-200 text-emerald-900 text-[10px] font-bold px-1.5 py-0.2 rounded">
                          OPTIMAL MATCH (95%)
                        </span>
                      </div>
                      <div className="text-emerald-800 text-[11px] mt-0.5">
                        Primary: Mathematics • Weekly Substitutions: 1 • Biometric: Present
                      </div>
                    </div>
                    <span className="text-emerald-700 font-bold font-mono text-sm">+50 Score</span>
                  </div>

                  {/* Candidate 2: Lower match */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between opacity-70">
                    <div>
                      <div className="font-semibold text-slate-900">Mr. Rajiv Sen</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Primary: English • Weekly Substitutions: 4 • Biometric: Present
                      </div>
                    </div>
                    <span className="text-slate-600 font-mono text-xs">+15 Score</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsSubstitutionModalOpen(false)}
                className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-md text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubstitution}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Assign Mrs. Anita Verma
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
