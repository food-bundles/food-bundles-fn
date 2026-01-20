"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Building, Calendar } from "lucide-react";
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
  currentPage,
  pageSize,
}: VoucherColumnsProps): ColumnDef<Voucher>[] => [
  {
    id: "index",
    header: "#",
    cell: ({ row }) => {
      const index = row.index;
      return (
        <span className="text-xs font-bold text-gray-900">
          {(currentPage - 1) * pageSize + index + 1}
        </span>
      );
    },
  },
  {
    accessorKey: "voucherCode",
    header: "Voucher Code",
    cell: ({ row }) => (
      <span className="text-xs font-bold text-blue-600">{row.original.voucherCode}</span>
    ),
  },
  {
    accessorKey: "restaurant",
    header: "Restaurant",
    cell: ({ row }) => {
      const restaurant = row.original.restaurant;
      return (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-xs font-bold text-gray-900">{restaurant.name}</p>
            <p className="text-xs text-gray-600">{restaurant.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "creditLimit",
    header: "Credit Info",
    cell: ({ row }) => (
      <div>
        <p className="text-xs font-bold text-green-600">
          {row.original.creditLimit.toLocaleString()} {row.original.currency}
        </p>
        <p className="text-xs text-gray-500">
          {getVoucherTypeLabel(row.original.voucherType)}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "usedCredit",
    header: "Usage",
    cell: ({ row }) => {
      const usagePercent = (row.original.usedCredit / row.original.totalCredit) * 100;
      return (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="font-bold text-gray-900">
              {row.original.usedCredit.toLocaleString()} {row.original.currency}
            </span>
            <span className="text-gray-500">{usagePercent.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "remainingCredit",
    header: "Remaining",
    cell: ({ row }) => (
      <span className="text-xs font-bold text-blue-600">
        {row.original.remainingCredit.toLocaleString()} {row.original.currency}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge className={getStatusColor(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "expiryDate",
    header: "Expires",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Calendar className="h-3 w-3 text-gray-500" />
        <span className="text-xs text-gray-900">
          {new Date(row.original.expiryDate).toLocaleDateString()}
        </span>
      </div>
    ),
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