"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { GradeHistoryChart } from "./grade-history-chart";
import { AttendanceLog } from "./attendance-log";
import { TeacherNotes } from "./teacher-notes";
import { type Student } from "@/lib/types";
import {
  getStudentAverageGrade,
  getStudentAttendanceRate,
  getGradeEntriesForStudent,
  exams,
  classes,
} from "@/lib/mock-data";
import { calculateLetterGrade, formatDate, getGradeColor } from "@/lib/utils";
import { Mail, ArrowLeft, Phone } from "lucide-react";

interface StudentProfileProps {
  student: Student;
}

export function StudentProfile({ student }: StudentProfileProps) {
  const overallAvg = getStudentAverageGrade(student.id);
  const attendance = getStudentAttendanceRate(student.id);

  // Per-class averages
  const classAverages = student.classIds.map((classId) => {
    const cls = classes.find((c) => c.id === classId);
    const avg = getStudentAverageGrade(student.id, classId);
    return { cls, avg };
  });

  // Recent exams
  const recentExams = getGradeEntriesForStudent(student.id)
    .filter((e) => e.isPublished && e.score !== null)
    .map((entry) => {
      const exam = exams.find((e) => e.id === entry.examId);
      const cls = classes.find((c) => c.id === entry.classId);
      return { entry, exam, cls };
    })
    .filter((e) => e.exam)
    .sort((a, b) => b.exam!.date.localeCompare(a.exam!.date))
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Back button */}
      <Link
        href="/students"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Students
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-border bg-white p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar firstName={student.firstName} lastName={student.lastName} size="lg" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {student.firstName} {student.lastName}
            </h2>
            <p className="text-sm text-gray-500">
              {student.grade} Grade &middot; ID: {student.id.toUpperCase()}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {student.parentName} ({student.parentPhone})
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/messages">
              <Button variant="secondary" size="md">
                <Mail className="h-4 w-4" />
                Message Parent
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Overall Average"
          value={overallAvg !== null ? `${overallAvg}%` : "N/A"}
          colorClass={
            overallAvg !== null && overallAvg >= 70
              ? "text-emerald-600"
              : overallAvg !== null
                ? "text-red-600"
                : "text-gray-400"
          }
        />
        <StatCard
          label="Attendance"
          value={`${attendance}%`}
          colorClass={
            attendance >= 90
              ? "text-emerald-600"
              : attendance >= 80
                ? "text-amber-600"
                : "text-red-600"
          }
        />
        {classAverages.slice(0, 2).map(({ cls, avg }) =>
          cls ? (
            <StatCard
              key={cls.id}
              label={cls.subject}
              value={avg !== null ? `${avg}%` : "N/A"}
              colorClass={
                avg !== null && avg >= 70
                  ? "text-emerald-600"
                  : avg !== null
                    ? "text-red-600"
                    : "text-gray-400"
              }
            />
          ) : null
        )}
      </div>

      {/* Chart + Recent Exams */}
      <div className="grid gap-6 lg:grid-cols-2">
        <GradeHistoryChart studentId={student.id} />

        {/* Recent Exams */}
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Recent Exams</h3>
          <div className="space-y-1">
            {recentExams.map(({ entry, exam, cls }) => {
              const grade = calculateLetterGrade(entry.score!, exam!.maxScore);
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-800">{exam!.name}</p>
                    <p className="text-xs text-gray-500">{cls?.subject} &middot; {formatDate(exam!.date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm tabular-nums text-gray-600">
                      {entry.score}/{exam!.maxScore}
                    </span>
                    <span className={`text-sm font-bold ${getGradeColor(grade)}`}>
                      {grade}
                    </span>
                    {entry.score! < exam!.maxScore * 0.6 && (
                      <Badge variant="danger">!</Badge>
                    )}
                  </div>
                </div>
              );
            })}
            {recentExams.length === 0 && (
              <p className="text-sm text-gray-500">No published exams yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Attendance + Notes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AttendanceLog studentId={student.id} />
        <TeacherNotes studentId={student.id} />
      </div>
    </div>
  );
}
