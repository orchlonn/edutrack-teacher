"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { ClassCard } from "./class-card";
import { ClassFormModal } from "./class-form-modal";
import { DeleteConfirmModal } from "./delete-confirm-modal";
import { deleteClass } from "@/app/actions/classes";
import type { Class, Student } from "@/lib/types";

interface ClassesClientProps {
  classes: Class[];
  students: Student[];
}

export function ClassesClient({ classes, students }: ClassesClientProps) {
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);

  const filtered = classes.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      c.grade.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search classes..."
          className="flex-1"
        />
        <Button size="sm" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" />
          New Class
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            {search ? "No classes match your search." : "No classes yet. Create your first class to get started."}
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {filtered.map((cls) => (
            <ClassCard
              key={cls.id}
              cls={cls}
              students={students}
              isExpanded={expandedClassId === cls.id}
              onToggleExpand={() =>
                setExpandedClassId(expandedClassId === cls.id ? null : cls.id)
              }
              onEdit={() => setEditingClass(cls)}
              onDelete={() => setDeletingClass(cls)}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      <ClassFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Edit modal */}
      {editingClass && (
        <ClassFormModal
          isOpen={true}
          onClose={() => setEditingClass(null)}
          initialData={editingClass}
        />
      )}

      {/* Delete confirm */}
      {deletingClass && (
        <DeleteConfirmModal
          isOpen={true}
          onClose={() => setDeletingClass(null)}
          onConfirm={() => deleteClass(deletingClass.id)}
          className={deletingClass.name}
          studentCount={deletingClass.studentIds.length}
        />
      )}
    </div>
  );
}
