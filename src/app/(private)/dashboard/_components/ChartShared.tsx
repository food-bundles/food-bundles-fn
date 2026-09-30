/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StatsFilters } from "@/app/services/statisticsService";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Soft gradient surface shared by the dashboard chart cards
export const chartCardClass =
  "gap-0 overflow-hidden py-0 border-emerald-100/80 bg-gradient-to-br from-white via-white to-emerald-50/70 shadow-sm";

export const formatCompact = (value: number) =>
  Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);

export const periodDescription = (filters: StatsFilters) =>
  !filters.year
    ? "all years"
    : filters.month
      ? `${MONTHS[filters.month - 1]} ${filters.year}, by week`
      : `${filters.year}, by month`;

/**
 * Turn the stats API `timeBreakdown` into chart points for the selected filter,
 * filling missing buckets with 0 so the curve is continuous:
 *   All years → one point per year · year → Jan–Dec · year + month → weeks.
 */
export function buildSeries<K extends string>(
  timeBreakdown: Record<string, any> | undefined,
  filters: StatsFilters,
  keys: readonly K[]
): Array<{ label: string } & Record<K, number>> {
  const point = (label: string, source: any) =>
    ({
      label,
      ...Object.fromEntries(keys.map((k) => [k, Number(source?.[k]) || 0])),
    }) as { label: string } & Record<K, number>;

  const breakdown = timeBreakdown || {};
  const { year, month } = filters;

  if (!year) {
    const currentYear = new Date().getFullYear();
    const years = Object.keys(breakdown).map(Number).filter(Boolean);
    const first = Math.min(currentYear, ...years);
    const last = Math.max(currentYear, ...years);
    return Array.from({ length: last - first + 1 }, (_, i) => {
      const y = first + i;
      return point(y.toString(), breakdown[y]);
    });
  }

  const months = breakdown[year]?.months || {};
  if (!month) {
    return MONTHS.map((name, i) => point(name, months[i + 1]));
  }

  const weeks = months[month]?.weeks || {};
  const daysInMonth = new Date(year, month, 0).getDate();
  const weekCount = Math.max(Math.ceil(daysInMonth / 7), ...Object.keys(weeks).map(Number));
  return Array.from({ length: weekCount }, (_, i) => point(`Week ${i + 1}`, weeks[i + 1]));
}

// Year / month selects (unchanged behaviour: month needs a year)
export function ChartPeriodFilter({
  filters,
  onChange,
}: {
  filters: StatsFilters;
  onChange: (filters: StatsFilters) => void;
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  return (
    <div className="flex items-center gap-2">
      <Select
        value={filters.year?.toString() || "all"}
        onValueChange={(value) =>
          onChange({ year: value === "all" ? undefined : parseInt(value), month: undefined })
        }
      >
        <SelectTrigger className="h-8 w-[92px] rounded-lg bg-white/80 text-xs" aria-label="Year">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="all" className="rounded-lg text-xs">All</SelectItem>
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()} className="rounded-lg text-xs">
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.month?.toString() || "all"}
        onValueChange={(value) =>
          onChange({ ...filters, month: value === "all" ? undefined : parseInt(value) })
        }
        disabled={!filters.year}
      >
        <SelectTrigger className="h-8 w-[80px] rounded-lg bg-white/80 text-xs" aria-label="Month">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="all" className="rounded-lg text-xs">All</SelectItem>
          {MONTHS.map((label, i) => (
            <SelectItem key={label} value={(i + 1).toString()} className="rounded-lg text-xs">
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Vertical gradient for an area fill, keyed by series name
export function AreaGradient({ id, color, top = 0.55 }: { id: string; color: string; top?: number }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={color} stopOpacity={top} />
      <stop offset="95%" stopColor={color} stopOpacity={0.02} />
    </linearGradient>
  );
}
