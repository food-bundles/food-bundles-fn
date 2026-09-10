"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CreditCard, CheckCircle, Loader2, ChevronRight } from "lucide-react";
import { voucherService } from "@/app/services/voucherService";
import { toast } from "react-hot-toast";
import IssueVoucherCardModal from "./IssueVoucherCardModal";

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

  // Modals
  const [issueCardFor, setIssueCardFor] = useState<Activity | null>(null);
  const [issueOpen, setIssueOpen] = useState(false);
  const [approving, setApproving] = useState<Activity | null>(null);
  const [approveAmount, setApproveAmount] = useState("");
  const [approvePct, setApprovePct] = useState("100");
  const [approveDays, setApproveDays] = useState("30");
  const [approveRequireFee, setApproveRequireFee] = useState(false);
  const [approveFeePct, setApproveFeePct] = useState("");
  const [submittingApprove, setSubmittingApprove] = useState(false);

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

  const openApprove = (activity: Activity) => {
    setApproving(activity);
    setApproveAmount(String(activity.amount ?? 0));
    setApprovePct("100");
    setApproveDays(String(activity.repaymentDays ?? 30));
    setApproveRequireFee(activity.effectiveUnlockFeeEnabled ?? false);
    setApproveFeePct(
      activity.effectiveUnlockFeeEnabled
        ? String(activity.effectiveUnlockFeePercentage ?? "")
        : "",
    );
  };

  const handlePctChange = (val: string) => {
    setApprovePct(val);
    if (approving && approving.amount) {
      const pct = parseFloat(val) || 0;
      setApproveAmount(String(Math.round((approving.amount * pct) / 100)));
    }
  };

  const handleSubmitApprove = async () => {
    if (!approving) return;
    setSubmittingApprove(true);
    try {
      await voucherService.approveLoanSession(approving.targetId, {
        approvedAmount: parseFloat(approveAmount),
        approvalPercentage: parseFloat(approvePct),
        repaymentDays: parseInt(approveDays),
        requireUnlockFee: approveRequireFee,
        unlockFeePercentage: approveRequireFee
          ? parseFloat(approveFeePct) || 0
          : undefined,
      });
      toast.success(`Loan approved for ${approving.restaurantName}`);
      setApproving(null);
      load();
      onAction();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to approve loan");
    } finally {
      setSubmittingApprove(false);
    }
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
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        Pending Actions
      </h2>
      <div className="space-y-0.5">
        {activities.map((a) =>
          a.type === "LOAN_REQUEST" ? (
            <div
              key={a.id}
              className="flex items-center gap-2 rounded px-2 py-1 transition-colors hover:bg-green-50"
            >
              <button
                type="button"
                onClick={() => handleNavigate(a)}
                className="flex-1 flex items-center gap-2 text-left text-xs text-gray-700 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 text-yellow-500 shrink-0" />
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
                onClick={() => openApprove(a)}
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

      {/* Quick approve loan */}
      <Dialog open={approving !== null} onOpenChange={(open) => !open && setApproving(null)}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Approve Loan — {approving?.restaurantName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Requested</span>
                <span className="font-semibold">
                  {approving?.amount?.toLocaleString()} RWF
                </span>
              </div>
              {approving?.purpose && (
                <div className="flex justify-between mt-1">
                  <span className="text-gray-500">Purpose</span>
                  <span className="text-gray-700">{approving.purpose}</span>
                </div>
              )}
              {approving?.rrn && (
                <div className="flex justify-between mt-1">
                  <span className="text-gray-500">RRN</span>
                  <span className="font-mono text-xs">{approving.rrn}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Approval % (credit given on the requested amount)</label>
              <Input
                type="number"
                min="1"
                max="100"
                value={approvePct}
                onChange={(e) => handlePctChange(e.target.value)}
                className="h-10 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                The client's requested amount is never modified — this percentage only sets the credit granted.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Requested</span>
                <span className="font-semibold">
                  {approving?.amount?.toLocaleString()} RWF
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Approved ({approvePct}%)</span>
                <span className="font-semibold text-green-600">
                  {(parseFloat(approveAmount) || 0).toLocaleString()} RWF
                </span>
              </div>
              {approving?.amount &&
                parseFloat(approveAmount) > 0 &&
                approving.amount - parseFloat(approveAmount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Extra the client pays at checkout</span>
                    <span className="font-semibold text-orange-600">
                      {(approving.amount - parseFloat(approveAmount)).toLocaleString()} RWF
                    </span>
                  </div>
                )}
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={approveRequireFee}
                onChange={(e) => setApproveRequireFee(e.target.checked)}
                className="w-4 h-4 accent-green-600"
              />
              <span>
                Require unlock fee before this loan activates
                <span className="block text-xs text-gray-400">
                  The unlock fee is not static — you set the percentage applied at approval.
                </span>
              </span>
            </label>

            {approveRequireFee && (
              <div>
                <label className="block text-sm font-medium mb-1">Unlock Fee %</label>
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={approveFeePct}
                  onChange={(e) => setApproveFeePct(e.target.value)}
                  placeholder="e.g. 5"
                  className="h-10 text-sm"
                />
              </div>
            )}

            {approveRequireFee && parseFloat(approveFeePct) > 0 && parseFloat(approveAmount) > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
                <p className="font-medium text-orange-800">Unlock Fee Applied</p>
                <p className="text-orange-700 mt-0.5">
                  {parseFloat(approveAmount).toLocaleString()} × {approveFeePct}% ={" "}
                  <strong>
                    {(
                      (parseFloat(approveAmount) * parseFloat(approveFeePct)) /
                      100
                    ).toLocaleString()}{" "}
                    RWF
                  </strong>
                </p>
                <p className="text-orange-500 text-xs mt-1">
                  Restaurant pays this before the loan activates.
                </p>
              </div>
            )}
            {approveRequireFee && (!approveFeePct || parseFloat(approveFeePct) <= 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                <p className="font-medium text-yellow-800">Enter the unlock fee percentage</p>
                <p className="text-yellow-700 text-xs mt-0.5">
                  Approving with a fee enabled but no percentage will not lock the loan.
                </p>
              </div>
            )}
            {!approveRequireFee && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                <p className="font-medium text-green-800">No Unlock Fee Applies</p>
                <p className="text-green-700 text-xs mt-0.5">
                  The loan activates immediately upon approval.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Repayment Days</label>
              <Input
                type="number"
                value={approveDays}
                onChange={(e) => setApproveDays(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleSubmitApprove}
                disabled={
                submittingApprove ||
                !approveAmount ||
                !approveDays ||
                (approveRequireFee && (!approveFeePct || parseFloat(approveFeePct) <= 0))
              }
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {submittingApprove && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {submittingApprove ? "Approving..." : "Approve Loan"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setApproving(null)}
                disabled={submittingApprove}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}