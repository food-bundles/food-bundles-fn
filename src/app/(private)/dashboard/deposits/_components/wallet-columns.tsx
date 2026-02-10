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
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

export interface WalletData {
  id: string;
  balance: number;
  isActive: boolean;
  restaurantId: string | null;
  traderId: string | null;
  commission?: number;
  canTradeOnBehalf?: boolean;
  delegationStatus?: string;
  restaurant?: {
    name: string;
    phone: string;
  } | null;
  trader?: {
    id: string;
    email: string;
    username: string;
    phone: string;
  } | null;
  _count: {
    transactions: number;
  };
}

interface WalletColumnsProps {
  onToggleStatus: (walletId: string, currentStatus: boolean) => void;
  onDeposit: (restaurantId: string) => void;
  onApproveDelegation?: (traderId: string, currentCommission: number) => void;
  onRevokeDelegation?: (traderId: string) => void;
  currentPage: number;
  pageSize: number;
  walletType?: "restaurant" | "trader";
}

const getDelegationStatusColor = (status: string) => {
  switch (status) {
    case "ACCEPTED":
      return "bg-green-100 text-green-700 border-green-200";
    case "APPROVED":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "NORMAL":
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

function DelegationStatusBadge({
  currentStatus,
  traderId,
  commission,
  onApproveDelegation,
  onRevokeDelegation,
}: {
  currentStatus: string;
  traderId: string;
  commission: number;
  onApproveDelegation?: (traderId: string, commission: number) => void;
  onRevokeDelegation?: (traderId: string) => void;
}) {
  const handleAction = () => {
    if (currentStatus === "PENDING" && onApproveDelegation) {
      onApproveDelegation(traderId, commission);
    } else if (currentStatus === "ACCEPTED" && onRevokeDelegation) {
      onRevokeDelegation(traderId);
    }
  };

  const getStatusLabel = () => {
    switch (currentStatus) {
      case "ACCEPTED":
        return "Accepted";
      case "APPROVED":
        return "Approved";
      case "PENDING":
        return "Pending";
      case "NORMAL":
      default:
        return "Normal";
    }
  };

  const showActionButton = currentStatus === "PENDING" || currentStatus === "ACCEPTED";

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${getDelegationStatusColor(currentStatus)} border px-3 py-1 text-xs rounded-full`}>
        {getStatusLabel()}
      </Badge>
      {showActionButton && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleAction}
          className="h-6 px-2 text-xs"
        >
          {currentStatus === "PENDING" ? "Approve" : "Revoke"}
        </Button>
      )}
    </div>
  );
}

export const createWalletColumns = ({
  onToggleStatus,
  onDeposit,
  onApproveDelegation,
  onRevokeDelegation,
  currentPage,
  pageSize,
  walletType = "restaurant",
}: WalletColumnsProps): ColumnDef<WalletData>[] => [
  {
    id: "index",
    header: "No",
    cell: ({ row }) => {
      const index = row.index;
      return (
        <span className="text-xs text-gray-900">
          {(currentPage - 1) * pageSize + index + 1}
        </span>
      );
    },
  },
  {
    accessorKey: walletType === "restaurant" ? "restaurant" : "trader",
    header: walletType === "restaurant" ? "Restaurant" : "Trader",
    cell: ({ row }) => {
      if (walletType === "restaurant") {
        const restaurant = row.getValue("restaurant") as WalletData["restaurant"];
        return (
          <div>
            <p className="text-xs text-gray-900">
              {restaurant?.name && restaurant?.name.length > 20
                ? restaurant?.name.slice(0, 20) + "..."
                : restaurant?.name}
            </p>

            <p className="text-xs text-gray-600">{restaurant?.phone}</p>
          </div>
        );
      } else {
        const trader = row.getValue("trader") as WalletData["trader"];
        return (
          <div>
            <p className="text-xs text-gray-900">{trader?.username && trader?.username.length > 20 ? trader?.username.slice(0, 10) + "..." : trader?.username}</p>
            <p className="text-xs text-gray-600">{trader?.phone}</p>
          </div>
        );
      }
    },
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => {
      const balance = row.getValue("balance") as number;
      return (
        <div className="flex items-baseline gap-1">
          <span className="text-sm text-gray-900">
            {balance?.toLocaleString()}
          </span>
          <span className="text-xs text-gray-600">RWF</span>
        </div>
      );
    },
  },
  {
    accessorKey: "_count.transactions",
    header: "Transactions",
    cell: ({ row }) => {
      const count = row.original._count?.transactions || 0;
      return (
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 w-fit">
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span className="text-xs">{count}</span>
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
        <Badge className="bg-green-100/50 text-green-700 border-none px-3 py-1 text-xs rounded-full">
          Active
        </Badge>
      ) : (
        <Badge className="bg-red-100/50 text-red-700 border-none px-3 py-1 text-xs rounded-full">
          Inactive
        </Badge>
      );
    },
  },
  ...(walletType === "trader"
    ? [
        {
          accessorKey: "delegationStatus",
          header: "Delegation",
          cell: ({ row }: any) => {
            const wallet = row.original;
            return (
              <DelegationStatusBadge
                currentStatus={wallet.delegationStatus || "NORMAL"}
                traderId={wallet.traderId!}
                commission={wallet.commission || 5}
                onApproveDelegation={onApproveDelegation}
                onRevokeDelegation={onRevokeDelegation}
              />
            );
          },
        } as ColumnDef<WalletData>,
      ]
    : []),
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
            {walletType === "restaurant" && wallet.restaurantId && (
              <DropdownMenuItem
                onClick={() => onDeposit(wallet.restaurantId!)}
              >
                Deposit
              </DropdownMenuItem>
            )}
            {walletType === "trader" && wallet.traderId && onApproveDelegation && (
              <DropdownMenuItem
                onClick={() => onApproveDelegation(wallet.traderId!, wallet.commission || 5)}
              >
                {wallet.delegationStatus === "PENDING" ? "Approve Delegation" : "Resend OTP"}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];