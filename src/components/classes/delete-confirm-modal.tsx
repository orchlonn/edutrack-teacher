"use client";

import { Button } from "@/components/ui/button";
import { useTransition } from "react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  className: string;
  studentCount: number;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  className,
  studentCount,
}: DeleteConfirmModalProps) {
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  function handleConfirm() {
    startTransition(async () => {
      await onConfirm();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900">Delete Class</h3>
        <p className="mt-2 text-sm text-gray-600">
          Are you sure you want to delete <span className="font-medium">{className}</span>?
          This will remove {studentCount > 0 ? `all ${studentCount} student enrollments, ` : ""}
          attendance records, exams, and grades for this class.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
