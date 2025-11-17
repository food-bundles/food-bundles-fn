"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, FileText } from "lucide-react";
import { ArrowUpDown } from "lucide-react";

export type Sale = {
  saleId: string;
  restaurantId: string;
  restaurantName: string;
  orderId: string;
  products: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  paymentMethod: "POS" | "Mobile Money" | "Bank";
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: string;
  restaurantDetails?: {
    phone: string;
    email: string;
    location: string;
  };
  paymentReference?: string;
  deliveryStatus?: string;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "FAILED":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "FRW",
  }).format(amount);
};

const formatProducts = (products: Sale["products"]) => {
  if (products.length <= 2) {
    return products.map((p) => p.name).join(", ");
  }

  const displayProducts = products
    .slice(0, 1)
    .map((p) => p.name)
    .join(", ");
  const remaining = products.length - 2;
  return `${displayProducts} +${remaining} more`;
};

export const salesColumns: ColumnDef<Sale>[] = [
  {
    accessorKey: "restaurantName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Restaurant Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const restaurantName = row.getValue("restaurantName") as string;
      return <div className="font-medium text-gray-900">{restaurantName}</div>;
    },
  },
  {
    accessorKey: "orderId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Order Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const orderId = row.getValue("orderId") as string;
      return <div className="font-mono text-sm text-gray-600">#{orderId}</div>;
    },
  },
  {
    accessorKey: "products",
    header: "Products",
    cell: ({ row }) => {
      const products = row.getValue("products") as Sale["products"];
      return (
        <div className="max-w-[200px]">
          <span className="text-sm text-gray-700">
            {formatProducts(products)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Total Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = row.getValue("totalAmount") as number;
      return (
        <div className="font-semibold text-gray-900">
          {formatCurrency(amount)}
        </div>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;
      return <Badge className={getStatusColor(status)}>{status}</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return (
        <div className="text-sm text-gray-600">
          {new Date(date).toLocaleDateString()}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const sale = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                console.log("View sale details:", sale.saleId)
              }
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log("View invoice:", sale.saleId)}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
