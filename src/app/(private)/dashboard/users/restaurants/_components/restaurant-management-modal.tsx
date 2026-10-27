/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
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
import { PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useAdminAccess } from "@/app/hooks/useAdminAccess";

// Backend message when there is one (e.g. "Another account already uses this email")
const errorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.message || fallback;
import type { Restaurant } from "./restaurant-columns";

interface RestaurantManagementModalProps {
  restaurant: Restaurant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  onEdit: (restaurantId: string, data: any) => Promise<void>;
  onDelete: (restaurantId: string) => Promise<void>;
}

export function RestaurantManagementModal({
  restaurant,
  open,
  onOpenChange,
  onUpdate,
  onEdit,
  onDelete,
}: RestaurantManagementModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [newPassword, setNewPassword] = useState("");
  // Edit needs restaurants.edit; delete (to trash) and passwords: super admin only
  const { can, isSuperAdmin } = useAdminAccess();
  const canEdit = can("restaurants", "edit");

  // Edit form state
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });

  useEffect(() => {
    if (restaurant) {
      setEditData({
        name: restaurant.name,
        email: restaurant.email,
        phone: restaurant.phone || "",
        location: restaurant.location,
      });
    }
  }, [restaurant]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewPassword("");
    if (restaurant) {
      setEditData({
        name: restaurant.name,
        email: restaurant.email,
        phone: restaurant.phone || "",
        location: restaurant.location,
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!restaurant) return;
    
    setIsLoading(true);
    try {
      await onEdit(restaurant.id, {
        ...editData,
        ...(isSuperAdmin && newPassword ? { password: newPassword } : {}),
      });
      toast.success("Restaurant updated successfully");
      setIsEditing(false);
      setNewPassword("");
      onUpdate();
    } catch (error: any) {
      console.error("Failed to update restaurant:", error);
      toast.error(errorMessage(error, "Failed to update restaurant"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!restaurant) return;
    
    setIsLoading(true);
    try {
      await onDelete(restaurant.id);
      toast.success("Restaurant moved to the trash. A super admin can restore it.");
      setIsDeleting(false);
      setDeleteConfirmText("");
      onOpenChange(false);
      onUpdate();
    } catch (error: any) {
      console.error("Failed to delete restaurant:", error);
      toast.error(errorMessage(error, "Failed to delete restaurant"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleting(false);
    setDeleteConfirmText("");
  };

  const isDeleteConfirmValid = deleteConfirmText === restaurant?.name;

  if (!restaurant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125 max-h-[90vh] bg-white text-gray-900 border-gray-200 flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-gray-900">
            Restaurant Management
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {isDeleting
              ? "Confirm deletion of this restaurant"
              : "View and manage restaurant details"}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto scrollbar-thin px-6 flex-1">
          {isEditing ? (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-900">Restaurant Name</Label>
                <Input
                  id="name"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={isLoading}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={isLoading}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-900">Phone</Label>
                <Input
                  id="phone"
                  value={editData.phone}
                  onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={isLoading}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-gray-900">Location</Label>
                <Input
                  id="location"
                  value={editData.location}
                  onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                  disabled={isLoading}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              {isSuperAdmin && (
                <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <Label htmlFor="newPassword" className="text-gray-900">Set a new password (optional)</Label>
                  <Input
                    id="newPassword"
                    type="text"
                    autoComplete="off"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    placeholder="Leave empty to keep the current one"
                    className="bg-white border-gray-300 text-gray-900"
                  />
                  <p className="text-[11px] text-amber-800">
                    Passwords are stored encrypted, so the current one can&apos;t be shown. Share the new one with the restaurant.
                  </p>
                </div>
              )}
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
                  <h3 className="text-lg font-semibold text-gray-900">Move restaurant to the trash</h3>
                  <p className="text-sm text-gray-600">
                    The restaurant can no longer sign in and is hidden from lists. A super admin can
                    restore it from the trash. To confirm, please type the{" "}
                    <span className="font-semibold text-gray-900">restaurant name</span> below:
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deleteConfirm" className="text-gray-900">
                    Type restaurant name{" "}
                    <span className="font-semibold text-red-500">{restaurant.name}</span>{" "}
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
          ) : (
            <div className="py-4 space-y-4">

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Restaurant Name:</div>
                  <div className="text-sm col-span-2 text-gray-900 font-medium">{restaurant.name}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Email:</div>
                  <div className="text-sm col-span-2 text-gray-900">{restaurant.email}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Phone:</div>
                  <div className="text-sm col-span-2 text-gray-900">{restaurant.phone || "Not provided"}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Location:</div>
                  <div className="text-sm col-span-2 text-gray-900">{restaurant.location}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Status:</div>
                  <div className="text-sm col-span-2">
                    <Badge className={
                      restaurant.status === "active" ? "bg-green-100 text-green-800" :
                      restaurant.status === "suspended" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }>
                      {restaurant.status.charAt(0).toUpperCase() + restaurant.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Orders:</div>
                  <div className="text-sm col-span-2 text-gray-900">{restaurant.ordersCount} orders</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Total Spent:</div>
                  <div className="text-sm col-span-2 text-green-600 font-medium">
                    RWF {restaurant.totalSpent.toLocaleString()}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Joined:</div>
                  <div className="text-sm col-span-2 text-gray-900">
                    {new Date(restaurant.createdAt).toLocaleDateString()}
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
                {isLoading ? "Moving..." : "Move to trash"}
              </Button>
            </>
          ) : (
            <>
              {canEdit && (
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  className="flex items-center gap-1 bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit
                </Button>
              )}
              {isSuperAdmin && (
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleting(true)}
                  className="flex items-center gap-1"
                >
                  <Trash2Icon className="h-4 w-4" />
                  Move to trash
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}