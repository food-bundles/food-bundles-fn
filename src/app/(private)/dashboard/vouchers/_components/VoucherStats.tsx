/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { voucherService } from "@/app/services/voucherService";
import { FoodBundlesCard as CardShell } from "@/components/food-bundles-card";

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
