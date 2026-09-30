"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { FoodBundlesCard } from "@/components/food-bundles-card";

interface SubMetric {
  label: string;
  value: number;
}

interface DashboardStatCardProps {
  title: string;
  value: number;
  previousValue?: number;
  gradient: string;
  suffix?: string;
  loading?: boolean;
  subMetrics?: SubMetric[];
}

// Dashboard metric rendered as a FoodBundles card (same look as vouchers/deposits)
export function DashboardStatCard({
  title,
  value,
  previousValue,
  gradient,
  suffix = "",
  loading = false,
  subMetrics = [],
}: DashboardStatCardProps) {
  const percentageChange = previousValue
    ? ((value - previousValue) / previousValue) * 100
    : 0;
  const isPositive = percentageChange >= 0;

  return (
    <FoodBundlesCard gradient={gradient}>
      <div className="relative flex-1 flex flex-col justify-center min-h-0">
        <p className="text-[9px] uppercase tracking-widest text-white/70">{title}</p>
        {loading ? (
          <div className="h-7 w-20 mt-1 bg-white/20 rounded animate-pulse" />
        ) : (
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold drop-shadow leading-tight truncate">
              {value.toLocaleString()}
              {suffix && <span className="text-sm font-semibold">{suffix}</span>}
            </p>
            {previousValue !== undefined && (
              <span className="flex items-center text-[10px] font-semibold rounded-full bg-white/20 px-1.5 py-0.5">
                {isPositive ? (
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                )}
                {Math.abs(percentageChange).toFixed(1)}%
              </span>
            )}
          </div>
        )}
      </div>

      {subMetrics.length > 0 && (
        <div className="relative flex justify-between items-end gap-2">
          {subMetrics.map((metric) => (
            <div key={metric.label} className="min-w-0">
              <p className="text-[8px] uppercase tracking-wider text-white/60 leading-none truncate">
                {metric.label}
              </p>
              {loading ? (
                <div className="h-3 w-8 mt-1 bg-white/20 rounded animate-pulse" />
              ) : (
                <p className="text-[11px] font-semibold leading-none mt-1">
                  {metric.value.toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </FoodBundlesCard>
  );
}
