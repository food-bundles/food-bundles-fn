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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import type { NotificationRecipient } from "./recipient-columns";

interface RecipientManagementModalProps {
  recipient: NotificationRecipient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  onEdit: (recipientId: string, data: any) => Promise<void>;
  onDelete: (recipientId: string) => Promise<void>;
}

const categoryOptions = [
  { value: "MATURED_VOUCHERS", label: "Matured Vouchers" },
  { value: "EXPIRED_VOUCHERS", label: "Expired Vouchers" },
  { value: "LOW_STOCK", label: "Low Stock" },
  { value: "PAYMENT_ISSUES", label: "Payment Issues" },
  { value: "SYSTEM_ALERTS", label: "System Alerts" },
];

const categoryLabels: Record<string, string> = {
  MATURED_VOUCHERS: "Matured Vouchers",
  EXPIRED_VOUCHERS: "Expired Vouchers",
  LOW_STOCK: "Low Stock",
  PAYMENT_ISSUES: "Payment Issues",
  SYSTEM_ALERTS: "System Alerts",
};

export function RecipientManagementModal({
  recipient,
  open,
  onOpenChange,
  onUpdate,
  onEdit,
  onDelete,
}: RecipientManagementModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [editData, setEditData] = useState({
    name: "",
    phoneNumber: "",
    category: "",
    isActive: true,
  });

  useEffect(() => {
    if (recipient) {
      setEditData({
        name: recipient.name,
        phoneNumber: recipient.phoneNumber,
        category: recipient.category,
        isActive: recipient.isActive,
      });
    }
  }, [recipient]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (recipient) {
      setEditData({
        name: recipient.name,
        phoneNumber: recipient.phoneNumber,
        category: recipient.category,
        isActive: recipient.isActive,
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!recipient) return;
    
    setIsLoading(true);
    try {
      await onEdit(recipient.id, editData);
      toast.success("Recipient updated successfully");
      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      console.error("Failed to update recipient:", error);
      toast.error(error.response?.data?.message || "Failed to update recipient");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!recipient) return;
    
    setIsLoading(true);
    try {
      await onDelete(recipient.id);
      toast.success("Recipient deleted successfully");
      setIsDeleting(false);
      setDeleteConfirmText("");
      onOpenChange(false);
      onUpdate();
    } catch (error: any) {
      console.error("Failed to delete recipient:", error);
      toast.error(error.response?.data?.message || "Failed to delete recipient");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleting(false);
    setDeleteConfirmText("");
  };

  const isDeleteConfirmValid = deleteConfirmText === recipient?.name;

  if (!recipient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125 max-h-[90vh] bg-white text-gray-900 border-gray-200 flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-gray-900">
            Notification Recipient Management
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {isDeleting
              ? "Confirm deletion of this recipient"
              : "View and manage recipient details"}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto scrollbar-thin px-6 flex-1">
          {isEditing ? (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-900">Name</Label>
                <Input
                  id="name"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={isLoading}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-gray-900">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={editData.phoneNumber}
                  onChange={(e) => setEditData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  disabled={isLoading}
                  placeholder="+250788123456"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-900">Category</Label>
                <Select
                  value={editData.category}
                  onValueChange={(value) => setEditData(prev => ({ ...prev, category: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive" className="text-gray-900">Status</Label>
                <Select
                  value={editData.isActive ? "true" : "false"}
                  onValueChange={(value) => setEditData(prev => ({ ...prev, isActive: value === "true" }))}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
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
                  <h3 className="text-lg font-semibold text-gray-900">Delete Recipient</h3>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone. To confirm deletion, please type the{" "}
                    <span className="font-semibold text-gray-900">recipient name</span> below:
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deleteConfirm" className="text-gray-900">
                    Type recipient name{" "}
                    <span className="font-semibold text-red-500">{recipient.name}</span>{" "}
                    to confirm
                  </Label>
                  <Input
                    id="deleteConfirm"
                    placeholder="Type recipient name"
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
                  <div className="text-sm font-medium text-gray-600">Name:</div>
                  <div className="text-sm col-span-2 text-gray-900 font-medium">{recipient.name}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Phone Number:</div>
                  <div className="text-sm col-span-2 text-gray-900">{recipient.phoneNumber}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Category:</div>
                  <div className="text-sm col-span-2">
                    <Badge variant="outline">
                      {categoryLabels[recipient.category] || recipient.category}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Status:</div>
                  <div className="text-sm col-span-2">
                    <Badge className={
                      recipient.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }>
                      {recipient.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Created:</div>
                  <div className="text-sm col-span-2 text-gray-900">
                    {new Date(recipient.createdAt).toLocaleDateString()}
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
