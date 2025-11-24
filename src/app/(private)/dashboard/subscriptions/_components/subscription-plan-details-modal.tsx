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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PencilIcon, Trash2Icon, Package } from "lucide-react";
import { toast } from "sonner";
import { subscriptionService } from "@/app/services/subscriptionService";
import { Switch } from "@/components/ui/switch";
import { SubscriptionPlan } from "./subscription-columns";

interface SubscriptionPlanDetailsModalProps {
  plan: SubscriptionPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

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

export function SubscriptionPlanDetailsModal({
  plan,
  open,
  onOpenChange,
  onUpdate,
}: SubscriptionPlanDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [editData, setEditData] = useState({
    name: plan.name,
    description: plan.description || "",
    price: plan.price.toString(),
    duration: plan.duration.toString(),
    voucherAccess: plan.voucherAccess,
    voucherPaymentDays: plan.voucherPaymentDays,
    freeDelivery: plan.freeDelivery,
    stablePricing: plan.stablePricing,
    receiveEBM: plan.receiveEBM,
    advertisingAccess: plan.advertisingAccess,
    otherServices: plan.otherServices,
    features: plan.features || [],
    isActive: plan.isActive,
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      name: plan.name,
      description: plan.description || "",
      price: plan.price.toString(),
      duration: plan.duration.toString(),
      voucherAccess: plan.voucherAccess,
      voucherPaymentDays: plan.voucherPaymentDays,
      freeDelivery: plan.freeDelivery,
      stablePricing: plan.stablePricing,
      receiveEBM: plan.receiveEBM,
      advertisingAccess: plan.advertisingAccess,
      otherServices: plan.otherServices,
      features: plan.features || [],
      isActive: plan.isActive,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      name: plan.name,
      description: plan.description || "",
      price: plan.price.toString(),
      duration: plan.duration.toString(),
      voucherAccess: plan.voucherAccess,
      voucherPaymentDays: plan.voucherPaymentDays,
      freeDelivery: plan.freeDelivery,
      stablePricing: plan.stablePricing,
      receiveEBM: plan.receiveEBM,
      advertisingAccess: plan.advertisingAccess,
      otherServices: plan.otherServices,
      features: plan.features || [],
      isActive: plan.isActive,
    });
  };


  const handleSaveEdit = async () => {
    setIsLoading(true);
    try {
      const updatePayload = {
        name: editData.name,
        description: editData.description,
        price: Number.parseFloat(editData.price),
        duration: Number.parseInt(editData.duration),
        voucherAccess: editData.voucherAccess,
        voucherPaymentDays: editData.voucherPaymentDays,
        freeDelivery: editData.freeDelivery,
        stablePricing: editData.stablePricing,
        receiveEBM: editData.receiveEBM,
        advertisingAccess: editData.advertisingAccess,
        otherServices: editData.otherServices,
        features: editData.features,
        isActive: editData.isActive,
      };

      const response = await subscriptionService.updateSubscriptionPlan(
        plan.id,
        updatePayload
      );

      if (response?.success) {
        toast.success("Subscription plan updated successfully");
        setIsEditing(false);
        onUpdate();
      }
    } catch (error: any) {
      console.error("Failed to update plan:", error);
      toast.error(
        error.response?.data?.message || "Failed to update subscription plan"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await subscriptionService.deleteSubscriptionPlan(
        plan.id
      );

      if (response?.success) {
        toast.success("Subscription plan deleted successfully");
        setIsDeleting(false);
        setDeleteConfirmText("");
        onOpenChange(false);
        onUpdate();
      }
    } catch (error: any) {
      console.error("Failed to delete plan:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete subscription plan"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleting(false);
    setDeleteConfirmText("");
  };

  const isDeleteConfirmValid = deleteConfirmText === plan.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] bg-white text-gray-900 border-gray-200 flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-gray-900">
            Subscription Plan Details
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {isDeleting
              ? "Confirm deletion of this subscription plan"
              : "View detailed information about this subscription plan"}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto scrollbar-thin px-6 flex-1">
          {isEditing ? (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-900">
                  Plan Name *
                </Label>
                <Input
                  id="name"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  disabled={isLoading}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-900">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={editData.description}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  disabled={isLoading}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-gray-900">
                    Price <span className="text-xs text-gray-500">/ FRW</span> *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={editData.price}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-gray-900">
                    Duration{" "}
                    <span className="text-xs text-gray-500">/ days</span> *
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    value={editData.duration}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-900">Plan Features</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-voucherAccess"
                      checked={editData.voucherAccess}
                      onChange={(e) =>
                        setEditData(prev => ({ ...prev, voucherAccess: e.target.checked }))
                      }
                      disabled={isLoading}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="edit-voucherAccess" className="text-sm">
                      Voucher Access ({editData.voucherPaymentDays} days)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-freeDelivery"
                      checked={editData.freeDelivery}
                      onChange={(e) =>
                        setEditData(prev => ({ ...prev, freeDelivery: e.target.checked }))
                      }
                      disabled={isLoading}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="edit-freeDelivery" className="text-sm">
                      Free Delivery
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-stablePricing"
                      checked={editData.stablePricing}
                      onChange={(e) =>
                        setEditData(prev => ({ ...prev, stablePricing: e.target.checked }))
                      }
                      disabled={isLoading}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="edit-stablePricing" className="text-sm">
                      Stable Pricing
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-receiveEBM"
                      checked={editData.receiveEBM}
                      onChange={(e) =>
                        setEditData(prev => ({ ...prev, receiveEBM: e.target.checked }))
                      }
                      disabled={isLoading}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="edit-receiveEBM" className="text-sm">
                      Receive EBM
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-advertisingAccess"
                      checked={editData.advertisingAccess}
                      onChange={(e) =>
                        setEditData(prev => ({ ...prev, advertisingAccess: e.target.checked }))
                      }
                      disabled={isLoading}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="edit-advertisingAccess" className="text-sm">
                      Advertising Access
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-otherServices"
                      checked={editData.otherServices}
                      onChange={(e) =>
                        setEditData(prev => ({ ...prev, otherServices: e.target.checked }))
                      }
                      disabled={isLoading}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="edit-otherServices" className="text-sm">
                      Other Services
                    </Label>
                  </div>
                </div>
              </div>

         

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="isActive" className="text-gray-900">
                  Active Status
                </Label>
                <Switch
                  id="isActive"
                  checked={editData.isActive}
                  onCheckedChange={(checked) =>
                    setEditData((prev) => ({ ...prev, isActive: checked }))
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
                    Delete Subscription Plan
                  </h3>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone. To confirm deletion, please
                    type the{" "}
                    <span className="font-semibold text-gray-900">
                      plan name
                    </span>{" "}
                    below:
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="text-sm text-gray-600">
                      Plan Name:{" "}
                      <span className="font-semibold text-gray-900">
                        {plan.name}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deleteConfirm" className="text-gray-900">
                      Type plan name to confirm
                    </Label>
                    <Input
                      id="deleteConfirm"
                      placeholder="Type plan name"
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
                  <Package className="h-10 w-10 text-green-600" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Plan Name:
                  </div>
                  <div className="text-sm col-span-2 text-gray-900 font-medium">
                    {plan.name}
                  </div>
                </div>
                {plan.description && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm font-medium text-gray-600">
                      Description:
                    </div>
                    <div className="text-sm col-span-2 text-gray-900">
                      {plan.description}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Price:
                  </div>
                  <div className="text-sm col-span-2 text-green-600 font-medium">
                    {formatCurrency(plan.price)}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Duration:
                  </div>
                  <div className="text-sm col-span-2 text-gray-900">
                    {plan.duration} days
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Status:
                  </div>
                  <div className="text-sm col-span-2">
                    <Badge
                      className={
                        plan.isActive
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }
                    >
                      {plan.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                {plan._count && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm font-medium text-gray-600">
                      Subscriptions:
                    </div>
                    <div className="text-sm col-span-2 text-gray-900">
                      {plan._count.subscriptions} active
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Plan Features:
                  </div>
                  <div className="text-sm col-span-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={plan.voucherAccess ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {plan.voucherAccess ? "✓" : "✗"}
                      </Badge>
                      <span className="text-gray-900">Voucher Access {plan.voucherAccess && `(${plan.voucherPaymentDays} days)`}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={plan.freeDelivery ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {plan.freeDelivery ? "✓" : "✗"}
                      </Badge>
                      <span className="text-gray-900">Free Delivery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={plan.stablePricing ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {plan.stablePricing ? "✓" : "✗"}
                      </Badge>
                      <span className="text-gray-900">Stable Pricing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={plan.receiveEBM ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {plan.receiveEBM ? "✓" : "✗"}
                      </Badge>
                      <span className="text-gray-900">Receive EBM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={plan.advertisingAccess ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {plan.advertisingAccess ? "✓" : "✗"}
                      </Badge>
                      <span className="text-gray-900">Advertising Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={plan.otherServices ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {plan.otherServices ? "✓" : "✗"}
                      </Badge>
                      <span className="text-gray-900">Other Services</span>
                    </div>
                  </div>
                </div>
                {plan.features && plan.features.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-sm font-medium text-gray-600">
                      Features:
                    </div>
                    <div className="text-sm col-span-2 space-y-1">
                      {plan.features.map((feature: any, index: any) => (
                        <div key={index} className="text-gray-900">
                          {index + 1} . {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Created:
                  </div>
                  <div className="text-sm col-span-2 text-gray-900">
                    {formatDate(plan.createdAt)}
                  </div>
                </div>
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
