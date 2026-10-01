"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ViewModeOption<T extends string> {
  value: T;
  label: string;
  icon: LucideIcon;
}

interface ViewModeToggleProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ViewModeOption<T>[];
  className?: string;
}

/** Pill-style view-mode switcher (e.g. cards/table/list) shared across data views. */
export function ViewModeToggle<T extends string>({
  value,
  onChange,
  options,
  className,
}: ViewModeToggleProps<T>) {
  return (
    <div
      className={cn(
        "flex gap-0.5 bg-gray-100 rounded-xl p-0.5",
        className,
      )}
      role="group"
      aria-label="View mode"
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={cn(
              "px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1",
              isActive ? "bg-white shadow-sm text-gray-900" : "text-gray-500",
            )}
          >
            <option.icon className="w-3 h-3" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
