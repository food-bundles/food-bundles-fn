"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Download, X, Check } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Order {
  id: string;
  orderNumber: string;
  restaurantId: string;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "READY" |"IN_TRANSIT" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  paymentStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED" | "REFUNDED";
  paymentMethod: "CASH" | "MOBILE_MONEY" | "CARD" | "BANK_TRANSFER";
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
function StatusDropdown({ currentStatus, orderId, onUpdate }: {
  currentStatus: string;
  orderId: string;
  onUpdate: (orderId: string, status: string) => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [showUpdate, setShowUpdate] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    setShowUpdate(newStatus !== currentStatus);
  };

  const handleUpdate = () => {
    onUpdate(orderId, selectedStatus);
    setShowUpdate(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedStatus} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-32 h-8">
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
      {showUpdate && (
        <Button
          size="sm"
          onClick={handleUpdate}
          className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700"
        >
          <Check className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

// Payment Status Dropdown Component
function PaymentStatusDropdown({ currentStatus, orderId, onUpdate }: {
  currentStatus: string;
  orderId: string;
  onUpdate: (orderId: string, paymentStatus: string) => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [showUpdate, setShowUpdate] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    setShowUpdate(newStatus !== currentStatus);
  };

  const handleUpdate = () => {
    onUpdate(orderId, selectedStatus);
    setShowUpdate(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedStatus} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-32 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="PROCESSING">Processing</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
          <SelectItem value="FAILED">Failed</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
          <SelectItem value="REFUNDED">Refunded</SelectItem>
        </SelectContent>
      </Select>
      {showUpdate && (
        <Button
          size="sm"
          onClick={handleUpdate}
          className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700"
        >
          <Check className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

export const createOrdersColumns = (actions: {
  onView: (order: Order) => void;
  onDownloadPDF: (order: Order) => void;
  onCancel: (order: Order) => void;
  onStatusUpdate: (orderId: string, status: string) => void;
  onPaymentStatusUpdate: (orderId: string, paymentStatus: string) => void;
}): ColumnDef<Order>[] => [
  {
    accessorKey: "orderNumber",
    header: "Order #",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("orderNumber")}</div>
    ),
  },
  {
    accessorKey: "restaurant.name",
    header: "Restaurant",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.restaurant.name}</div>
        <div className="text-[12px] text-gray-600">{row.original.restaurant.email}</div>
      </div>
    ),
  },
  {
    accessorKey: "billingName",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue("billingName")}</div>
        <div className="text-[12px] text-gray-600">{row.original.billingPhone}</div>
      </div>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="font-medium">
        RWF {row.getValue<number>("totalAmount").toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <StatusDropdown
          currentStatus={order.status}
          orderId={order.id}
          onUpdate={actions.onStatusUpdate}
        />
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <PaymentStatusDropdown
          currentStatus={order.paymentStatus}
          orderId={order.id}
          onUpdate={actions.onPaymentStatusUpdate}
        />
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <div className="text-sm">
        {new Date(row.getValue("createdAt")).toLocaleDateString()}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const order = row.original;

      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => actions.onView(order)}
            className="h-8 w-8 p-0 hover:bg-blue-100"
          >
            <Eye className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => actions.onDownloadPDF(order)}
            className="h-8 w-8 p-0 hover:bg-green-100"
          >
            <Download className="h-4 w-4 text-green-600" />
          </Button>
          {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => actions.onCancel(order)}
              className="h-8 w-8 p-0 hover:bg-red-100"
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          )}
        </div>
      );
    },
  },
];