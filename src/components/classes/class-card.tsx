"use client";

import { Pencil, Trash2, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClassStudentPanel } from "./class-student-panel";
import type { Class, Student } from "@/lib/types";

interface ClassCardProps {
  cls: Class;
  students: Student[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ClassCard({
  cls,
  students,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
}: ClassCardProps) {
  const enrolledStudents = students.filter((s) => cls.studentIds.includes(s.id));

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{cls.name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant="info">{cls.subject}</Badge>
            <span className="text-xs text-gray-500">{cls.grade}</span>
            <span className="text-xs text-gray-500">Room {cls.room}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onEdit} title="Edit class">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} title="Delete class">
            <Trash2 className="h-4 w-4 text-red-400" />
          </Button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {cls.studentIds.length} {cls.studentIds.length === 1 ? "student" : "students"}
        </span>
        <Button variant="secondary" size="sm" onClick={onToggleExpand}>
          <Users className="h-4 w-4" />
          {isExpanded ? "Hide Students" : "Manage Students"}
        </Button>
      </div>

      {isExpanded && (
        <ClassStudentPanel
          classId={cls.id}
          enrolledStudents={enrolledStudents}
          allStudents={students}
        />
      )}
    </Card>
  );
}
