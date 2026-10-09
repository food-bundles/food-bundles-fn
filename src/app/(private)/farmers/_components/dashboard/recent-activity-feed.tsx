"use client";

import { motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, XCircle, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecentActivityItem } from "@/app/types/farmer-dashboard";
import { gridContainerVariants, gridItemVariants } from "./motion-variants";
import { DashboardEmptyState } from "./dashboard-empty-state";

interface RecentActivityFeedProps {
  items: RecentActivityItem[];
  loading?: boolean;
}

/** Recent login-activity feed for the farmer dashboard. */
export function RecentActivityFeed({ items, loading }: RecentActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <DashboardEmptyState
            icon={History}
            message="No recent activity yet."
            className="h-auto py-10"
          />
        ) : (
          <motion.ul
            variants={gridContainerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {items.map((item) => (
              <motion.li
                key={item.id}
                variants={gridItemVariants}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-gray-100 bg-gray-50/60"
              >
                {item.successful ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-800">
                    {item.successful ? "Successful login" : "Failed login attempt"}
                  </p>
                  {item.deviceInfo && (
                    <p className="text-xs text-gray-500 truncate">{item.deviceInfo}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {formatDistanceToNow(new Date(item.attemptTime), { addSuffix: true })}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </CardContent>
    </Card>
  );
}
