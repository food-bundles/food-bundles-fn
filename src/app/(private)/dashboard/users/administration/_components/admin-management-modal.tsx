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
import { PencilIcon, Trash2Icon} from "lucide-react";
import { toast } from "sonner";
import type { Admin } from "@/app/contexts/AdminsContext";

interface AdminManagementModalProps {
  admin: Admin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  onEdit: (adminId: string, data: any) => Promise<void>;
  onDelete: (adminId: string) => Promise<void>;
}

export function AdminManagementModal({
  admin,
  open,
  onOpenChange,
  onUpdate,
  onEdit,
  onDelete,
}: AdminManagementModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Edit form state
  const [editData, setEditData] = useState({
    username: "",
    email: "",
    phone: "",
    province: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
  });

  useEffect(() => {
    if (admin) {
      setEditData({
        username: admin.username,
        email: admin.email,
        phone: admin.phone || "",
        province: admin.province || "",
        district: admin.district || "",
        sector: admin.sector || "",
        cell: admin.cell || "",
        village: admin.village || "",
      });
    }
  }, [admin]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (admin) {
      setEditData({
        username: admin.username,
        email: admin.email,
        phone: admin.phone || "",
        province: admin.province || "",
        district: admin.district || "",
        sector: admin.sector || "",
        cell: admin.cell || "",
        village: admin.village || "",
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!admin) return;
    
    setIsLoading(true);
    try {
      await onEdit(admin.id, editData);
      toast.success("Admin updated successfully");
      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      console.error("Failed to update admin:", error);
      toast.error(error.message || "Failed to update admin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!admin) return;
    
    setIsLoading(true);
    try {
      await onDelete(admin.id);
      toast.success("Admin deleted successfully");
      setIsDeleting(false);
      setDeleteConfirmText("");
      onOpenChange(false);
      onUpdate();
    } catch (error: any) {
      console.error("Failed to delete admin:", error);
      toast.error(error.message || "Failed to delete admin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleting(false);
    setDeleteConfirmText("");
  };

  const isDeleteConfirmValid = deleteConfirmText === admin?.username;

  if (!admin) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] bg-white text-gray-900 border-gray-200 flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-gray-900">
            Admin Management
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {isDeleting
              ? "Confirm deletion of this admin"
              : "View and manage admin details"}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto scrollbar-thin px-6 flex-1">
          {isEditing ? (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-900">Username</Label>
                <Input
                  id="username"
                  value={editData.username}
                  onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province" className="text-gray-900">Province</Label>
                  <Input
                    id="province"
                    value={editData.province}
                    onChange={(e) => setEditData(prev => ({ ...prev, province: e.target.value }))}
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district" className="text-gray-900">District</Label>
                  <Input
                    id="district"
                    value={editData.district}
                    onChange={(e) => setEditData(prev => ({ ...prev, district: e.target.value }))}
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sector" className="text-gray-900">Sector</Label>
                  <Input
                    id="sector"
                    value={editData.sector}
                    onChange={(e) => setEditData(prev => ({ ...prev, sector: e.target.value }))}
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cell" className="text-gray-900">Cell</Label>
                  <Input
                    id="cell"
                    value={editData.cell}
                    onChange={(e) => setEditData(prev => ({ ...prev, cell: e.target.value }))}
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="village" className="text-gray-900">Village</Label>
                  <Input
                    id="village"
                    value={editData.village}
                    onChange={(e) => setEditData(prev => ({ ...prev, village: e.target.value }))}
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
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
                  <h3 className="text-lg font-semibold text-gray-900">Delete Admin</h3>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone. To confirm deletion, please type{" "}
                    <span className="font-semibold text-gray-900">{admin.username}</span> below:
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deleteConfirm" className="text-gray-900">
                    Type{" "}
                    <span className="font-semibold text-red-500">{admin.username}</span>{" "}
                    to confirm
                  </Label>
                  <Input
                    id="deleteConfirm"
                    placeholder="Type username"
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
                  <div className="text-sm font-medium text-gray-600">Username:</div>
                  <div className="text-sm col-span-2 text-gray-900 font-medium">{admin.username}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Email:</div>
                  <div className="text-sm col-span-2 text-gray-900">{admin.email}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Role:</div>
                  <div className="text-sm col-span-2">
                    <Badge className="bg-green-100 text-green-800">{admin.role}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Phone:</div>
                  <div className="text-sm col-span-2 text-gray-900">{admin.phone || "Not provided"}</div>
                </div>
                {admin.province && (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-sm font-medium text-gray-600">Province:</div>
                      <div className="text-sm col-span-2 text-gray-900">{admin.province}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-sm font-medium text-gray-600">District:</div>
                      <div className="text-sm col-span-2 text-gray-900">{admin.district}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-sm font-medium text-gray-600">Location:</div>
                      <div className="text-sm col-span-2 text-gray-900">
                        {admin.sector}, {admin.cell}, {admin.village}
                      </div>
                    </div>
                  </>
                )}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Status:</div>
                  <div className="text-sm col-span-2">
                    <Badge className={
                      admin.status === "active" ? "bg-green-100 text-green-800" :
                      admin.status === "suspended" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }>
                      {admin.status ? admin.status.charAt(0).toUpperCase() + admin.status.slice(1) : "Active"}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Created:</div>
                  <div className="text-sm col-span-2 text-gray-900">
                    {new Date(admin.createdAt).toLocaleDateString()}
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