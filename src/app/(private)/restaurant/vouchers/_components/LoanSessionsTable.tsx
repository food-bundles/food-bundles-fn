"use client";

import { useEffect, useRef, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { voucherService } from "@/app/services/voucherService";
import { ILoanSession, LoanSessionStatus } from "@/lib/types";
import { Lock, Unlock, AlertCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import UnlockFeeModal from "./UnlockFeeModal";
import RepayVoucherModal from "./RepayVoucherModal";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/auth-context";
import { useLoanWebSocket } from "@/hooks/useLoanWebSocket";

const STATUS_COLORS: Record<string, string> = {
  REQUESTED: "text-yellow-600",
  APPROVED_LOCKED: "text-blue-600",
  UNLOCK_FEE_PENDING: "text-orange-600",
  ACTIVE: "text-green-600",
  PARTIALLY_USED: "text-teal-600",
  FULLY_USED: "text-indigo-600",
  CLOSED: "text-gray-500",
  SETTLED: "text-green-700",
  REJECTED: "text-red-600",
  OVERDUE: "text-red-700",
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

const fmt = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function LoanSessionsTable() {
  const [sessions, setSessions] = useState<ILoanSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockSession, setUnlockSession] = useState<ILoanSession | null>(null);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [repaySession, setRepaySession] = useState<ILoanSession | null>(null);
  const [repayModalOpen, setRepayModalOpen] = useState(false);

  const { user } = useAuth();
  const { loanUpdates } = useLoanWebSocket(user?.id || "", user?.id);
  const loanUpdateCountRef = useRef(0);
  const autoCheckedRef = useRef<Set<string>>(new Set());

  const loadSessions = () => {
    voucherService
      .getMyLoanSessions()
      .then((res) => setSessions(res?.data ?? []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Live refresh: whenever the backend broadcasts a LOAN_UPDATE (payment
  // confirmed, repayment, etc.) reload the list. If the update is for the
  // session currently trying to unlock, close its modal — payment succeeded.
  useEffect(() => {
    if (loanUpdates.length === 0) return;
    if (loanUpdates.length === loanUpdateCountRef.current) return;
    loanUpdateCountRef.current = loanUpdates.length;

    const latest = loanUpdates[loanUpdates.length - 1];
    loadSessions();

    if (
      unlockSession &&
      latest.loanId === unlockSession.id &&
      (latest.data?.status === "ACTIVE" ||
        latest.data?.unlockStatus === "UNLOCKED")
    ) {
      setUnlockModalOpen(false);
      toast.success("Unlock fee paid — your loan is now active!");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loanUpdates]);

  // Recovery: on load, re-check any session stuck in UNLOCK_FEE_PENDING. The
  // backend now reads the PayPack status correctly, so a payment that already
  // went through activates immediately — no need to pay twice.
  useEffect(() => {
    if (loading) return;
    const pending = sessions.filter(
      (s) => s.status === LoanSessionStatus.UNLOCK_FEE_PENDING
    );
    pending.forEach((s) => {
      if (autoCheckedRef.current.has(s.id)) return;
      autoCheckedRef.current.add(s.id);
      voucherService
        .verifyUnlockFeePayment(s.id)
        .then((res) => {
          const data = res?.data || {};
          if (data.verified || data.alreadyUnlocked) loadSessions();
        })
        .catch(() => {
          // ignore — user can retry from the modal
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions, loading]);

  const columns: ColumnDef<ILoanSession>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => <span className="text-xs text-gray-500">{row.index + 1}</span>,
    },
    {
      accessorKey: "rrn",
      header: "RRN",
      cell: ({ row }) => (
        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
          {row.original.rrn}
        </span>
      ),
    },
    {
      id: "amounts",
      header: "Loan Amount",
      cell: ({ row }) => {
        const s = row.original;
        return s.approvedAmount != null ? (
          <p className="text-xs font-semibold text-green-600">
            {s.approvedAmount.toLocaleString()} RWF
          </p>
        ) : (
          <p className="text-xs text-gray-700">
            {s.requestedAmount.toLocaleString()} RWF
          </p>
        );
      },
    },
    {
      id: "unlockFee",
      header: "Unlock Fee",
      cell: ({ row }) => {
        const s = row.original;
        if (s.unlockFee == null) return <span className="text-xs text-gray-400">—</span>;
        return (
          <div className="text-xs">
            <p className="font-medium text-orange-600">{s.unlockFee.toLocaleString()} RWF</p>
          </div>
        );
      },
    },
    {
      id: "usage",
      header: "Outstanding",
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="text-xs">
            <p className="text-orange-600">{s.amountUsed.toLocaleString()} used</p>
            <p className={s.outstandingAmount > 0 ? "text-red-600" : "text-gray-400"}>
              {s.outstandingAmount.toLocaleString()} outstanding
            </p>
          </div>
        );
      },
    },
    {
      id: "unlockStatus",
      header: "Lock",
      cell: ({ row }) => {
        const s = row.original;
        return s.unlockStatus === "UNLOCKED" ? (
          <Unlock className="w-4 h-4 text-green-500" />
        ) : (
          <Lock className="w-4 h-4 text-gray-400" />
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <span className={`text-xs font-medium ${STATUS_COLORS[s] ?? "text-gray-600"}`}>
            {STATUS_LABELS[s] ?? s}
          </span>
        );
      },
    },
    {
      id: "dates",
      header: "Dates",
      cell: ({ row }) => {
        const s = row.original;
        const isOverdue = s.dueDate && new Date(s.dueDate) < new Date() && s.outstandingAmount > 0;
        return (
          <div className="text-xs text-gray-500 space-y-0.5">
            <p>Req: {fmt(s.requestedAt)}</p>
            {s.dueDate && (
              <p className={isOverdue ? "text-red-600 font-medium flex items-center gap-1" : ""}>
                {isOverdue && <AlertCircle className="w-3 h-3" />}
                Due: {fmt(s.dueDate)}
              </p>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const s = row.original;
        const unlockable =
          s.status === LoanSessionStatus.APPROVED_LOCKED ||
          s.status === LoanSessionStatus.UNLOCK_FEE_PENDING;

        const repayable =
          s.outstandingAmount > 0 &&
          [
            LoanSessionStatus.ACTIVE,
            LoanSessionStatus.PARTIALLY_USED,
            LoanSessionStatus.FULLY_USED,
            LoanSessionStatus.OVERDUE,
          ].includes(s.status);

        if (!unlockable && !repayable) {
          return (
            <span className="text-xs text-gray-300">
              {s.unlockStatus === "UNLOCKED" ? "Unlocked" : "—"}
            </span>
          );
        }

        return (
          <div className="flex items-center gap-2">
            {unlockable && s.unlockFee != null && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-orange-400 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                onClick={() => {
                  setUnlockSession(s);
                  setUnlockModalOpen(true);
                }}
              >
                <Unlock className="w-3.5 h-3.5 mr-1.5" />
                Unlock
              </Button>
            )}
            {repayable && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-blue-400 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                onClick={() => {
                  setRepaySession(s);
                  setRepayModalOpen(true);
                }}
              >
                <Wallet className="w-3.5 h-3.5 mr-1.5" />
                Pay Voucher
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={sessions}
        title="Loan Session History"
        description="All your loan sessions — each session is a separate RRN"
        showPagination
        showColumnVisibility={false}
        showRowSelection={false}
        isLoading={loading}
      />
      {unlockSession && (
        <UnlockFeeModal
          open={unlockModalOpen}
          onClose={() => setUnlockModalOpen(false)}
          session={unlockSession}
          onSuccess={() => {
            setUnlockModalOpen(false);
            toast.success("Unlock fee paid — your loan is now active!");
            loadSessions();
          }}
        />
      )}
      {repaySession && (
        <RepayVoucherModal
          open={repayModalOpen}
          onClose={() => setRepayModalOpen(false)}
          session={repaySession}
          onSuccess={() => {
            setRepayModalOpen(false);
            toast.success("Voucher repaid — thank you!");
            loadSessions();
          }}
        />
      )}
    </>
  );
}
