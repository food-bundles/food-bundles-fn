/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Loader2 } from "lucide-react";
import { voucherService } from "@/app/services/voucherService";
import { subscriptionService } from "@/app/services/subscriptionService";
import { toast } from "sonner";

export interface ApproveSessionInput {
  id: string;
  rrn?: string | null;
  restaurantName: string;
  requestedAmount: number;
  purpose?: string | null;
  repaymentDays?: number | null;
  loanProviderType?: "TRADER" | "FOOD_BUNDLES" | string | null;
  fundingTraderId?: string | null;
  effectiveUnlockFeeEnabled?: boolean;
  effectiveUnlockFeePercentage?: number;
}

interface LoanTrader {
  id: string;
  name: string;
  email: string;
  phone?: string;
  availableBalance: number;
  canTradeOnBehalf: boolean;
  delegationStatus: string;
  unlockFeeEnabled?: boolean;
  unlockFeePercentage?: number | null;
}

interface TraderCapacity {
  traderId: string;
  name: string;
  email?: string;
  availableBalance: number;
  requiredAmount: number | null;
  canFund: boolean;
  shortfall: number;
}

interface ApproveLoanSessionModalProps {
  open: boolean;
  session: ApproveSessionInput | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApproveLoanSessionModal({
  open,
  session,
  onClose,
  onSuccess,
}: ApproveLoanSessionModalProps) {
  const [approvedAmount, setApprovedAmount] = useState("");
  const [approvalPct, setApprovalPct] = useState("100");
  const [repaymentDays, setRepaymentDays] = useState("30");
  const [onBehalfTraderId, setOnBehalfTraderId] = useState("");
  const [requireUnlockFee, setRequireUnlockFee] = useState(false);
  const [unlockFeePct, setUnlockFeePct] = useState("");
  const [traders, setTraders] = useState<LoanTrader[]>([]);
  const [platformFee, setPlatformFee] = useState<{ enabled: boolean; pct: number }>({
    enabled: false,
    pct: 0,
  });
  const [isLoadingTraders, setIsLoadingTraders] = useState(false);
  const [traderCapacity, setTraderCapacity] = useState<TraderCapacity | null>(null);
  const [checkingBalance, setCheckingBalance] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Prefill and load traders whenever the modal opens for a new session
  useEffect(() => {
    if (!open || !session) return;
    setApprovedAmount(session.requestedAmount.toString());
    setApprovalPct("100");
    setRepaymentDays(session.repaymentDays?.toString() ?? "30");
    // Default the funding provider to the one the restaurant selected ("" = platform)
    setOnBehalfTraderId(session.fundingTraderId ?? "");
    setTraderCapacity(null);
    setIsLoadingTraders(true);
    voucherService
      .getLoanTraders()
      .then((res) => setTraders(res?.data ?? []))
      .catch(() => setTraders([]))
      .finally(() => setIsLoadingTraders(false));
    subscriptionService
      .getLoanAccessProviders()
      .then((res) => {
        const p = res?.data?.platform;
        setPlatformFee({
          enabled: !!p?.unlockFeeEnabled,
          pct: p?.unlockFeePercentage ?? 0,
        });
      })
      .catch(() => setPlatformFee({ enabled: false, pct: 0 }));
  }, [open, session]);

  // Auto-apply the unlock fee of the provider that will actually fund this loan.
  // Re-runs when the admin changes the funding provider so the fee (and checkbox)
  // always matches the selected trader's wallet fee, or the Food Bundles platform fee.
  useEffect(() => {
    if (!open || !session) return;
    let enabled = false;
    let pct = 0;
    if (onBehalfTraderId) {
      const t = traders.find((x) => x.id === onBehalfTraderId);
      enabled = !!(t?.unlockFeeEnabled && (t.unlockFeePercentage ?? 0) > 0);
      pct = t?.unlockFeePercentage ?? 0;
    } else {
      enabled = platformFee.enabled && platformFee.pct > 0;
      pct = platformFee.pct;
    }
    setRequireUnlockFee(enabled);
    setUnlockFeePct(enabled ? String(pct) : "");
  }, [open, session, onBehalfTraderId, traders, platformFee]);

  // Live trader-capacity check for the approve-on-behalf trader
  useEffect(() => {
    if (!open || !onBehalfTraderId || !session) {
      setTraderCapacity(null);
      setCheckingBalance(false);
      return;
    }
    let cancelled = false;
    setCheckingBalance(true);
    const amount = parseFloat(approvedAmount) || session.requestedAmount;
    voucherService
      .checkTraderLoanCapacity(onBehalfTraderId, amount)
      .then((res) => {
        if (!cancelled) setTraderCapacity(res?.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setTraderCapacity(null);
      })
      .finally(() => {
        if (!cancelled) setCheckingBalance(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, onBehalfTraderId, approvedAmount, session]);

  const handlePctChange = (val: string) => {
    setApprovalPct(val);
    if (session) {
      const pct = parseFloat(val) || 0;
      setApprovedAmount(String(Math.round((session.requestedAmount * pct) / 100)));
    }
  };

  const parsedAmount = parseFloat(approvedAmount) || 0;
  const extraAmount =
    session && parsedAmount > 0
      ? Math.max(0, session.requestedAmount - parsedAmount)
      : 0;

  const handleApprove = async () => {
    if (!session) return;
    setSubmitting(true);
    try {
      const traderId = onBehalfTraderId || null;
      const approvedAmountValue =
        parseInt(approvedAmount) ||
        Math.round(
          session.requestedAmount * ((parseFloat(approvalPct) || 100) / 100),
        );
      await voucherService.approveLoanSession(session.id, {
        approvedAmount: approvedAmountValue,
        approvalPercentage: parseFloat(approvalPct),
        repaymentDays: parseInt(repaymentDays),
        fundingTraderId: traderId,
        requireUnlockFee,
        unlockFeePercentage: requireUnlockFee
          ? parseFloat(unlockFeePct) || 0
          : undefined,
      });
      toast.success(`Loan approved for ${session.restaurantName}`);
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to approve loan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open && session !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-white max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Approve Loan: {session?.restaurantName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Requested</span>
              <span className="font-semibold">
                {session?.requestedAmount.toLocaleString()} RWF
              </span>
            </div>
            {session?.purpose && (
              <div className="flex justify-between mt-1">
                <span className="text-gray-500">Purpose</span>
                <span className="text-gray-700">{session.purpose}</span>
              </div>
            )}
            <div className="flex justify-between mt-1">
              <span className="text-gray-500">RRN</span>
              <span className="font-mono text-xs">{session?.rrn}</span>
            </div>
            {session && session.loanProviderType === "FOOD_BUNDLES" && (
              <div className="flex justify-between mt-1">
                <span className="text-gray-500">Provider</span>
                <span className="text-gray-700">Food Bundles (platform)</span>
              </div>
            )}
            {requireUnlockFee && (parseFloat(unlockFeePct) || 0) > 0 && (
              <div className="flex justify-between mt-1 text-amber-600">
                <span>Unlock fee applies at approval</span>
                <span className="font-medium">{unlockFeePct}%</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Approval % (credit given on the requested amount)
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={approvalPct}
                onChange={(e) => handlePctChange(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Repayment Days
              </label>
              <Input
                type="number"
                value={repaymentDays}
                onChange={(e) => setRepaymentDays(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Requested</span>
              <span className="font-semibold">
                {session?.requestedAmount.toLocaleString()} RWF
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Approved ({approvalPct}%)</span>
              <span className="font-semibold text-green-600">
                {parsedAmount.toLocaleString()} RWF
              </span>
            </div>
            {extraAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Extra the client pays at checkout</span>
                <span className="font-semibold text-orange-600">
                  {extraAmount.toLocaleString()} RWF
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Funding provider (who funds this loan)
            </label>
            {isLoadingTraders ? (
              <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading traders...
              </div>
            ) : (
              <Select
                value={onBehalfTraderId || "platform"}
                onValueChange={(v) =>
                  setOnBehalfTraderId(v === "platform" ? "" : v)
                }
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Select a trader" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="platform">Platform lender — Food Bundles</SelectItem>
                  {traders.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} — {t.availableBalance.toLocaleString()} RWF
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-gray-400 mt-1">
              When no trader is selected, the platform (Food Bundles) funds and
              locks the loan.
            </p>

            {onBehalfTraderId && !isLoadingTraders && (
              <div className="text-xs mt-2 space-y-1">
                {checkingBalance && (
                  <p className="text-gray-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Checking trader balance...
                  </p>
                )}
                {!checkingBalance && traderCapacity && traderCapacity.canFund && (
                  <p className="text-green-600 bg-green-50 border border-green-200 rounded-lg p-2">
                    Sufficient balance — {traderCapacity.name} can fund{" "}
                    {traderCapacity.requiredAmount?.toLocaleString() ?? parsedAmount.toLocaleString()} RWF
                    ({traderCapacity.availableBalance.toLocaleString()} RWF available).
                  </p>
                )}
                {!checkingBalance && traderCapacity && !traderCapacity.canFund && (
                  <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                    Insufficient balance — {traderCapacity.name} has{" "}
                    {traderCapacity.availableBalance.toLocaleString()} RWF available but{" "}
                    {traderCapacity.requiredAmount?.toLocaleString() ?? parsedAmount.toLocaleString()} RWF
                    is required (short {traderCapacity.shortfall.toLocaleString()} RWF). Choose
                    another trader or approve on behalf of the platform.
                  </p>
                )}
              </div>
            )}
          </div>

          {requireUnlockFee && parsedAmount > 0 ? (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-orange-800">
                Unlock Fee: {unlockFeePct}%
              </p>
              <p className="text-orange-700 mt-0.5">
                {parsedAmount.toLocaleString()} × {unlockFeePct}% ={" "}
                <strong>
                  {((parsedAmount * parseFloat(unlockFeePct)) / 100).toLocaleString()} RWF
                </strong>
              </p>
              <p className="text-orange-500 text-xs mt-1">
                Applied automatically from the selected loan provider. The restaurant
                pays this before the loan activates.
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-green-800">No Unlock Fee</p>
              <p className="text-green-700 mt-0.5">
                The selected loan provider has no unlock fee — the loan activates
                immediately upon approval.
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleApprove}
              disabled={submitting || !approvedAmount || !repaymentDays}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {submitting ? "Approving..." : "Approve Loan"}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}