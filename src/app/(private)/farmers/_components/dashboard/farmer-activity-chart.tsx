"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { EarningsTimeSeriesPoint } from "@/app/types/farmer-dashboard";
import { formatRwf } from "@/lib/currency";
import {
  AreaGradient,
  chartCardClass,
  formatCompact,
} from "@/app/(private)/dashboard/_components/ChartShared";
import { fillTrendGaps } from "./fill-trend-gaps";

const chartConfig = {
  submissions: { label: "Submissions", color: "#2563eb" },
  earnings: { label: "Earnings (RWF)", color: "#16a34a" },
} satisfies ChartConfig;

type Series = keyof typeof chartConfig;
const SERIES = ["submissions", "earnings"] as const;

interface FarmerActivityChartProps {
  data: EarningsTimeSeriesPoint[];
  loading?: boolean;
  /** Trailing months shown, zero-filled where there's no data. */
  months?: number;
}

/** Submissions and earnings over the last months, one switchable area chart (admin dashboard style). */
export function FarmerActivityChart({ data, loading, months = 6 }: FarmerActivityChartProps) {
  const [active, setActive] = useState<Series>("submissions");
  const filled = useMemo(() => fillTrendGaps(data, months), [data, months]);
  const totals: Record<Series, number> = {
    submissions: filled.reduce((sum, p) => sum + p.submissions, 0),
    earnings: filled.reduce((sum, p) => sum + p.earnings, 0),
  };

  return (
    <Card className={chartCardClass}>
      <CardHeader className="flex flex-col gap-0 border-b border-emerald-100/80 p-0!">
        <div className="grid gap-1 px-6 py-5">
          <CardTitle className="text-sm font-semibold">Your activity</CardTitle>
          <CardDescription className="text-xs">
            {chartConfig[active].label} · last {months} months
          </CardDescription>
        </div>
        <div className="grid grid-cols-2 border-t border-emerald-100/80">
          {SERIES.map((series) => (
            <button
              key={series}
              type="button"
              data-active={active === series}
              className="relative flex flex-col justify-center gap-1 px-6 py-4 text-left transition-colors not-first:border-l not-first:border-emerald-100/80 hover:bg-white/60 data-[active=true]:bg-white cursor-pointer"
              onClick={() => setActive(series)}
            >
              {active === series && (
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5"
                  style={{ backgroundColor: chartConfig[series].color }}
                />
              )}
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: chartConfig[series].color }} />
                {chartConfig[series].label}
              </span>
              {loading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <span className="text-xl leading-none font-bold sm:text-2xl">
                  {series === "earnings" ? formatRwf(totals.earnings) : totals.submissions.toLocaleString()}
                </span>
              )}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 pb-4 sm:px-6 sm:pt-6">
        {loading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
            <AreaChart accessibilityLayer data={filled} margin={{ left: 12, right: 12 }}>
              <defs>
                {SERIES.map((s) => (
                  <AreaGradient key={s} id={`fill-farmer-${s}`} color={`var(--color-${s})`} />
                ))}
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={36}
                allowDecimals={false}
                tickFormatter={(value: number) => formatCompact(value)}
              />
              <ChartTooltip content={<ChartTooltipContent className="w-[170px]" />} />
              <Area
                key={active}
                dataKey={active}
                type="monotone"
                stroke={`var(--color-${active})`}
                strokeWidth={2.5}
                fill={`url(#fill-farmer-${active})`}
                dot={{ r: 3, strokeWidth: 2, fill: "white" }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
