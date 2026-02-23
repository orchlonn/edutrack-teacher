"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { classes, students, getStudentAverageGrade, getStudentAttendanceRate } from "@/lib/mock-data";

export function ClassSnapshot() {
  // Aggregate stats across all classes
  const allStudentIds = new Set(classes.flatMap((c) => c.studentIds));
  const studentStats = [...allStudentIds].map((id) => {
    const student = students.find((s) => s.id === id);
    const avg = getStudentAverageGrade(id);
    const attendance = getStudentAttendanceRate(id);
    return { student, avg, attendance };
  });

  const validGrades = studentStats.filter((s) => s.avg !== null);
  const overallAvg = validGrades.length > 0
    ? Math.round(validGrades.reduce((sum, s) => sum + s.avg!, 0) / validGrades.length)
    : 0;

  const atRisk = studentStats.filter(
    (s) => (s.avg !== null && s.avg < 65) || s.attendance < 80
  );

  const topPerformers = studentStats
    .filter((s) => s.avg !== null && s.avg >= 90)
    .length;

  return (
    <Card
      title="Class Snapshot"
      action={
        <Link href="/students" className="text-xs font-medium text-blue-600 hover:text-blue-700">
          View All
        </Link>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">{overallAvg}%</p>
            <p className="text-xs text-gray-500">Average Grade</p>
          </div>
          <div className="flex items-center gap-1 text-sm text-emerald-600">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">Stable</span>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 rounded-lg bg-red-50 p-2.5">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
              <span className="text-sm font-bold text-red-700">{atRisk.length}</span>
            </div>
            <p className="text-xs text-red-600">At Risk</p>
          </div>
          <div className="flex-1 rounded-lg bg-emerald-50 p-2.5">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-700">{topPerformers}</span>
            </div>
            <p className="text-xs text-emerald-600">Top Performers</p>
          </div>
        </div>

        {atRisk.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-500">Students Needing Attention</p>
            <div className="space-y-1">
              {atRisk.slice(0, 3).map((s) => (
                <Link
                  key={s.student?.id}
                  href={`/students/${s.student?.id}`}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50"
                >
                  <span className="font-medium text-gray-800">
                    {s.student?.lastName}, {s.student?.firstName}
                  </span>
                  <div className="flex gap-2">
                    {s.avg !== null && s.avg < 65 && (
                      <Badge variant="danger">{s.avg}%</Badge>
                    )}
                    {s.attendance < 80 && (
                      <Badge variant="warning">Attend: {s.attendance}%</Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
