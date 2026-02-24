/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Voucher } from "@/app/services/traderService";
import { formatDateTime } from "@/lib/reusableFunctions";

interface VoucherColumnsProps {
  onViewDetails: (voucher: Voucher) => void;
  currentPage: number;
  pageSize: number;
}

export const createVoucherColumns = ({
  onViewDetails,
}: VoucherColumnsProps): ColumnDef<Voucher>[] => [
  {
    accessorKey: "voucherCode",
    header: "Voucher Code",
    cell: ({ row }) => (
      <span className="text-xs font-bold text-blue-600">
        {row.original.voucherCode}
      </span>
    ),
  },
  {
    accessorKey: "totalCredit",
    header: "Approved Amount",
    cell: ({ row }) => {
      const isExpired = row.original.status === "EXPIRED";
      return (
        <span className={`text-xs ${isExpired ? "line-through text-gray-400" : ""}`}>
          {row.original.creditLimit.toLocaleString()} {row.original.currency}
        </span>
      );
    },
  },
  {
    accessorKey: "usedAmount",
    header: "Used Amount",
    cell: ({ row }) => (
      <span className="text-xs font-bold text-green-600">
        {row.original.usedCredit}
      </span>
    ),
  },
  {
    accessorKey: "restaurant",
    header: "Restaurant",
    cell: ({ row }) => (
      <span className="text-xs text-gray-900">
        {row.original.restaurant.name}
      </span>
    ),
  },
  {
    accessorKey: "repaymentDays",
    header: "Repayment Days",
    cell: ({ row }) => (
      <span className="text-xs text-gray-700">
        {row.original.repaymentDays} days
      </span>
    ),
  },
  {
    accessorKey: "loan.repaymentDueDate",
    header: "Repayment Date",
    cell: ({ row }: any) => (
      <span className="text-xs text-gray-700">
        {formatDateTime(row.original.loan.repaymentDueDate)}
      </span>
    ),
  },

  {
    accessorKey: "commission",
    header: "Commission",
    cell: ({ row }) => {
      const commission = row.original.commission || 0;
      const isUsed =
        row.original.status === "USED" || row.original.status === "SETTLED";
      return (
        <div className="text-xs">
          <span
            className={isUsed ? "text-green-600 font-medium" : "text-gray-500"}
          >
            {commission.toLocaleString()} {row.original.currency}
          </span>
          {isUsed && <div className="text-green-500 text-xs">Earned</div>}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onViewDetails(row.original)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];