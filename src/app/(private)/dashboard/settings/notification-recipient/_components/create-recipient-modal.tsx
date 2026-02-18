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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { notificationRecipientService } from "@/app/services/notificationRecipientService";

interface CreateRecipientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const categoryOptions = [
  { value: "MATURED_VOUCHERS", label: "Matured Vouchers" },
  { value: "EXPIRED_VOUCHERS", label: "Expired Vouchers" },
  { value: "LOW_STOCK", label: "Low Stock" },
  { value: "PAYMENT_ISSUES", label: "Payment Issues" },
  { value: "SYSTEM_ALERTS", label: "System Alerts" },
];

export function CreateRecipientModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateRecipientModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    category: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phoneNumber || !formData.category) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await notificationRecipientService.createRecipient(formData);
      toast.success("Recipient created successfully");
      setFormData({ name: "", phoneNumber: "", category: "" });
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Failed to create recipient:", error);
      toast.error(error.response?.data?.message || "Failed to create recipient");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125 bg-white text-gray-900 border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Add Notification Recipient</DialogTitle>
          <DialogDescription className="text-gray-600">
            Add a new phone number to receive system notifications
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-900">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={isLoading}
              placeholder="e.g., Finance Manager"
              className="bg-white border-gray-300 text-gray-900"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-gray-900">Phone Number *</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              disabled={isLoading}
              placeholder="+250788123456"
              className="bg-white border-gray-300 text-gray-900"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-gray-900">Notification Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              disabled={isLoading}
              required
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isLoading ? "Creating..." : "Create Recipient"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
