"use client";

import { useMemo } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Users, GraduationCap, ClipboardCheck, AlertTriangle } from "lucide-react";
import { classes, students, getStudentAverageGrade, getStudentAttendanceRate } from "@/lib/mock-data";

interface ClassStats {
  classId: string;
  className: string;
  subject: string;
  studentCount: number;
  avgGrade: number;
  attendanceRate: number;
  atRiskCount: number;
}

export function ClassOverview() {
  const { classStats, totals } = useMemo(() => {
    const allStudentIds = new Set(classes.flatMap((c) => c.studentIds));

    const stats: ClassStats[] = classes.map((cls) => {
      const studentGrades = cls.studentIds.map((id) => ({
        avg: getStudentAverageGrade(id, cls.id),
        attendance: getStudentAttendanceRate(id),
      }));

      const validGrades = studentGrades.filter((s) => s.avg !== null);
      const avgGrade =
        validGrades.length > 0
          ? Math.round(validGrades.reduce((sum, s) => sum + s.avg!, 0) / validGrades.length)
          : 0;

      const avgAttendance =
        studentGrades.length > 0
          ? Math.round(studentGrades.reduce((sum, s) => sum + s.attendance, 0) / studentGrades.length)
          : 0;

      const atRisk = studentGrades.filter(
        (s) => (s.avg !== null && s.avg < 65) || s.attendance < 80
      ).length;

      return {
        classId: cls.id,
        className: cls.name,
        subject: cls.subject,
        studentCount: cls.studentIds.length,
        avgGrade,
        attendanceRate: avgAttendance,
        atRiskCount: atRisk,
      };
    });

    // Totals across unique students
    const allGrades = [...allStudentIds].map((id) => ({
      avg: getStudentAverageGrade(id),
      attendance: getStudentAttendanceRate(id),
    }));
    const validAll = allGrades.filter((s) => s.avg !== null);
    const overallAvg =
      validAll.length > 0
        ? Math.round(validAll.reduce((sum, s) => sum + s.avg!, 0) / validAll.length)
        : 0;
    const overallAttendance =
      allGrades.length > 0
        ? Math.round(allGrades.reduce((sum, s) => sum + s.attendance, 0) / allGrades.length)
        : 0;
    const overallAtRisk = allGrades.filter(
      (s) => (s.avg !== null && s.avg < 65) || s.attendance < 80
    ).length;

    return {
      classStats: stats,
      totals: {
        students: allStudentIds.size,
        avgGrade: overallAvg,
        attendanceRate: overallAttendance,
        atRisk: overallAtRisk,
      },
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Summary stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Total Students"
          value={totals.students}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Avg Grade"
          value={`${totals.avgGrade}%`}
          icon={<GraduationCap className="h-4 w-4" />}
          colorClass={totals.avgGrade >= 70 ? "text-emerald-600" : "text-red-600"}
        />
        <StatCard
          label="Attendance Rate"
          value={`${totals.attendanceRate}%`}
          icon={<ClipboardCheck className="h-4 w-4" />}
          colorClass={totals.attendanceRate >= 90 ? "text-emerald-600" : totals.attendanceRate >= 80 ? "text-amber-600" : "text-red-600"}
        />
        <StatCard
          label="At-Risk Students"
          value={totals.atRisk}
          icon={<AlertTriangle className="h-4 w-4" />}
          colorClass={totals.atRisk > 0 ? "text-red-600" : "text-emerald-600"}
        />
      </div>

      {/* Class comparison table */}
      <Card title="Class Comparison">
        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-gray-500">
                <th className="pb-2">Class</th>
                <th className="pb-2 text-center">Students</th>
                <th className="pb-2 text-center">Avg Grade</th>
                <th className="pb-2 text-center">Attendance</th>
                <th className="pb-2 text-center">At Risk</th>
              </tr>
            </thead>
            <tbody>
              {classStats.map((cls) => (
                <tr key={cls.classId} className="border-b border-border last:border-0">
                  <td className="py-3">
                    <p className="font-medium text-gray-900">{cls.className}</p>
                    <p className="text-xs text-gray-500">{cls.subject}</p>
                  </td>
                  <td className="py-3 text-center text-gray-700">{cls.studentCount}</td>
                  <td className="py-3 text-center">
                    <span className={`font-semibold ${cls.avgGrade >= 70 ? "text-emerald-600" : cls.avgGrade >= 60 ? "text-amber-600" : "text-red-600"}`}>
                      {cls.avgGrade}%
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className={`font-semibold ${cls.attendanceRate >= 90 ? "text-emerald-600" : cls.attendanceRate >= 80 ? "text-amber-600" : "text-red-600"}`}>
                      {cls.attendanceRate}%
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    {cls.atRiskCount > 0 ? (
                      <Badge variant="danger">{cls.atRiskCount}</Badge>
                    ) : (
                      <Badge variant="success">0</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {classStats.map((cls) => (
            <div key={cls.classId} className="rounded-lg border border-border p-3">
              <p className="font-medium text-gray-900">{cls.className}</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="text-gray-500">Avg Grade</p>
                  <p className={`font-bold ${cls.avgGrade >= 70 ? "text-emerald-600" : "text-red-600"}`}>
                    {cls.avgGrade}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Attendance</p>
                  <p className={`font-bold ${cls.attendanceRate >= 90 ? "text-emerald-600" : "text-amber-600"}`}>
                    {cls.attendanceRate}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">At Risk</p>
                  <p className={`font-bold ${cls.atRiskCount > 0 ? "text-red-600" : "text-emerald-600"}`}>
                    {cls.atRiskCount}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
