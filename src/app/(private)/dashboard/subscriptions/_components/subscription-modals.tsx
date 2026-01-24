/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PencilIcon, Trash2Icon, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { subscriptionService } from "@/app/services/subscriptionService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RestaurantSubscription } from "./subscription-columns";

interface SubscriptionDetailsModalProps {
  subscription: RestaurantSubscription;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-RW", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
  }).format(amount);
};

export function SubscriptionDetailsModal({
  subscription,
  open,
  onOpenChange,
  onUpdate,
}: SubscriptionDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Edit form state
  const [editData, setEditData] = useState({
    status: subscription.status,
    autoRenew: subscription.autoRenew,
    endDate: subscription.endDate,
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      status: subscription.status,
      autoRenew: subscription.autoRenew,
      endDate: subscription.endDate,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      status: subscription.status,
      autoRenew: subscription.autoRenew,
      endDate: subscription.endDate,
    });
  };

  const handleSaveEdit = async () => {
    setIsLoading(true);
    try {
      const response = await subscriptionService.updateSubscription(
        subscription.id,
        editData
      );

      if (response?.success) {
        toast.success("Subscription updated successfully");
        setIsEditing(false);
        onUpdate();
      }
    } catch (error: any) {
      console.error("Failed to update subscription:", error);
      toast.error(
        error.response?.data?.message || "Failed to update subscription"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await subscriptionService.deleteSubscription(
        subscription.id
      );

      if (response?.success) {
        toast.success("Subscription deleted successfully");
        setIsDeleting(false);
        setDeleteConfirmText("");
        onOpenChange(false);
        onUpdate();
      }
    } catch (error: any) {
      console.error("Failed to delete subscription:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete subscription"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleting(false);
    setDeleteConfirmText("");
  };

  const isDeleteConfirmValid =
    deleteConfirmText === subscription.plan.name ||
    deleteConfirmText === subscription.restaurant.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125 max-h-[90vh] bg-white text-gray-900 border-gray-200 flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-gray-900">
            Subscription Details
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {isDeleting
              ? "Confirm deletion of this subscription"
              : "View detailed information about this subscription"}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto scrollbar-thin px-6 flex-1">
          {isEditing ? (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-gray-900">
                  Status
                </Label>
                <Select
                  value={editData.status}
                  onValueChange={(value) =>
                    setEditData((prev) => ({
                      ...prev,
                      status: value as RestaurantSubscription["status"],
                    }))
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-gray-900">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={editData.endDate.split("T")[0]}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      endDate: new Date(e.target.value).toISOString(),
                    }))
                  }
                  disabled={isLoading}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="autoRenew" className="text-gray-900">
                  Auto Renew
                </Label>
                <Switch
                  id="autoRenew"
                  checked={editData.autoRenew}
                  onCheckedChange={(checked) =>
                    setEditData((prev) => ({ ...prev, autoRenew: checked }))
                  }
                  disabled={isLoading}
                />
              </div>
            </div>
          ) : isDeleting ? (
            <div className="py-4 space-y-4">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-red-600/10 flex items-center justify-center">
                  <Trash2Icon className="h-10 w-10 text-red-600" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Subscription
                  </h3>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone. To confirm deletion, please
                    type the{" "}
                    <span className="font-semibold text-gray-900">
                      restaurant name
                    </span>{" "}
                    below:
                  </p>
                </div>

                <div className="space-y-3">

                  <div className="space-y-2">
                    <Label htmlFor="deleteConfirm" className="text-gray-900">
                      Type restaurant name{" "}
                      <span className="font-semibold text-red-500">
                        {subscription.restaurant.name}
                      </span>{" "}
                      to confirm
                    </Label>
                    <Input
                      id="deleteConfirm"
                      placeholder="Type restaurant name"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      disabled={isLoading}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-green-600/10 flex items-center justify-center">
                  <CreditCard className="h-10 w-10 text-green-600" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Restaurant:
                  </div>
                  <div className="text-sm col-span-2 text-gray-900 font-medium">
                    {subscription.restaurant.name}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Email:
                  </div>
                  <div className="text-sm col-span-2 text-gray-900">
                    {subscription.restaurant.email}
                  </div>
                </div>
                {subscription.restaurant.phone && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm font-medium text-gray-600">
                      Phone:
                    </div>
                    <div className="text-sm col-span-2 text-gray-900">
                      {subscription.restaurant.phone}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Plan:</div>
                  <div className="text-sm col-span-2 text-gray-900 font-medium">
                    {subscription.plan.name}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Price:
                  </div>
                  <div className="text-sm col-span-2 text-green-600 font-medium">
                    {formatCurrency(subscription.plan.price)}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Status:
                  </div>
                  <div className="text-sm col-span-2">
                    <Badge className={getStatusColor(subscription.status)}>
                      {subscription.status.charAt(0).toUpperCase() +
                        subscription.status.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Payment:
                  </div>
                  <div className="text-sm col-span-2">
                    <Badge
                      className={getPaymentStatusColor(
                        subscription.paymentStatus
                      )}
                    >
                      {subscription.paymentStatus.charAt(0).toUpperCase() +
                        subscription.paymentStatus.slice(1).toLowerCase()}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Start Date:
                  </div>
                  <div className="text-sm col-span-2 text-gray-900">
                    {formatDate(subscription.startDate)}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    End Date:
                  </div>
                  <div className="text-sm col-span-2 text-gray-900">
                    {formatDate(subscription.endDate)}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Auto Renew:
                  </div>
                  <div className="text-sm col-span-2">
                    <Badge
                      className={
                        subscription.autoRenew
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }
                    >
                      {subscription.autoRenew ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
                {subscription.paymentMethod && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm font-medium text-gray-600">
                      Payment Method:
                    </div>
                    <div className="text-sm col-span-2 text-gray-900">
                      {subscription.paymentMethod}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 pb-6 pt-2">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isLoading}
                className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveEdit}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : isDeleting ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                disabled={isLoading}
                className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading || !isDeleteConfirmValid}
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Deleting..." : "I Understand"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleEdit}
                className="flex items-center gap-1 bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsDeleting(true)}
                className="flex items-center gap-1"
              >
                <Trash2Icon className="h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
