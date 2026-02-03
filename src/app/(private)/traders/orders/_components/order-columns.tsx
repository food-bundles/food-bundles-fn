"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Building, CreditCard, Package } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TraderOrder } from "@/app/services/traderService";

interface OrderColumnsProps {
  onViewDetails: (order: TraderOrder) => void;
  currentPage: number;
  pageSize: number;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    case "DELIVERED":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-RW", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const createOrderColumns = ({
  onViewDetails,
  currentPage,
  pageSize,
}: OrderColumnsProps): ColumnDef<TraderOrder>[] => [
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
    accessorKey: "orderNumber",
    header: "Order Number",
    cell: ({ row }) => (
      <span className="text-xs font-bold text-blue-600">{row.original.orderNumber}</span>
    ),
  },
  {
    accessorKey: "restaurant",
    header: "Restaurant",
    cell: ({ row }) => {
      const restaurant = row.original.restaurant;
      return (
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-900">{restaurant.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: "order Amount",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <span className="text-xs font-bold text-green-600">
          {row.original.totalAmount.toLocaleString()} RWF
        </span>
      </div>
    ),
  },
  {
    accessorKey: "Voucher",
    header: "Voucher",
    cell: ({ row }) => {
      const voucher = row.original.Voucher;
      return voucher ? (
        <div className="bg-blue-50 px-2 py-1 rounded">
          <p className="text-xs font-bold text-blue-600">{voucher.voucherCode}</p>
          <p className="text-xs text-blue-600">{voucher.discountPercentage}% Off</p>
        </div>
      ) : (
        <span className="text-xs text-gray-500">No Voucher</span>
      );
    },
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
    accessorKey: "createdAt",
    header: "Order Date",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-900">
          {formatDate(row.original.createdAt)}
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