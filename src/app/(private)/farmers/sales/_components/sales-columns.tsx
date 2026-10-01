"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { FarmerSubmission } from "@/app/contexts/submission-context";
import { formatRwf } from "@/lib/currency";

/** Maps a submission status to the Badge color used across the app (PAID = purple, matches the admin submissions table). */
const getStatusColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case "ACCEPTED":
    case "APPROVED":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "REJECTED":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "VERIFIED":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "PAID":
      return "bg-purple-100 text-purple-800 hover:bg-purple-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

const formatCurrency = (amount: number | null) => {
  if (amount === null || amount === undefined) return "-";
  return formatRwf(amount);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-RW", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/** Columns for a farmer's own sales/submissions table, focused on payment status rather than admin verification actions. */
export const salesColumns: ColumnDef<FarmerSubmission>[] = [
  {
    id: "no",
    header: "No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "productName",
    header: "Product",
    cell: ({ row }) => (
      <span className="font-medium text-sm">{row.original.productName}</span>
    ),
  },
  {
    accessorKey: "quantities",
    header: "Quantity",
    cell: ({ row }) => (
      <div className="flex flex-col text-sm">
        <span>
          Submitted: <span className="font-medium">{row.original.submittedQty}</span>
        </span>
        {row.original.acceptedQty !== null && (
          <span className="text-green-700">
            Accepted: <span className="font-medium">{row.original.acceptedQty}</span>
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
    cell: ({ row }) => (
      <span className="font-medium">{formatCurrency(row.original.totalAmount)}</span>
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
    accessorKey: "submittedAt",
    header: "Submitted",
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.original.submittedAt)}</span>
    ),
  },
  {
    accessorKey: "paidAt",
    header: "Paid On",
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.original.paidAt)}</span>
    ),
  },
];
