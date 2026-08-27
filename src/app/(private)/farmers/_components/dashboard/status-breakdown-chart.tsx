"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Product } from "../product-context";
import { DashboardEmptyState } from "./dashboard-empty-state";

interface StatusBreakdownChartProps {
  products: Product[];
  loading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  Pending: "#F59E0B",
  Approved: "#10B981",
  Rejected: "#EF4444",
  Paid: "#3B82F6",
};

/** Donut chart of submission status breakdown, derived from already-fetched submissions. */
export function StatusBreakdownChart({ products, loading }: StatusBreakdownChartProps) {
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

  const counts = {
    Pending: products.filter(
      (p) => (p.status === "PENDING" || p.status === "VERIFIED") && p.farmerFeedbackStatus !== "REJECTED",
    ).length,
    Approved: products.filter((p) => p.status === "APPROVED").length,
    Rejected: products.filter((p) => p.farmerFeedbackStatus === "REJECTED").length,
    Paid: products.filter((p) => p.status === "PAID").length,
  };

  const data = Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);

  const isSingleCategory = data.length === 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Submission Status Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <DashboardEmptyState />
        ) : (
          <div className="relative">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={isSingleCategory ? 0 : 2}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            {isSingleCategory && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -translate-y-4">
                <span className="text-xl font-bold text-gray-900">100%</span>
                <span className="text-xs text-gray-500">{data[0].name}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
