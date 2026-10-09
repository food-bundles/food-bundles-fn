import type { EarningsTimeSeriesPoint } from "@/app/types/farmer-dashboard";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Zero-fills a sparse earnings/submissions time series into a continuous N-month
 * range ending this month, so the trend chart always has enough points to render
 * a line (even an all-zero one) instead of falling back to an empty-state message.
 */
export function fillTrendGaps(
  data: EarningsTimeSeriesPoint[],
  months: number,
): EarningsTimeSeriesPoint[] {
  const byMonth = new Map(data.map((point) => [point.month, point]));
  const now = new Date();
  const filled: EarningsTimeSeriesPoint[] = [];

  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const existing = byMonth.get(key);
    filled.push({
      month: MONTH_LABELS[d.getMonth()],
      submissions: existing?.submissions ?? 0,
      earnings: existing?.earnings ?? 0,
    });
  }

  return filled;
}
