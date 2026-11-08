'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Download,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  RotateCcw,
  Sparkles,
  Info,
  ChevronDown
} from 'lucide-react';

interface ColumnMapping {
  csvHeader: string;
  matchedField: string;
  confidence: number;
}

interface ValidRow {
  rowNum: number;
  admNo: string;
  name: string;
  className: string;
  section: string;
  dob: string;
  phone: string;
  gender: string;
}

interface QuarantinedRow {
  rowNum: number;
  admNo: string;
  name: string;
  rawInput: string;
  errorCode: string;
  errorMessage: string;
  hindiHint: string;
}

const mockInitialMappings: ColumnMapping[] = [
  { csvHeader: 'Adm No', matchedField: 'admission_number', confidence: 0.99 },
  { csvHeader: 'Vidyarthi ka Naam', matchedField: 'student_name', confidence: 0.96 },
  { csvHeader: 'Kaksha', matchedField: 'class_name', confidence: 0.95 },
  { csvHeader: 'Sec', matchedField: 'section_name', confidence: 0.98 },
  { csvHeader: 'DOB (Janam Tithi)', matchedField: 'date_of_birth', confidence: 0.94 },
  { csvHeader: 'Father Contact', matchedField: 'guardian_phone', confidence: 0.97 },
  { csvHeader: 'Gender', matchedField: 'gender', confidence: 0.95 },
];

const mockValidRows: ValidRow[] = [
  { rowNum: 2, admNo: 'DPS-2026-101', name: 'Aarav Sharma', className: 'Class 5', section: 'A', dob: '2014-07-15', phone: '+919876543210', gender: 'MALE' },
  { rowNum: 3, admNo: 'DPS-2026-102', name: 'Priya Kumari', className: 'Class 5', section: 'A', dob: '2014-11-22', phone: '+919835012345', gender: 'FEMALE' },
  { rowNum: 4, admNo: 'DPS-2026-103', name: 'Mohit Verma', className: 'Class 5', section: 'B', dob: '2014-03-08', phone: '+919431109876', gender: 'MALE' },
  { rowNum: 6, admNo: 'DPS-2026-105', name: 'Sneha Patel', className: 'Class 5', section: 'A', dob: '2014-09-19', phone: '+919708123456', gender: 'FEMALE' },
];

const mockQuarantinedRows: QuarantinedRow[] = [
  {
    rowNum: 5,
    admNo: 'DPS-2026-104',
    name: 'Rohan Gupta',
    rawInput: 'Phone: 12345',
    errorCode: 'ERR_INVALID_PHONE',
    errorMessage: 'Phone number has 5 digits instead of 10',
    hindiHint: 'अभिभावक का मोबाइल नंबर 10 अंकों का होना चाहिए (e.g. 9876543210)',
  },
  {
    rowNum: 7,
    admNo: 'DPS-2024-042',
    name: 'Duplicate Student',
    rawInput: 'AdmNo: DPS-2024-042',
    errorCode: 'ERR_DUPLICATE_ADM_NO',
    errorMessage: 'Admission number already exists in Class 4 roster',
    hindiHint: 'यह प्रवेश संख्या पहले से दर्ज है, कृपया नई संख्या प्रदान करें',
  },
];

export default function IngestionPage() {
  const [activeTab, setActiveTab] = useState<'valid' | 'quarantined'>('valid');
  const [hasCommitted, setHasCommitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCommit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setHasCommitted(true);
    }, 600);
  };

  const handleDownloadFixCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'RowNumber,AdmissionNumber,StudentName,RawInput,ErrorCode,ErrorMessage,HindiGuidanceHint\n' +
      mockQuarantinedRows
        .map(
          (r) =>
            `${r.rowNum},"${r.admNo}","${r.name}","${r.rawInput}","${r.errorCode}","${r.errorMessage}","${r.hindiHint}"`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'SchoolOS_Quarantined_Rows_To_Fix.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Self-Service Smart Ingestion
            </h1>
            <span className="bg-primary-50 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded border border-primary-200 flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3 text-primary-600" /> DATA-26 Split-Commit
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Import legacy Indian school CSV/Excel rosters with heuristic column auto-matching and isolated quarantine handling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setHasCommitted(false);
            }}
            className="px-3.5 py-2 border border-slate-200 text-slate-700 rounded-md text-xs font-medium hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Reset Demo
          </button>
          <button
            onClick={handleDownloadFixCSV}
            className="px-3.5 py-2 border border-amber-200 bg-amber-50 text-amber-800 rounded-md text-xs font-semibold hover:bg-amber-100 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-700" /> Export Quarantined CSV
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Total Rows Uploaded</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">6</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" /> Session_2026_Admissions.csv
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Heuristic Headers Mapped</div>
          <div className="text-2xl font-bold text-primary-600 mt-1 font-mono">7 / 7 (100%)</div>
          <div className="text-xs text-primary-700 mt-1">Colloquial Hindi/English detected</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Valid Rows (To Commit)</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">4 (66.7%)</div>
          <div className="text-xs text-emerald-700 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Clean +91 phone & ISO dates
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Quarantined Faulty Rows</div>
          <div className="text-2xl font-bold text-rose-600 mt-1 font-mono">2 (33.3%)</div>
          <div className="text-xs text-rose-700 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Isolated with Hindi hints
          </div>
        </div>
      </div>

      {/* Heuristic Column Auto-Mapping Preview */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <h2 className="text-sm font-semibold text-slate-900">
              Heuristic Indian Synonyms Auto-Detection Engine
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Confidence Threshold: &gt; 90%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
          {mockInitialMappings.map((m) => (
            <div
              key={m.csvHeader}
              className="bg-slate-50 border border-slate-200 rounded p-2.5 flex flex-col justify-between"
            >
              <div>
                <div className="text-[11px] text-slate-500 font-mono truncate" title={m.csvHeader}>
                  {m.csvHeader}
                </div>
                <div className="text-xs font-bold text-slate-800 mt-1 truncate" title={m.matchedField}>
                  {m.matchedField}
                </div>
              </div>
              <div className="mt-2 text-[10px] font-mono text-emerald-600 font-semibold flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" /> {(m.confidence * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Split-Commit Tabbed Review Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Tab Headers */}
        <div className="border-b border-slate-200 px-5 flex items-center justify-between bg-slate-50/70">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('valid')}
              className={`py-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'valid'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Valid Records ({mockValidRows.length})
            </button>
            <button
              onClick={() => setActiveTab('quarantined')}
              className={`py-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'quarantined'
                  ? 'border-rose-600 text-rose-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Quarantined Errors ({mockQuarantinedRows.length})
            </button>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-primary-600" /> Kernel RLS Verified
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'valid' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium font-mono">
                <tr>
                  <th className="py-2.5 px-4">Row #</th>
                  <th className="py-2.5 px-4">Admission No</th>
                  <th className="py-2.5 px-4">Student Name</th>
                  <th className="py-2.5 px-4">Class & Sec</th>
                  <th className="py-2.5 px-4">DOB</th>
                  <th className="py-2.5 px-4">Normalized Phone</th>
                  <th className="py-2.5 px-4">Gender</th>
                  <th className="py-2.5 px-4 text-right">Commit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {mockValidRows.map((r) => (
                  <tr key={r.rowNum} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-semibold">{r.rowNum}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{r.admNo}</td>
                    <td className="py-3 px-4 text-slate-800 font-sans font-medium">{r.name}</td>
                    <td className="py-3 px-4 text-slate-600">{r.className}-{r.section}</td>
                    <td className="py-3 px-4 text-slate-600">{r.dob}</td>
                    <td className="py-3 px-4 text-slate-800 font-semibold">{r.phone}</td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                        {r.gender}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {hasCommitted ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> COMMITTED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-primary-700 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                          READY
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium font-mono">
                <tr>
                  <th className="py-2.5 px-4">Row #</th>
                  <th className="py-2.5 px-4">Candidate Identity</th>
                  <th className="py-2.5 px-4">Faulty Input</th>
                  <th className="py-2.5 px-4">Error Diagnostics</th>
                  <th className="py-2.5 px-4">Localized Hindi Guidance Hint</th>
                  <th className="py-2.5 px-4 text-right">Quarantine Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockQuarantinedRows.map((q) => (
                  <tr key={q.rowNum} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3 px-4 text-rose-500 font-bold font-mono">{q.rowNum}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{q.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{q.admNo}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-rose-600 bg-rose-50/50 rounded px-2 py-1 text-[11px]">
                      {q.rawInput}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded font-bold">
                        {q.errorCode}
                      </span>
                      <div className="text-xs text-slate-600 mt-1">{q.errorMessage}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium font-sans">
                      <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded inline-block text-[11px]">
                        💡 {q.hindiHint}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <span className="text-rose-600 font-bold text-[10px] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                        QUARANTINED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Action Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-primary-600 shrink-0" />
            <span>
              Split-commit ensures clean records are imported immediately without failing on quarantined rows.
            </span>
          </div>

          <div className="flex items-center gap-3">
            {hasCommitted ? (
              <div className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-md flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> 4 Students Enrolled in Active Database
              </div>
            ) : (
              <button
                onClick={handleCommit}
                disabled={isProcessing}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                {isProcessing ? 'Writing to Postgres...' : 'Commit 4 Valid Records to Roster'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
