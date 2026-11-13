"use client";

import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, BellRing } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "../product-context";
import type { EarningsSummary } from "@/app/types/farmer-dashboard";
import { formatRwf } from "@/lib/currency";
import { gridContainerVariants } from "./motion-variants";

const FOOD_BUNDLES_LOGO =
  "https://res.cloudinary.com/dzxyelclu/image/upload/v1760111270/Food_bundle_logo_cfsnsw.png";

interface FarmerSummaryCardsProps {
  products: Product[];
  earnings: EarningsSummary | null;
  farmerName?: string | null;
  loading?: boolean;
}

// Same look as the FoodBundles voucher card: gradient, soft circles, brand line, chip
function BrandCard({
  gradient,
  title,
  children,
}: {
  gradient: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
      className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg min-h-52 flex flex-col"
      style={{ background: gradient }}
    >
      <span className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10" />
      <span className="pointer-events-none absolute -bottom-9 -left-9 h-32 w-32 rounded-full bg-white/10" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FOOD_BUNDLES_LOGO} alt="" className="h-6 w-6 rounded-full bg-white object-cover" />
          <div className="leading-none">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/70">FoodBundles</p>
            <p className="mt-1 text-[11px] font-semibold text-white/90">{title}</p>
          </div>
        </div>
        {/* Card chip */}
        <div className="h-7 w-9 rounded-md bg-yellow-300/90 p-[3px]">
          <div className="grid h-full w-full grid-cols-2 gap-[2px] rounded-sm border border-yellow-600/40 p-[2px]">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="rounded-[2px] bg-yellow-600/50" />
            ))}
          </div>
        </div>
      </div>

      <div className="relative mt-4 flex flex-1 flex-col">{children}</div>
    </motion.div>
  );
}

/** Three FoodBundles-style cards summarizing the farmer's earnings, submissions and performance. */
export function FarmerSummaryCards({ products, earnings, farmerName, loading }: FarmerSummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-52 rounded-2xl" />
        ))}
      </div>
    );
  }

  // Submission counts
  const total = products.length;
  const isRejected = (p: Product) => p.status === "REJECTED" || p.farmerFeedbackStatus === "REJECTED";
  const rejected = products.filter(isRejected).length;
  // Waiting on review or on the farmer's answer to an offer
  const pending = products.filter(
    (p) => (p.status === "PENDING" || p.status === "NEGOTIATING") && !isRejected(p),
  ).length;
  // Approved = price agreed, being received or waiting for payment
  const approved = products.filter((p) => p.status === "APPROVED" || p.status === "VERIFIED").length;
  const paid = products.filter((p) => p.status === "PAID").length;
  const decided = approved + paid + rejected;
  const acceptanceRate = decided > 0 ? Math.round(((approved + paid) / decided) * 100) : 0;
  // Offers the team made that wait for the farmer's answer
  const awaitingReply = products.filter((p) => p.status === "NEGOTIATING").length;

  // Earnings
  const thisMonth = earnings?.thisMonth ?? 0;
  const lastMonth = earnings?.lastMonth ?? 0;
  const monthChange = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null;
  const MonthArrow = monthChange !== null && monthChange < 0 ? ArrowDownRight : ArrowUpRight;

  const segments = [
    { label: "Pending", value: pending, color: "bg-amber-300" },
    { label: "Approved", value: approved, color: "bg-emerald-300" },
    { label: "Paid", value: paid, color: "bg-white" },
    { label: "Rejected", value: rejected, color: "bg-red-300" },
  ];

  // Acceptance ring
  const radius = 30;
  const circumference = 2 * Math.PI * radius;

  return (
    <motion.div
      variants={gridContainerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-4 md:grid-cols-3"
    >
      {/* 1. Earnings */}
      <BrandCard gradient="linear-gradient(135deg, #059669 0%, #166534 100%)" title="Earnings">
        <p className="text-[10px] uppercase tracking-[0.15em] text-white/60">Earned this year</p>
        <p className="mt-1 font-mono text-2xl font-bold tracking-wide sm:text-3xl">
          {formatRwf(earnings?.yearToDate ?? 0)}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/60">This month</p>
            <p className="text-sm font-semibold">{formatRwf(thisMonth)}</p>
            {monthChange !== null && (
              <p className="mt-0.5 flex items-center gap-0.5 text-[11px] text-white/80">
                <MonthArrow className="h-3 w-3" />
                {Math.abs(monthChange)}% vs last month
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/60">Avg / submission</p>
            <p className="text-sm font-semibold">{formatRwf(earnings?.avgPerSubmission ?? 0)}</p>
            {farmerName && <p className="mt-0.5 max-w-32 truncate text-[11px] text-white/70">{farmerName}</p>}
          </div>
        </div>
      </BrandCard>

      {/* 2. Submissions */}
      <BrandCard gradient="linear-gradient(135deg, #0f766e 0%, #134e4a 100%)" title="Submissions">
        <p className="text-[10px] uppercase tracking-[0.15em] text-white/60">Total submitted</p>
        <p className="mt-1 font-mono text-3xl font-bold">{total}</p>

        <div className="mt-auto pt-4">
          {/* Share of each status */}
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/15">
            {total > 0 &&
              segments.map((segment) =>
                segment.value > 0 ? (
                  <span
                    key={segment.label}
                    className={segment.color}
                    style={{ width: `${(segment.value / total) * 100}%` }}
                  />
                ) : null,
              )}
          </div>
          <div className="mt-2.5 grid grid-cols-4 gap-1 text-center">
            {segments.map((segment) => (
              <div key={segment.label}>
                <p className="text-base font-bold leading-none">{segment.value}</p>
                <p className="mt-1 flex items-center justify-center gap-1 text-[10px] text-white/70">
                  <span className={`h-1.5 w-1.5 rounded-full ${segment.color}`} />
                  {segment.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </BrandCard>

      {/* 3. Performance & what needs attention */}
      <BrandCard gradient="linear-gradient(135deg, #d97706 0%, #9a3412 100%)" title="Performance">
        <div className="flex items-center gap-4">
          <svg viewBox="0 0 80 80" className="h-20 w-20 shrink-0 -rotate-90">
            <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="white"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - acceptanceRate / 100)}
            />
          </svg>
          <div>
            <p className="font-mono text-3xl font-bold leading-none">{acceptanceRate}%</p>
            <p className="mt-1 text-[11px] text-white/75">
              Acceptance rate · {approved + paid} of {decided} decided
            </p>
          </div>
        </div>

        <div className="mt-auto pt-4">
          {awaitingReply > 0 ? (
            <div className="flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2">
              <BellRing className="h-4 w-4 shrink-0" />
              <p className="text-xs">
                <span className="font-bold">{awaitingReply}</span>{" "}
                {awaitingReply === 1 ? "offer is" : "offers are"} waiting for your reply
              </p>
            </div>
          ) : (
            <p className="rounded-lg bg-white/10 px-3 py-2 text-xs text-white/85">
              No offers waiting for you · {pending} under review
            </p>
          )}
        </div>
      </BrandCard>
    </motion.div>
  );
}
