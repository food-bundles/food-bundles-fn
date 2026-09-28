/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { voucherService } from "@/app/services/voucherService";
import Image from "next/image";

const FOOD_BUNDLES_LOGO =
  "https://res.cloudinary.com/dzxyelclu/image/upload/v1760111270/Food_bundle_logo_cfsnsw.png";

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
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/10" />

      <div className="relative flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Image
            src={FOOD_BUNDLES_LOGO}
            alt="FoodBundles Logo"
            width={20}
            height={20}
            className="rounded-full bg-white object-cover"
            crossOrigin="anonymous"
          />
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/90 leading-none">FoodBundles Card</p>
            <p className="text-[7px] text-white/60 whitespace-nowrap leading-none mt-1">Your Supply, Always Secured</p>
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

interface LoanSession {
  status: string;
  approvedAmount?: number | null;
  amountUsed: number;
  amountRepaid: number;
  amountTransferredToWallet: number;
  outstandingAmount: number;
  dueDate?: string | null;
}

export default function VoucherStats() {
  const [cardStats, setCardStats] = useState({
    totalCards: 0,
    activeCards: 0,
    pendingSessions: 0,
    totalVouchers: 0,
    activeVouchers: 0,
    suspendedVouchers: 0,
  });

  const [creditStats, setCreditStats] = useState({
    activeCount: 0,
    totalCreditDelivered: 0,
    maturedCount: 0,
    settledCount: 0,
    settledTotal: 0,
    pendingCount: 0,
    pendingTotal: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [cardStatsRes, sessionsRes] = await Promise.all([
          voucherService.getCardStats(),
          voucherService.getAllLoanSessions({ limit: 200 }),
        ]);

        const cs = cardStatsRes?.data ?? {};
        setCardStats({
          totalCards: cs.totalCards ?? 0,
          activeCards: cs.activeCards ?? 0,
          pendingSessions: cs.pendingSessions ?? 0,
          totalVouchers: cs.totalSessions ?? 0,
          activeVouchers: 0,
          suspendedVouchers: 0,
        });

        const sessions: LoanSession[] = sessionsRes?.data ?? [];
        const now = new Date();

        const activeSessions = sessions.filter((s) =>
          ["ACTIVE", "PARTIALLY_USED", "FULLY_USED", "OVERDUE", "SETTLED"].includes(s.status)
        );
        const totalCreditDelivered = activeSessions.reduce(
          (sum, s) => sum + (s.amountUsed ?? 0) + (s.amountTransferredToWallet ?? 0),
          0
        );

        const matured = sessions.filter(
          (s) =>
            s.dueDate &&
            new Date(s.dueDate) < now &&
            s.outstandingAmount > 0 &&
            s.status !== "SETTLED" &&
            s.status !== "CLOSED"
        );
        const settled = sessions.filter((s) => s.status === "SETTLED");
        const settledTotal = settled.reduce((sum, s) => sum + (s.amountRepaid ?? 0), 0);

        const pendingRepayment = sessions.filter(
          (s) =>
            s.outstandingAmount > 0 &&
            !["SETTLED", "CLOSED", "REJECTED", "REQUESTED"].includes(s.status)
        );
        const pendingTotal = pendingRepayment.reduce(
          (sum, s) => sum + s.outstandingAmount,
          0
        );

        setCreditStats({
          activeCount: activeSessions.length,
          totalCreditDelivered,
          maturedCount: matured.length,
          settledCount: settled.length,
          settledTotal,
          pendingCount: pendingRepayment.length,
          pendingTotal,
        });
      } catch {
        // keep zeros
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <CardShell gradient="from-emerald-600 to-green-800">
        <StatValue label="Total Vouchers" value={cardStats.totalCards} loading={loading} />
        <div className="relative flex justify-between items-end gap-2">
          {[
            { label: "Active", value: cardStats.activeCards },
            { label: "Pending", value: cardStats.pendingSessions },
          ].map((r) => (
            <div key={r.label} className="text-center">
              <p className="text-[8px] uppercase tracking-wider text-white/60 leading-none">{r.label}</p>
              {loading ? (
                <Skeleton className="h-3 w-8 mx-auto mt-1 bg-white/20" />
              ) : (
                <p className="text-[11px] font-semibold leading-none mt-1">{r.value}</p>
              )}
            </div>
          ))}
        </div>
      </CardShell>

      <CardShell gradient="from-blue-600 to-blue-900">
        <StatValue label="Active Credits" value={creditStats.activeCount} loading={loading} />
        <div className="relative flex justify-between items-end">
          <div>
            <p className="text-[8px] uppercase tracking-wider text-white/60 leading-none">Total Delivered</p>
            {loading ? (
              <Skeleton className="h-3 w-20 mt-1 bg-white/20" />
            ) : (
              <p className="text-[11px] font-semibold leading-none mt-1">
                {creditStats.totalCreditDelivered.toLocaleString()} RWF
              </p>
            )}
          </div>
        </div>
      </CardShell>

      <CardShell gradient="from-indigo-600 to-indigo-900">
        <div className="relative flex-1 flex items-center justify-between gap-3 min-h-0">
          {[
            { label: "Matured", count: creditStats.maturedCount, sub: "Past due" },
            { label: "Settled", count: creditStats.settledCount, sub: `${creditStats.settledTotal.toLocaleString()} RWF` },
          ].map((c) => (
            <div key={c.label} className="flex-1">
              <p className="text-[9px] uppercase tracking-widest text-white/70">{c.label}</p>
              {loading ? (
                <>
                  <Skeleton className="h-7 w-12 mt-1 bg-white/20" />
                  <Skeleton className="h-3 w-16 mt-1 bg-white/20" />
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold drop-shadow leading-tight">{c.count}</p>
                  <p className="text-[11px] text-white/70">{c.sub}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </CardShell>

      <CardShell gradient="from-amber-500 to-orange-700">
        <StatValue label="Pending Credits" value={creditStats.pendingCount} loading={loading} />
        <div className="relative flex justify-between items-end">
          <div>
            <p className="text-[8px] uppercase tracking-wider text-white/60 leading-none">Total Outstanding</p>
            {loading ? (
              <Skeleton className="h-3 w-20 mt-1 bg-white/20" />
            ) : (
              <p className="text-[11px] font-semibold leading-none mt-1">
                {creditStats.pendingTotal.toLocaleString()} RWF
              </p>
            )}
          </div>
        </div>
      </CardShell>
    </div>
  );
}
