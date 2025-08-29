/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import type { Product } from "@/app/contexts/product-context";

export const getInventoryColumns = (
  onView: (product: Product) => void,
  onEdit: (product: Product) => void,
  onDelete: (productId: string) => void
): ColumnDef<Product>[] => [
  {
    accessorKey: "productName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Product Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-lg overflow-hidden border">
            <Image
              src={
                product.images?.[0] ||
                "/placeholder.svg?height=48&width=48&query=product"
              }
              alt={product.productName}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {product.productName}
            </span>
            <span className="text-sm text-gray-500">SKU: {product.sku}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const category = row.getValue("category") as any;
      let categoryName = "Unknown";

      if (category) {
        if (typeof category === "string") {
          categoryName = category;
        } else if (category.name && typeof category.name === "string") {
          categoryName = category.name;
        }
      }

      return <div>{categoryName.toLowerCase().replace(/_/g, " ")}</div>;
    },
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const quantity = row.getValue("quantity") as number;
      const unit = row.original.unit;

      // Determine status
      let status = "Out of Stock";
      if (quantity > 50) status = "In Stock";
      else if (quantity > 0) status = "Low Stock";

      // Pick styles
      const statusClasses =
        status === "In Stock"
          ? "text-green-700"
          : status === "Low Stock"
          ? "text-yellow-700"
          : "text-red-700";

      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {quantity} {unit}
          </span>
          <span className={`text-sm font-medium ${statusClasses}`}>
            {status}
          </span>
        </div>
      );
    },
  },

  {
    accessorKey: "purchasePrice",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const purchasePrice = row.getValue("purchasePrice") as number;
      const unit = row.original.unit;
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {purchasePrice.toLocaleString()} RWF
          </span>
          <span className="text-sm text-gray-500">per {unit}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "unitPrice",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = row.getValue("unitPrice") as number;
      const unit = row.original.unit;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{price.toLocaleString()} RWF</span>
          <span className="text-sm text-gray-500">per {unit}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "expiryDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Expiry Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const expiryDate = row.getValue("expiryDate") as Date | null;
      if (!expiryDate) return <span className="text-gray-400">No expiry</span>;

      const isExpiringSoon =
        new Date(expiryDate).getTime() - new Date().getTime() <
        7 * 24 * 60 * 60 * 1000;
      const isExpired = new Date(expiryDate) < new Date();

      return (
        <span
          className={`${
            isExpired
              ? "text-red-600"
              : isExpiringSoon
              ? "text-yellow-600"
              : "text-gray-900"
          }`}
        >
          {new Date(expiryDate).toLocaleDateString()}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;

      return (
        <Badge
          variant={status === "ACTIVE" ? "default" : "secondary"}
          className={
            status === "ACTIVE"
              ? "bg-green-100 text-green-700 hover:bg-green-100"
              : "bg-gray-100 text-gray-800 hover:bg-gray-100"
          }
        >
          {status}
        </Badge>
      );
    },
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const product = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onView(product)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(product)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(product.id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
