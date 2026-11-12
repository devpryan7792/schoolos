'use client';

import React, { useState } from 'react';
import {
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Sparkles,
  Zap,
  Clock,
  Eye,
  Check,
  X,
  ShieldCheck
} from 'lucide-react';

interface QuestionResult {
  qNo: number;
  options: { label: string; density: number }[];
  selected: string[];
  correct: string;
  isCorrect: boolean;
  isDoubleBubble: boolean;
  isBlank: boolean;
}

const generateMockQuestions = (): QuestionResult[] => {
  const letters = ['A', 'B', 'C', 'D'];
  const results: QuestionResult[] = [];

  for (let i = 1; i <= 50; i++) {
    const correctOption = letters[(i - 1) % 4];

    if (i === 24) {
      results.push({
        qNo: i,
        options: [
          { label: 'A', density: 0.12 },
          { label: 'B', density: 0.88 },
          { label: 'C', density: 0.79 },
          { label: 'D', density: 0.10 },
        ],
        selected: ['B', 'C'],
        correct: 'B',
        isCorrect: false,
        isDoubleBubble: true,
        isBlank: false,
      });
    } else if (i === 42) {
      results.push({
        qNo: i,
        options: [
          { label: 'A', density: 0.08 },
          { label: 'B', density: 0.11 },
          { label: 'C', density: 0.09 },
          { label: 'D', density: 0.07 },
        ],
        selected: [],
        correct: 'D',
        isCorrect: false,
        isDoubleBubble: false,
        isBlank: true,
      });
    } else {
      results.push({
        qNo: i,
        options: letters.map((l) => ({
          label: l,
          density: l === correctOption ? 0.92 : 0.08,
        })),
        selected: [correctOption],
        correct: correctOption,
        isCorrect: true,
        isDoubleBubble: false,
        isBlank: false,
      });
    }
  }

  return results;
};

export default function OMRPage() {
  const [questions] = useState<QuestionResult[]>(generateMockQuestions());
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasPublished, setHasPublished] = useState(false);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'correct'>('all');

  const correctCount = questions.filter((q) => q.isCorrect).length;
  const doubleCount = questions.filter((q) => q.isDoubleBubble).length;
  const blankCount = questions.filter((q) => q.isBlank).length;

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setHasPublished(true);
    }, 400);
  };

  const filteredQuestions = questions.filter((q) => {
    if (filter === 'flagged') return q.isDoubleBubble || q.isBlank;
    if (filter === 'correct') return q.isCorrect;
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-ink tracking-tight">Computer Vision OMR Grading Copilot</h1>
            <span className="bg-pastel-lavender text-pastel-lavender-ink text-[10px] font-semibold px-2 py-0.5 rounded-full border border-transparent">
              AGENT-29 &lt;1000ms Invariant
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            4-point homography alignment • Otsu dynamic binarization • Automated double-bubble fraud detection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePublish}
            disabled={hasPublished || isPublishing}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium shadow-whisper transition-all ${
              hasPublished
                ? 'bg-semantic-success-bg text-semantic-success border border-semantic-success-border cursor-default'
                : 'bg-brand hover:bg-brand-hover text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {hasPublished ? 'Marks Published to Broadsheet' : isPublishing ? 'Publishing...' : 'Publish Marks to SIS'}
          </button>
        </div>
      </div>

      {/* KPI Stats (Personio Metric Tiles) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="bg-canvas border border-hairline rounded-lg p-4 shadow-tile">
          <div className="text-[11px] font-semibold text-ink-faint uppercase tracking-utility">Evaluation Latency</div>
          <div className="text-xl font-bold font-mono text-ink mt-2 tabular-nums">
            144 <span className="text-xs font-normal text-ink-faint">ms</span>
          </div>
          <div className="text-[11px] text-semantic-success font-medium mt-1">Invariant: &lt;1000ms Met</div>
        </div>

        <div className="bg-canvas border border-hairline rounded-lg p-4 shadow-tile">
          <div className="text-[11px] font-semibold text-ink-faint uppercase tracking-utility">Total Score</div>
          <div className="text-xl font-bold font-mono text-ink mt-2 tabular-nums">
            {correctCount} <span className="text-xs font-normal text-ink-faint">/ 50 (96.0%)</span>
          </div>
          <div className="text-[11px] text-semantic-success font-medium mt-1">CBSE Grade: A1</div>
        </div>

        <div className="bg-canvas border border-hairline rounded-lg p-4 shadow-tile">
          <div className="text-[11px] font-semibold text-ink-faint uppercase tracking-utility">Double-Bubble Penalties</div>
          <div className="text-xl font-bold font-mono text-semantic-critical mt-2 tabular-nums">
            {doubleCount} <span className="text-xs font-normal text-ink-faint">Q24 Flagged</span>
          </div>
          <div className="text-[11px] text-semantic-critical font-medium mt-1">0 Marks Awarded</div>
        </div>

        <div className="bg-canvas border border-hairline rounded-lg p-4 shadow-tile">
          <div className="text-[11px] font-semibold text-ink-faint uppercase tracking-utility">Blank / Unanswered</div>
          <div className="text-xl font-bold font-mono text-semantic-warning mt-2 tabular-nums">
            {blankCount} <span className="text-xs font-normal text-ink-faint">Q42 Skipped</span>
          </div>
          <div className="text-[11px] text-semantic-warning font-medium mt-1">Otsu Density &lt; 0.15</div>
        </div>
      </div>

      {/* Main Grid: Perspective Warping Diagnostics & Interactive Bubble Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Sheet Diagnostics Card */}
        <div className="bg-canvas border border-hairline rounded-lg p-5 shadow-whisper space-y-4">
          <div className="border-b border-hairline pb-3">
            <h2 className="text-sm font-bold text-ink">Computer Vision Pipeline Diagnostic</h2>
            <p className="text-[11px] text-ink-faint">OpenCV 4-corner fiducial homography</p>
          </div>

          <div className="p-3.5 rounded-md bg-canvas-chrome border border-hairline space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-ink-muted">Student:</span>
              <span className="font-bold text-ink">Aarav Sharma</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Roll / PEN:</span>
              <span className="text-ink">1042 / PEN-91823019</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Exam:</span>
              <span className="text-ink font-sans">Mid-Term Science 086</span>
            </div>
            <div className="border-t border-hairline pt-2 flex justify-between">
              <span className="text-ink-muted">Homography Skew:</span>
              <span className="text-semantic-success">0.42° (Corrected)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-md bg-semantic-critical-bg border border-semantic-critical-border text-xs space-y-1">
            <div className="font-bold text-semantic-critical flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Double-Bubble Alert on Question 24
            </div>
            <p className="text-[11px] text-semantic-critical leading-relaxed">
              Student marked both bubble B (88% fill) and bubble C (79% fill). Automated scoring zeroed the marks per examination board bylaws.
            </p>
          </div>
        </div>

        {/* Right Columns (2): 50-Question Interactive Bubble Grid */}
        <div className="lg:col-span-2 bg-canvas border border-hairline rounded-lg p-5 shadow-whisper space-y-4">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-ink">Evaluated Answer Key & Fill Densities</span>
              <div className="flex gap-1 ml-4 text-[10px]">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-2 py-0.5 rounded transition-all ${filter === 'all' ? 'bg-ink text-white font-semibold' : 'text-ink-muted'}`}
                >
                  All (50)
                </button>
                <button
                  onClick={() => setFilter('flagged')}
                  className={`px-2 py-0.5 rounded transition-all ${filter === 'flagged' ? 'bg-semantic-critical text-white font-semibold' : 'text-ink-muted'}`}
                >
                  Flagged (2)
                </button>
                <button
                  onClick={() => setFilter('correct')}
                  className={`px-2 py-0.5 rounded transition-all ${filter === 'correct' ? 'bg-semantic-success text-white font-semibold' : 'text-ink-muted'}`}
                >
                  Correct (48)
                </button>
              </div>
            </div>
            <span className="text-[11px] text-ink-faint font-mono">50 Items Tabulated</span>
          </div>

          {/* Bubble Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-[460px] overflow-y-auto p-1">
            {filteredQuestions.map((q) => (
              <div
                key={q.qNo}
                className={`p-2 rounded-md border text-xs font-mono transition-all ${
                  q.isDoubleBubble
                    ? 'bg-semantic-critical-bg border-semantic-critical-border'
                    : q.isBlank
                    ? 'bg-semantic-warning-bg border-semantic-warning-border'
                    : 'bg-canvas border-hairline hover:border-hairline-strong'
                }`}
              >
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className="font-bold text-ink font-sans">Q{q.qNo}</span>
                  {q.isDoubleBubble ? (
                    <span className="text-[9px] text-semantic-critical font-bold">DOUBLE</span>
                  ) : q.isBlank ? (
                    <span className="text-[9px] text-semantic-warning font-bold">BLANK</span>
                  ) : (
                    <span className="text-[9px] text-semantic-success font-bold">1/1</span>
                  )}
                </div>

                {/* 4 Bubble circles */}
                <div className="flex justify-between items-center px-1">
                  {['A', 'B', 'C', 'D'].map((letter) => {
                    const isSelected = q.selected.includes(letter);
                    const isAns = q.correct === letter;
                    return (
                      <div
                        key={letter}
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          isSelected
                            ? q.isDoubleBubble
                              ? 'bg-semantic-critical text-white'
                              : 'bg-ink text-white'
                            : 'border border-hairline text-ink-faint'
                        }`}
                      >
                        {letter}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
