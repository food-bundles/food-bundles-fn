"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { formatDateTime } from "@/lib/reusableFunctions";

export interface TransactionData {
  id: string;
  type: string;
  amount: number;
  status: string;
  previousBalance: number;
  createdAt: string;
  wallet: {
    restaurant?: {
      name: string;
      phone: string;
    };
    trader?: {
      email: string;
      username: string;
      phone: string;
    };
  };
}

interface TransactionColumnsProps {
  onViewDetails: (transaction: TransactionData) => void;
  currentPage: number;
  pageSize: number;
  walletType: "restaurant" | "trader";
}

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    case "processing":
      return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
    case "failed":
      return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
  }
};

export const createTransactionColumns = ({
  onViewDetails,
  currentPage,
  pageSize,
  walletType,
}: TransactionColumnsProps): ColumnDef<TransactionData>[] => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => {
      const index = row.index;
      return (
        <span className="text-xs   text-gray-900">
          {(currentPage - 1) * pageSize + index + 1}
        </span>
      );
    },
  },
  {
    accessorKey: walletType === "restaurant" ? "wallet.restaurant.name" : "wallet.trader.email",
    header: walletType === "restaurant" ? "Restaurant" : "Trader",
    cell: ({ row }) => {
      const transaction = row.original;
      if (walletType === "restaurant") {
        const name = transaction.wallet?.restaurant?.name;
         const phone = transaction.wallet?.restaurant?.phone;
        return (
          <div className="flex flex-col">
            <span className="text-xs text-gray-900">{name &&name.length>20? name.slice(0, 10) + "..." : name}</span>
             {phone && <span className="text-xs text-gray-500">{phone}</span>}
          </div>
        );
      } else {
        const username = transaction.wallet?.trader?.username;
        const phone = transaction.wallet?.trader?.phone;
        return (
          <div className="flex flex-col">
            <span className="text-xs text-gray-900 font-medium">
              {username && username.length > 20
                ? username.slice(0, 10) + "..."
                : username}
            </span>
            {phone && <span className="text-xs text-gray-500">{phone}</span>}
          </div>
        );
      }
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return getStatusBadge(status);
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <div className="flex items-center gap-2">
          <span className="text-xs   text-gray-900">{type}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      return (
        <span
          className={`text-xs   ${
            amount > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {amount > 0 ? "+" : ""}
          {amount.toLocaleString()} RWF
        </span>
      );
    },
  },
  {
    accessorKey: "previousBalance",
    header: "Previous Balance",
    cell: ({ row }) => {
      const balance = row.getValue("previousBalance") as number;
      return (
        <span className="text-xs   text-gray-900">
          {balance?.toLocaleString() || "0"} RWF
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date & Time",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="flex flex-col">
          <span className="text-xs   text-gray-900">
            {formatDateTime(date.toISOString())}
          </span>
        </div>
      );
    }
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const transaction = row.original;
      return (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onViewDetails(transaction)}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-xl p-2 transition-all"
        >
          <Eye className="h-4 w-4" />
        </Button>
      );
    },
  },
];