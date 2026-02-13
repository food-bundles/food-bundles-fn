import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Loader2 } from "lucide-react";
import { formatDateTime } from "@/lib/reusableFunctions";

export interface WithdrawalData {
  id: string;
  amount: number;
  withdrawType: string;
  paymentMethod: string;
  accountNumber: string;
  accountName: string;
  status: string;
  createdAt: string;
  trader?: {
    username: string;
    email: string;
    phone?: string;
    wallet?: {
      balance: number;
      commissionBalance: number;
    };
  };
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
  actionLoading: string | null;
}

export const createWithdrawalColumns = ({
  onApprove,
  onCancel,
  onViewTrader,
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
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
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
      const status = row.original.status;
      const colors = {
        COMPLETED: "bg-green-100 text-green-800",
        PENDING: "bg-yellow-100 text-yellow-800",
        FAILED: "bg-red-100 text-red-800",
      };
      return (
        <Badge className={colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
          {status}
        </Badge>
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
      if (row.original.status !== "PENDING") return null;
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onApprove(row.original.id)}
            disabled={actionLoading === row.original.id}
            className="hover:bg-green-50"
          >
            {actionLoading === row.original.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </Button>
        </div>
      );
    },
  },
];
