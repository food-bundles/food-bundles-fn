/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/app/contexts/product-context";

interface ProductStatusModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: (productId: string, status: string, reason?: string) => Promise<void>;
}

export function ProductStatusModal({
  product,
  open,
  onOpenChange,
  onStatusUpdate,
}: ProductStatusModalProps) {
  const [status, setStatus] = useState<string>("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !status) return;

    setIsLoading(true);
    try {
      // Only send reason for INACTIVE status
      const reasonToSend = status === "INACTIVE" ? reason : undefined;
      await onStatusUpdate(product.id, status, reasonToSend);
      onOpenChange(false);
      setStatus("");
      setReason("");
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) return null;

  const currentStatus = product.status;
  const oppositeStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Product Status</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Product</Label>
            <div className="p-2 bg-gray-50 rounded-md">
              <p className="font-medium">{product.productName}</p>
              <p className="text-sm text-gray-600">SKU: {product.sku}</p>
              <p className="text-sm text-gray-600">Current Status: {currentStatus}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select value={status} onValueChange={setStatus} required>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status === "INACTIVE" && (
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Required for INACTIVE)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for deactivating product..."
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !status || (status === "INACTIVE" && !reason)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}