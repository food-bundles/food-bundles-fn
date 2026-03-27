/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2, ImageUp, Clock, ImageIcon } from "lucide-react";
import { formatDateTime } from "@/lib/reusableFunctions";

export interface WithdrawalData {
  id: string;
  amount: number;
  withdrawType: "BALANCE" | "COMMISSION";
  paymentMethod: string;
  accountNumber: string;
  accountName: string;
  status: string;
  approvedAt?: string | null;
  paymentProofImage?: string | null;
  createdAt: string;
  wallet?: {
    trader: {
      username: string;
      email: string;
    };
  };
}

interface CreateWithdrawalColumnsProps {
  onApprove: (withdrawId: string) => void;
  onCancel: (withdrawId: string) => void;
  onViewTrader: (withdrawal: any) => void;
  onComplete: (withdrawal: WithdrawalData) => void;
  onViewProof: (imageUrl: string) => void;
  actionLoading: string | null;
}

function getRemainingDays(approvedAt: string): number {
  const approved = new Date(approvedAt).getTime();
  const elapsed = Math.floor((Date.now() - approved) / (1000 * 60 * 60 * 24));
  return Math.max(0, 45 - elapsed);
}

export const createWithdrawalColumns = ({
  onApprove,
  onViewTrader,
  onComplete,
  onViewProof,
  actionLoading,
}: CreateWithdrawalColumnsProps): ColumnDef<WithdrawalData>[] => [
  {
    accessorKey: "wallet.trader.username",
    header: "Trader",
    cell: ({ row }) => (
      <div className="cursor-pointer hover:text-green-600" onClick={() => onViewTrader(row.original)}>
        <p className="font-medium">{row.original.wallet?.trader?.username || "N/A"}</p>
        <p className="text-xs text-gray-500">{row.original.wallet?.trader?.email}</p>
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-medium">{Math.abs(row.original.amount).toLocaleString()} RWF</span>
    ),
  },
  {
    accessorKey: "withdrawType",
    header: "Type",
    cell: ({ row }) => (
      <Badge className={row.original.withdrawType === "BALANCE" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}>
        {row.original.withdrawType}
      </Badge>
    ),
  },
  {
    accessorKey: "accountNumber",
    header: "Account",
    cell: ({ row }) => (
      <div>
        <p className="text-xs">{row.original.accountNumber}</p>
        <p className="text-xs text-gray-500">{row.original.accountName}</p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const { status, withdrawType, approvedAt } = row.original;
      const colors: Record<string, string> = {
        COMPLETED: "bg-green-100 text-green-800",
        PENDING: "bg-yellow-100 text-yellow-800",
        APPROVED: "bg-blue-100 text-blue-800",
        PROCESSING: "bg-orange-100 text-orange-800",
        CANCELLED: "bg-red-100 text-red-800",
        FAILED: "bg-red-100 text-red-800",
      };

      const remainingDays =
        status === "APPROVED" && withdrawType === "BALANCE" && approvedAt
          ? getRemainingDays(approvedAt)
          : null;

      return (
        <div className="space-y-1">
          <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>
          {remainingDays !== null && (
            <div className="flex items-center gap-1 text-xs text-orange-600">
              <Clock className="h-3 w-3" />
              {remainingDays === 0 ? (
                <span className="text-green-600 font-medium">Ready to complete</span>
              ) : (
                <span>{remainingDays} day{remainingDays !== 1 ? "s" : ""} remaining</span>
              )}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => <span className="text-xs">{formatDateTime(row.original.createdAt)}</span>,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const { status, withdrawType, approvedAt } = row.original;

      // PENDING: show Approve button
      if (status === "PENDING") {
        return (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onApprove(row.original.id)}
            disabled={actionLoading === row.original.id}
            className="hover:bg-green-50"
            title="Approve withdrawal"
          >
            {actionLoading === row.original.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </Button>
        );
      }

      // APPROVED BALANCE: show Complete button only when 45 days passed
      if (status === "APPROVED" && withdrawType === "BALANCE" && approvedAt) {
        const remaining = getRemainingDays(approvedAt);
        return (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onComplete(row.original)}
            disabled={remaining > 0 || actionLoading === row.original.id}
            className={remaining === 0 ? "hover:bg-green-50" : "opacity-50 cursor-not-allowed"}
            title={remaining > 0 ? `${remaining} days remaining` : "Complete withdrawal"}
          >
            {actionLoading === row.original.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageUp className={`h-4 w-4 ${remaining === 0 ? "text-green-600" : "text-gray-400"}`} />
            )}
          </Button>
        );
      }

      // APPROVED COMMISSION: show Complete button immediately
      if (status === "APPROVED" && withdrawType === "COMMISSION") {
        return (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onComplete(row.original)}
            disabled={actionLoading === row.original.id}
            className="hover:bg-purple-50"
            title="Complete commission withdrawal"
          >
            {actionLoading === row.original.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageUp className="h-4 w-4 text-purple-600" />
            )}
          </Button>
        );
      }

      // COMPLETED: show view proof button if image exists
      if (status === "COMPLETED" && row.original.paymentProofImage) {
        return (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewProof(row.original.paymentProofImage!)}
            className="hover:bg-gray-50"
            title="View payment proof"
          >
            <ImageIcon className="h-4 w-4 text-gray-500" />
          </Button>
        );
      }

      return null;
    },
  },
];
