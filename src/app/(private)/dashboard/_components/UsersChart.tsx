/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardStats, statisticsService, StatsFilters } from "@/app/services/statisticsService";
import {
  AreaGradient,
  buildSeries,
  chartCardClass,
  ChartPeriodFilter,
} from "./ChartShared";

interface UsersChartProps {
  loading?: boolean;
  data?: DashboardStats["users"];
}

const chartConfig = {
  restaurants: { label: "Restaurants", color: "#2563eb" },
  farmers: { label: "Farmers", color: "#16a34a" },
  admins: { label: "Admins", color: "#f59e0b" },
  affiliators: { label: "Affiliators", color: "#9333ea" },
} satisfies ChartConfig;

const ROLES = ["restaurants", "farmers", "admins", "affiliators"] as const;

// Users growth — shadcn "Area Chart - Interactive", stacked by role
export function UsersChart({ loading = false, data }: UsersChartProps) {
  const [apiData, setApiData] = useState<any>(null);
  const [filters, setFilters] = useState<StatsFilters>({ year: new Date().getFullYear() });
  const [fetching, setFetching] = useState(true);

  const fetchApiData = async (next: StatsFilters) => {
    setFetching(true);
    try {
      const response = await statisticsService.getUserStats(next);
      setApiData(response.data);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchApiData(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only; filter changes fetch explicitly
  }, []);

  const isLoading = loading || fetching;
  const chartData = buildSeries(apiData?.timeBreakdown, filters, ROLES);
  const totalChange = data?.growth?.totalChange || 0;
  const isGrowth = totalChange >= 0;

  return (
    <Card className={chartCardClass}>
      <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100/80 px-6 py-5">
        <div className="grid gap-1">
          <CardTitle className="text-sm font-semibold">Users Growth</CardTitle>
          <CardDescription className="flex items-center gap-1.5 text-xs">
            <span>Total: {(data?.totalUsers || 0).toLocaleString()}</span>
            <span
              className={`flex items-center gap-0.5 ${isGrowth ? "text-green-600" : "text-red-600"}`}
            >
              {isGrowth ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isGrowth ? "+" : ""}
              {totalChange.toFixed(1)}%
            </span>
          </CardDescription>
        </div>
        <ChartPeriodFilter
          filters={filters}
          onChange={(next) => {
            setFilters(next);
            fetchApiData(next);
          }}
        />
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <Skeleton className="h-[250px] w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={chartData} margin={{ left: 4, right: 12 }}>
              <defs>
                {ROLES.map((role) => (
                  <AreaGradient key={role} id={`fill-user-${role}`} color={`var(--color-${role})`} top={0.6} />
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
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              {ROLES.map((role) => (
                <Area
                  key={role}
                  dataKey={role}
                  type="monotone"
                  fill={`url(#fill-user-${role})`}
                  stroke={`var(--color-${role})`}
                  strokeWidth={2}
                  stackId="a"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}

        {/* Totals per role (as before) */}
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-emerald-100/80 pt-4 pb-4 sm:grid-cols-4">
          {ROLES.map((role) => (
            <div key={role} className="rounded-lg bg-white/70 py-2 text-center">
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: chartConfig[role].color }}
                />
                {chartConfig[role].label}
              </p>
              <p className="text-sm font-semibold">{(data?.[role] || 0).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
