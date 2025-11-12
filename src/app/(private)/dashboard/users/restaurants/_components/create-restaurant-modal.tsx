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
import { Switch } from "@/components/ui/switch";
import { Store } from "lucide-react";
import { toast } from "sonner";

interface CreateRestaurantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: any) => Promise<void>;
}

export function CreateRestaurantModal({
  open,
  onOpenChange,
  onCreate,
}: CreateRestaurantModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    tin: "",
    location: "",
    password: "",
    verified: true,
    agreed: true,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-fill password with phone number if phone changes and password is empty
    if (field === "phone" && !formData.password) {
      setFormData(prev => ({ ...prev, password: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.tin) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      await onCreate(formData);
      toast.success("Restaurant created successfully");
      onOpenChange(false);
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        tin: "",
        location: "",
        password: "",
        verified: true,
        agreed: true,
      });
    } catch (error: any) {
      console.error("Failed to create restaurant:", error);
      toast.error(error.message || "Failed to create restaurant");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white text-gray-900 border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <Store className="h-5 w-5 text-green-600" />
            Create New Restaurant
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Create a new restaurant account with admin privileges
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-900">Restaurant Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={isLoading}
                className="bg-white border-gray-300 text-gray-900"
                placeholder="Enter restaurant name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={isLoading}
                className="bg-white border-gray-300 text-gray-900"
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-900">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={isLoading}
                className="bg-white border-gray-300 text-gray-900"
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tin" className="text-gray-900">TIN Number *</Label>
              <Input
                id="tin"
                value={formData.tin}
                onChange={(e) => handleInputChange("tin", e.target.value)}
                disabled={isLoading}
                className="bg-white border-gray-300 text-gray-900"
                placeholder="Enter TIN number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-gray-900">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              disabled={isLoading}
              className="bg-white border-gray-300 text-gray-900"
              placeholder="Enter location (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-900">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              disabled={isLoading}
              className="bg-white border-gray-300 text-gray-900"
              placeholder="Default: phone number"
            />
            <p className="text-xs text-gray-500">
              Leave empty to use phone number as default password
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="verified" className="text-gray-900">Verified Status</Label>
                <p className="text-xs text-gray-500">Mark restaurant as verified</p>
              </div>
              <Switch
                id="verified"
                checked={formData.verified}
                onCheckedChange={(checked) => handleInputChange("verified", checked)}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="agreed" className="text-gray-900">Terms Agreement</Label>
                <p className="text-xs text-gray-500">Mark terms as agreed</p>
              </div>
              <Switch
                id="agreed"
                checked={formData.agreed}
                onCheckedChange={(checked) => handleInputChange("agreed", checked)}
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
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
              {isLoading ? "Creating..." : "Create Restaurant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}