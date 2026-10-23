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
  Undo2,
  Wallet,
  History,
} from "lucide-react";
import { CiEdit } from "react-icons/ci";
import { FarmerSubmission, farmerDisplayName } from "@/app/contexts/submission-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  onApproveSubmission: (submissionId: string) => void,
  onReject: (submission: FarmerSubmission) => void,
  onDelete: (submission: FarmerSubmission) => void,
  onForceComplete: (submission: FarmerSubmission) => void,
  onPayout: (submission: FarmerSubmission) => void,
  onReverseStatus: (submission: FarmerSubmission) => void,
  onViewHistory: (submission: FarmerSubmission) => void,
  // Farmer submissions permission check for one action ("approve", "verify"…);
  // hides actions the user's role can't do. Omitted = everything allowed.
  can: (action: string) => boolean = () => true
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
        const farmerName = farmerDisplayName(farmer);

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

    // Farmer Counter Offer
    {
      accessorKey: "farmerCounterOffer",
      header: "Counter Offer (RWF/kg)",
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {formatCurrency(row.original.farmerCounterOffer)}
        </span>
      ),
    },

    // Farmer Counter Quantity
    {
      accessorKey: "farmerCounterQty",
      header: "Counter Qty (kg)",
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original.farmerCounterQty ?? "-"}
        </span>
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

    // Actions column: one ⋮ menu with every action (icon + name). Actions
    // show only when the submission's status allows them and the user's role
    // has the permission.
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const submission = row.original;
        const isLocked =
          submission.status === "APPROVED" || submission.status === "PAID";

        const hasActivePayout = (submission.payouts || []).some((p) =>
          ["PENDING", "PROCESSING", "COMPLETED"].includes(p.status)
        );

        const actions = [
          {
            key: "verify",
            label: "Verify submission",
            icon: <CheckCircle className="h-4 w-4 text-green-600" />,
            show: submission.status === "PENDING" && can("verify"),
            onSelect: () => onOpenModal(submission, "verify"),
          },
          {
            key: "approve",
            label: "Approve submission",
            icon: <CheckIcon className="h-4 w-4 text-green-600" />,
            show: !isLocked && can("approve"),
            onSelect: () => onApproveSubmission(submission.id),
          },
          {
            key: "force",
            label: "Force complete",
            icon: <CheckCircle className="h-4 w-4 text-blue-600" />,
            show: submission.status === "VERIFIED" && can("force_complete"),
            onSelect: () => onForceComplete(submission),
          },
          {
            key: "payout",
            label: "Pay farmer",
            icon: <Wallet className="h-4 w-4 text-purple-600" />,
            show: submission.status === "APPROVED" && !hasActivePayout && can("request_payout"),
            onSelect: () => onPayout(submission),
          },
          {
            key: "edit",
            label: "Edit submission",
            icon: <CiEdit className="h-4 w-4 text-gray-700" />,
            show: can("edit"),
            onSelect: () => onOpenModal(submission, "edit"),
          },
          {
            key: "history",
            label: "Payout & status history",
            icon: <History className="h-4 w-4 text-indigo-600" />,
            show: true,
            onSelect: () => onViewHistory(submission),
          },
          {
            key: "reverse",
            label: "Move status back",
            icon: <Undo2 className="h-4 w-4 text-amber-600" />,
            show: can("reverse_status"),
            onSelect: () => onReverseStatus(submission),
          },
          {
            key: "reject",
            label: "Reject submission",
            icon: <XCircle className="h-4 w-4 text-red-600" />,
            show: ["PENDING", "VERIFIED"].includes(submission.status) && can("reject"),
            onSelect: () => onReject(submission),
          },
        ].filter((action) => action.show);
        const canDelete = !isLocked && can("delete");

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="Open actions"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs text-gray-500">Actions</DropdownMenuLabel>
              {actions.map((action) => (
                <DropdownMenuItem
                  key={action.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onSelect();
                  }}
                  className="gap-2 text-sm cursor-pointer"
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              ))}
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(submission);
                    }}
                    className="gap-2 text-sm text-red-600 focus:text-red-700 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete submission
                  </DropdownMenuItem>
                </>
              )}
              {isLocked && (
                <p className="px-2 pt-1 pb-1.5 text-[11px] text-gray-500">
                  Approved and paid submissions can&apos;t be approved again or deleted.
                </p>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}