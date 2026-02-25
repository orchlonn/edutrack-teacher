"use client";

import { useState, useTransition } from "react";
import { UserPlus, UserMinus, Plus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { addStudentToClass, removeStudentFromClass } from "@/app/actions/classes";
import { CreateStudentModal } from "./create-student-modal";
import type { Student } from "@/lib/types";

interface ClassStudentPanelProps {
  classId: string;
  enrolledStudents: Student[];
  allStudents: Student[];
}

export function ClassStudentPanel({
  classId,
  enrolledStudents,
  allStudents,
}: ClassStudentPanelProps) {
  const [search, setSearch] = useState("");
  const [showCreateStudent, setShowCreateStudent] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const enrolledIds = new Set(enrolledStudents.map((s) => s.id));
  const availableStudents = allStudents
    .filter((s) => !enrolledIds.has(s.id))
    .filter(
      (s) =>
        !search ||
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );

  function handleAdd(studentId: string) {
    setPendingId(studentId);
    startTransition(async () => {
      await addStudentToClass(classId, studentId);
      setPendingId(null);
    });
  }

  function handleRemove(studentId: string) {
    setPendingId(studentId);
    startTransition(async () => {
      await removeStudentFromClass(classId, studentId);
      setPendingId(null);
    });
  }

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      {/* Enrolled students */}
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Enrolled ({enrolledStudents.length})
      </h4>
      {enrolledStudents.length === 0 ? (
        <p className="mt-2 text-sm text-gray-400">No students enrolled yet.</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {enrolledStudents.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <Avatar firstName={s.firstName} lastName={s.lastName} size="sm" />
                <span className="text-sm text-gray-900">
                  {s.firstName} {s.lastName}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(s.id)}
                disabled={isPending && pendingId === s.id}
                title="Remove from class"
              >
                <UserMinus className="h-4 w-4 text-gray-400" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Add students */}
      <div className="mt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Add Students
        </h4>
        <div className="mt-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search students..."
            debounceMs={200}
          />
        </div>
        {availableStudents.length === 0 ? (
          <p className="mt-2 text-sm text-gray-400">
            {search ? "No matching students found." : "All students are enrolled."}
          </p>
        ) : (
          <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
            {availableStudents.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <Avatar firstName={s.firstName} lastName={s.lastName} size="sm" />
                  <span className="text-sm text-gray-900">
                    {s.firstName} {s.lastName}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAdd(s.id)}
                  disabled={isPending && pendingId === s.id}
                  title="Add to class"
                >
                  <UserPlus className="h-4 w-4 text-blue-500" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create new student */}
      <div className="mt-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowCreateStudent(true)}
        >
          <Plus className="h-4 w-4" />
          New Student
        </Button>
      </div>

      <CreateStudentModal
        isOpen={showCreateStudent}
        onClose={() => setShowCreateStudent(false)}
        classId={classId}
      />
    </div>
  );
}
