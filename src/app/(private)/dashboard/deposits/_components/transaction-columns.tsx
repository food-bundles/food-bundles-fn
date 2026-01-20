"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Wallet, Eye } from "lucide-react";

export interface TransactionData {
  id: string;
  type: string;
  amount: number;
  status: string;
  previousBalance: number;
  createdAt: string;
  wallet: {
    restaurant: {
      name: string;
    };
  };
}

interface TransactionColumnsProps {
  onViewDetails: (transaction: TransactionData) => void;
  currentPage: number;
  pageSize: number;
}

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "TOP_UP":
      return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    case "PAYMENT":
      return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    case "REFUND":
      return <ArrowUpRight className="h-4 w-4 text-blue-600" />;
    default:
      return <Wallet className="h-4 w-4 text-gray-600" />;
  }
};

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
    accessorKey: "wallet.restaurant.name",
    header: "Restaurant",
    cell: ({ row }) => {
      const name = row.original.wallet?.restaurant?.name;
      return <span className="text-xs   text-gray-900">{name}</span>;
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
          {getTransactionIcon(type)}
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
          <span className="text-xs text-gray-900 font-medium">
            {date.toLocaleDateString()}
          </span>
          <span className="text-xs text-gray-500">
            {date.toLocaleTimeString()}
          </span>
        </div>
      );
    },
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