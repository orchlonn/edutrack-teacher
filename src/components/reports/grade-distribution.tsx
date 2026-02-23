"use client";

import { useMemo } from "react";
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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { useClassContext } from "@/contexts/class-context";
import {
  classes,
  getGradeDistributionByClass,
  getExamsByClass,
  getGradeEntriesForExam,
} from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

const gradeColors: Record<string, string> = {
  A: "#16a34a",
  B: "#2563eb",
  C: "#d97706",
  D: "#ea580c",
  F: "#dc2626",
};

export function GradeDistribution() {
  const { selectedClassId, setSelectedClassId } = useClassContext();
  const classOptions = classes.map((c) => ({ value: c.id, label: c.name }));

  const chartData = useMemo(() => {
    const dist = getGradeDistributionByClass(selectedClassId);
    return (Object.keys(dist) as (keyof typeof dist)[]).map((grade) => ({
      grade,
      count: dist[grade],
      fill: gradeColors[grade],
    }));
  }, [selectedClassId]);

  const examStats = useMemo(() => {
    const examList = getExamsByClass(selectedClassId).filter((e) => e.isPublished);
    return examList.map((exam) => {
      const entries = getGradeEntriesForExam(exam.id).filter(
        (e) => e.score !== null
      );
      const scores = entries.map((e) => e.score!);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const high = scores.length > 0 ? Math.max(...scores) : 0;
      const low = scores.length > 0 ? Math.min(...scores) : 0;
      const passCount = scores.filter((s) => (s / exam.maxScore) * 100 >= 60).length;
      const passRate = scores.length > 0 ? Math.round((passCount / scores.length) * 100) : 0;

      return {
        id: exam.id,
        name: exam.name,
        date: exam.date,
        type: exam.type,
        maxScore: exam.maxScore,
        avg,
        high,
        low,
        passRate,
        entryCount: scores.length,
      };
    });
  }, [selectedClassId]);

  const totalStudents = chartData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-4">
      <div className="w-full sm:w-56">
        <Select
          label="Class"
          options={classOptions}
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart */}
        <Card title="Grade Distribution">
          {totalStudents > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="grade" tick={{ fontSize: 14, fontWeight: 600 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                    formatter={(value) => [`${value} students`]}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.grade} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-gray-500">No grade data available.</p>
          )}

          {/* Legend */}
          <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-gray-600">
            {chartData.map((d) => (
              <span key={d.grade} className="flex items-center gap-1">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: d.fill }}
                />
                {d.grade}: {d.count} ({totalStudents > 0 ? Math.round((d.count / totalStudents) * 100) : 0}%)
              </span>
            ))}
          </div>
        </Card>

        {/* Exam stats table */}
        <Card title="Exam Breakdown">
          {examStats.length > 0 ? (
            <div className="space-y-1">
              {examStats.map((exam) => (
                <div
                  key={exam.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg px-2 py-2.5 text-sm hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800">{exam.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(exam.date)} &middot;{" "}
                      <span className="capitalize">{exam.type}</span> &middot; /{exam.maxScore}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="text-center">
                      <p className="text-gray-500">Avg</p>
                      <p className="font-bold text-gray-800">{exam.avg}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">High</p>
                      <p className="font-bold text-emerald-600">{exam.high}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500">Low</p>
                      <p className="font-bold text-red-600">{exam.low}</p>
                    </div>
                    <Badge variant={exam.passRate >= 80 ? "success" : exam.passRate >= 60 ? "warning" : "danger"}>
                      {exam.passRate}% pass
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-gray-500">No published exams for this class.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
