"use client";

import { useState, useMemo } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { TeacherCard } from "./teacher-card";
import { type Teacher } from "@/lib/types";
import { type TeacherSummaryStats } from "@/lib/db/teacher-directory";

interface TeacherListProps {
  teachers: Teacher[];
  statsMap: Record<string, TeacherSummaryStats>;
}

const emptyStats: TeacherSummaryStats = {
  classCount: 0,
  studentCount: 0,
  avgGrade: null,
  attendanceRate: 100,
  examCount: 0,
};

export function TeacherList({ teachers, statsMap }: TeacherListProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return teachers;
    const q = search.toLowerCase();
    return teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q)
    );
  }, [search, teachers]);

  return (
    <div className="space-y-4">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search teachers by name, subject, or email..."
        className="w-full"
      />

      <div className="space-y-2">
        {filtered.map((teacher) => (
          <TeacherCard
            key={teacher.id}
            teacher={teacher}
            stats={statsMap[teacher.id] ?? emptyStats}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-gray-500">
          No teachers found{search ? ` matching "${search}"` : ""}.
        </p>
      )}

      <p className="text-xs text-gray-400">
        Showing {filtered.length} of {teachers.length} teachers
      </p>
    </div>
  );
}
