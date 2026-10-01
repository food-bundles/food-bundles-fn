"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { TopProduct } from "@/app/types/farmer-dashboard";
import { DashboardEmptyState } from "./dashboard-empty-state";

interface TopProductsChartProps {
  data: TopProduct[];
  loading?: boolean;
}

const truncateLabel = (name: string, max = 10) =>
  name.length > max ? `${name.slice(0, max)}…` : name;

/** Bar chart ranking the farmer's top-performing products by total paid earnings. */
export function TopProductsChart({ data, loading }: TopProductsChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Top Performing Products</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <DashboardEmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="productName"
                tick={{ fontSize: 10 }}
                stroke="#666"
                tickFormatter={(value) => truncateLabel(value)}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                stroke="#666"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  fontSize: "12px",
                }}
                labelStyle={{ fontSize: "12px", marginBottom: "4px", fontWeight: "bold" }}
                formatter={(value: number | undefined, _name, item) =>
                  [
                    `${(value ?? 0).toLocaleString()} RWF (${item.payload.submissionCount} submissions)`,
                    "Total earnings",
                  ] as [string, string]
                }
              />
              <Bar dataKey="totalEarnings" fill="#10B981" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
