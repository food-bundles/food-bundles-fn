import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardEmptyStateProps {
  message?: string;
  icon?: LucideIcon;
  className?: string;
}

/** Shared empty-state block used by every chart/section on the farmer dashboard. */
export function DashboardEmptyState({
  message = "No data available",
  icon: Icon = Inbox,
  className,
}: DashboardEmptyStateProps) {
  return (
    <div
      className={cn(
        "h-[300px] flex flex-col items-center justify-center gap-2 text-center px-6 rounded-lg border border-dashed border-gray-200 bg-gray-50/50",
        className,
      )}
    >
      <Icon className="w-8 h-8 text-gray-300" />
      <p className="text-sm text-gray-500 max-w-xs">{message}</p>
    </div>
  );
}
