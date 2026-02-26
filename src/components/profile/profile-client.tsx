"use client";

import { useState } from "react";
import { LogOut, Mail, BookOpen, Users, GraduationCap, ClipboardCheck, AlertTriangle, CalendarDays } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import type { Teacher } from "@/lib/types";

interface ProfileStats {
  totalClasses: number;
  totalStudents: number;
  attendanceRate: number;
  classAverage: number | null;
  atRiskCount: number;
  activeDays: number;
  recentActivities: number;
}

interface ProfileClientProps {
  teacher: Teacher;
  stats: ProfileStats;
}

export function ProfileClient({ teacher, stats }: ProfileClientProps) {
  const [signingOut, setSigningOut] = useState(false);

  const initials = teacher.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Profile Card */}
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {teacher.name}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                {teacher.email}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {teacher.subject}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="rounded-xl border border-border bg-white p-6">
        <h3 className="text-base font-semibold text-gray-900">
          Performance Overview
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatTile
            icon={BookOpen}
            label="Classes"
            value={stats.totalClasses}
            color="blue"
          />
          <StatTile
            icon={Users}
            label="Students"
            value={stats.totalStudents}
            color="indigo"
          />
          <StatTile
            icon={ClipboardCheck}
            label="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            color="emerald"
          />
          <StatTile
            icon={GraduationCap}
            label="Class Average"
            value={stats.classAverage !== null ? `${stats.classAverage}%` : "N/A"}
            color="amber"
          />
          <StatTile
            icon={AlertTriangle}
            label="At-Risk Students"
            value={stats.atRiskCount}
            color="red"
          />
          <StatTile
            icon={CalendarDays}
            label="Days Tracked"
            value={stats.activeDays}
            color="violet"
          />
        </div>
      </div>

      {/* Sign Out */}
      <div className="rounded-xl border border-border bg-white p-6">
        <h3 className="text-base font-semibold text-gray-900">Account</h3>
        <p className="mt-1 text-sm text-gray-500">
          Signed in as {teacher.email}
        </p>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="mt-4 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          {signingOut ? "Signing out..." : "Sign Out"}
        </button>
      </div>
    </div>
  );
}

/* ---- Small helper component ---- */

const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
  blue:    { bg: "bg-blue-50",    text: "text-blue-700",    icon: "text-blue-500" },
  indigo:  { bg: "bg-indigo-50",  text: "text-indigo-700",  icon: "text-indigo-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "text-emerald-500" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   icon: "text-amber-500" },
  red:     { bg: "bg-red-50",     text: "text-red-700",     icon: "text-red-500" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-700",  icon: "text-violet-500" },
};

function StatTile({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
}) {
  const c = colorMap[color] ?? colorMap.blue;
  return (
    <div className={`rounded-lg ${c.bg} p-4`}>
      <Icon className={`h-5 w-5 ${c.icon}`} />
      <p className={`mt-2 text-2xl font-bold ${c.text}`}>{value}</p>
      <p className="text-xs font-medium text-gray-500">{label}</p>
    </div>
  );
}
