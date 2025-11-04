/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Copy, Check, RefreshCw, Download } from "lucide-react";

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

// Helper function to generate receipt HTML
export const generateReceiptHTML = (order: Order) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Receipt - ${order.orderId}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          max-width: 800px; 
          margin: 0 auto; 
          padding: 20px;
          background: #f8fffe;
        }
        .receipt-container {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          border: 2px solid #22c55e;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #22c55e;
        }
        .logo {
          width: 60px;
          height: 60px;
          margin: 0 auto 15px;
          background: #22c55e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 24px;
        }
        .header h1 {
          font-size: 28px;
          color: #22c55e;
          margin-bottom: 5px;
        }
        .header p {
          color: #64748b;
          font-size: 16px;
        }
        .order-info {
          margin-bottom: 30px;
        }
        .order-info h2 {
          font-size: 20px;
          color: #1f2937;
          margin-bottom: 20px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 10px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        .info-item {
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #22c55e;
        }
        .info-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }
        .info-value {
          font-size: 14px;
          color: #1f2937;
          font-weight: 600;
        }
        .items-section {
          margin-bottom: 30px;
        }
        .items-section h3 {
          font-size: 18px;
          color: #1f2937;
          margin-bottom: 15px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 10px;
        }
        .items-container {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        .item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          border-bottom: 1px solid #f3f4f6;
        }
        .item:last-child {
          border-bottom: none;
        }
        .item-name {
          font-size: 14px;
          color: #1f2937;
        }
        .item-price {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }
        .total-section {
          background: #f0fdf4;
          padding: 20px;
          border-radius: 8px;
          border: 2px solid #22c55e;
          text-align: right;
        }
        .total-label {
          font-size: 16px;
          color: #64748b;
          margin-bottom: 5px;
        }
        .total-amount {
          font-size: 24px;
          font-weight: bold;
          color: #22c55e;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #64748b;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <div class="logo">FB</div>
          <h1>Food Bundle</h1>
          <p>Order Receipt</p>
        </div>
        
        <div class="order-info">
          <h2>Order Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Order Number</div>
              <div class="info-value">#${order.orderId}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Order Date</div>
              <div class="info-value">${order.orderedDate}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Customer Name</div>
              <div class="info-value">${order.customerName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Status</div>
              <div class="info-value">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</div>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">Delivery Address</div>
            <div class="info-value">${order.deliveryAddress}</div>
          </div>
        </div>
        
        <div class="items-section">
          <h3>Order Items</h3>
          <div class="items-container">
            <div class="item">
              <span class="item-name">${order.items}</span>
              <span class="item-price">${order.totalAmount} Rwf</span>
            </div>
            <div class="item" style="background: #f0fdf4; font-weight: bold;">
              <span class="item-name">Total</span>
              <span class="item-price" style="color: #22c55e; font-size: 16px;">${order.totalAmount} Rwf</span>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Food Bundle!</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
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
      className="h-6 w-6 p-0 hover:bg-gray-100 shrink-0"
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
  onDownload: (order: Order) => void,
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
      <div className="font-medium ">
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

      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(order)}
            className="h-8 w-8 p-0 hover:bg-blue-100"
            title="View Order"
          >
            <Eye className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDownload(order)}
            className="h-8 w-8 p-0 hover:bg-green-100"
            title="Download Receipt"
          >
            <Download className="h-4 w-4 text-green-600" />
          </Button>
          {order.originalData?.paymentMethod !== "VOUCHER" && (
            <button
              className="text-[12px] text-green-600 hover:text-green-700 cursor-pointer px-2 py-1 rounded hover:bg-green-50"
              onClick={() => onReorder(order.id)}
              title="Reorder"
            >
              Reorder
            </button>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
