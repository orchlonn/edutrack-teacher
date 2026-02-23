import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: "up" | "down" | "stable";
  colorClass?: string;
  className?: string;
}

export function StatCard({ label, value, icon, trend, colorClass, className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted">{label}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <p className={cn("mt-1 text-2xl font-bold", colorClass || "text-gray-900")}>
        {value}
      </p>
      {trend && (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            trend === "up" && "text-emerald-600",
            trend === "down" && "text-red-600",
            trend === "stable" && "text-gray-500",
          )}
        >
          {trend === "up" && "Trending up"}
          {trend === "down" && "Trending down"}
          {trend === "stable" && "Stable"}
        </p>
      )}
    </div>
  );
}
