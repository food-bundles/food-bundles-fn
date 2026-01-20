"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpRight, MoreHorizontal } from "lucide-react";

export interface WalletData {
  id: string;
  balance: number;
  isActive: boolean;
  restaurantId: string;
  restaurant: {
    name: string;
    phone: string;
  };
  _count: {
    transactions: number;
  };
}

interface WalletColumnsProps {
  onToggleStatus: (walletId: string, currentStatus: boolean) => void;
  onDeposit: (restaurantId: string) => void;
  currentPage: number;
  pageSize: number;
}

export const createWalletColumns = ({
  onToggleStatus,
  onDeposit,
  currentPage,
  pageSize,
}: WalletColumnsProps): ColumnDef<WalletData>[] => [
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
    accessorKey: "restaurant",
    header: "Restaurant",
    cell: ({ row }) => {
      const restaurant = row.getValue("restaurant") as WalletData["restaurant"];
      return (
          <div>
            <p className="text-xs   text-gray-900">{restaurant?.name}</p>
            <p className="text-xs text-gray-600">{restaurant?.phone}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => {
      const balance = row.getValue("balance") as number;
      return (
        <div className="flex flex-col">
          <span className="text-sm   text-gray-900">
            {balance?.toLocaleString()}
          </span>
          <span className="text-xs text-gray-600">RWF</span>
        </div>
      );
    },
  },
  {
    accessorKey: "_count.transactions",
    header: "Activity",
    cell: ({ row }) => {
      const count = row.original._count?.transactions || 0;
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 w-fit">
          <ArrowUpRight className="h-3.5 w-3.5" />
          <span className="text-xs  ">{count}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return isActive ? (
        <Badge className="bg-green-100/50 text-green-700 border-none px-3 py-1 text-xs   rounded-full">
          Active
        </Badge>
      ) : (
        <Badge className="bg-red-100/50 text-red-700 border-none px-3 py-1 text-xs   rounded-full">
          Inactive
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const wallet = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() => onToggleStatus(wallet.id, wallet.isActive)}
            >
              {wallet.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeposit(wallet.restaurantId)}
            >
              Deposit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];