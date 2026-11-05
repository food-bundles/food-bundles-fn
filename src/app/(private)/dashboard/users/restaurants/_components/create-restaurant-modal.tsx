/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
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
import { Store } from "lucide-react";
import { toast } from "sonner";
import {
  customerTypeService,
  CustomerType,
} from "@/app/services/customerTypeService";

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
  // Business types a customer can be created as (Restaurant, Hotel, School…).
  // The list is managed by the admin and loaded from the backend.
  const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([]);
  const [selectedCustomerTypeId, setSelectedCustomerTypeId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    tin: "",
    location: "",
  });

  useEffect(() => {
    let cancelled = false;
    customerTypeService
      .getAllCustomerTypes()
      .then((res) => {
        if (cancelled) return;
        const list: CustomerType[] = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        setCustomerTypes(list.filter((ct) => ct.isActive));
      })
      .catch(() => !cancelled && setCustomerTypes([]));
    return () => {
      cancelled = true;
    };
  }, []);

  // "RESTAURANT" → "Restaurant"; names the admin typed in mixed case stay as typed
  const formatTypeName = (name: string) =>
    name === name.toUpperCase()
      ? name.charAt(0) + name.slice(1).toLowerCase()
      : name;
  const selectedCustomerType = customerTypes.find(
    (ct) => ct.id === selectedCustomerTypeId
  );
  const businessLabel = selectedCustomerType
    ? formatTypeName(selectedCustomerType.name)
    : "Customer";

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.tin) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (customerTypes.length > 0 && !selectedCustomerTypeId) {
      toast.error("Please select the customer type");
      return;
    }

    setIsLoading(true);
    try {
      await onCreate({
        ...formData,
        // Every customer is created with role RESTAURANT; the business type
        // they picked goes in customerTypeId (same as signup).
        customerTypeId: selectedCustomerTypeId || undefined,
      });
      toast.success("Customer created successfully");
      onOpenChange(false);
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        tin: "",
        location: "",
      });
      setSelectedCustomerTypeId("");
    } catch (error: any) {
      console.error("Failed to create customer:", error);
      toast.error(error.message || "Failed to create customer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125 bg-white text-gray-900 border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <Store className="h-5 w-5 text-green-600" />
            Create New Customer
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Create a new customer account (restaurant, hotel, school…). Password
            will be auto-generated and sent via SMS.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Business type = customer type (saved in customerTypeId, not in role).
              Shown only when the admin has active customer types. */}
          {customerTypes.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="customerType" className="text-gray-900">
                Customer Type *
              </Label>
              <Select
                value={selectedCustomerTypeId}
                onValueChange={setSelectedCustomerTypeId}
                disabled={isLoading}
              >
                <SelectTrigger
                  id="customerType"
                  aria-label="Customer type"
                  className="w-full bg-white border-gray-300 text-gray-900"
                >
                  <SelectValue placeholder="Select customer type" />
                </SelectTrigger>
                <SelectContent>
                  {customerTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {formatTypeName(type.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-900">
                {businessLabel} Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={isLoading}
                className="bg-white border-gray-300 text-gray-900"
                placeholder={`Enter ${businessLabel.toLowerCase()} name`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900">
                Email *
              </Label>
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
              <Label htmlFor="phone" className="text-gray-900">
                Phone *
              </Label>
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
              <Label htmlFor="tin" className="text-gray-900">
                TIN Number *
              </Label>
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
            <Label htmlFor="location" className="text-gray-900">
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              disabled={isLoading}
              className="bg-white border-gray-300 text-gray-900"
              placeholder="Enter location (e.g., Kimihurura)"
            />
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
              {isLoading ? "Creating..." : "Create Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
