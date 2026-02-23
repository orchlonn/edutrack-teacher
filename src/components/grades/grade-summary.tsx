"use client";

import { calculateLetterGrade } from "@/lib/utils";

interface GradeSummaryProps {
  scores: Record<string, number | null>;
  maxScore: number;
  totalStudents: number;
}

export function GradeSummary({ scores, maxScore, totalStudents }: GradeSummaryProps) {
  const values = Object.values(scores).filter((s): s is number => s !== null);
  const entered = values.length;

  if (entered === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-4 text-center text-sm text-gray-500">
        No scores entered yet. Start entering scores above.
      </div>
    );
  }

  const avg = Math.round(values.reduce((a, b) => a + b, 0) / entered);
  const high = Math.max(...values);
  const low = Math.min(...values);
  const avgLetter = calculateLetterGrade(avg, maxScore);

  // Grade distribution
  const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  for (const score of values) {
    const grade = calculateLetterGrade(score, maxScore);
    if (grade.startsWith("A")) distribution.A++;
    else if (grade.startsWith("B")) distribution.B++;
    else if (grade.startsWith("C")) distribution.C++;
    else if (grade.startsWith("D")) distribution.D++;
    else distribution.F++;
  }

  const distColors = {
    A: "bg-emerald-500",
    B: "bg-blue-500",
    C: "bg-amber-500",
    D: "bg-orange-500",
    F: "bg-red-500",
  };

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <div>
          <span className="text-gray-500">Avg: </span>
          <span className="font-bold text-gray-900">{avg}/{maxScore}</span>
          <span className="ml-1 text-gray-400">({avgLetter})</span>
        </div>
        <div>
          <span className="text-gray-500">High: </span>
          <span className="font-bold text-emerald-600">{high}</span>
        </div>
        <div>
          <span className="text-gray-500">Low: </span>
          <span className="font-bold text-red-600">{low}</span>
        </div>
        <div>
          <span className="text-gray-500">Entered: </span>
          <span className="font-bold text-gray-900">{entered}/{totalStudents}</span>
        </div>
      </div>

      {/* Distribution bar */}
      <div className="mt-3">
        <div className="flex h-3 overflow-hidden rounded-full">
          {(Object.keys(distribution) as (keyof typeof distribution)[]).map((grade) => {
            const pct = (distribution[grade] / entered) * 100;
            if (pct === 0) return null;
            return (
              <div
                key={grade}
                className={`${distColors[grade]} transition-all`}
                style={{ width: `${pct}%` }}
                title={`${grade}: ${distribution[grade]} students (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>
        <div className="mt-1.5 flex gap-3 text-xs text-gray-500">
          {(Object.keys(distribution) as (keyof typeof distribution)[]).map((grade) =>
            distribution[grade] > 0 ? (
              <span key={grade} className="flex items-center gap-1">
                <span className={`inline-block h-2 w-2 rounded-full ${distColors[grade]}`} />
                {grade}: {distribution[grade]}
              </span>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
