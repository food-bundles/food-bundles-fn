"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal, Trash2, FileText, Edit3, Send, ChevronLeft, ChevronRight } from "lucide-react";

// Helper function to get payment method colors
const getPaymentMethodColor = (method: string) => {
  switch (method.toLowerCase()) {
    case 'cash':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'card':
    case 'credit_card':
    case 'debit_card':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'mobile_money':
    case 'momo':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'voucher':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'bank_transfer':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

// Helper function to get order status colors
const getOrderStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'PREPARING':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'READY':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'IN_TRANSIT':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'DELIVERED':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'REFUNDED':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

// Helper function to get payment status colors
const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'COMPLETED':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'VOUCHER_CREDIT':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'FAILED':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'REFUNDED':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface Order {
  id: string;
  orderNumber: string;
  restaurantId: string;
  totalAmount: number;
  originalAmount?: number;
  deliveryFee?: number;
  packagingFee?: number;
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "READY" |"IN_TRANSIT" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  paymentStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "VOUCHER_CREDIT" | "FAILED" | "CANCELLED" | "REFUNDED";
  paymentMethod: "CASH" | "MOBILE_MONEY" | "CARD" | "BANK_TRANSFER"| "VOUCHER";
  billingName: string;
  billingPhone: string;
  billingEmail: string;
  billingAddress: string;
  notes?: string;
  requestedDelivery?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
  restaurant: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  orderItems: Array<{
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    unit: string;
    images: string[];
    category: string;
  }>;
  _count: {
    orderItems: number;
  };
}

// Order status flow — the stepper moves one step forward/back along it
const ORDER_STATUS_FLOW: Order["status"][] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "IN_TRANSIT",
  "DELIVERED",
];

// Paid = completed, or paid with voucher credit
const PAID_STATUSES = ["COMPLETED", "VOUCHER_CREDIT"];
const isPaid = (paymentStatus: string) => PAID_STATUSES.includes(paymentStatus);

type Steps = { prev: string | null; next: string | null };

// The order status only moves once the payment is completed. A cancelled
// order can be reactivated: Next moves it to Confirmed, Back to Pending.
const getOrderSteps = (order: Order): Steps => {
  if (!isPaid(order.paymentStatus)) return { prev: null, next: null };
  if (order.status === "CANCELLED") return { prev: "PENDING", next: "CONFIRMED" };
  const index = ORDER_STATUS_FLOW.indexOf(order.status);
  return {
    prev: index > 0 ? ORDER_STATUS_FLOW[index - 1] : null,
    next: index >= 0 && index < ORDER_STATUS_FLOW.length - 1 ? ORDER_STATUS_FLOW[index + 1] : null,
  };
};

// Payment moves forward Pending → Processing → Completed. Back always goes to
// Failed, from any status. A failed (or cancelled) payment can be marked
// Completed when the restaurant did pay. Voucher credit and refunds are fixed.
const PAYMENT_STEPS: Record<string, Steps> = {
  PENDING: { prev: "FAILED", next: "PROCESSING" },
  PROCESSING: { prev: "FAILED", next: "COMPLETED" },
  COMPLETED: { prev: "FAILED", next: null },
  FAILED: { prev: null, next: "COMPLETED" },
  CANCELLED: { prev: "FAILED", next: "COMPLETED" },
};

// Orders still being processed go back to Pending when the payment stops
// being completed (the backend does the same)
const ORDER_RESET_ON_UNPAID = ["CONFIRMED", "PREPARING", "READY", "IN_TRANSIT"];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  VOUCHER_CREDIT: "V Credit",
  FAILED: "Failed",
};

const getStatusLabel = (status: string) => STATUS_LABELS[status] || status;

// Status Stepper Component: [back] badge [next], each step confirmed via dialog
function StatusStepper({ currentStatus, steps, lockedReason, getWarning, canManage = true, orderId, restaurantName, kind, getColor, onUpdate }: {
  currentStatus: string;
  steps: Steps;
  // Shown on hover when the stepper is locked (e.g. payment not completed)
  lockedReason?: string;
  // Extra note in the confirmation dialog for a given target status
  getWarning?: (status: string) => string | null;
  canManage?: boolean;
  orderId: string;
  restaurantName: string;
  kind: "order" | "payment";
  getColor: (status: string) => string;
  onUpdate: (orderId: string, status: string) => void;
}) {
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  // Users who cannot manage orders get no arrows
  const prevStatus = canManage ? steps.prev : null;
  const nextStatus = canManage ? steps.next : null;
  const locked = canManage && !!lockedReason && !prevStatus && !nextStatus;
  const warning = pendingStatus && getWarning ? getWarning(pendingStatus) : null;
  const isBackward = pendingStatus !== null && pendingStatus === prevStatus;
  const title = kind === "order" ? "Order Status" : "Payment Status";

  const requestChange = (e: React.MouseEvent, status: string) => {
    e.stopPropagation();
    setPendingStatus(status);
  };

  const confirmUpdate = () => {
    if (pendingStatus) onUpdate(orderId, pendingStatus);
    setPendingStatus(null);
  };

  const stepButtonClass =
    "h-5 w-5 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-green-600 hover:border-green-600 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer";

  return (
    <>
      <div className="flex items-center gap-1" title={locked ? lockedReason : undefined}>
        <button
          type="button"
          title={prevStatus ? `Back to ${getStatusLabel(prevStatus)}` : undefined}
          disabled={!prevStatus}
          onClick={(e) => prevStatus && requestChange(e, prevStatus)}
          className={stepButtonClass}
        >
          <ChevronLeft className="h-3 w-3" />
        </button>
        <span
          className={`w-24 text-center text-[12px] rounded-full border px-2 py-0.5 ${getColor(currentStatus)}`}
        >
          {getStatusLabel(currentStatus)}
        </span>
        <button
          type="button"
          title={nextStatus ? `Move to ${getStatusLabel(nextStatus)}` : undefined}
          disabled={!nextStatus}
          onClick={(e) => nextStatus && requestChange(e, nextStatus)}
          className={stepButtonClass}
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      <AlertDialog open={pendingStatus !== null} onOpenChange={() => {}}>
        <AlertDialogContent className="sm:max-w-md border-2 border-green-500">
          <AlertDialogHeader className="text-center pb-4">
            <AlertDialogTitle className="text-center font-semibold text-gray-900">
              {isBackward ? `Revert ${title}` : `Advance ${title}`}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 mt-3 text-center">
              Are you sure you want to {isBackward ? "move back" : "move"} the{" "}
              {title.toLowerCase()} for{" "}
              <span className="font-semibold text-gray-900">&quot;{restaurantName}&quot;</span> from{" "}
              <span className="font-semibold text-gray-900">&quot;{getStatusLabel(currentStatus)}&quot;</span> to{" "}
              <span className={`font-semibold ${isBackward ? "text-orange-600" : "text-green-700"}`}>
                &quot;{pendingStatus && getStatusLabel(pendingStatus)}&quot;
              </span>
              ?
              {warning && (
                <span className="mt-3 block rounded-md bg-orange-50 border border-orange-200 px-3 py-2 text-[13px] text-orange-800">
                  {warning}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 pt-4">
            <AlertDialogCancel
              onClick={() => setPendingStatus(null)}
              className="flex-1 h-10 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmUpdate}
              className={`flex-1 h-10 text-white ${
                isBackward ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isBackward ? "Move Back" : "Move Forward"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatTime = (date: string | Date) =>
  new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });


export const createOrdersColumns = (actions: {
  onView: (order: Order) => void;
  onDownloadPDF: (order: Order) => void;
  onCancel: (order: Order) => void;
  onDelete: (order: Order) => void;
  onStatusUpdate: (orderId: string, status: string) => void;
  onPaymentStatusUpdate: (orderId: string, paymentStatus: string) => void;
  onEdit?: (order: Order) => void;
  onSendPaymentLink?: (order: Order) => void;
  // Orders permission check for one action ("update_status", "edit"…);
  // hides the matching arrows and menu items. Omitted = everything allowed.
  can?: (action: string) => boolean;
}): ColumnDef<Order>[] => [
  {
    accessorKey: "#",
    header: "#",
    cell: ({ row }) => (
      <div>{row.index + 1}</div>),
  },
  {
    accessorKey: "orderNumber",
    header: "Order",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("orderNumber")}</div>
    ),
  },
  {
    accessorKey: "restaurant.name",
    header: "Restaurant",
    cell: ({ row }) => (
      <div>
        <div className="font-medium truncate max-w-45">
          {row.original.restaurant.name}
        </div>
        <div className="text-[12px] truncate max-w-45 text-gray-800">
          {row.original.restaurant.email}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "billingName",
    header: "Phone Number",
    cell: ({ row }) => (
      <div>
        <div className="text-[12px] text-gray-800 ">
          {row.original.billingPhone}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: "Amount",
    cell: ({ row }) => {
      const order = row.original;
      const totalAmount = row.getValue<number>("totalAmount");
      const originalAmount = order.originalAmount;
      
      return (
        <div className="font-medium">
          {originalAmount && originalAmount !== totalAmount ? (
            <div>
              <div className="text-green-600">
                {totalAmount.toLocaleString()} RWF
              </div>
            </div>
          ) : (
            <div>RWF {totalAmount.toLocaleString()}</div>
          )}
          <div
            className={`text-[12px] lowercase rounded-full border px-2 mt-1 ${getPaymentMethodColor(
              row.original.paymentMethod,
            )}`}
          >
            {row.original.paymentMethod}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Order Status",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <StatusStepper
          currentStatus={order.status}
          steps={getOrderSteps(order)}
          lockedReason={
            isPaid(order.paymentStatus)
              ? undefined
              : "Complete the payment first, then the order status can be changed"
          }
          canManage={actions.can?.("update_status") ?? true}
          kind="order"
          getColor={getOrderStatusColor}
          orderId={order.id}
          restaurantName={order.restaurant.name}
          onUpdate={actions.onStatusUpdate}
        />
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <StatusStepper
          currentStatus={order.paymentStatus}
          steps={PAYMENT_STEPS[order.paymentStatus] ?? { prev: null, next: null }}
          getWarning={(target) =>
            isPaid(order.paymentStatus) &&
            !isPaid(target) &&
            ORDER_RESET_ON_UNPAID.includes(order.status)
              ? `The order status will go back to Pending (now ${getStatusLabel(order.status)}) until the payment is completed again.`
              : null
          }
          canManage={actions.can?.("update_payment_status") ?? true}
          kind="payment"
          getColor={getPaymentStatusColor}
          orderId={order.id}
          restaurantName={order.restaurant.name}
          onUpdate={actions.onPaymentStatusUpdate}
        />
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const date = row.original.createdAt;

      return (
        <div className="text-sm text-gray-700">
          {formatDate(date)}
          <p className="text-xs text-gray-500">{formatTime(date)}</p>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const order = row.original;

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => actions.onView(order)}>
                <Eye className="mr-2 h-4 w-4" />
                View Order
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => actions.onDownloadPDF(order)}>
                <FileText className="mr-2 h-4 w-4" />
                Print Order
              </DropdownMenuItem>
              {actions.onEdit && (actions.can?.("edit") ?? true) && ["PENDING", "CONFIRMED"].includes(order.status) && (
                <DropdownMenuItem onClick={() => actions.onEdit!(order)}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Order
                </DropdownMenuItem>
              )}
              {actions.onSendPaymentLink && (actions.can?.("send_payment_link") ?? true) && order.paymentStatus === "FAILED" && (
                <DropdownMenuItem onClick={() => actions.onSendPaymentLink!(order)}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Payment Link
                </DropdownMenuItem>
              )}
              {(actions.can?.("delete") ?? true) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => actions.onDelete(order)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Order
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];