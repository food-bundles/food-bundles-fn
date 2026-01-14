"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RestaurantSubscription } from "@/app/services/subscriptionService";
import { RefreshCw, CreditCard, TrendingUp, TrendingDown } from "lucide-react";

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

interface SubscriptionActionsProps {
  onRenew?: (subscriptionId: string) => void;
  onRepay?: (subscriptionId: string) => void;
  onUpgrade?: (subscriptionId: string) => void;
  onDowngrade?: (subscriptionId: string) => void;
}

export const createSubscriptionColumns = ({
  onRenew,
  onRepay,
  onUpgrade,
  onDowngrade,
}: SubscriptionActionsProps = {}): ColumnDef<RestaurantSubscription>[] => [
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
    accessorKey: "plan.price",
    header: "Price",
    cell: ({ row }) => (
      <div>{row.original.plan.price.toLocaleString()} RWF</div>
    ),
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      const date = row.original.startDate;
      return (
        <div className="flex flex-col text-sm">
          <span>{formatDate(date)}</span>
         <span className="text-gray-500 text-xs"> {formatTime(date)}</span>
        </div>
      )
  },
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
       const date = row.original.endDate;
        return (
          <div className="flex flex-col text-sm">
            <span>{formatDate(date)}</span>
            <span className="text-gray-500 text-xs"> {formatTime(date)}</span>
          </div>
        );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const subscription = row.original;
      
      const canRepay = () => {
        return (
          (subscription.paymentStatus === "FAILED" ||
            subscription.paymentStatus === "CANCELLED") &&
          subscription.status === "PENDING"
        );
      };

      const canRenew = () => {
        return subscription.status === "EXPIRED";
      };

      const canUpgrade = () => {
        return subscription.status === "ACTIVE";
      };

      const canDowngrade = () => {
        return subscription.status === "ACTIVE";
      };
      
      return (
        <div className="flex gap-1 flex-wrap">
          {canRepay() && onRepay && (
            <Button
              size="sm"
              onClick={() => onRepay(subscription.id)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <CreditCard className="w-3 h-3 mr-1" />
              Repay
            </Button>
          )}
          
          {canRenew() && onRenew && (
            <Button
              size="sm"
              onClick={() => onRenew(subscription.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Renew
            </Button>
          )}

          {canUpgrade() && onUpgrade && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpgrade(subscription.id)}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Upgrade
            </Button>
          )}

          {canDowngrade() && onDowngrade && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDowngrade(subscription.id)}
            >
              <TrendingDown className="w-3 h-3 mr-1" />
              Downgrade
            </Button>
          )}
        </div>
      );
    },
  },
];