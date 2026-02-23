"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardCheck,
  GraduationCap,
  MessageCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { type ActionItem } from "@/lib/types";

const iconMap = {
  attendance: ClipboardCheck,
  grades: GraduationCap,
  message: MessageCircle,
  alert: AlertTriangle,
};

const priorityVariant = {
  high: "danger" as const,
  medium: "warning" as const,
  low: "neutral" as const,
};

interface ActionItemsProps {
  items: ActionItem[];
}

export function ActionItems({ items }: ActionItemsProps) {
  const pending = items.filter((i) => !i.isCompleted);

  if (pending.length === 0) {
    return (
      <Card title="Action Items">
        <p className="text-sm text-gray-500">All caught up! No pending tasks.</p>
      </Card>
    );
  }

  return (
    <Card title="Action Items" action={<Badge variant="danger">{pending.length} pending</Badge>}>
      <div className="space-y-2">
        {pending.map((item) => {
          const Icon = iconMap[item.type];
          return (
            <Link
              key={item.id}
              href={item.link}
              className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-gray-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <Icon className="h-4 w-4 text-gray-600" />
              </div>
              <span className="flex-1 text-sm font-medium text-gray-800">
                {item.title}
              </span>
              <Badge variant={priorityVariant[item.priority]}>
                {item.priority}
              </Badge>
              <ArrowRight className="h-4 w-4 shrink-0 text-gray-400" />
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
