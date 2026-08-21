"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PaymentMethodFormData {
  name: string;
  description: string;
  isActive: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

interface PaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  method?: PaymentMethod | null;
  onSubmit: (data: PaymentMethodFormData) => Promise<void>;
}

const ACCEPTED_METHODS = [
  "MOBILE_MONEY",
  "CARD",
  "BANK_TRANSFER",
  "CASH",
  "VOUCHER",
];

export function PaymentMethodModal({
  open,
  onOpenChange,
  method,
  onSubmit,
}: PaymentMethodModalProps) {
  const [formData, setFormData] = useState<PaymentMethodFormData>({
    name: "MOBILE_MONEY",
    description: "",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (method) {
      setFormData({
        name: method.name,
        description: method.description || "",
        isActive: method.isActive ?? true,
      });
    } else {
      setFormData({
        name: "MOBILE_MONEY",
        description: "",
        isActive: true,
      });
    }
  }, [method, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {method ? "Edit Payment Method" : "Create New Payment Method"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Select
              value={formData.name}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, name: value }))
              }
            >
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {ACCEPTED_METHODS.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter payment method description"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked }))
              }
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : method ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}