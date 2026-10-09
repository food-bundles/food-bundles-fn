"use client";

import { useState, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  formatCompact,
  periodDescription,
} from "./ChartShared";

interface FinanceChartProps {
  loading?: boolean;
  data?: DashboardStats["finance"];
}

const chartConfig = {
  revenue: { label: "Revenue", color: "#16a34a" },
  expenses: { label: "Expenses", color: "#dc2626" },
} satisfies ChartConfig;

const SERIES = ["revenue", "expenses"] as const;

// Finance overview — shadcn "Area Chart - Interactive"
export function FinanceChart({ loading = false, data }: FinanceChartProps) {
  const [filters, setFilters] = useState<StatsFilters>({ year: new Date().getFullYear() });
  const [localData, setLocalData] = useState<DashboardStats["finance"] | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  const fetchLocalData = async (next: StatsFilters) => {
    setLocalLoading(true);
    try {
      const response = await statisticsService.getFinanceStats(next);
      setLocalData(response.data);
    } catch (error) {
      console.error("Error fetching finance data:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    fetchLocalData(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only; filter changes fetch explicitly
  }, []);

  const activeData = localData || data;
  const isLoading = loading || localLoading;
  const chartData = buildSeries(activeData?.timeBreakdown, filters, SERIES);

  const netProfit = activeData?.netProfit || 0;
  const isProfit = netProfit >= 0;
  const profitMargin = activeData?.profitMargin || 0;

  return (
    <Card className={chartCardClass}>
      <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100/80 px-6 py-5">
        <div className="grid gap-1">
          <CardTitle className="text-sm font-semibold">Finance Overview</CardTitle>
          <CardDescription className="text-xs">
            Revenue vs expenses · {periodDescription(filters)}
          </CardDescription>
        </div>
        <ChartPeriodFilter
          filters={filters}
          onChange={(next) => {
            setFilters(next);
            fetchLocalData(next);
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
                <AreaGradient id="fillRevenue" color="var(--color-revenue)" />
                <AreaGradient id="fillExpenses" color="var(--color-expenses)" top={0.4} />
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={16}
              />
              <YAxis tickLine={false} axisLine={false} width={40} tickFormatter={formatCompact} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              {/* Overlapping, not stacked: expenses are compared against revenue */}
              <Area
                dataKey="revenue"
                type="monotone"
                fill="url(#fillRevenue)"
                stroke="var(--color-revenue)"
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 2, fill: "white" }}
                activeDot={{ r: 5 }}
              />
              <Area
                dataKey="expenses"
                type="monotone"
                fill="url(#fillExpenses)"
                stroke="var(--color-expenses)"
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 2, fill: "white" }}
                activeDot={{ r: 5 }}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 border-t border-emerald-100/80 px-6 py-4 text-xs">
        <div
          className={`flex items-center gap-1.5 font-medium ${isProfit ? "text-green-600" : "text-red-600"}`}
        >
          Net {isProfit ? "profit" : "loss"} {Math.abs(netProfit).toLocaleString()} RWF
          {isProfit ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
        </div>
        <div className="text-muted-foreground">
          {profitMargin.toFixed(1)}% margin · Revenue {(activeData?.totalRevenue || 0).toLocaleString()} RWF ·
          Expenses {(activeData?.totalExpenses || 0).toLocaleString()} RWF
        </div>
      </CardFooter>
    </Card>
  );
}
