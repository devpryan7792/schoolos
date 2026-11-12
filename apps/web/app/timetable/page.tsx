'use client';

import React, { useState } from 'react';
import {
  CalendarDays,
  UserCheck,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { autoAssignSubstitutions } from '../../lib/api';

interface TimetableSlotDisplay {
  id: string;
  day: string;
  period: number;
  timeRange: string;
  subject: string;
  teacher: string;
  room: string;
  isHeavy: boolean;
  isSubstituted?: boolean;
  substituteTeacher?: string;
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
      4: { id: 'm4', day: 'Monday', period: 4, timeRange: '10:15 - 11:00', subject: 'English Lit', teacher: 'Ms. Rachel Green', room: 'Room 101', isHeavy: false },
      5: { id: 'm5', day: 'Monday', period: 5, timeRange: '11:30 - 12:15', subject: 'Social Studies', teacher: 'Mr. K. C. Paul', room: 'Room 101', isHeavy: false },
      6: { id: 'm6', day: 'Monday', period: 6, timeRange: '12:15 - 01:00', subject: 'Computer Sci', teacher: 'Mrs. Neha Roy', room: 'Comp Lab', isHeavy: false },
      7: { id: 'm7', day: 'Monday', period: 7, timeRange: '01:00 - 01:45', subject: 'Hindi/Sanskrit', teacher: 'Pt. J. Mishra', room: 'Room 101', isHeavy: false },
      8: { id: 'm8', day: 'Monday', period: 8, timeRange: '01:45 - 02:30', subject: 'Physical Ed', teacher: 'Coach R. Yadav', room: 'Ground', isHeavy: false },
    },
    Tuesday: {
      1: { id: 't1', day: 'Tuesday', period: 1, timeRange: '08:00 - 08:45', subject: 'Chemistry', teacher: 'Dr. V. Prasad', room: 'Lab 1', isHeavy: true },
      2: { id: 't2', day: 'Tuesday', period: 2, timeRange: '08:45 - 09:30', subject: 'Chemistry Lab', teacher: 'Dr. V. Prasad', room: 'Lab 1', isHeavy: true },
      3: { id: 't3', day: 'Tuesday', period: 3, timeRange: '09:30 - 10:15', subject: 'English Lang', teacher: 'Ms. Rachel Green', room: 'Room 101', isHeavy: false },
      4: { id: 't4', day: 'Tuesday', period: 4, timeRange: '10:15 - 11:00', subject: 'Mathematics', teacher: 'Mr. R. Sharma', room: 'Room 101', isHeavy: true },
      5: { id: 't5', day: 'Tuesday', period: 5, timeRange: '11:30 - 12:15', subject: 'Biology', teacher: 'Mrs. S. Bannerjee', room: 'Room 101', isHeavy: false },
      6: { id: 't6', day: 'Tuesday', period: 6, timeRange: '12:15 - 01:00', subject: 'History/Civics', teacher: 'Mr. K. C. Paul', room: 'Room 101', isHeavy: false },
      7: { id: 't7', day: 'Tuesday', period: 7, timeRange: '01:00 - 01:45', subject: 'Library', teacher: 'Mrs. M. Sinha', room: 'Library', isHeavy: false },
      8: { id: 't8', day: 'Tuesday', period: 8, timeRange: '01:45 - 02:30', subject: 'Art & Crafts', teacher: 'Mr. A. Sen', room: 'Art Room', isHeavy: false },
    },
    Wednesday: {
      1: { id: 'w1', day: 'Wednesday', period: 1, timeRange: '08:00 - 08:45', subject: 'Mathematics', teacher: 'Mr. R. Sharma', room: 'Room 101', isHeavy: true },
      2: { id: 'w2', day: 'Wednesday', period: 2, timeRange: '08:45 - 09:30', subject: 'Physics', teacher: 'Dr. S. K. Singh', room: 'Room 101', isHeavy: true },
      3: { id: 'w3', day: 'Wednesday', period: 3, timeRange: '09:30 - 10:15', subject: 'Social Studies', teacher: 'Mr. K. C. Paul', room: 'Room 101', isHeavy: false },
      4: { id: 'w4', day: 'Wednesday', period: 4, timeRange: '10:15 - 11:00', subject: 'Hindi', teacher: 'Pt. J. Mishra', room: 'Room 101', isHeavy: false },
      5: { id: 'w5', day: 'Wednesday', period: 5, timeRange: '11:30 - 12:15', subject: 'English', teacher: 'Ms. Rachel Green', room: 'Room 101', isHeavy: false },
      6: { id: 'w6', day: 'Wednesday', period: 6, timeRange: '12:15 - 01:00', subject: 'Chemistry Lab', teacher: 'Dr. V. Prasad', room: 'Lab 1', isHeavy: true },
      7: { id: 'w7', day: 'Wednesday', period: 7, timeRange: '01:00 - 01:45', subject: 'Chemistry Lab', teacher: 'Dr. V. Prasad', room: 'Lab 1', isHeavy: true },
      8: { id: 'w8', day: 'Wednesday', period: 8, timeRange: '01:45 - 02:30', subject: 'Yoga / PE', teacher: 'Coach R. Yadav', room: 'Hall', isHeavy: false },
    },
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink tracking-tight">Master Weekly Timetable</h1>
            <span className="bg-semantic-success-bg text-semantic-success text-[10px] font-semibold px-2 py-0.5 rounded-full border border-semantic-success-border">
              0 Hard Collisions
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Hard constraints: 0 teacher overlap, max 2 consecutive heavy periods • 1-click substitute optimizer
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSubstitutionModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-whisper transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Auto-Assign Absent Substitute
          </button>
        </div>
      </div>

      {/* Timetable Weekly Matrix (Notion Document Calm Grid) */}
      <div className="bg-canvas border border-hairline rounded-lg overflow-hidden shadow-whisper">
        <div className="p-3 border-b border-hairline bg-canvas-chrome flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ink">Schedule Grid:</span>
            <span className="bg-pastel-sky text-pastel-sky-ink px-2 py-0.5 rounded text-[10px] font-semibold">
              {selectedClass}
            </span>
          </div>
          <div className="text-[11px] text-ink-faint font-mono">
            Heavy Subjects: Math, Physics, Chemistry (Max 2 consecutive)
          </div>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-hairline text-ink-faint uppercase text-[10px] font-semibold tracking-utility">
                <th className="p-2.5 w-24">Day</th>
                {timeSlots.map((ts) => (
                  <th key={ts.period} className="p-2.5 text-center">
                    <div>P{ts.period}</div>
                    <div className="text-[9px] font-normal font-mono text-ink-faint lowercase">{ts.time}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {days.slice(0, 3).map((day) => (
                <tr key={day} className="hover:bg-canvas-subdued transition-colors">
                  <td className="p-2.5 font-bold text-ink text-xs bg-canvas-chrome border-r border-hairline">
                    {day}
                  </td>
                  {timeSlots.map((ts) => {
                    const slot = slots[day]?.[ts.period];
                    if (!slot) {
                      return (
                        <td key={ts.period} className="p-2 text-center text-ink-faint text-[10px]">
                          —
                        </td>
                      );
                    }
                    return (
                      <td key={ts.period} className="p-1.5 align-top">
                        <div className={`p-2 rounded-md border text-[11px] space-y-0.5 ${
                          slot.isSubstituted
                            ? 'bg-pastel-peach/40 border-pastel-peach-ink/20'
                            : slot.isHeavy
                            ? 'bg-canvas-chrome border-hairline'
                            : 'bg-canvas border-hairline'
                        }`}>
                          <div className="font-semibold text-ink truncate leading-tight">
                            {slot.subject}
                          </div>
                          <div className="text-[10px] text-ink-muted truncate">
                            {slot.teacher}
                          </div>
                          <div className="text-[9px] font-mono text-ink-faint">
                            {slot.room}
                          </div>
                          {slot.isSubstituted && (
                            <span className="block text-[8px] font-bold text-semantic-critical uppercase font-mono mt-0.5">
                              SUB ASSIGNED
                            </span>
                          )}
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

      {/* 1-Click Substitution Modal (Personio Action Pattern) */}
      {isSubstitutionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-md bg-canvas border border-hairline rounded-lg shadow-popover p-5 space-y-4">
            <div className="border-b border-hairline pb-3">
              <div className="font-bold text-sm text-ink flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand" />
                Teacher Substitution Assignment
              </div>
              <p className="text-[11px] text-ink-faint mt-0.5">
                Absent Teacher: Smt. Rekha Verma (Period 2 Math)
              </p>
            </div>

            <div className="p-3 rounded-md bg-canvas-chrome border border-hairline space-y-2 text-xs">
              <div className="font-semibold text-ink text-[11px] uppercase tracking-utility">
                Candidate Evaluation Matrix
              </div>
              <div className="p-2 rounded bg-canvas border border-hairline flex justify-between items-center">
                <div>
                  <div className="font-bold text-ink">Mrs. Anita Verma (TGT Math)</div>
                  <div className="text-[10px] text-ink-faint">Free Period 2 • Same Subject Match • 18/24 load</div>
                </div>
                <span className="bg-semantic-success-bg text-semantic-success text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">
                  SCORE: 98%
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsSubstitutionModalOpen(false)}
                className="flex-1 py-1.5 rounded-md border border-hairline bg-canvas text-xs font-medium text-ink-muted hover:bg-canvas-chrome transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await autoAssignSubstitutions('tea-rekha-01', 'P2_MON');
                  setHasSubstituted(true);
                  setIsSubstitutionModalOpen(false);
                }}
                className="flex-1 py-1.5 rounded-md bg-brand hover:bg-brand-hover text-xs font-medium text-white transition-all shadow-whisper"
              >
                Confirm Substitution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
