"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createScheduleItem, updateScheduleItem } from "@/app/actions/schedule";
import type { Class } from "@/lib/types";

const dayOptions = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
];

const periodOptions = [
  { value: "1", label: "Period 1" },
  { value: "2", label: "Period 2" },
  { value: "3", label: "Period 3" },
  { value: "4", label: "Period 4" },
  { value: "5", label: "Period 5" },
  { value: "6", label: "Period 6" },
  { value: "7", label: "Period 7" },
];

interface ScheduleItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: Class[];
  initialData?: {
    id: string;
    classId: string;
    period: number;
    startTime: string;
    endTime: string;
    dayOfWeek: number;
  };
  defaultDay?: number;
  defaultPeriod?: number;
}

export function ScheduleItemModal({
  isOpen,
  onClose,
  classes,
  initialData,
  defaultDay,
  defaultPeriod,
}: ScheduleItemModalProps) {
  const isEditing = !!initialData;
  const [classId, setClassId] = useState(initialData?.classId ?? classes[0]?.id ?? "");
  const [period, setPeriod] = useState((initialData?.period ?? defaultPeriod ?? 1).toString());
  const [startTime, setStartTime] = useState(initialData?.startTime ?? "08:00");
  const [endTime, setEndTime] = useState(initialData?.endTime ?? "08:50");
  const [dayOfWeek, setDayOfWeek] = useState((initialData?.dayOfWeek ?? defaultDay ?? 1).toString());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const classOptions = classes.map((c) => ({ value: c.id, label: c.name }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!classId || !startTime || !endTime) {
      setError("All fields are required");
      return;
    }

    startTransition(async () => {
      try {
        const data = {
          classId,
          period: parseInt(period, 10),
          startTime,
          endTime,
          dayOfWeek: parseInt(dayOfWeek, 10),
        };
        if (isEditing) {
          await updateScheduleItem(initialData.id, data);
        } else {
          await createScheduleItem(data);
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
          {isEditing ? "Edit Schedule Item" : "Add Schedule Item"}
        </h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <Select
            label="Class"
            options={classOptions}
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          />
          <Select
            label="Day"
            options={dayOptions}
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
          />
          <Select
            label="Period"
            options={periodOptions}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
          <Input
            label="Start Time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
          <Input
            label="End Time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEditing ? "Save" : "Add"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
