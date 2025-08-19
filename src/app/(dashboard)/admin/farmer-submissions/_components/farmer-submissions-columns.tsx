"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { CiEdit } from "react-icons/ci";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type FarmerSubmission = {
  id: string;
  farmerName: string;
  farmerAvatar: string;
  location: string;
  product: string;
  productIcon: string;
  quantity: string;
  proposedPrice: string;
  acceptedQtyPrice: string;
  aggregatorName: string;
  status: "Pending" | "Accepted" | "Rejected";
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Accepted":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "Rejected":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "Pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

export const farmerSubmissionsColumns: ColumnDef<FarmerSubmission>[] = [
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
    accessorKey: "farmerName",
    header: "Farmer Name",
    cell: ({ row }) => (
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={row.original.farmerAvatar || "/placeholder.svg"} />
          <AvatarFallback>
            {row.original.farmerName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{row.original.farmerName}</span>
      </div>
    ),
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <span className="text-lg">{row.original.productIcon}</span>
        <span>{row.original.product}</span>
      </div>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Qty",
  },
  {
    accessorKey: "proposedPrice",
    header: "Proposed Price",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.proposedPrice}</span>
    ),
  },
  {
    accessorKey: "acceptedQtyPrice",
    header: "Accepted Qty/Price",
    cell: ({ row }) => <span>{row.original.acceptedQtyPrice || "-"}</span>,
  },
  {
    accessorKey: "aggregatorName",
    header: "Aggregator Name",
    cell: ({ row }) => <span>{row.original.aggregatorName || "-"}</span>,
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
    id: "actions",
    header: "Actions",
    cell: () => (
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <CiEdit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
