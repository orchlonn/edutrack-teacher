"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { type Student, type GradeLetter } from "@/lib/types";
import { calculateLetterGrade, getGradeColor } from "@/lib/utils";

interface GradeEntryTableProps {
  students: Student[];
  scores: Record<string, number | null>;
  maxScore: number;
  onScoreChange: (studentId: string, score: number | null) => void;
}

export function GradeEntryTable({ students, scores, maxScore, onScoreChange }: GradeEntryTableProps) {
  return (
    <div className="space-y-1.5">
      {/* Header - hidden on mobile */}
      <div className="hidden items-center gap-3 px-3 py-2 text-xs font-medium text-gray-500 sm:flex">
        <span className="w-6 text-center">#</span>
        <span className="w-8" />
        <span className="flex-1">Student Name</span>
        <span className="w-24 text-center">Score</span>
        <span className="w-16 text-center">Grade</span>
        <span className="w-16 text-center">Status</span>
      </div>

      {students.map((student, i) => {
        const score = scores[student.id];
        const letterGrade: GradeLetter | null =
          score !== null && score !== undefined
            ? calculateLetterGrade(score, maxScore)
            : null;
        const isInvalid = score !== null && score !== undefined && (score < 0 || score > maxScore);

        return (
          <div
            key={student.id}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-white px-3 py-2.5 sm:flex-nowrap"
          >
            <span className="hidden w-6 text-center text-xs font-medium text-gray-400 sm:block">
              {i + 1}
            </span>
            <Avatar firstName={student.firstName} lastName={student.lastName} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">
                {student.lastName}, {student.firstName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={maxScore}
                  value={score ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    onScoreChange(student.id, val === "" ? null : Number(val));
                  }}
                  placeholder="--"
                  className={`h-10 w-20 rounded-lg border px-2 text-center text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    isInvalid
                      ? "border-red-400 bg-red-50 text-red-600"
                      : "border-gray-300 text-gray-800"
                  }`}
                />
                <span className="absolute top-1/2 -right-6 hidden -translate-y-1/2 text-xs text-gray-400 sm:block">
                  /{maxScore}
                </span>
              </div>
            </div>
            <div className="w-16 text-center">
              {letterGrade ? (
                <span className={`text-sm font-bold ${getGradeColor(letterGrade)}`}>
                  {letterGrade}
                </span>
              ) : (
                <span className="text-sm text-gray-300">--</span>
              )}
            </div>
            <div className="w-16 text-center">
              {score === null || score === undefined ? (
                <Badge variant="warning">Missing</Badge>
              ) : (
                <Badge variant="neutral">Draft</Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
