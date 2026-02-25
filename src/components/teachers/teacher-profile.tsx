"use client";

import Link from "next/link";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { type Teacher } from "@/lib/types";
import { type TeacherDetailStats, type TeacherSummaryStats } from "@/lib/db/teacher-directory";
import {
  ArrowLeft,
  Mail,
  BookOpen,
  Users,
  GraduationCap,
  ClipboardCheck,
  FileText,
  AlertTriangle,
} from "lucide-react";

interface TeacherProfileProps {
  teacher: Teacher;
  summary: TeacherSummaryStats;
  detail: TeacherDetailStats;
}

const bgColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-teal-500",
];

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return bgColors[Math.abs(hash) % bgColors.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const barColors: Record<string, string> = {
  A: "#16a34a",
  B: "#2563eb",
  C: "#d97706",
  D: "#ea580c",
  F: "#dc2626",
};

export function TeacherProfile({ teacher, summary, detail }: TeacherProfileProps) {
  const chartData = Object.entries(detail.gradeDistribution).map(([grade, count]) => ({
    grade,
    count,
  }));

  const hasGrades = chartData.some((d) => d.count > 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/teachers"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Teachers
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-border bg-white p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div
            className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white ${getColorFromName(teacher.name)}`}
          >
            {getInitials(teacher.name)}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{teacher.name}</h2>
            <p className="text-sm text-gray-500">{teacher.subject}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {teacher.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Classes"
          value={summary.classCount}
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatCard
          label="Students"
          value={detail.totalStudents}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Avg Grade"
          value={summary.avgGrade !== null ? `${summary.avgGrade}%` : "N/A"}
          icon={<GraduationCap className="h-4 w-4" />}
          colorClass={
            summary.avgGrade !== null && summary.avgGrade >= 70
              ? "text-emerald-600"
              : summary.avgGrade !== null
                ? "text-red-600"
                : "text-gray-400"
          }
        />
        <StatCard
          label="Attendance"
          value={`${summary.attendanceRate}%`}
          icon={<ClipboardCheck className="h-4 w-4" />}
          colorClass={
            summary.attendanceRate >= 90
              ? "text-emerald-600"
              : summary.attendanceRate >= 80
                ? "text-amber-600"
                : "text-red-600"
          }
        />
        <StatCard
          label="Exams"
          value={detail.totalExams}
          icon={<FileText className="h-4 w-4" />}
        />
        <StatCard
          label="At-Risk"
          value={detail.atRiskStudents.length}
          icon={<AlertTriangle className="h-4 w-4" />}
          colorClass={detail.atRiskStudents.length > 0 ? "text-red-600" : "text-emerald-600"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Classes Breakdown */}
        <Card title="Classes">
          {detail.classes.length === 0 ? (
            <p className="text-sm text-gray-500">No classes assigned.</p>
          ) : (
            <div className="space-y-2">
              {detail.classes.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800">{cls.name}</p>
                    <p className="text-xs text-gray-500">
                      {cls.subject} &middot; {cls.grade} &middot; {cls.studentCount} students
                    </p>
                  </div>
                  <Badge
                    variant={
                      cls.avgGrade !== null && cls.avgGrade >= 70 ? "success" : cls.avgGrade !== null ? "danger" : "neutral"
                    }
                  >
                    {cls.avgGrade !== null ? `${cls.avgGrade}%` : "N/A"}
                  </Badge>
                  <Badge
                    variant={cls.attendanceRate >= 90 ? "success" : cls.attendanceRate >= 80 ? "warning" : "danger"}
                  >
                    {cls.attendanceRate}%
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Grade Distribution */}
        <Card title="Grade Distribution">
          {!hasGrades ? (
            <p className="text-sm text-gray-500">No published grades yet.</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="grade" tick={{ fontSize: 14, fontWeight: 600 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                    formatter={(value) => [`${value} students`]}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.grade} fill={barColors[entry.grade] ?? "#6b7280"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* At-Risk Students */}
      <Card
        title="At-Risk Students"
        action={
          detail.atRiskStudents.length > 0 ? (
            <Badge variant="danger">{detail.atRiskStudents.length}</Badge>
          ) : undefined
        }
      >
        {detail.atRiskStudents.length === 0 ? (
          <p className="text-sm text-gray-500">No at-risk students. Great work!</p>
        ) : (
          <div className="space-y-1">
            {detail.atRiskStudents.slice(0, 10).map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-gray-50"
              >
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-800">
                    {s.lastName}, {s.firstName}
                  </p>
                  <p className="text-xs text-gray-500">{s.className}</p>
                </div>
                <Badge variant={s.avgGrade !== null && s.avgGrade >= 65 ? "warning" : "danger"}>
                  {s.avgGrade !== null ? `${s.avgGrade}%` : "N/A"}
                </Badge>
                <Badge variant={s.attendanceRate >= 80 ? "warning" : "danger"}>
                  {s.attendanceRate}%
                </Badge>
              </div>
            ))}
            {detail.atRiskStudents.length > 10 && (
              <p className="pt-1 text-xs text-gray-400">
                and {detail.atRiskStudents.length - 10} more...
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
