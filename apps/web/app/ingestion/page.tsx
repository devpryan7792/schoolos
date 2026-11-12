'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Download,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ArrowRight
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
    }, 500);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink tracking-tight">Smart CSV/Excel Ingestion Engine</h1>
            <span className="bg-pastel-sky text-pastel-sky-ink text-[10px] font-semibold px-2 py-0.5 rounded-full border border-transparent">
              DATA-26 Split-Commit
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Colloquial Indian header heuristic mapping • Mobile +91 normalization • Bilingual Hindi error quarantine
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleCommit}
            disabled={hasCommitted || isProcessing}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium shadow-whisper transition-all ${
              hasCommitted
                ? 'bg-semantic-success-bg text-semantic-success border border-semantic-success-border cursor-default'
                : 'bg-brand hover:bg-brand-hover text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {hasCommitted ? '4 Valid Records Committed' : isProcessing ? 'Committing...' : 'Commit 4 Valid Records'}
          </button>
        </div>
      </div>

      {/* Upload Drop Zone & Heuristic Header Mapping */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: File Dropzone (Notion Document Style) */}
        <div className="bg-canvas border border-dashed border-hairline hover:border-brand/40 rounded-lg p-6 shadow-whisper flex flex-col items-center justify-center text-center space-y-2 transition-all">
          <div className="w-10 h-10 rounded-full bg-canvas-chrome border border-hairline flex items-center justify-center text-ink-muted">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs text-ink">class5_admissions_nov2026.csv</div>
            <div className="text-[11px] text-ink-faint">6 rows detected • Auto-mapped with 96.3% confidence</div>
          </div>
          <span className="text-[10px] bg-pastel-mint text-pastel-mint-ink font-semibold px-2 py-0.5 rounded">
            Ready for Split-Commit
          </span>
        </div>

        {/* Right Columns (2): Colloquial Header Synonyms Detected */}
        <div className="lg:col-span-2 bg-canvas border border-hairline rounded-lg p-5 shadow-whisper space-y-3">
          <div className="flex items-center justify-between border-b border-hairline pb-2.5">
            <div className="text-xs font-semibold text-ink flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              Auto-Detected Colloquial Indian Header Mappings
            </div>
            <span className="text-[10px] font-mono text-semantic-success">7/7 Mapped</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {mockInitialMappings.map((m, idx) => (
              <div key={idx} className="p-2 rounded-md bg-canvas-chrome border border-hairline text-[11px] space-y-0.5">
                <div className="text-ink-muted truncate font-mono">{m.csvHeader}</div>
                <div className="font-bold text-ink flex items-center gap-1 text-[10px] text-brand">
                  ➔ {m.matchedField}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Split-Commit Tabular Review (Personio High-Density Table) */}
      <div className="bg-canvas border border-hairline rounded-lg overflow-hidden shadow-whisper space-y-0">
        {/* Tab Headers */}
        <div className="p-3 border-b border-hairline bg-canvas-chrome flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('valid')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === 'valid'
                  ? 'bg-canvas text-ink font-semibold shadow-whisper border border-hairline'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Valid Rows ({mockValidRows.length})
            </button>
            <button
              onClick={() => setActiveTab('quarantined')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeTab === 'quarantined'
                  ? 'bg-canvas text-semantic-critical font-semibold shadow-whisper border border-hairline'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Quarantined Error Rows ({mockQuarantinedRows.length})
            </button>
          </div>

          <span className="text-[11px] text-ink-faint font-mono">
            Split-Commit: Valid rows commit to Postgres; corrupt rows isolate for correction
          </span>
        </div>

        {/* Content Table */}
        <div className="p-4">
          {activeTab === 'valid' ? (
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[10px] uppercase font-semibold text-ink-faint tracking-utility border-b border-hairline font-sans">
                <tr>
                  <th className="pb-2">Row</th>
                  <th className="pb-2">Adm No</th>
                  <th className="pb-2">Student Name</th>
                  <th className="pb-2">Class</th>
                  <th className="pb-2">DOB</th>
                  <th className="pb-2">Normalized Phone</th>
                  <th className="pb-2 text-right">Commit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {mockValidRows.map((r) => (
                  <tr key={r.rowNum} className="hover:bg-canvas-subdued transition-colors text-xs">
                    <td className="py-2.5 text-ink-faint">{r.rowNum}</td>
                    <td className="py-2.5 font-bold text-ink">{r.admNo}</td>
                    <td className="py-2.5 font-sans font-medium text-ink">{r.name}</td>
                    <td className="py-2.5 font-sans text-ink-muted">{r.className}-{r.section}</td>
                    <td className="py-2.5 text-ink-faint">{r.dob}</td>
                    <td className="py-2.5 text-brand">{r.phone}</td>
                    <td className="py-2.5 text-right font-sans">
                      <span className="bg-semantic-success-bg text-semantic-success text-[10px] font-semibold px-2 py-0.5 rounded-full border border-semantic-success-border">
                        {hasCommitted ? 'COMMITTED' : 'READY'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[10px] uppercase font-semibold text-ink-faint tracking-utility border-b border-hairline font-sans">
                <tr>
                  <th className="pb-2">Row</th>
                  <th className="pb-2">Input Data</th>
                  <th className="pb-2">Error Reason</th>
                  <th className="pb-2">Bilingual Hindi Guidance Hint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {mockQuarantinedRows.map((q) => (
                  <tr key={q.rowNum} className="hover:bg-canvas-subdued transition-colors text-xs">
                    <td className="py-2.5 text-semantic-critical font-bold">{q.rowNum}</td>
                    <td className="py-2.5 text-ink font-semibold">{q.rawInput}</td>
                    <td className="py-2.5 font-sans text-semantic-critical text-xs">{q.errorMessage}</td>
                    <td className="py-2.5 font-devanagari text-xs text-ink-secondary bg-pastel-yellow/30 px-2 rounded">
                      {q.hindiHint}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
