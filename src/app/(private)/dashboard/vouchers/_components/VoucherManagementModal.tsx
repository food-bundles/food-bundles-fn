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
import { PencilIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IVoucher } from "@/lib/types";

interface VoucherManagementModalProps {
  voucher: IVoucher | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  onEdit: (voucherId: string, data: any) => Promise<void>;
}

const voucherStatuses = ["ACTIVE", "USED", "EXPIRED", "SUSPENDED", "SETTLED"];
const voucherTypes = ["DISCOUNT_10", "DISCOUNT_20", "DISCOUNT_50", "DISCOUNT_80", "DISCOUNT_100"];

export function VoucherManagementModal({
  voucher,
  open,
  onOpenChange,
  onUpdate,
  onEdit,
}: VoucherManagementModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Edit form state
  const [editData, setEditData] = useState({
    status: "",
    voucherType: "",
    discountPercentage: 0,
    creditLimit: 0,
  });

  useEffect(() => {
    if (voucher) {
      setEditData({
        status: voucher.status,
        voucherType: voucher.voucherType,
        discountPercentage: voucher.discountPercentage,
        creditLimit: voucher.creditLimit,
      });
    }
  }, [voucher]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (voucher) {
      setEditData({
        status: voucher.status,
        voucherType: voucher.voucherType,
        discountPercentage: voucher.discountPercentage,
        creditLimit: voucher.creditLimit,
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!voucher) return;

    setIsLoading(true);
    try {
      await onEdit(voucher.id, editData);
      toast.success("Voucher updated successfully");
      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      console.error("Failed to update voucher:", error);
      toast.error(error.message || "Failed to update voucher");
    } finally {
      setIsLoading(false);
    }
  };

  if (!voucher) return null;

  const getStatusBadge = (status: string) => {
    const statusColors = {
      ACTIVE: "bg-green-100 text-green-800",
      USED: "bg-blue-100 text-blue-800",
      EXPIRED: "bg-red-100 text-red-800",
      SUSPENDED: "bg-yellow-100 text-yellow-800",
      SETTLED: "bg-gray-100 text-gray-800",
    };
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] bg-white text-gray-900 border-gray-200 flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-gray-900">
            Voucher Management
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            View and manage voucher details
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto scrollbar-thin px-6 flex-1">
          {isEditing ? (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-gray-900">
                    Status
                  </Label>
                  <Select
                    value={editData.status}
                    onValueChange={(value) =>
                      setEditData((prev) => ({ ...prev, status: value }))
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {voucherStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="voucherType" className="text-gray-900">
                    Voucher Type
                  </Label>
                  <Select
                    value={editData.voucherType}
                    onValueChange={(value) =>
                      setEditData((prev) => ({ ...prev, voucherType: value }))
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {voucherTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discountPercentage" className="text-gray-900">
                    Discount Percentage (%)
                  </Label>
                  <Input
                    id="discountPercentage"
                    type="number"
                    value={editData.discountPercentage}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        discountPercentage: Number(e.target.value),
                      }))
                    }
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditLimit" className="text-gray-900">
                    Credit Limit (RWF)
                  </Label>
                  <Input
                    id="creditLimit"
                    type="number"
                    value={editData.creditLimit}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        creditLimit: Number(e.target.value),
                      }))
                    }
                    disabled={isLoading}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Voucher Code:
                  </div>
                  <div className="text-sm col-span-2 text-gray-900 font-medium">
                    {voucher.voucherCode}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">Status:</div>
                  <div className="text-sm col-span-2">
                    <Badge className={getStatusBadge(voucher.status)}>
                      {voucher.status}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Restaurant:
                  </div>
                  <div className="text-sm col-span-2 text-gray-900">
                    {(voucher as any).restaurant?.name || "N/A"}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Voucher Type:
                  </div>
                  <div className="text-sm col-span-2 text-gray-900">
                    {voucher.voucherType}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Discount:
                  </div>
                  <div className="text-sm col-span-2 text-green-600 font-medium">
                    {voucher.discountPercentage}%
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Credit Limit:
                  </div>
                  <div className="text-sm col-span-2 text-gray-900">
                    {voucher.creditLimit.toLocaleString()} RWF
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Used Credit:
                  </div>
                  <div className="text-sm col-span-2 text-red-600">
                    {voucher.usedCredit.toLocaleString()} RWF
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Remaining Credit:
                  </div>
                  <div className="text-sm col-span-2 text-green-600 font-medium">
                    {voucher.remainingCredit.toLocaleString()} RWF
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Expiry Date:
                  </div>
                  <div className="text-sm col-span-2 text-gray-900">
                    {new Date(voucher.expiryDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Issued Date:
                  </div>
                  <div className="text-sm col-span-2 text-gray-900">
                    {new Date(voucher.issuedDate).toLocaleDateString()}
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
          ) : (
            <Button
              variant="outline"
              onClick={handleEdit}
              className="flex items-center gap-1 bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}