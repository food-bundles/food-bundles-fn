"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { EarningsTimeSeriesPoint } from "@/app/types/farmer-dashboard";
import { fillTrendGaps } from "./fill-trend-gaps";

interface SubmissionsTrendChartProps {
  data: EarningsTimeSeriesPoint[];
  metric: "submissions" | "earnings";
  loading?: boolean;
  /** Number of trailing months to always render, zero-filled where there's no data. */
  months?: number;
}

const METRIC_CONFIG = {
  submissions: { title: "Submissions Over Time", color: "#3B82F6", label: "Submissions" },
  earnings: { title: "Earnings Over Time", color: "#10B981", label: "Earnings (RWF)" },
};

/** Single-metric line chart for either submission volume or earnings, one axis only. */
export function SubmissionsTrendChart({ data, metric, loading, months = 6 }: SubmissionsTrendChartProps) {
  const config = METRIC_CONFIG[metric];
  const filled = useMemo(() => fillTrendGaps(data, months), [data, months]);

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
        <CardTitle className="text-sm font-semibold">{config.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={filled} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#666" />
            <YAxis
              tick={{ fontSize: 10 }}
              stroke="#666"
              tickFormatter={(value) =>
                metric === "earnings" ? `${(value / 1000).toFixed(0)}K` : value.toString()
              }
              allowDecimals={false}
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
              formatter={(value: number | undefined) => [
                metric === "earnings" ? `${(value ?? 0).toLocaleString()} RWF` : (value ?? 0).toString(),
                config.label,
              ] as [string, string]}
            />
            <Line
              type="monotone"
              dataKey={metric}
              stroke={config.color}
              strokeWidth={2}
              name={config.label}
              dot={{ fill: config.color, strokeWidth: 1, r: 3 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
