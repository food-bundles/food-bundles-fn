/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DashboardStats,
  statisticsService,
  StatsFilters,
} from "@/app/services/statisticsService";
import {
  AreaGradient,
  buildSeries,
  chartCardClass,
  ChartPeriodFilter,
  periodDescription,
} from "./ChartShared";

interface OrdersChartProps {
  loading?: boolean;
  data?: DashboardStats["orders"];
}

const chartConfig = {
  completed: { label: "Completed", color: "#16a34a" },
  cancelled: { label: "Cancelled", color: "#dc2626" },
  ongoing: { label: "Ongoing", color: "#2563eb" },
} satisfies ChartConfig;

type Series = keyof typeof chartConfig;
const SERIES = ["completed", "cancelled", "ongoing"] as const;

// Orders trend — shadcn "Line Chart - Interactive": click a total to switch the curve
export function OrdersChart({ loading = false, data }: OrdersChartProps) {
  const [apiData, setApiData] = useState<any>(null);
  const [filters, setFilters] = useState<StatsFilters>({ year: new Date().getFullYear() });
  const [fetching, setFetching] = useState(true);
  const [activeSeries, setActiveSeries] = useState<Series>("completed");

  const fetchApiData = async (next: StatsFilters) => {
    setFetching(true);
    try {
      const response = await statisticsService.getOrderStats(next);
      setApiData(response.data);
    } catch (error) {
      console.error("Error fetching order stats:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchApiData(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only; filter changes fetch explicitly
  }, []);

  const isLoading = loading || (fetching && !apiData);
  const chartData = buildSeries(apiData?.timeBreakdown, filters, SERIES);
  const totals: Record<Series, number> = {
    completed: apiData?.completedOrders ?? data?.completedOrders ?? 0,
    cancelled: apiData?.cancelledOrders ?? data?.cancelledOrders ?? 0,
    ongoing: apiData?.ongoingOrders ?? data?.ongoingOrders ?? 0,
  };

  return (
    <Card className={chartCardClass}>
      <CardHeader className="flex flex-col gap-0 border-b border-emerald-100/80 p-0!">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
          <div className="grid gap-1">
            <CardTitle className="text-sm font-semibold">Orders Trend</CardTitle>
            <CardDescription className="text-xs">
              {chartConfig[activeSeries].label} orders · {periodDescription(filters)}
            </CardDescription>
          </div>
          <ChartPeriodFilter
            filters={filters}
            onChange={(next) => {
              setFilters(next);
              fetchApiData(next);
            }}
          />
        </div>
        <div className="grid grid-cols-3 border-t border-emerald-100/80">
          {SERIES.map((series) => (
            <button
              key={series}
              data-active={activeSeries === series}
              className="relative flex flex-col justify-center gap-1 px-6 py-4 text-left transition-colors not-first:border-l not-first:border-emerald-100/80 hover:bg-white/60 data-[active=true]:bg-white cursor-pointer"
              onClick={() => setActiveSeries(series)}
            >
              {/* Active tab underline in the series colour */}
              {activeSeries === series && (
                <span
                  className="absolute inset-x-0 bottom-0 h-0.5"
                  style={{ backgroundColor: chartConfig[series].color }}
                />
              )}
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: chartConfig[series].color }}
                />
                {chartConfig[series].label}
              </span>
              {isLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <span className="text-2xl leading-none font-bold">
                  {totals[series].toLocaleString()}
                </span>
              )}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 pb-4 sm:px-6 sm:pt-6">
        {isLoading || fetching ? (
          <Skeleton className="h-[250px] w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
              <defs>
                {SERIES.map((s) => (
                  <AreaGradient key={s} id={`fill-order-${s}`} color={`var(--color-${s})`} />
                ))}
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={16}
              />
              <YAxis tickLine={false} axisLine={false} width={28} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent className="w-[150px]" />} />
              <Area
                key={activeSeries}
                dataKey={activeSeries}
                type="monotone"
                stroke={`var(--color-${activeSeries})`}
                strokeWidth={2.5}
                fill={`url(#fill-order-${activeSeries})`}
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
