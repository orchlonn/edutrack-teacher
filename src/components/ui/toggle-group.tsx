"use client";

import { cn } from "@/lib/utils";

interface ToggleOption {
  value: string;
  label: string;
  activeColor: string; // Tailwind bg class when selected e.g. "bg-emerald-500"
}

interface ToggleGroupProps {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ToggleGroup({ options, value, onChange, className }: ToggleGroupProps) {
  return (
    <div className={cn("flex gap-1", className)}>
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-3 text-sm font-semibold transition-all cursor-pointer",
              isActive
                ? `${opt.activeColor} text-white shadow-sm`
                : "bg-gray-100 text-gray-500 hover:bg-gray-200",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
