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
  Clock,
  AlertCircle,
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
  card?: { id: string; pan: string };
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

const DEFAULT_UNLOCK_FEE_PCT = 4.5;

export default function LoanSessionsAdminTable() {
  const [sessions, setSessions] = useState<LoanSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<LoanSession | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState("");
  const [approvalPct, setApprovalPct] = useState("100");
  const [repaymentDays, setRepaymentDays] = useState("30");
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const pendingSessions = sessions.filter((s) => s.status === "REQUESTED");

  // Sync amount when percentage changes
  const handlePctChange = (val: string) => {
    setApprovalPct(val);
    if (selected) {
      const pct = parseFloat(val) || 0;
      setApprovedAmount(((selected.requestedAmount * pct) / 100).toFixed(0));
    }
  };

  const handleAmountChange = (val: string) => {
    setApprovedAmount(val);
    if (selected && parseFloat(val) > 0) {
      const pct = (parseFloat(val) / selected.requestedAmount) * 100;
      setApprovalPct(pct.toFixed(1));
    }
  };

  const openApprove = (session: LoanSession) => {
    setSelected(session);
    setApprovedAmount(session.requestedAmount.toString());
    setApprovalPct("100");
    setRepaymentDays(session.repaymentDays?.toString() ?? "30");
    setApproveOpen(true);
  };

  const openReject = (session: LoanSession) => {
    setSelected(session);
    setRejectReason("");
    setRejectOpen(true);
  };

  const handleApprove = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await voucherService.approveLoanSession(selected.id, {
        approvedAmount: parseFloat(approvedAmount),
        approvalPercentage: parseFloat(approvalPct),
        repaymentDays: parseInt(repaymentDays),
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

  const parsedAmount = parseFloat(approvedAmount) || 0;
  const unlockFeePreview = parsedAmount * (DEFAULT_UNLOCK_FEE_PCT / 100);

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
        if (!s.unlockFee) return <span className="text-xs text-gray-400">—</span>;
        return (
          <div className="text-xs">
            <p className="text-orange-600 font-medium">{s.unlockFee.toLocaleString()} RWF</p>
            <p className="text-gray-400">{s.unlockFeePercentage ?? 4.5}%</p>
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
                Approve
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
      {/* Pending requests highlight */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-yellow-500" />
          <h3 className="text-sm font-semibold text-gray-800">Pending Loan Requests</h3>
          {pendingSessions.length > 0 && (
            <Badge className="bg-yellow-100 text-yellow-700 text-xs rounded-full px-2">
              {pendingSessions.length}
            </Badge>
          )}
        </div>

        {!loading && pendingSessions.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-4 py-3 border border-dashed border-gray-200">
            <AlertCircle className="w-4 h-4" />
            No pending loan requests
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={pendingSessions}
            title=""
            description=""
            showPagination={false}
            showColumnVisibility={false}
            showRowSelection={false}
            isLoading={loading}
          />
        )}
      </div>

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
              <label className="block text-sm font-medium mb-1">Approval % </label>
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
              <label className="block text-sm font-medium mb-1">Approved Amount (RWF)</label>
              <Input
                type="number"
                value={approvedAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            {/* Unlock fee preview */}
            {parsedAmount > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
                <p className="font-medium text-orange-800">Unlock Fee (auto-calculated)</p>
                <p className="text-orange-700 mt-0.5">
                  {parsedAmount.toLocaleString()} × {DEFAULT_UNLOCK_FEE_PCT}% ={" "}
                  <strong>{unlockFeePreview.toLocaleString()} RWF</strong>
                </p>
                <p className="text-orange-500 text-xs mt-1">
                  Restaurant pays this before the loan activates.
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

            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleApprove}
                disabled={submitting || !approvedAmount || !repaymentDays}
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
