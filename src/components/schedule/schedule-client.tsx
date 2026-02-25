"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScheduleItemModal } from "./schedule-item-modal";
import { deleteScheduleItem } from "@/app/actions/schedule";
import { formatTime } from "@/lib/utils";
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";
import type { ScheduleItem, Class } from "@/lib/types";

interface ScheduleItemWithClass extends ScheduleItem {
  className: string;
}

interface ScheduleClientProps {
  items: ScheduleItemWithClass[];
  classes: Class[];
}

const dayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function ScheduleClient({ items, classes }: ScheduleClientProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItemWithClass | null>(null);
  const [defaultDay, setDefaultDay] = useState<number | undefined>();
  const [defaultPeriod, setDefaultPeriod] = useState<number | undefined>();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  function handleDelete(id: string) {
    setPendingId(id);
    startTransition(async () => {
      await deleteScheduleItem(id);
      setPendingId(null);
    });
  }

  function handleAddForSlot(day: number, period: number) {
    setDefaultDay(day);
    setDefaultPeriod(period);
    setShowModal(true);
  }

  // Group items by day
  const days = [1, 2, 3, 4, 5];
  const periods = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <h1 className="text-lg font-semibold text-gray-900">Weekly Schedule</h1>
        </div>
        <Button size="sm" onClick={() => { setDefaultDay(undefined); setDefaultPeriod(undefined); setShowModal(true); }}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Desktop grid */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-white md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-gray-50">
              <th className="w-16 px-3 py-2.5 text-left text-xs font-semibold text-gray-500">Period</th>
              {days.map((day) => (
                <th key={day} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">
                  {dayNames[day]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((period) => (
              <tr key={period} className="border-b border-border last:border-0">
                <td className="px-3 py-2 text-center text-xs font-semibold text-gray-500">
                  P{period}
                </td>
                {days.map((day) => {
                  const item = items.find((i) => i.dayOfWeek === day && i.period === period);
                  return (
                    <td key={day} className="px-2 py-1.5">
                      {item ? (
                        <div className="group flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-blue-800">{item.className}</p>
                            <p className="text-xs text-blue-600">
                              {formatTime(item.startTime)} - {formatTime(item.endTime)}
                            </p>
                          </div>
                          <div className="hidden shrink-0 gap-0.5 group-hover:flex">
                            <button
                              onClick={() => setEditingItem(item)}
                              className="rounded p-0.5 text-blue-400 hover:bg-blue-100 hover:text-blue-600 cursor-pointer"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={isPending && pendingId === item.id}
                              className="rounded p-0.5 text-red-400 hover:bg-red-100 hover:text-red-600 cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddForSlot(day, period)}
                          className="flex h-10 w-full items-center justify-center rounded-lg border border-dashed border-gray-200 text-gray-300 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-400 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="space-y-4 md:hidden">
        {days.map((day) => {
          const dayItems = items
            .filter((i) => i.dayOfWeek === day)
            .sort((a, b) => a.period - b.period);

          return (
            <Card key={day} title={dayNames[day]}>
              {dayItems.length === 0 ? (
                <p className="text-sm text-gray-400">No classes</p>
              ) : (
                <div className="space-y-2">
                  {dayItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-lg bg-blue-50 px-3 py-2">
                      <Badge variant="neutral">P{item.period}</Badge>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800">{item.className}</p>
                        <p className="text-xs text-gray-500">
                          {formatTime(item.startTime)} - {formatTime(item.endTime)}
                        </p>
                      </div>
                      <button
                        onClick={() => setEditingItem(item)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={isPending && pendingId === item.id}
                        className="rounded p-1 text-red-400 hover:bg-red-100 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <ScheduleItemModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        classes={classes}
        defaultDay={defaultDay}
        defaultPeriod={defaultPeriod}
      />

      {editingItem && (
        <ScheduleItemModal
          isOpen={true}
          onClose={() => setEditingItem(null)}
          classes={classes}
          initialData={editingItem}
        />
      )}
    </div>
  );
}
