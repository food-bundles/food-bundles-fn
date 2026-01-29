/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Voucher } from "@/app/services/traderService";

interface VoucherColumnsProps {
  onViewDetails: (voucher: Voucher) => void;
  currentPage: number;
  pageSize: number;
}

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-RW", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800";
    case "EXPIRED":
      return "bg-red-100 text-red-800";
    case "USED":
      return "bg-gray-100 text-gray-800";
    case "MATURED":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};

const getVoucherTypeLabel = (type: string) => {
  switch (type) {
    case "DISCOUNT_10":
      return "10% Discount";
    case "DISCOUNT_20":
      return "20% Discount";
    case "DISCOUNT_50":
      return "50% Discount";
    case "DISCOUNT_80":
      return "80% Discount";
    case "DISCOUNT_100":
      return "100% Discount";
    default:
      return type;
  }
};

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
    cell: ({ row }) => (
      <span className="text-xs">
        {row.original.totalCredit.toLocaleString()} {row.original.currency}
      </span>
    ),
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
  // {
  //   accessorKey: "status",
  //   header: "Status",
  //   cell: ({ row }) => (
  //     <Badge className={getStatusColor(row.original.status)}>
  //       {row.original.status}
  //     </Badge>
  //   ),
  // },
  {
    accessorKey: "serviceFeeRate",
    header: "Commission",
    cell: ({ row }) => {
      const commission = row.original.serviceFeeRate;
      const isUsed =
        row.original.status === "USED" || row.original.status === "SETTLED";
      return (
        <div className="text-xs">
          <span
            className={isUsed ? "text-green-600 font-medium" : "text-gray-500"}
          >
            {commission}%
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