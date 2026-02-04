"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { Product } from "@/app/contexts/product-context";

export const getInventoryColumns = (
  onManage: (product: Product) => void,
  onStatusClick?: (product: Product) => void
): ColumnDef<Product>[] => [
  {
    id: "index",
    header: "#",
    cell: ({ row }) => {
      return (
        <div className="text-xs text-gray-900">
          {row.index + 1}
        </div>
      );
    },
  },
  {
    accessorKey: "productName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 text-xs"
        >
          Product Name
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
            <span className="text-xs text-gray-900">
              {product.productName}
            </span>
            <span className="text-xs text-gray-600">
              SKU: {product.sku}
            </span>
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
          className="h-auto p-0 text-xs"
        >
          Category
        </Button>
      );
    },
    cell: ({ row }) => {
      const product = row.original;
      const categoryName = product.category?.name || "Unknown";
      return <div className="text-xs text-gray-900">{categoryName}</div>;
    },
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 text-xs"
        >
          Stock
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
          <span className="text-xs text-gray-900">
            {quantity} {unit}
          </span>
          <span className={`text-xs ${statusClasses}`}>
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
          className="h-auto p-0 text-xs"
        >
          purchase Price
        </Button>
      );
    },
    cell: ({ row }) => {
      const purchasePrice = row.getValue("purchasePrice") as number;
      const unit = row.original.unit;
      return (
        <div className="flex flex-col">
          <span className="text-xs text-gray-900">
            {(purchasePrice || 0).toLocaleString()} RWF
          </span>
          <span className="text-xs text-gray-600">per {unit}</span>
        </div>
      );
    },
  },
  {    accessorKey: "unitPrice",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 text-xs"
        >
          Unit Price
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = row.getValue("unitPrice") as number;
      const unit = row.original.unit;
      return (
        <div className="flex flex-col">
          <span className="text-xs text-gray-900">{(price || 0).toLocaleString()} RWF</span>
          <span className="text-xs text-gray-600">per {unit}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "restaurantPrice",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 text-xs"
        >
          Restaurant Price
        </Button>
      );
    },
    cell: ({ row }) => {
      const restaurantPrice = row.original.restaurantPrice;
      const unit = row.original.unit;
      return (
        <div className="flex flex-col">
          <span className="text-xs text-gray-900">
            {restaurantPrice !== null && restaurantPrice !== undefined ? `${restaurantPrice.toLocaleString()} RWF` : 'N/A'}
          </span>
          {restaurantPrice !== null && restaurantPrice !== undefined && <span className="text-xs text-gray-600">per {unit}</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "hotelPrice",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 text-xs"
        >
          Hotel Price
        </Button>
      );
    },
    cell: ({ row }) => {
      const hotelPrice = row.original.hotelPrice;
      const unit = row.original.unit;
      return (
        <div className="flex flex-col">
          <span className="text-xs text-gray-900">
            {hotelPrice !== null && hotelPrice !== undefined ? `${hotelPrice.toLocaleString()} RWF` : 'N/A'}
          </span>
          {hotelPrice !== null && hotelPrice !== undefined && <span className="text-xs text-gray-600">per {unit}</span>}
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
          className="h-auto p-0 text-xs"
        >
          Expiry Date 
        </Button>
      );
    },
    cell: ({ row }) => {
      const expiryDate = row.getValue("expiryDate") as Date | null;
      if (!expiryDate)
        return <span className="text-xs text-gray-600">No expiry</span>;

      const isExpiringSoon =
        new Date(expiryDate).getTime() - new Date().getTime() <
        7 * 24 * 60 * 60 * 1000;
      const isExpired = new Date(expiryDate) < new Date();

      return (
        <span
          className={`text-xs ${
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
      const product = row.original;

      return (
        <Badge
          variant={status === "ACTIVE" ? "default" : "secondary"}
          className={ 
            status === "ACTIVE" 
              ? "bg-green-100 text-green-800 hover:text-green-900 hover:bg-green-200 cursor-pointer"
              : "bg-red-100 text-red-800 hover:text-red-900 hover:bg-red-200 cursor-pointer"
          }
          onClick={() => onStatusClick?.(product)}
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
           <Button
             variant="ghost"
             size="sm"
             onClick={() => onManage(product)}
             className="flex items-center gap-2 text-xs"
           >
             view
           </Button>
         );
    },
  },
];
