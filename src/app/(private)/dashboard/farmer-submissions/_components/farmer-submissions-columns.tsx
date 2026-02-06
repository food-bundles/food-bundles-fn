"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Trash2,
  XCircle,
  CheckCircle,
  MoreHorizontal,
  CheckIcon,
} from "lucide-react";
import { CiEdit } from "react-icons/ci";
import { FarmerSubmission } from "@/app/contexts/submission-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateTime } from "@/lib/reusableFunctions";

// Helper functions
const getStatusColor = (status: string) => {
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
  if (amount === null) return "-";
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
  }).format(amount);
};

const formatLocation = (submission: FarmerSubmission) => {
  return `${submission.village}, ${submission.cell}, ${submission.sector}`;
};


const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-RW", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Create comprehensive admin columns showing all fields
export function getAdminSubmissionColumns(
  onOpenModal: (
    submission: FarmerSubmission,
    mode: "view" | "verify" | "edit"
  ) => void,
  onApproveSubmission: (submissionId: string) => void
): ColumnDef<FarmerSubmission>[] {
  return [
    // Selection column
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

    // Submission ID
    {
      accessorKey: "NoAdditional Details",
      header: "No",
      cell: ({ row}) => (
        <div className="font-mono text-xs">
          {row.index + 1}
        </div>
      ),
    },

    // Farmer Information
    {
      accessorKey: "farmer",
      id: "farmerInfo",
      header: "Farmer",
      cell: ({ row }) => {
        const farmer = row.original.farmer;
        const farmerName = farmer.email?.split("@")[0] || "Unknown";

        return (
          <div className="flex items-center space-x-3">
            <div className="flex flex-col">
              <span className="font-medium">{farmerName}</span>
              <span className="text-xs text-gray-500">{farmer.phone}</span>
              <span className="text-xs text-gray-400">{farmer.email}</span>
            </div>
          </div>
        );
      },
    },

    // Product Information
    {
      accessorKey: "productName",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.productName}</span>
          {row.original.categoryId && (
            <span className="text-xs text-gray-500">
              {"unknown"}
            </span>
          )}
        </div>
      ),
    },

    // Quantities
    {
      accessorKey: "quantities",
      header: "Quantities (kg)",
      cell: ({ row }) => (
        <div className="flex flex-col space-y-1">
          <div className="text-sm">
            <span className="text-gray-600">Submitted:</span>
            <span className="font-medium ml-1">
              {row.original.submittedQty}
            </span>
          </div>
          {row.original.acceptedQty && (
            <div className="text-sm">
              <span className="text-gray-600">Accepted:</span>
              <span className="font-medium ml-1 text-green-600">
                {row.original.acceptedQty}
              </span>
            </div>
          )}
        </div>
      ),
    },

    // Prices
    {
      accessorKey: "prices",
      header: "Prices (RWF/kg)",
      cell: ({ row }) => (
        <div className="flex flex-col space-y-1">
          <div className="text-sm">
            <span className="text-gray-600">Wished:</span>
            <span className="font-medium ml-1">{row.original.wishedPrice}</span>
          </div>
          {row.original.acceptedPrice && (
            <div className="text-sm">
              <span className="text-gray-600">Accepted:</span>
              <span className="font-medium ml-1 text-green-600">
                {row.original.acceptedPrice}
              </span>
            </div>
          )}
        </div>
      ),
    },

    // Total Amount
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ row }) => (
        <span className="font-medium">
          {formatCurrency(row.original.totalAmount)}
        </span>
      ),
    },

    // Location
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <div className="max-w-37.5">
          <div className="font-medium text-sm">{row.original.province}</div>
          <div className="text-xs text-gray-500">{row.original.district}</div>
          <div className="text-xs text-gray-400 truncate">
            {formatLocation(row.original)}
          </div>
        </div>
      ),
    },

    // Status
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex flex-col space-y-1">
          <Badge className={getStatusColor(row.original.status)}>
            {row.original.status}
          </Badge>
        </div>
      ),
    },

    // Farmer Feedback Status
    {
      accessorKey: "Farmer Reaction",
      header: "Farmer's Reaction",
      cell: ({ row }) => (
        <Badge
          className={getStatusColor(
            row.original.farmerFeedbackStatus || "PENDING"
          )}
        >
          {row.original.farmerFeedbackStatus || "PENDING"}
        </Badge>
      ),
    },

    // Aggregator
    {
      accessorKey: "Verified By",
      header: "Verified By",
      cell: ({ row }) => {
        const aggregator = row.original.aggregator;
        if (!aggregator) return <span className="text-gray-400">-</span>;

        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm">{aggregator.username}</span>
            <span className="text-xs text-gray-500">{aggregator.phone}</span>
          </div>
        );
      },
    },

    // Dates - Submitted
    {
      accessorKey: "submittedAt",
      header: "Submitted",
      cell: ({ row }) => (
        <span className="text-sm">
          {formatDateTime(row.original.submittedAt)}
        </span>
      ),
    },

    // More details dropdown (for fields that don't need to be always visible)
    {
      id: "moreDetails",
      header: "Details",
      cell: ({ row }) => {
        const submission = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="p-2 space-y-2">
                <div className="text-sm font-medium">Additional Details</div>

                {submission.verifiedAt && (
                  <div className="text-xs">
                    <span className="text-gray-600">Verified:</span>{" "}
                    {formatDate(submission.verifiedAt)}
                  </div>
                )}

                {submission.approvedAt && (
                  <div className="text-xs">
                    <span className="text-gray-600">Approved:</span>{" "}
                    {formatDate(submission.approvedAt)}
                  </div>
                )}

                {submission.paidAt && (
                  <div className="text-xs">
                    <span className="text-gray-600">Paid:</span>{" "}
                    {formatDate(submission.paidAt)}
                  </div>
                )}

                {submission.farmerFeedbackAt && (
                  <div className="text-xs">
                    <span className="text-gray-600">Feedback:</span>{" "}
                    {formatDate(submission.farmerFeedbackAt)}
                  </div>
                )}

                {submission.feedbackDeadline && (
                  <div className="text-xs">
                    <span className="text-gray-600">Deadline:</span>{" "}
                    {formatDate(submission.feedbackDeadline)}
                  </div>
                )}

                {submission.farmerCounterOffer && (
                  <div className="text-xs">
                    <span className="text-gray-600">Counter Offer:</span>{" "}
                    {formatCurrency(submission.farmerCounterOffer)}
                  </div>
                )}

                {submission.farmerCounterQty && (
                  <div className="text-xs">
                    <span className="text-gray-600">Counter Qty:</span>{" "}
                    {submission.farmerCounterQty} kg
                  </div>
                )}

                {submission.farmerFeedbackNotes && (
                  <div className="text-xs">
                    <span className="text-gray-600">Notes:</span>
                    <p className="mt-1 text-gray-800">
                      {submission.farmerFeedbackNotes}
                    </p>
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },

    // Actions column
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const submission = row.original;

        return (
          <div className="flex items-center space-x-1">
            {/* Approve Submission Button - Changed from Eye to ThumbsUp icon */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-green-600 hover:text-green-800 hover:bg-blue-50"
              onClick={() => onApproveSubmission(submission.id)}
              title="Approve submission"
              disabled={
                submission.status === "APPROVED" || submission.status === "PAID"
              }
            >
              <CheckIcon className="h-6 w-6 text-green-600" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              onClick={() => onOpenModal(submission, "edit")}
              title="Edit submission"
            >
              <CiEdit className="h-4 w-4" />
            </Button>

            {submission.status === "PENDING" && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => onOpenModal(submission, "verify")}
                  title="Verify submission"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Reject submission"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete submission"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}