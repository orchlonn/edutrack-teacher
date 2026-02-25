"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { type Teacher } from "@/lib/types";
import { type TeacherSummaryStats } from "@/lib/db/teacher-directory";
import { BookOpen, Users } from "lucide-react";

interface TeacherCardProps {
  teacher: Teacher;
  stats: TeacherSummaryStats;
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

export function TeacherCard({ teacher, stats }: TeacherCardProps) {
  return (
    <Link
      href={`/teachers/${teacher.id}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-white p-3 transition-all hover:border-blue-200 hover:shadow-sm"
    >
      <div
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${getColorFromName(teacher.name)}`}
      >
        {getInitials(teacher.name)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-800">{teacher.name}</p>
        <p className="text-xs text-gray-500">{teacher.subject}</p>
      </div>
      <div className="hidden items-center gap-3 text-xs text-gray-500 sm:flex">
        <span className="flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          {stats.classCount}
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {stats.studentCount}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant={stats.avgGrade !== null && stats.avgGrade >= 70 ? "success" : stats.avgGrade !== null ? "danger" : "neutral"}>
          {stats.avgGrade !== null ? `${stats.avgGrade}%` : "N/A"}
        </Badge>
        <Badge variant={stats.attendanceRate >= 90 ? "success" : stats.attendanceRate >= 80 ? "warning" : "danger"}>
          {stats.attendanceRate}%
        </Badge>
      </div>
    </Link>
  );
}
