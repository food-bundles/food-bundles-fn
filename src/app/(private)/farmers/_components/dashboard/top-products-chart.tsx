"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { TopProduct } from "@/app/types/farmer-dashboard";
import { chartCardClass, formatCompact } from "@/app/(private)/dashboard/_components/ChartShared";
import { DashboardEmptyState } from "./dashboard-empty-state";

interface TopProductsChartProps {
  data: TopProduct[];
  loading?: boolean;
}

const chartConfig = {
  totalEarnings: { label: "Earnings (RWF)", color: "#16a34a" },
} satisfies ChartConfig;

/** The farmer's best-paying products, as horizontal bars (admin dashboard style). */
export function TopProductsChart({ data, loading }: TopProductsChartProps) {
  return (
    <Card className={chartCardClass}>
      <CardHeader className="border-b border-emerald-100/80 px-6 py-5">
        <CardTitle className="text-sm font-semibold">Top products</CardTitle>
        <CardDescription className="text-xs">What earned you the most</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 pb-4 sm:px-6">
        {loading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : data.length === 0 ? (
          <DashboardEmptyState />
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
            <BarChart
              accessibilityLayer
              data={data.slice(0, 6)}
              layout="vertical"
              margin={{ left: 8, right: 48 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <YAxis
                dataKey="productName"
                type="category"
                tickLine={false}
                axisLine={false}
                width={90}
                tickFormatter={(value: string) => (value.length > 12 ? `${value.slice(0, 12)}…` : value)}
              />
              <XAxis type="number" hide />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[190px]"
                    formatter={(value, _name, item) => (
                      <div className="flex w-full justify-between gap-2">
                        <span className="text-muted-foreground">
                          {(item?.payload as TopProduct | undefined)?.submissionCount ?? 0} submissions
                        </span>
                        <span className="font-mono font-medium">{Number(value).toLocaleString()} RWF</span>
                      </div>
                    )}
                  />
                }
              />
              <Bar dataKey="totalEarnings" fill="var(--color-totalEarnings)" radius={6}>
                <LabelList
                  dataKey="totalEarnings"
                  position="right"
                  className="fill-foreground"
                  fontSize={11}
                  formatter={(value: unknown) => formatCompact(Number(value))}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
