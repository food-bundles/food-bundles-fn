/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Loader2,
  Lock,
  Unlock,
} from "lucide-react";
import { voucherService } from "@/app/services/voucherService";
import { toast } from "sonner";

interface LoanSession {
  id: string;
  rrn: string;
  restaurantId: string;
  requestedAmount: number;
  approvedAmount?: number;
  approvalPercentage?: number;
  unlockFee?: number;
  unlockFeePercentage?: number;
  // Effective config (admin-set, no default) resolved from card then provider
  effectiveUnlockFeeEnabled?: boolean;
  effectiveUnlockFeePercentage?: number;
  unlockStatus: string;
  amountUsed: number;
  outstandingAmount: number;
  status: string;
  purpose?: string;
  notes?: string;
  repaymentDays?: number;
  dueDate?: string;
  requestedAt: string;
  approvedAt?: string;
  restaurant: { id: string; name: string; email: string };
  approver?: { id: string; username: string };
  fundingTrader?: { id: string; username: string; email: string };
  card?: { id: string; pan: string };
}

interface LoanTrader {
  id: string;
  name: string;
  email: string;
  phone?: string;
  availableBalance: number;
  canTradeOnBehalf: boolean;
  delegationStatus: string;
}

const STATUS_COLORS: Record<string, string> = {
  REQUESTED: "bg-yellow-100 text-yellow-700",
  APPROVED_LOCKED: "bg-blue-100 text-blue-700",
  UNLOCK_FEE_PENDING: "bg-orange-100 text-orange-700",
  ACTIVE: "bg-green-100 text-green-700",
  PARTIALLY_USED: "bg-teal-100 text-teal-700",
  FULLY_USED: "bg-indigo-100 text-indigo-700",
  CLOSED: "bg-gray-100 text-gray-600",
  SETTLED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-700",
  OVERDUE: "bg-red-200 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: "Pending",
  APPROVED_LOCKED: "Approved (Locked)",
  UNLOCK_FEE_PENDING: "Unlock Fee Due",
  ACTIVE: "Active",
  PARTIALLY_USED: "Partially Used",
  FULLY_USED: "Fully Used",
  CLOSED: "Closed",
  SETTLED: "Settled",
  REJECTED: "Rejected",
  OVERDUE: "Overdue",
};

export default function LoanSessionsAdminTable() {
  const [sessions, setSessions] = useState<LoanSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<LoanSession | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState("");
  const [approvalPct, setApprovalPct] = useState("100");
  const [repaymentDays, setRepaymentDays] = useState("30");
  const [requireUnlockFee, setRequireUnlockFee] = useState(false);
  const [unlockFeePct, setUnlockFeePct] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [traders, setTraders] = useState<LoanTrader[]>([]);
  const [selectedTraderId, setSelectedTraderId] = useState("");
  const [onBehalfTraderId, setOnBehalfTraderId] = useState("");
  const [isLoadingTraders, setIsLoadingTraders] = useState(false);

  const loadTraders = async (prefill?: string) => {
    setOnBehalfTraderId("");
    setSelectedTraderId(prefill ?? "");
    try {
      const res = await voucherService.getLoanTraders();
      setTraders(res?.data ?? []);
    } catch {
      setTraders([]);
    }
  };

  const load = () => {
    setLoading(true);
    voucherService
      .getAllLoanSessions()
      .then((res) => setSessions(res?.data ?? []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  // Sync amount when percentage changes (amount is always derived from the requested amount)
  const handlePctChange = (val: string) => {
    setApprovalPct(val);
    if (selected) {
      const pct = parseFloat(val) || 0;
      setApprovedAmount(String(Math.round((selected.requestedAmount * pct) / 100)));
    }
  };

  const openApprove = async (session: LoanSession) => {
    setSelected(session);
    setApprovedAmount(session.requestedAmount.toString());
    setApprovalPct("100");
    setRepaymentDays(session.repaymentDays?.toString() ?? "30");
    setRequireUnlockFee(session.effectiveUnlockFeeEnabled ?? false);
    setUnlockFeePct(
      session.effectiveUnlockFeeEnabled
        ? String(session.effectiveUnlockFeePercentage ?? "")
        : "",
    );
    setOnBehalfTraderId("");
    setApproveOpen(true);
    try {
      const res = await voucherService.getLoanTraders();
      setTraders(res?.data ?? []);
    } catch {
      setTraders([]);
    }
  };

  const openReject = (session: LoanSession) => {
    setSelected(session);
    setRejectReason("");
    setRejectOpen(true);
  };

  const openAccept = async (session: LoanSession) => {
    setSelected(session);
    setSelectedTraderId(session.fundingTrader?.id ?? "");
    setIsLoadingTraders(true);
    setAcceptOpen(true);
    try {
      const res = await voucherService.getLoanTraders();
      setTraders(res?.data ?? []);
    } catch {
      setTraders([]);
    } finally {
      setIsLoadingTraders(false);
    }
  };

  const handleAccept = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      // Prefer the trader the restaurant picked; otherwise the admin-selected trader.
      const traderId = selected.fundingTrader?.id || selectedTraderId || undefined;
      await voucherService.acceptLoanSession(selected.id, traderId);
      toast.success(
        traderId
          ? "Loan accepted and sent to the trader for approval"
          : "Loan accepted — trader can now approve it",
      );
      setAcceptOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to accept");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const approvedAmountValue = parseInt(approvedAmount) || Math.round(selected.requestedAmount * (parseFloat(approvalPct) || 100) / 100);

      // Approve on behalf of a delegation trader
      if (onBehalfTraderId) {
        await voucherService.adminApproveLoanSessionOnBehalf(
          selected.id,
          onBehalfTraderId,
          {
            approvalPercentage: parseFloat(approvalPct),
            approvedAmount: approvedAmountValue,
            repaymentDays: parseInt(repaymentDays),
          },
        );
        toast.success(`Loan approved on behalf of trader — ${selected.restaurant.name}`);
        setApproveOpen(false);
        load();
        return;
      }

      await voucherService.approveLoanSession(selected.id, {
        approvedAmount: approvedAmountValue,
        approvalPercentage: parseFloat(approvalPct),
        repaymentDays: parseInt(repaymentDays),
        requireUnlockFee: requireUnlockFee,
        unlockFeePercentage: requireUnlockFee
          ? parseFloat(unlockFeePct) || 0
          : undefined,
      });
      toast.success(`Loan approved for ${selected.restaurant.name}`);
      setApproveOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to approve");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await voucherService.rejectLoanSession(selected.id, rejectReason || "Rejected by admin");
      toast.success("Loan request rejected");
      setRejectOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to reject");
    } finally {
      setSubmitting(false);
    }
  };

  // Derived: effective unlock fee for the selected pending session (admin-input, no default fee)
  const parsedAmount = parseFloat(approvedAmount) || 0;
  const parsedFeePct = parseFloat(unlockFeePct) || 0;
  const effectiveFeePct =
    selected?.status === "REQUESTED" && requireUnlockFee ? parsedFeePct : 0;
  const unlockFeePreview = effectiveFeePct > 0 ? parsedAmount * (effectiveFeePct / 100) : 0;
  const extraAmount = selected && parsedAmount > 0 ? Math.max(0, selected.requestedAmount - parsedAmount) : 0;

  const columns: ColumnDef<LoanSession>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => <span className="text-xs text-gray-500">{row.index + 1}</span>,
    },
    {
      id: "rrn",
      header: "RRN",
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
          {row.original.rrn}
        </span>
      ),
    },
    {
      id: "restaurant",
      header: "Restaurant",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-gray-800">{row.original.restaurant.name}</p>
          <p className="text-xs text-gray-400">{row.original.restaurant.email}</p>
        </div>
      ),
    },
    {
      id: "provider",
      header: "Trader",
      cell: ({ row }) => {
        const t = row.original.fundingTrader;
        return t ? (
          <div>
            <p className="text-sm font-medium text-gray-800">{t.username}</p>
            <p className="text-xs text-gray-400">{t.email}</p>
          </div>
        ) : (
          <span className="text-xs text-gray-400">
            {row.original.status === "REQUESTED" ? "Not assigned" : "—"}
          </span>
        );
      },
    },
    {
      id: "pan",
      header: "Card (PAN)",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-gray-500">
          {row.original.card?.pan
            ? row.original.card.pan.replace(/(.{4})/g, "$1 ").trim()
            : "—"}
        </span>
      ),
    },
    {
      id: "amounts",
      header: "Requested / Approved",
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="text-xs">
            <p className="font-semibold text-gray-800">
              {s.requestedAmount.toLocaleString()} RWF
            </p>
            {s.approvedAmount && (
              <p className="text-green-600">
                → {s.approvedAmount.toLocaleString()} RWF
                {s.approvalPercentage && s.approvalPercentage < 100 && (
                  <span className="text-gray-400 ml-1">({s.approvalPercentage}%)</span>
                )}
              </p>
            )}
          </div>
        );
      },
    },
    {
      id: "unlockFee",
      header: "Unlock Fee",
      cell: ({ row }) => {
        const s = row.original;
        if (s.status === "REQUESTED") {
          if (s.effectiveUnlockFeeEnabled && (s.effectiveUnlockFeePercentage ?? 0) > 0) {
            return (
              <div className="text-xs">
                <p className="text-amber-600 font-medium" title="Will apply at approval">
                  {s.effectiveUnlockFeePercentage}% (pending)
                </p>
                <p className="text-gray-400">
                  {(s.requestedAmount * ((s.effectiveUnlockFeePercentage ?? 0) / 100)).toLocaleString()} RWF
                </p>
              </div>
            );
          }
          return <span className="text-xs text-gray-400">None</span>;
        }
        if (!s.unlockFee) return <span className="text-xs text-gray-400">None</span>;
        return (
          <div className="text-xs">
            <p className="text-orange-600 font-medium">{s.unlockFee.toLocaleString()} RWF</p>
            <p className="text-gray-400">
              {s.unlockFeePercentage ? `${s.unlockFeePercentage}%` : "snapshot"}
            </p>
          </div>
        );
      },
    },
    {
      id: "lock",
      header: "Lock",
      cell: ({ row }) =>
        row.original.unlockStatus === "UNLOCKED" ? (
          <Unlock className="w-4 h-4 text-green-500" />
        ) : (
          <Lock className="w-4 h-4 text-gray-300" />
        ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <Badge className={`text-xs rounded ${STATUS_COLORS[s] ?? "bg-gray-100 text-gray-600"}`}>
            {STATUS_LABELS[s] ?? s}
          </Badge>
        );
      },
    },
    {
      id: "purpose",
      header: "Purpose",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500">{row.original.purpose ?? "—"}</span>
      ),
    },
    {
      id: "requestedAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs text-gray-500">
          {new Date(row.original.requestedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const s = row.original;
        const isPending = s.status === "REQUESTED";
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={!isPending}
                onClick={() => openApprove(s)}
              >
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Approve (Food Bundles)
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!isPending}
                onClick={() => openAccept(s)}
              >
                <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                Accept (send to trader)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={!isPending}
                className="text-red-600"
                onClick={() => openReject(s)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* All sessions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-gray-800">All Loan Sessions</h3>
        </div>
        <DataTable
          columns={columns}
          data={sessions}
          title=""
          description=""
          showPagination
          showColumnVisibility
          isLoading={loading}
        />
      </div>

      {/* Approve modal */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Approve Loan — {selected?.restaurant.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Requested info */}
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Requested</span>
                <span className="font-semibold">
                  {selected?.requestedAmount.toLocaleString()} RWF
                </span>
              </div>
              {selected?.purpose && (
                <div className="flex justify-between mt-1">
                  <span className="text-gray-500">Purpose</span>
                  <span className="text-gray-700">{selected.purpose}</span>
                </div>
              )}
              <div className="flex justify-between mt-1">
                <span className="text-gray-500">RRN</span>
                <span className="font-mono text-xs">{selected?.rrn}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Approval % (credit given on the requested amount)</label>
              <Input
                type="number"
                min="1"
                max="100"
                value={approvalPct}
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
                  {selected?.requestedAmount.toLocaleString()} RWF
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

            {/* Require unlock fee — admin override, defaults to the configured card/provider fee */}
            <label className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={requireUnlockFee}
                onChange={(e) => setRequireUnlockFee(e.target.checked)}
                className="w-4 h-4 accent-green-600"
              />
              <span>
                Require unlock fee before this loan activates
                <span className="block text-xs text-gray-400">
                  The unlock fee is not static — you set the percentage applied at approval.
                </span>
              </span>
            </label>

            {requireUnlockFee && (
              <div>
                <label className="block text-sm font-medium mb-1">Unlock Fee %</label>
                <Input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={unlockFeePct}
                  onChange={(e) => setUnlockFeePct(e.target.value)}
                  placeholder="e.g. 5"
                  className="h-10 text-sm"
                />
              </div>
            )}

            {/* Unlock fee preview — uses the admin-set percentage, not static */}
            {parsedAmount > 0 && effectiveFeePct > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
                <p className="font-medium text-orange-800">Unlock Fee Applied</p>
                <p className="text-orange-700 mt-0.5">
                  {parsedAmount.toLocaleString()} × {effectiveFeePct}% ={" "}
                  <strong>{unlockFeePreview.toLocaleString()} RWF</strong>
                </p>
                <p className="text-orange-500 text-xs mt-1">
                  Restaurant pays this before the loan activates.
                </p>
              </div>
            )}
            {requireUnlockFee && parsedAmount > 0 && effectiveFeePct <= 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                <p className="font-medium text-yellow-800">Enter the unlock fee percentage</p>
                <p className="text-yellow-700 text-xs mt-0.5">
                  Approving with a fee enabled but no percentage will not lock the loan.
                </p>
              </div>
            )}
            {!requireUnlockFee && (
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
                value={repaymentDays}
                onChange={(e) => setRepaymentDays(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            {/* Approve on behalf of a delegation trader */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Approve on behalf of trader (optional)
              </label>
              <div className="space-y-2">
                {traders.filter(
                  (t) => t.canTradeOnBehalf && t.delegationStatus === "ACCEPTED"
                ).length > 0 ? (
                  traders
                    .filter(
                      (t) => t.canTradeOnBehalf && t.delegationStatus === "ACCEPTED"
                    )
                    .map((t) => (
                      <label
                        key={t.id}
                        className={`flex items-start gap-2 border rounded-lg p-3 cursor-pointer text-sm ${
                          onBehalfTraderId === t.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="onBehalfTrader"
                          checked={onBehalfTraderId === t.id}
                          onChange={() => setOnBehalfTraderId(t.id)}
                          className="w-4 h-4 mt-0.5 accent-blue-600"
                        />
                        <span className="flex-1">
                          <span className="block font-medium text-gray-800">{t.name}</span>
                          <span className="block text-xs text-gray-500">
                            {t.availableBalance.toLocaleString()} RWF available
                          </span>
                        </span>
                      </label>
                    ))
                ) : (
                  <p className="text-xs text-gray-400 py-1">
                    No delegation traders available.
                  </p>
                )}
              </div>
              {onBehalfTraderId && (
                <p className="text-xs text-gray-400 mt-1">
                  The selected trader&rsquo;s wallet balance will be reserved for this loan.
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleApprove}
                disabled={
                  submitting ||
                  !approvedAmount ||
                  !repaymentDays ||
                  (requireUnlockFee && (!unlockFeePct || parseFloat(unlockFeePct) <= 0))
                }
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {submitting ? "Approving..." : "Approve Loan"}
              </Button>
              <Button variant="outline" onClick={() => setApproveOpen(false)} disabled={submitting}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Accept dialog — send to trader */}
      <Dialog open={acceptOpen} onOpenChange={setAcceptOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              Accept &amp; Send to Trader — {selected?.restaurant.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Requested</span>
                <span className="font-semibold">
                  {selected?.requestedAmount.toLocaleString()} RWF
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-500">RRN</span>
                <span className="font-mono text-xs">{selected?.rrn}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-gray-500">Provider</span>
                <span className="text-gray-700">
                  {selected?.fundingTrader?.username ?? (
                    <span className="text-amber-600">None selected yet</span>
                  )}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {selected?.fundingTrader
                  ? "Confirm or change the trader"
                  : "Select a trader to approve this loan"}
              </label>
              {isLoadingTraders ? (
                <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading traders...
                </div>
              ) : traders.length === 0 ? (
                <p className="text-xs text-gray-500 py-2">
                  No active traders with wallets found. The loan can still be
                  accepted, but no trader will be notified.
                </p>
              ) : (
                <div className="space-y-2">
                  {traders.map((t) => (
                    <label
                      key={t.id}
                      className={`flex items-start gap-2 border rounded-lg p-3 cursor-pointer text-sm ${
                        selectedTraderId === t.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="trader"
                        checked={selectedTraderId === t.id}
                        onChange={() => setSelectedTraderId(t.id)}
                        className="w-4 h-4 mt-0.5 accent-blue-600"
                      />
                      <span className="flex-1">
                        <span className="block font-medium text-gray-800">
                          {t.name}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {t.availableBalance.toLocaleString()} RWF available
                          {t.canTradeOnBehalf &&
                            t.delegationStatus === "APPROVED" &&
                            " · Can trade on behalf"}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleAccept}
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {submitting ? "Accepting..." : "Accept & Send to Trader"}
              </Button>
              <Button variant="outline" onClick={() => setAcceptOpen(false)} disabled={submitting}>
                Cancel
              </Button>
            </div>
            {(selected?.fundingTrader || selectedTraderId) && (
              <p className="text-xs text-gray-400">
                The selected trader will be notified and must approve the loan
                in their app.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject modal */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" />
              Reject Loan — {selected?.restaurant.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Reason (optional)</label>
              <Input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Insufficient order history"
                className="h-10 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleReject}
                disabled={submitting}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {submitting ? "Rejecting..." : "Reject"}
              </Button>
              <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={submitting}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
