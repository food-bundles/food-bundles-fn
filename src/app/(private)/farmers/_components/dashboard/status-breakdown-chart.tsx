"use client";

import { Label, Pie, PieChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "../product-context";
import { chartCardClass } from "@/app/(private)/dashboard/_components/ChartShared";
import { DashboardEmptyState } from "./dashboard-empty-state";

interface StatusBreakdownChartProps {
  products: Product[];
  loading?: boolean;
}

const chartConfig = {
  pending: { label: "Pending", color: "#f59e0b" },
  approved: { label: "Approved", color: "#16a34a" },
  paid: { label: "Paid", color: "#2563eb" },
  rejected: { label: "Rejected", color: "#dc2626" },
} satisfies ChartConfig;

type StatusKey = keyof typeof chartConfig;

/** Donut of where the farmer's submissions stand (admin dashboard style). */
export function StatusBreakdownChart({ products, loading }: StatusBreakdownChartProps) {
  const isRejected = (p: Product) => p.status === "REJECTED" || p.farmerFeedbackStatus === "REJECTED";
  const counts: Record<StatusKey, number> = {
    pending: products.filter(
      (p) => (p.status === "PENDING" || p.status === "NEGOTIATING") && !isRejected(p),
    ).length,
    approved: products.filter((p) => p.status === "APPROVED" || p.status === "VERIFIED").length,
    paid: products.filter((p) => p.status === "PAID").length,
    rejected: products.filter(isRejected).length,
  };
  const data = (Object.keys(counts) as StatusKey[])
    .map((status) => ({ status, value: counts[status], fill: `var(--color-${status})` }))
    .filter((d) => d.value > 0);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className={chartCardClass}>
      <CardHeader className="border-b border-emerald-100/80 px-6 py-5">
        <CardTitle className="text-sm font-semibold">Submission status</CardTitle>
        <CardDescription className="text-xs">Where your submissions stand</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 pb-4 sm:px-6">
        {loading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : total === 0 ? (
          <DashboardEmptyState />
        ) : (
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <ChartContainer config={chartConfig} className="aspect-square h-[200px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="status"
                  innerRadius={58}
                  outerRadius={85}
                  strokeWidth={4}
                  paddingAngle={data.length > 1 ? 2 : 0}
                >
                  <Label
                    content={({ viewBox }) =>
                      viewBox && "cx" in viewBox && "cy" in viewBox ? (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
                            {total}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">
                            submissions
                          </tspan>
                        </text>
                      ) : null
                    }
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className="w-full space-y-2 text-sm">
              {(Object.keys(chartConfig) as StatusKey[]).map((status) => (
                <li key={status} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-gray-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartConfig[status].color }} />
                    {chartConfig[status].label}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {counts[status]}
                    <span className="ml-1 text-xs font-normal text-gray-500">
                      {total > 0 ? Math.round((counts[status] / total) * 100) : 0}%
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
