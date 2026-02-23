"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Users, UserCheck, UserX, Clock } from "lucide-react";
import { classes, attendanceRecords } from "@/lib/mock-data";
import { getToday } from "@/lib/utils";

export function AttendanceSummary() {
  // Compute today's attendance across all classes
  const today = getToday();
  const todayRecords = attendanceRecords.filter((r) => r.date === today);

  // If no records for today, show last available date
  const lastDate = todayRecords.length > 0
    ? today
    : attendanceRecords.length > 0
      ? attendanceRecords[attendanceRecords.length - 1].date
      : null;

  const records = lastDate
    ? attendanceRecords.filter((r) => r.date === lastDate)
    : [];

  const total = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const late = records.filter((r) => r.status === "late").length;
  const excused = records.filter((r) => r.status === "excused").length;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  const totalStudents = new Set(classes.flatMap((c) => c.studentIds)).size;

  return (
    <Card
      title="Attendance Today"
      action={
        <Link href="/attendance" className="text-xs font-medium text-blue-600 hover:text-blue-700">
          View Details
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2.5 rounded-lg bg-emerald-50 p-3">
          <UserCheck className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="text-lg font-bold text-emerald-700">{present}</p>
            <p className="text-xs text-emerald-600">Present</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg bg-red-50 p-3">
          <UserX className="h-5 w-5 text-red-600" />
          <div>
            <p className="text-lg font-bold text-red-700">{absent}</p>
            <p className="text-xs text-red-600">Absent</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg bg-amber-50 p-3">
          <Clock className="h-5 w-5 text-amber-600" />
          <div>
            <p className="text-lg font-bold text-amber-700">{late}</p>
            <p className="text-xs text-amber-600">Late</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg bg-gray-50 p-3">
          <Users className="h-5 w-5 text-gray-600" />
          <div>
            <p className="text-lg font-bold text-gray-700">{totalStudents}</p>
            <p className="text-xs text-gray-600">Total Students</p>
          </div>
        </div>
      </div>
      {total > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Attendance Rate</span>
            <span className="font-semibold text-gray-700">{rate}%</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${rate}%` }}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
