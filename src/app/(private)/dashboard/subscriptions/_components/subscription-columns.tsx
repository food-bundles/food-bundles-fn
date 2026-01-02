/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { SubscriptionDetailsModal } from "./subscription-modals";
import { SubscriptionPlanDetailsModal } from "./subscription-plan-details-modal";

export type SubscriptionPlan = {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  voucherAccess: boolean;
  voucherPaymentDays?: number;
  freeDelivery: boolean;
  stablePricing: boolean;
  receiveEBM: boolean;
  advertisingAccess: boolean;
  otherServices: boolean;
  features?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    subscriptions: number;
  };
};

export type RestaurantSubscription = {
  id: string;
  restaurantId: string;
  planId: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "SUSPENDED" | "PENDING";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod?: "CASH" | "MOBILE_MONEY" | "BANK_TRANSFER" | "CARD";
  paymentStatus:
    | "PENDING"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED"
    | "REFUNDED";
  createdAt: string;
  updatedAt: string;
  plan: SubscriptionPlan;
  restaurant: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
};

const getStatusColor = (status: RestaurantSubscription["status"]) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "EXPIRED":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "CANCELLED":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    case "SUSPENDED":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "PENDING":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

const getPaymentStatusColor = (
  status: RestaurantSubscription["paymentStatus"]
) => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "PROCESSING":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "FAILED":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "CANCELLED":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    case "REFUNDED":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-RW", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const calculateDaysRemaining = (endDate: string) => {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

function SubscriptionPlanActionsCell({
  plan,
  onUpdate,
}: {
  plan: SubscriptionPlan;
  onUpdate: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        className="h-8 px-3"
        onClick={() => setOpen(true)}
      >
        View
      </Button>
      <SubscriptionPlanDetailsModal
        plan={plan}
        open={open}
        onOpenChange={setOpen}
        onUpdate={onUpdate}
      />
    </>
  );
}

function RestaurantSubscriptionActionsCell({
  subscription,
  onUpdate,
}: {
  subscription: RestaurantSubscription;
  onUpdate: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        className="h-8 px-3"
        onClick={() => setOpen(true)}
      >
        View
      </Button>
      <SubscriptionDetailsModal
        subscription={subscription}
        open={open}
        onOpenChange={setOpen}
        onUpdate={onUpdate}
      />
    </>
  );
}

// Columns for Subscription Plans (Admin)
export const createSubscriptionPlansColumns = (
  onUpdate: () => void
): ColumnDef<SubscriptionPlan>[] => [
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
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Plan Name
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue("name")}
        {row.original._count && (
          <div className="text-xs text-gray-500">
            {row.original._count.subscriptions} active subscriptions
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">
        {row.getValue("description") || "No description"}
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Price
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium text-green-600">
        {formatCurrency(row.getValue("price"))}
      </div>
    ),
  },
  {
    accessorKey: "duration",
    header: "Duration (days)",
    cell: ({ row }) => <div>{row.getValue("duration")} days</div>,
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge
          className={
            isActive
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          }
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Created
        </Button>
      );
    },
    cell: ({ row }) => <div>{formatDate(row.getValue("createdAt"))}</div>,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <SubscriptionPlanActionsCell plan={row.original} onUpdate={onUpdate} />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

export const createRestaurantSubscriptionsColumns = (
  onUpdate: () => void
): ColumnDef<RestaurantSubscription>[] => [
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
    id: "index",
    header: "No",
    cell: ({ row }) => (
      <div className="font-medium text-green-600">{row.index + 1}</div>
    ),
  },
  {
    accessorKey: "restaurant.name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0"
        >
          Restaurant
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div>
        <div className="">{row.original.restaurant.name}</div>
        <div className="text-xs text-gray-500">
          {row.original.restaurant.email}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "plan.name",
    header: "Plan Type",
    cell: ({ row }) => (
      <div className="">{row.original.plan.name}</div>
    ),
  },
  {
    accessorKey: "plan.price",
    header: "Price",
    cell: ({ row }) => (
      <div className=" text-green-600">
        {formatCurrency(row.original.plan.price)}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Sbs Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as RestaurantSubscription["status"];
      return (
        <Badge className={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => {
      const paymentStatus = row.getValue(
        "paymentStatus"
      ) as RestaurantSubscription["paymentStatus"];
      return (
        <Badge className={getPaymentStatusColor(paymentStatus)}>
          {paymentStatus.charAt(0).toUpperCase() +
            paymentStatus.slice(1).toLowerCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => <div>{formatDate(row.getValue("startDate"))}</div>,
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      const endDate = row.getValue("endDate") as string;
      const daysRemaining = calculateDaysRemaining(endDate);

      return (
        <div>
          <div>{formatDate(endDate)}</div>
          {daysRemaining > 0 && (
            <div className="text-xs text-gray-500">
              {daysRemaining} days remaining
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <RestaurantSubscriptionActionsCell
        subscription={row.original}
        onUpdate={onUpdate}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
