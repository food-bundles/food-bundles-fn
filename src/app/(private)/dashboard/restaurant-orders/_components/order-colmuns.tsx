"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal, Trash2, FileText } from "lucide-react";

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
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// Status Dropdown Component
function StatusDropdown({ currentStatus, orderId, restaurantName, onUpdate }: {
  currentStatus: string;
  orderId: string;
  restaurantName: string;
  onUpdate: (orderId: string, status: string) => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [showConfirm, setShowConfirm] = useState(false);

  // Sync with current status when it changes
  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    if (newStatus !== currentStatus) {
      setShowConfirm(true);
    }
  };

  const confirmUpdate = () => {
    onUpdate(orderId, selectedStatus);
    setShowConfirm(false);
  };

  const handleCancel = () => {
    setSelectedStatus(currentStatus);
    setShowConfirm(false);
  };

  return (
    <>
      <Select value={selectedStatus} onValueChange={handleStatusChange}>
        <SelectTrigger className={`w-32 h-4 ${getOrderStatusColor(selectedStatus)}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
          <SelectItem value="PREPARING">Preparing</SelectItem>
          <SelectItem value="READY">Ready</SelectItem>
          <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
          <SelectItem value="DELIVERED">Delivered</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
          <SelectItem value="REFUNDED">Refunded</SelectItem>
        </SelectContent>
      </Select>
      
      <AlertDialog open={showConfirm} onOpenChange={() => {}}>
        <AlertDialogContent className="sm:max-w-md border-2 border-green-500">
          <AlertDialogHeader className="text-center pb-4">
            <AlertDialogTitle className="text-center font-semibold text-gray-900">
              Confirm Status Update
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 mt-3 text-center">
              Are you sure you want to update the order status for{" "}
              <span className="font-semibold text-gray-900">&quot;{restaurantName}&quot;</span> to{" "}
              <span className="font-semibold text-green-700">&quot;{selectedStatus}&quot;</span>?
              <br />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 pt-4">
            <AlertDialogCancel 
              onClick={handleCancel}
              className="flex-1 h-10 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmUpdate}
              className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-white"
            >
              Update Status
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Payment Status Dropdown Component
function PaymentStatusDropdown({ currentStatus, orderId, restaurantName, onUpdate }: {
  currentStatus: string;
  orderId: string;
  restaurantName: string;
  onUpdate: (orderId: string, paymentStatus: string) => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [showConfirm, setShowConfirm] = useState(false);

  // Sync with current status when it changes
  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    if (newStatus !== currentStatus) {
      setShowConfirm(true);
    }
  };

  const confirmUpdate = () => {
    onUpdate(orderId, selectedStatus);
    setShowConfirm(false);
  };

  const handleCancel = () => {
    setSelectedStatus(currentStatus);
    setShowConfirm(false);
  };

  return (
    <>
      <Select value={selectedStatus} onValueChange={handleStatusChange}>
        <SelectTrigger className={`w-32 h-4 ${getPaymentStatusColor(selectedStatus)}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="PROCESSING">Processing</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
          <SelectItem value="VOUCHER_CREDIT">V Credit</SelectItem>
          <SelectItem value="FAILED">Failed</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
          <SelectItem value="REFUNDED">Refunded</SelectItem>
        </SelectContent>
      </Select>
      
      <AlertDialog open={showConfirm} onOpenChange={() => {}}>
        <AlertDialogContent className="sm:max-w-md border-2 border-green-500">
          <AlertDialogHeader className="text-center pb-4">
            <AlertDialogTitle className=" font-bold text-center text-gray-900">
              Confirm Payment Status Update
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-800 mt-3 text-center">
              Are you sure you want to update the payment status for{" "}
              <span className="font-semibold text-gray-900">&quot;{restaurantName}&quot;</span> to{" "}
              <span className="font-semibold text-green-700">&quot;{selectedStatus}&quot;</span>?
              <br />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 pt-4">
            <AlertDialogCancel 
              onClick={handleCancel}
              className="flex-1 h-10 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmUpdate}
              className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-white"
            >
              Update Payment Status
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
    cell: ({ row }) => (
      <div className="font-medium">
        RWF {row.getValue<number>("totalAmount").toLocaleString()}
        <div
          className={`text-[12px]  lowercase rounded-full border px-2 ${getPaymentMethodColor(
            row.original.paymentMethod
          )}`}
        >
          {row.original.paymentMethod}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Order Status",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <StatusDropdown
          currentStatus={order.status}
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
        <PaymentStatusDropdown
          currentStatus={order.paymentStatus}
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => actions.onDelete(order)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];