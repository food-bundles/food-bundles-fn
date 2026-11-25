"use client";

import { fullRwf, margin, marginLevel } from "@/lib/menu-designer/costing";

const TONE = {
  good: "bg-green-100 text-green-800",
  ok: "bg-amber-100 text-amber-800",
  low: "bg-red-100 text-red-700",
  unknown: "bg-gray-100 text-gray-600",
} as const;

/** "Cost 2,350 · margin 76%": green when the dish earns well, red when food eats the price */
export function CostChip({ cost, price, missing }: { cost: number; price?: number; missing: number }) {
  const m = margin(price, cost);
  const level = cost > 0 ? marginLevel(m) : "unknown";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${TONE[level]}`}>
      {cost > 0 ? `Cost ${fullRwf(cost)}` : "No cost yet"}
      {m !== null && cost > 0 ? ` · margin ${Math.round(m * 100)}%` : ""}
      {missing > 0 ? ` · ${missing} not found` : ""}
    </span>
  );
}
