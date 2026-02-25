"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createExam, updateExam } from "@/app/actions/exams";

const examTypes = [
  { value: "quiz", label: "Quiz" },
  { value: "test", label: "Test" },
  { value: "midterm", label: "Midterm" },
  { value: "final", label: "Final" },
  { value: "homework", label: "Homework" },
  { value: "project", label: "Project" },
];

interface ExamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  initialData?: {
    id: string;
    name: string;
    date: string;
    maxScore: number;
    type: string;
  };
}

export function ExamFormModal({ isOpen, onClose, classId, initialData }: ExamFormModalProps) {
  const isEditing = !!initialData;
  const [name, setName] = useState(initialData?.name ?? "");
  const [date, setDate] = useState(initialData?.date ?? "");
  const [maxScore, setMaxScore] = useState(initialData?.maxScore?.toString() ?? "100");
  const [type, setType] = useState(initialData?.type ?? "test");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !date || !maxScore) {
      setError("All fields are required");
      return;
    }

    const score = parseInt(maxScore, 10);
    if (isNaN(score) || score <= 0) {
      setError("Max score must be a positive number");
      return;
    }

    startTransition(async () => {
      try {
        const data = {
          name: name.trim(),
          date,
          maxScore: score,
          type,
        };
        if (isEditing) {
          await updateExam(initialData.id, data);
        } else {
          await createExam({ ...data, classId });
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
          {isEditing ? "Edit Exam" : "Create Exam"}
        </h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <Input
            label="Exam Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Chapter 5 Quiz"
            required
          />
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <Input
            label="Max Score"
            type="number"
            value={maxScore}
            onChange={(e) => setMaxScore(e.target.value)}
            placeholder="e.g. 100"
            min="1"
            required
          />
          <Select
            label="Type"
            options={examTypes}
            value={type}
            onChange={(e) => setType(e.target.value)}
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
