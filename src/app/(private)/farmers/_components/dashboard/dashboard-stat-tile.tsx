"use client";

import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { gridItemVariants } from "./motion-variants";

type Accent = "green" | "amber" | "red" | "blue";

const ACCENT_STYLES: Record<Accent, { gradient: string; value: string }> = {
  green: { gradient: "from-emerald-500 to-emerald-600", value: "text-emerald-800" },
  amber: { gradient: "from-amber-500 to-amber-600", value: "text-amber-800" },
  red: { gradient: "from-red-500 to-red-600", value: "text-red-800" },
  blue: { gradient: "from-blue-500 to-blue-600", value: "text-blue-800" },
};

export interface DashboardStatTileProps {
  title: string;
  value: string;
  icon: LucideIcon;
  subtitle?: string;
  trend?: { value: number; direction: "up" | "down" | "flat"; label: string };
  accent?: Accent;
}

/** Stat tile for the farmer dashboard's summary grid, styled after EnhancedMetricCard. */
export function DashboardStatTile({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  accent = "blue",
}: DashboardStatTileProps) {
  const styles = ACCENT_STYLES[accent];
  const TrendIcon = trend?.direction === "up" ? TrendingUp : trend?.direction === "down" ? TrendingDown : Minus;
  const trendColor =
    trend?.direction === "up" ? "text-emerald-600" : trend?.direction === "down" ? "text-red-600" : "text-gray-500";

  return (
    <motion.div variants={gridItemVariants}>
      <Card className="relative overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
        <div className={cn("absolute inset-0 bg-linear-to-br opacity-5", styles.gradient)} />
        <CardContent className="p-5 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className={cn("text-2xl font-bold mt-1.5 tracking-tight break-words", styles.value)}>{value}</p>
              {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
              {trend && (
                <div className={cn("flex items-center gap-1 mt-1.5 text-xs font-medium", trendColor)}>
                  <TrendIcon className="w-3 h-3" />
                  <span>
                    {trend.value > 0 ? "+" : ""}
                    {trend.value.toFixed(1)}% {trend.label}
                  </span>
                </div>
              )}
            </div>
            <div className={cn("p-2.5 rounded-full bg-linear-to-br shrink-0", styles.gradient)}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
