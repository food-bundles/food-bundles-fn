/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { voucherService } from "@/app/services/voucherService";
import { useVouchers } from "@/app/contexts/VoucherContext";
import { useRestaurants } from "@/app/contexts/RestaurantContext";
import { VoucherType } from "@/lib/types";

interface CreateVoucherFormProps {
  onSuccess: () => void;
}

interface Restaurant {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

const CreateVoucherForm = forwardRef<{ openModal: () => void }, CreateVoucherFormProps>(({ onSuccess }, ref) => {
  const { getAllVouchers } = useVouchers();
  const { getAllRestaurants } = useRestaurants();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    voucherType: "",
    creditLimit: "",
    repaymentDays: "",
    expiryDate: ""
  });

  useEffect(() => {
    if (open && restaurants.length === 0) {
      const fetchRestaurants = async () => {
        const response = await getAllRestaurants({ limit: 100 });
        if (response.success) {
          setRestaurants(response.data);
        }
      };
      fetchRestaurants();
    }
  }, [open, restaurants.length, getAllRestaurants]);





  const handleSubmit = async () => {
    if (!selectedRestaurant || !formData.voucherType || !formData.creditLimit || !formData.repaymentDays) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await voucherService.createVoucher({
        restaurantId: selectedRestaurant.id,
        voucherType: formData.voucherType as VoucherType,
        creditLimit: parseFloat(formData.creditLimit),
        repaymentDays: parseInt(formData.repaymentDays),
        expiryDate: formData.expiryDate || undefined
      });

      setSuccess("Voucher created successfully!");
      setTimeout(() => {
        setFormData({
          voucherType: "",
          creditLimit: "",
          repaymentDays: "",
          expiryDate: ""
        });
        setSelectedRestaurant(null);
        setSuccess("");
        setOpen(false);
        getAllVouchers();
        onSuccess();
      }, 1500);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to create voucher");
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    openModal: () => setOpen(true)
  }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Voucher</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm">
              {success}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-2">Select Restaurant * ({restaurants.length} available)</label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between"
                >
                  {selectedRestaurant
                    ? `${selectedRestaurant.name} (${selectedRestaurant.phone})`
                    : "Select restaurant..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search restaurants..." />
                  <CommandList>
                    <CommandEmpty>No restaurant found.</CommandEmpty>
                    <CommandGroup>
                      {restaurants.map((restaurant) => (
                        <CommandItem
                          key={restaurant.id}
                          value={`${restaurant.name} ${restaurant.phone} ${restaurant.email}`}
                          onSelect={() => {
                            setSelectedRestaurant(restaurant);
                            setComboboxOpen(false);
                            setError("");
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedRestaurant?.id === restaurant.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div>
                            <div className="font-medium">{restaurant.name}</div>
                            <div className="text-[10px] text-gray-800">{restaurant.phone} / {restaurant.email}</div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Voucher Type *</label>
            <Select value={formData.voucherType} onValueChange={(value) => setFormData(prev => ({ ...prev, voucherType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select voucher type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={VoucherType.DISCOUNT_10}>10% Discount</SelectItem>
                <SelectItem value={VoucherType.DISCOUNT_20}>20% Discount</SelectItem>
                <SelectItem value={VoucherType.DISCOUNT_50}>50% Discount</SelectItem>
                <SelectItem value={VoucherType.DISCOUNT_80}>80% Discount</SelectItem>
                <SelectItem value={VoucherType.DISCOUNT_100}>100% Discount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Credit Limit (RWF) *</label>
            <Input
              type="number"
              value={formData.creditLimit}
              onChange={(e) => setFormData(prev => ({ ...prev, creditLimit: e.target.value }))}
              placeholder="Enter credit limit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Repayment Days *</label>
            <Input
              type="number"
              value={formData.repaymentDays}
              onChange={(e) => setFormData(prev => ({ ...prev, repaymentDays: e.target.value }))}
              placeholder="Enter repayment days"
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={loading || !selectedRestaurant || !formData.voucherType || !formData.creditLimit || !formData.repaymentDays}
            className="w-full"
          >
            {loading ? "Creating..." : "Create Voucher"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

CreateVoucherForm.displayName = "CreateVoucherForm";

export default CreateVoucherForm;