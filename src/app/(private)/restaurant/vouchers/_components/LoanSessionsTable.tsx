"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { voucherService } from "@/app/services/voucherService";
import { ILoanSession, LoanSessionStatus } from "@/lib/types";
import { Lock, Unlock, AlertCircle } from "lucide-react";

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

  useEffect(() => {
    voucherService
      .getMyLoanSessions()
      .then((res) => setSessions(res?.data ?? []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

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
        return (
          <div className="text-xs">
            <p className="font-semibold text-gray-800">
              {(s.approvedAmount ?? s.requestedAmount).toLocaleString()} RWF
            </p>
            {s.approvalPercentage && s.approvalPercentage < 100 && (
              <p className="text-gray-400">{s.approvalPercentage}% approved</p>
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
        if (s.unlockFee == null) return <span className="text-xs text-gray-400">—</span>;
        return (
          <div className="text-xs">
            <p className="font-medium text-orange-600">{s.unlockFee.toLocaleString()} RWF</p>
            <p className="text-gray-400">{s.unlockFeePercentage ?? 4.5}%</p>
          </div>
        );
      },
    },
    {
      id: "usage",
      header: "Used / Outstanding",
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
  ];

  return (
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
  );
}
