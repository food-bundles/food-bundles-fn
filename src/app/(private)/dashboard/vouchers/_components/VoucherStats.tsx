/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { voucherService } from "@/app/services/voucherService";
import Image from "next/image";

const FOOD_BUNDLES_LOGO =
  "https://res.cloudinary.com/dzxyelclu/image/upload/v1760111270/Food_bundle_logo_cfsnsw.png";

// Physical-card front shell — same look as the restaurant voucher card front,
// without the PAN (numbers shown here are the stats, placed where the card
// number sits on the physical card).
function CardShell({
  gradient,
  children,
}: {
  gradient: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative h-[150px] rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-2xl overflow-hidden select-none p-4 flex flex-col`}
    >
      {/* Decorative circles */}
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/10" />

      {/* Top row — brand + contactless + EMV chip */}
      <div className="relative flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Image
            src={FOOD_BUNDLES_LOGO}
            alt="Food Bundles Logo"
            width={20}
            height={20}
            className="rounded-full bg-white object-cover"
            crossOrigin="anonymous"
          />
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/90 leading-none">
              Food Bundles Card
            </p>
            <p className="text-[7px] text-white/60 whitespace-nowrap leading-none mt-1">
              Your Supply, Always Secured
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="w-5 h-5 text-white/70 rotate-180"
          >
            <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36" />
            <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58" />
            <path d="M12.91 4.1a15.91 15.91 0 0 1 0 15.8" />
            <path d="M16.37 2a20.16 20.16 0 0 1 0 20" />
          </svg>
          <div className="w-9 h-7 rounded bg-yellow-300/90 flex items-center justify-center">
            <div className="w-6 h-5 rounded-sm border border-yellow-600/40 grid grid-cols-2 gap-px p-0.5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-yellow-600/50 rounded-sm" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}

function StatValue({
  label,
  value,
  subValue,
  loading,
}: {
  label: string;
  value: React.ReactNode;
  subValue?: string;
  loading: boolean;
}) {
  return (
    <div className="relative flex-1 flex flex-col justify-center min-h-0">
      <p className="text-[9px] uppercase tracking-widest text-white/70">{label}</p>
      {loading ? (
        <Skeleton className="h-7 w-16 mt-1 bg-white/20" />
      ) : (
        <p className="text-2xl font-bold drop-shadow leading-tight">{value}</p>
      )}
      {!loading && subValue && (
        <p className="text-[11px] text-white/70">{subValue}</p>
      )}
    </div>
  );
}

export default function VoucherStats() {
  const [stats, setStats] = useState({
    totalVouchers: 0,
    activeVouchers: 0,
    suspendedVouchers: 0,
    expiredVouchers: 0,
    usedVouchers: { count: 0, totalAmount: 0 },
    maturedVouchers: { count: 0, totalAmount: 0 },
    settledVouchers: { count: 0, totalAmount: 0 },
    pendingLoans: 0,
    totalCards: 0,
    activeCards: 0,
    pendingSessions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [vouchersResponse, loansResponse, cardStatsResponse] = await Promise.all([
        voucherService.getAllVouchers({ page: 1, limit: 1 }), // Get statistics from API
        voucherService.getAllLoanApplications(),
        voucherService.getCardStats()
      ]);

      const voucherStats = vouchersResponse.statistics || {};
      const loans = loansResponse.data || [];
      const cardStats = cardStatsResponse.data || {};

      setStats({
        totalVouchers: voucherStats.totalVouchers || 0,
        activeVouchers: voucherStats.activeVouchers || 0,
        suspendedVouchers: voucherStats.suspendedVouchers || 0,
        expiredVouchers: voucherStats.expiredVouchers || 0,
        usedVouchers: voucherStats.usedVouchers || { count: 0, totalAmount: 0 },
        maturedVouchers: voucherStats.maturedVouchers || { count: 0, totalAmount: 0 },
        settledVouchers: voucherStats.settledVouchers || { count: 0, totalAmount: 0 },
        pendingLoans: loans.filter((l: any) => l.status === "PENDING").length,
        totalCards: cardStats.totalCards || 0,
        activeCards: cardStats.activeCards || 0,
        pendingSessions: cardStats.pendingSessions || 0
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total vouchers + cards */}
      <CardShell gradient="from-emerald-600 to-green-800">
        <StatValue
          label="Total Vouchers"
          value={stats.totalCards + stats.totalVouchers}
          loading={loading}
        />
        <div className="relative flex justify-between items-end gap-2">
          {[
            { label: "Act", value: stats.activeCards + stats.activeVouchers },
            { label: "Cards", value: stats.totalCards },
            { label: "Susp", value: stats.suspendedVouchers },
          ].map((r) => (
            <div key={r.label} className="text-center">
              <p className="text-[8px] uppercase tracking-wider text-white/60 leading-none">
                {r.label}
              </p>
              {loading ? (
                <Skeleton className="h-3 w-8 mx-auto mt-1 bg-white/20" />
              ) : (
                <p className="text-[11px] font-semibold leading-none mt-1">{r.value}</p>
              )}
            </div>
          ))}
        </div>
      </CardShell>

      {/* Used vouchers */}
      <CardShell gradient="from-blue-600 to-blue-900">
        <StatValue
          label="Used Vouchers"
          value={stats.usedVouchers.count}
          loading={loading}
        />
        <div className="relative flex justify-between items-end">
          <div>
            <p className="text-[8px] uppercase tracking-wider text-white/60 leading-none">
              Total Value
            </p>
            {loading ? (
              <Skeleton className="h-3 w-16 mt-1 bg-white/20" />
            ) : (
              <p className="text-[11px] font-semibold leading-none mt-1">
                {stats.usedVouchers.totalAmount.toLocaleString()} RWF
              </p>
            )}
          </div>
        </div>
      </CardShell>

      {/* Matured + settled vouchers */}
      <CardShell gradient="from-indigo-600 to-indigo-900">
        <div className="relative flex-1 flex items-center justify-between gap-3 min-h-0">
          {[
            { label: "Matured", data: stats.maturedVouchers },
            { label: "Settled", data: stats.settledVouchers },
          ].map((c) => (
            <div key={c.label} className="flex-1">
              <p className="text-[9px] uppercase tracking-widest text-white/70">
                {c.label}
              </p>
              {loading ? (
                <>
                  <Skeleton className="h-7 w-12 mt-1 bg-white/20" />
                  <Skeleton className="h-3 w-16 mt-1 bg-white/20" />
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold drop-shadow leading-tight">
                    {c.data.count}
                  </p>
                  <p className="text-[11px] text-white/70">
                    {c.data.totalAmount.toLocaleString()} RWF
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </CardShell>

      {/* Pending loans */}
      <CardShell gradient="from-amber-500 to-orange-700">
        <StatValue
          label="Pending Loans"
          value={stats.pendingLoans + stats.pendingSessions}
          subValue="Awaiting approval"
          loading={loading}
        />
      </CardShell>
    </div>
  );
}
