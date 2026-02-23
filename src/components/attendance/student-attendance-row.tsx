"use client";

import { Avatar } from "@/components/ui/avatar";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { type AttendanceStatus, type Student } from "@/lib/types";

const attendanceOptions = [
  { value: "present", label: "P", activeColor: "bg-emerald-500" },
  { value: "absent", label: "A", activeColor: "bg-red-500" },
  { value: "late", label: "L", activeColor: "bg-amber-500" },
  { value: "excused", label: "E", activeColor: "bg-blue-500" },
];

interface StudentAttendanceRowProps {
  student: Student;
  status: AttendanceStatus;
  onChange: (studentId: string, status: AttendanceStatus) => void;
  index: number;
}

export function StudentAttendanceRow({ student, status, onChange, index }: StudentAttendanceRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-white px-3 py-2.5 transition-colors hover:bg-gray-50">
      <span className="w-6 text-center text-xs font-medium text-gray-400">{index + 1}</span>
      <Avatar firstName={student.firstName} lastName={student.lastName} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-800">
          {student.lastName}, {student.firstName}
        </p>
      </div>
      <ToggleGroup
        options={attendanceOptions}
        value={status}
        onChange={(val) => onChange(student.id, val as AttendanceStatus)}
      />
    </div>
  );
}
