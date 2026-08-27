"use client";

import { motion } from "motion/react";
import { Package, Clock, CheckCircle, XCircle, Wallet, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "../product-context";
import type { EarningsSummary } from "@/app/types/farmer-dashboard";
import { DashboardStatTile } from "./dashboard-stat-tile";
import { gridContainerVariants } from "./motion-variants";
import { formatRwf } from "@/lib/currency";

interface DashboardStatGridProps {
  products: Product[];
  earnings: EarningsSummary | null;
  loading?: boolean;
}

/** Compact 2-row, 3-column summary grid for the farmer dashboard. */
export function DashboardStatGrid({ products, earnings, loading }: DashboardStatGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  const total = products.length;
  const rejected = products.filter((p) => p.farmerFeedbackStatus === "REJECTED").length;
  const pending = products.filter(
    (p) => (p.status === "PENDING" || p.status === "VERIFIED") && p.farmerFeedbackStatus !== "REJECTED",
  ).length;
  const approved = products.filter((p) => p.status === "APPROVED").length;
  const paid = products.filter((p) => p.status === "PAID").length;
  const decided = approved + paid + rejected;
  const acceptanceRate = decided > 0 ? ((approved + paid) / decided) * 100 : 0;

  return (
    <motion.div
      variants={gridContainerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6"
    >
      <DashboardStatTile title="Total Submissions" value={total.toString()} icon={Package} accent="blue" />
      <DashboardStatTile title="Pending" value={pending.toString()} icon={Clock} accent="amber" />
      <DashboardStatTile
        title="Approved"
        value={approved.toString()}
        icon={CheckCircle}
        accent="green"
        subtitle={`${acceptanceRate.toFixed(0)}% acceptance`}
      />
      <DashboardStatTile title="Rejected" value={rejected.toString()} icon={XCircle} accent="red" />
      <DashboardStatTile title="Paid" value={paid.toString()} icon={Wallet} accent="green" />
      <DashboardStatTile
        title="Total Earnings"
        value={formatRwf(earnings?.yearToDate ?? 0)}
        icon={DollarSign}
        accent="green"
        subtitle={earnings ? `Avg ${formatRwf(earnings.avgPerSubmission)}/submission` : undefined}
      />
    </motion.div>
  );
}
