"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createMessage } from "@/app/actions/messages";
import type { Student } from "@/lib/types";

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
}

export function NewMessageModal({ isOpen, onClose, students }: NewMessageModalProps) {
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const selectedStudent = students.find((s) => s.id === studentId);
  const studentOptions = students.map((s) => ({
    value: s.id,
    label: `${s.lastName}, ${s.firstName}`,
  }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!studentId || !subject.trim() || !content.trim()) {
      setError("All fields are required");
      return;
    }

    startTransition(async () => {
      try {
        await createMessage({
          studentId,
          parentName: selectedStudent?.parentName ?? "Parent",
          subject: subject.trim(),
          content: content.trim(),
        });
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900">New Message</h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <Select
            label="Student"
            options={studentOptions}
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
          {selectedStudent && (
            <p className="text-xs text-gray-500">
              Parent: {selectedStudent.parentName} ({selectedStudent.parentEmail})
            </p>
          )}
          <Input
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Progress update"
            required
          />
          <div className="flex flex-col gap-1">
            <label htmlFor="message-content" className="text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="message-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your message..."
              rows={4}
              required
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={isPending}>
              {isPending ? "Sending..." : "Send"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
