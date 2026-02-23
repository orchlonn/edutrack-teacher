"use client";

import { Button } from "@/components/ui/button";
import { Undo2, Save } from "lucide-react";
import { type AttendanceStatus } from "@/lib/types";

interface AttendanceSummaryBarProps {
  records: Record<string, AttendanceStatus>;
  onSave: () => void;
  onUndo: () => void;
  canUndo: boolean;
  isSaved: boolean;
}

export function AttendanceSummaryBar({
  records,
  onSave,
  onUndo,
  canUndo,
  isSaved,
}: AttendanceSummaryBarProps) {
  const values = Object.values(records);
  const present = values.filter((s) => s === "present").length;
  const absent = values.filter((s) => s === "absent").length;
  const late = values.filter((s) => s === "late").length;
  const excused = values.filter((s) => s === "excused").length;

  return (
    <div className="sticky bottom-0 left-0 right-0 z-10 border-t border-border bg-white px-4 py-3 md:relative md:mt-4 md:rounded-xl md:border md:shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span>
            <span className="font-bold text-emerald-600">{present}</span>{" "}
            <span className="text-gray-500">Present</span>
          </span>
          <span>
            <span className="font-bold text-red-600">{absent}</span>{" "}
            <span className="text-gray-500">Absent</span>
          </span>
          <span>
            <span className="font-bold text-amber-600">{late}</span>{" "}
            <span className="text-gray-500">Late</span>
          </span>
          <span>
            <span className="font-bold text-blue-600">{excused}</span>{" "}
            <span className="text-gray-500">Excused</span>
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onUndo} disabled={!canUndo}>
            <Undo2 className="h-4 w-4" />
            Undo
          </Button>
          <Button
            variant={isSaved ? "success" : "primary"}
            size="md"
            onClick={onSave}
          >
            <Save className="h-4 w-4" />
            {isSaved ? "Saved!" : "Save Attendance"}
          </Button>
        </div>
      </div>
    </div>
  );
}
