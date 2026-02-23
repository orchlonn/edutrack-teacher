"use client";

import { Card } from "@/components/ui/card";
import {
  ClipboardCheck,
  GraduationCap,
  MessageCircle,
  Info,
} from "lucide-react";
import { getRelativeTime } from "@/lib/utils";
import { type Activity } from "@/lib/types";

const iconMap = {
  attendance: ClipboardCheck,
  grade: GraduationCap,
  message: MessageCircle,
  system: Info,
};

const colorMap = {
  attendance: "bg-emerald-100 text-emerald-600",
  grade: "bg-blue-100 text-blue-600",
  message: "bg-purple-100 text-purple-600",
  system: "bg-gray-100 text-gray-600",
};

interface RecentActivityProps {
  items: Activity[];
}

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <Card title="Recent Activity">
      <div className="space-y-1">
        {items.slice(0, 7).map((item) => {
          const Icon = iconMap[item.type];
          return (
            <div key={item.id} className="flex items-start gap-3 rounded-lg p-2">
              <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${colorMap[item.type]}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-700">{item.description}</p>
                <p className="text-xs text-gray-400">{getRelativeTime(item.timestamp)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
