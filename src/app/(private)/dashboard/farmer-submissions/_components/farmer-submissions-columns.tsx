"use client";

import type { ColumnDef } from "@tanstack/react-table";
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
import {
  agreedPriceOf,
  askedPriceOf,
  FarmerSubmission,
  farmerDisplayName,
} from "@/app/contexts/submission-context";
import { StageProgress } from "./SubmissionStageModals";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateTime } from "@/lib/reusableFunctions";


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
export interface SubmissionColumnActions {
  onApprove: (submission: FarmerSubmission) => void; // stage 2: approve / counter offer
  onVerify: (submission: FarmerSubmission) => void; // stage 3: verify face to face
  onPay: (submission: FarmerSubmission) => void; // stage 4: pay the farmer
  onReject: (submission: FarmerSubmission) => void;
  onDelete: (submission: FarmerSubmission) => void;
  onReverseStatus: (submission: FarmerSubmission) => void;
  onViewHistory: (submission: FarmerSubmission) => void;
  // Farmer submissions permission check for one action ("approve", "verify"…);
  // hides actions the user's role can't do. Omitted = everything allowed.
  can?: (action: string) => boolean;
}

export function getAdminSubmissionColumns({
  onApprove,
  onVerify,
  onPay,
  onReject,
  onDelete,
  onReverseStatus,
  onViewHistory,
  can = () => true,
}: SubmissionColumnActions): ColumnDef<FarmerSubmission>[] {
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

    // Prices: asked, Food Bundles, offer / agreed
    {
      accessorKey: "prices",
      header: "Prices (RWF/unit)",
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex flex-col space-y-0.5 text-sm">
            <div>
              <span className="text-gray-600">Asks:</span>
              <span className="font-medium ml-1">{askedPriceOf(s).toLocaleString()}</span>
              {s.farmerCounterOffer != null && (
                <span className="ml-1 text-xs text-amber-700">(new price)</span>
              )}
            </div>
            {s.foodBundlesPrice != null && (
              <div>
                <span className="text-gray-600">Food Bundles:</span>
                <span className="font-medium ml-1">{s.foodBundlesPrice.toLocaleString()}</span>
              </div>
            )}
            {s.status === "NEGOTIATING" && s.counterOfferPrice != null && (
              <div>
                <span className="text-gray-600">Offered:</span>
                <span className="font-medium ml-1 text-amber-700">{s.counterOfferPrice.toLocaleString()}</span>
              </div>
            )}
            {["APPROVED", "VERIFIED", "PAID"].includes(s.status) && (
              <div>
                <span className="text-gray-600">Agreed:</span>
                <span className="font-medium ml-1 text-green-600">
                  {(s.acceptedPrice ?? agreedPriceOf(s)).toLocaleString()}
                </span>
              </div>
            )}
            {s.totalAmount != null && s.status !== "NEGOTIATING" && s.status !== "REJECTED" && (
              <div className="pt-0.5">
                <span className="text-gray-600">Total:</span>
                <span className="ml-1 font-bold text-gray-900">{s.totalAmount}</span>
              </div>
            )}
          </div>
        );
      },
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

    // Stage: Submitted → Approved → Verified → Paid
    {
      accessorKey: "status",
      header: "Stage",
      cell: ({ row }) => <StageProgress status={row.original.status} />,
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

                <div className="rounded-md bg-gray-50 p-2 text-xs">
                  <div className="font-medium text-gray-900">
                    {farmerDisplayName(submission.farmer)}
                  </div>
                  {submission.farmer?.phone && (
                    <div className="text-gray-600">{submission.farmer.phone}</div>
                  )}
                  {submission.farmer?.email && (
                    <div className="text-gray-500">{submission.farmer.email}</div>
                  )}
                </div>

                <div className="text-xs">
                  <span className="text-gray-600">Submitted:</span>{" "}
                  {formatDateTime(submission.submittedAt)}
                </div>

                {submission.aggregator && (
                  <div className="text-xs">
                    <span className="text-gray-600">Verified by:</span>{" "}
                    {submission.aggregator.username}
                    {submission.aggregator.phone ? ` · ${submission.aggregator.phone}` : ""}
                  </div>
                )}

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

        const hasActivePayout = (submission.payouts || []).some((p) =>
          ["PENDING", "PROCESSING", "COMPLETED"].includes(p.status)
        );

        // Only the next step of the current stage is offered
        const stage = submission.status;
        const actions = [
          {
            key: "approve",
            label: "Approve / set price",
            icon: <CheckIcon className="h-4 w-4 text-green-600" />,
            show: stage === "PENDING" && can("approve"),
            onSelect: () => onApprove(submission),
          },
          {
            key: "verify",
            label: "Verify (weigh & record)",
            icon: <CheckCircle className="h-4 w-4 text-green-600" />,
            show: stage === "APPROVED" && can("verify"),
            onSelect: () => onVerify(submission),
          },
          {
            key: "payout",
            label: "Pay farmer",
            icon: <Wallet className="h-4 w-4 text-purple-600" />,
            show: stage === "VERIFIED" && !hasActivePayout && can("request_payout"),
            onSelect: () => onPay(submission),
          },
          {
            key: "reject",
            label: stage === "NEGOTIATING" ? "Withdraw offer & reject" : "Reject submission",
            icon: <XCircle className="h-4 w-4 text-red-600" />,
            show: ["PENDING", "NEGOTIATING", "APPROVED"].includes(stage) && can("reject"),
            onSelect: () => onReject(submission),
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
            show: stage !== "PENDING" && can("reverse_status"),
            onSelect: () => onReverseStatus(submission),
          },
        ].filter((action) => action.show);
        const canDelete = (stage === "PENDING" || stage === "REJECTED") && can("delete");
        const waitingNote =
          stage === "NEGOTIATING"
            ? "Counter-offer sent. The farmer accepts, declines or proposes a price."
            : stage === "VERIFIED" && hasActivePayout
              ? "MoMo payment in progress. Confirm it in the history."
              : null;

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
              {waitingNote && (
                <p className="px-2 pt-1 pb-1.5 text-[11px] text-amber-700">{waitingNote}</p>
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