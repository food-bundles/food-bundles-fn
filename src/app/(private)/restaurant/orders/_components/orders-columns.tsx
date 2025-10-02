/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Copy, Check, RefreshCw } from "lucide-react";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "ready"
  | "delivered"
  | "cancelled"
  | "refunded";

export type Order = {
  id: string;
  orderId: string;
  customerName: string;
  orderedDate: string;
  items: string;
  totalAmount: number;
  deliveryAddress: string;
  status: OrderStatus;
  originalData?: any;
};

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "confirmed":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "processing":
      return "bg-orange-100 text-orange-800 hover:bg-orange-200";
    case "ready":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200";
    case "delivered":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "cancelled":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "refunded":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

const isMapCoordinates = (address: string): boolean => {
  if (!address) return false;

  const coordPattern = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/;
  const labeledCoordPattern = /(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/;

  return coordPattern.test(address.trim()) || labeledCoordPattern.test(address);
};

const extractCoordinates = (address: string): string => {
  const match = address.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
  return match ? `${match[1]}, ${match[2]}` : address;
};

// Component for copy button with state
const CopyButton = ({ coordinates }: { coordinates: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coordinates);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy coordinates");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0 hover:bg-gray-100 flex-shrink-0"
      onClick={handleCopy}
    >
      {copied ? (
        <div className="flex items-center ml-3">
          <Check className="h-3 w-3 text-green-600" />{" "}
          <p className="text-[8px]">Copied</p>
        </div>
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );
};

export const ordersColumns = (
  onView: (order: Order) => void,
  onReorder: (orderId: string) => void
): ColumnDef<Order>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "orderId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium text-[13px]"
        >
          Order ID
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium text-blue-600">
        #{row.getValue("orderId")}
      </div>
    ),
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Name
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("customerName")}</div>
    ),
  },
  {
    accessorKey: "orderedDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium text-[13px]"
        >
          Order Date
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("orderedDate")}</div>,
  },
  {
    accessorKey: "items",
    header: "Items",
    cell: ({ row }) => (
      <div
        className="font-medium max-w-[200px] truncate"
        title={row.getValue("items")}
      >
        {row.getValue("items")}
      </div>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium text-[13px]"
        >
          Total Amount
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium text-green-600">
        {row.getValue("totalAmount")} Rwf
      </div>
    ),
  },
  {
    accessorKey: "deliveryAddress",
    header: "Delivery Address",
    cell: ({ row }) => {
      const address = row.getValue("deliveryAddress") as string;
      const isCoordinates = isMapCoordinates(address);
      const coordinates = isCoordinates ? extractCoordinates(address) : "";

      return (
        <div className="flex items-center gap-2 max-w-[200px]">
          <div
            className="truncate"
            title={isCoordinates ? coordinates : address}
          >
            {isCoordinates ? (
              <span className="text-[13px]">Map Location</span>
            ) : (
              address
            )}
          </div>
          {isCoordinates && <CopyButton coordinates={coordinates} />}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as OrderStatus;
      return (
        <Badge className={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const order = row.original;
      console.log("Rendering actions for order:", order.id); // Debug log

      return (
        <div className="flex items-center gap-2">
          <button
            className=" p-0 cursor-pointer "
            onClick={() => {
              console.log("Reorder clicked for:", order.id);
              onReorder(order.id);
            }}
            title="Reorder"
          >
            <span className="h-4 w-4 text-green-600 text-[12px]" >
              Reoder
            </span>
          </button>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
