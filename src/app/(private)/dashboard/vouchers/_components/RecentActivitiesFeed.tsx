"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle, Loader2, ChevronRight } from "lucide-react";
import { voucherService } from "@/app/services/voucherService";
import { toast } from "react-hot-toast";
import IssueVoucherCardModal from "./IssueVoucherCardModal";
import ApproveLoanSessionModal from "./ApproveLoanSessionModal";

interface Activity {
  id: string;
  type: "VOUCHER_CARD_APPLICATION" | "LOAN_REQUEST";
  targetId: string;
  restaurantId: string;
  restaurantName: string;
  restaurantEmail?: string | null;
  restaurantPhone?: string | null;
  amount: number | null;
  purpose?: string | null;
  repaymentDays?: number | null;
  rrn?: string | null;
  loanProviderType?: "TRADER" | "FOOD_BUNDLES" | string | null;
  fundingTraderId?: string | null;
  effectiveUnlockFeeEnabled?: boolean;
  effectiveUnlockFeePercentage?: number;
  message: string;
  createdAt: string;
}

interface RecentActivitiesFeedProps {
  onNavigate: (tab: "cards" | "loan-sessions") => void;
  onAction: () => void;
}

const REFRESH_INTERVAL_MS = 30_000;

export default function RecentActivitiesFeed({
  onNavigate,
  onAction,
}: RecentActivitiesFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Issue card modal
  const [issueCardFor, setIssueCardFor] = useState<Activity | null>(null);
  const [issueOpen, setIssueOpen] = useState(false);

  // Approve loan modal (shared with the loan sessions table)
  const [approving, setApproving] = useState<Activity | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await voucherService.getRecentActivities(10);
      setActivities((res as any)?.data ?? []);
    } catch (e) {
      // Keep last known activities on failure
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    timerRef.current = setInterval(load, REFRESH_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [load]);

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.round(diff / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.round(hrs / 24);
    return `${days}d ago`;
  };

  const handleNavigate = (activity: Activity) => {
    onNavigate(activity.type === "LOAN_REQUEST" ? "loan-sessions" : "cards");
  };

  const openIssueCard = (activity: Activity) => {
    setIssueCardFor(activity);
    setIssueOpen(true);
  };

  if (loading && activities.length === 0) {
    return (
      <div className="mb-4 flex items-center gap-2 text-xs text-gray-400 px-1">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Loading pending activities...
      </div>
    );
  }

  if (!loading && activities.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="space-y-0.5 bg-white shadow-sm rounded-lg overflow-hidden divide-y divide-gray-200 border border-green-100">
        {activities.map((a) =>
          a.type === "LOAN_REQUEST" ? (
            <div
              key={a.id}
              className="flex items-center gap-2 rounded px-2 py-1 bg-green-50 border-b border-green-100 transition-colors hover:bg-green-100"
            >
              <button
                type="button"
                onClick={() => handleNavigate(a)}
                className="flex-1 flex items-center gap-2 text-left text-xs text-gray-700 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                <span className="font-medium text-gray-900">{a.restaurantName}</span>
                <span>{a.message}</span>
                {a.amount ? (
                  <span className="text-green-600 font-medium">
                    {a.amount.toLocaleString()} RWF
                  </span>
                ) : null}
                <span className="text-gray-400">{timeAgo(a.createdAt)}</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              </button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 h-7 text-xs shrink-0"
                onClick={() => setApproving(a)}
              >
                Approve
              </Button>
            </div>
          ) : (
            <div
              key={a.id}
              className="flex items-center gap-2 rounded px-2 py-1 transition-colors hover:bg-green-50"
            >
              <button
                type="button"
                onClick={() => handleNavigate(a)}
                className="flex-1 flex items-center gap-2 text-left text-xs text-gray-700 cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="font-medium text-gray-900">{a.restaurantName}</span>
                <span>{a.message}</span>
                <span className="text-gray-400">{timeAgo(a.createdAt)}</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              </button>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 h-7 text-xs shrink-0"
                onClick={() => openIssueCard(a)}
              >
                Issue Card
              </Button>
            </div>
          ),
        )}
      </div>

      {/* Issue card from pending application */}
      <IssueVoucherCardModal
        isOpen={issueOpen}
        onClose={() => {
          setIssueOpen(false);
          setIssueCardFor(null);
        }}
        onSuccess={() => {
          setIssueOpen(false);
          setIssueCardFor(null);
          load();
          onAction();
        }}
        preselectedRestaurant={
          issueCardFor ? { id: issueCardFor.restaurantId, name: issueCardFor.restaurantName } : null
        }
      />

      {/* Approve loan (shared modal) */}
      <ApproveLoanSessionModal
        open={approving !== null}
        session={
          approving
            ? {
                id: approving.targetId,
                rrn: approving.rrn,
                restaurantName: approving.restaurantName,
                requestedAmount: approving.amount ?? 0,
                purpose: approving.purpose,
                repaymentDays: approving.repaymentDays,
                loanProviderType: approving.loanProviderType,
                fundingTraderId: approving.fundingTraderId,
                effectiveUnlockFeeEnabled: approving.effectiveUnlockFeeEnabled,
                effectiveUnlockFeePercentage: approving.effectiveUnlockFeePercentage,
              }
            : null
        }
        onClose={() => setApproving(null)}
        onSuccess={() => {
          setApproving(null);
          load();
          onAction();
        }}
      />
    </div>
  );
}