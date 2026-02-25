"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClass, updateClass } from "@/app/actions/classes";

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    id: string;
    name: string;
    subject: string;
    grade: string;
    room: string;
  };
}

export function ClassFormModal({ isOpen, onClose, initialData }: ClassFormModalProps) {
  const isEditing = !!initialData;
  const [name, setName] = useState(initialData?.name ?? "");
  const [subject, setSubject] = useState(initialData?.subject ?? "");
  const [grade, setGrade] = useState(initialData?.grade ?? "");
  const [room, setRoom] = useState(initialData?.room ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !subject.trim() || !grade.trim() || !room.trim()) {
      setError("All fields are required");
      return;
    }

    startTransition(async () => {
      try {
        const data = {
          name: name.trim(),
          subject: subject.trim(),
          grade: grade.trim(),
          room: room.trim(),
        };
        if (isEditing) {
          await updateClass(initialData.id, data);
        } else {
          await createClass(data);
        }
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900">
          {isEditing ? "Edit Class" : "Create Class"}
        </h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <Input
            label="Class Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Algebra I"
            required
          />
          <Input
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Mathematics"
            required
          />
          <Input
            label="Grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="e.g. 7th Grade"
            required
          />
          <Input
            label="Room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="e.g. Room 204"
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEditing ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
