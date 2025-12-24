"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RestaurantSubscription } from "@/app/services/subscriptionService";

export const createSubscriptionColumns = (
  onRenew?: (subscriptionId: string) => void
): ColumnDef<RestaurantSubscription>[] => [
  {
    accessorKey: "plan.name",
    header: "Plan",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.plan.name}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusColors = {
        ACTIVE: "bg-green-100 text-green-800",
        EXPIRED: "bg-red-100 text-red-800",
        CANCELLED: "bg-gray-100 text-gray-800",
        SUSPENDED: "bg-yellow-100 text-yellow-800",
        PENDING: "bg-blue-100 text-blue-800",
      };
      
      return (
        <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "plan.price",
    header: "Price",
    cell: ({ row }) => (
      <div>{row.original.plan.price.toLocaleString()} RWF</div>
    ),
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("startDate")).toLocaleDateString()}</div>
    ),
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => (
      <div>{new Date(row.getValue("endDate")).toLocaleDateString()}</div>
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const paymentStatus = row.getValue("paymentStatus") as string;
      const paymentColors = {
        COMPLETED: "bg-green-100 text-green-800",
        PENDING: "bg-yellow-100 text-yellow-800",
        FAILED: "bg-red-100 text-red-800",
        PROCESSING: "bg-blue-100 text-blue-800",
        CANCELLED: "bg-gray-100 text-gray-800",
        REFUNDED: "bg-purple-100 text-purple-800",
      };
      
      return (
        <Badge className={paymentColors[paymentStatus as keyof typeof paymentColors] || "bg-gray-100 text-gray-800"}>
          {paymentStatus}
        </Badge>
      );
    },
  },
  {
    accessorKey: "autoRenew",
    header: "Auto Renew",
    cell: ({ row }) => (
      <div>{row.getValue("autoRenew") ? "Yes" : "No"}</div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const subscription = row.original;
      const isExpired = subscription.status === "EXPIRED";
      
      if (!isExpired || !onRenew) return null;
      
      return (
        <Button
          size="sm"
          onClick={() => onRenew(subscription.id)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Renew
        </Button>
      );
    },
  },
];