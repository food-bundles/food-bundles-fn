/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { productService } from "@/app/services/productService";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { useActiveCategories } from "@/app/contexts/category-context";

export interface ProductFormData {
  productName: string;
  unitPrice: number;
  purchasePrice: number;
  categoryId: string;
  bonus: number;
  sku: string;
  quantity: number;
  images: File[];
  expiryDate: Date | undefined;
  unit: string;
}

interface CreateProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (productData: ProductFormData) => void;
}

const units = [
  "kg",
  "g",
  "lbs",
  "pieces",
  "liters",
  "ml",
  "boxes",
  "bags",
  "bunches",
];

export function CreateProductModal({
  open,
  onOpenChange,
  onSubmit,
}: CreateProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    unitPrice: 0,
    purchasePrice: 0,
    categoryId: "",
    bonus: 0,
    sku: "",
    quantity: 0,
    images: [],
    expiryDate: undefined,
    unit: "",
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use the category context hook instead of local state
  const {
    activeCategories,
    isLoading: isCategoriesLoading,
    error: categoryError,
  } = useActiveCategories();

  // Show error if categories failed to load and debug information
  useEffect(() => {
    console.log("Categories state:", {
      activeCategories,
      isCategoriesLoading,
      categoryError,
    });

    if (categoryError) {
      console.error("Category error:", categoryError);
      toast.error(`Failed to load categories: ${categoryError}`);
    }
  }, [categoryError, activeCategories, isCategoriesLoading]);

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () =>
          setImagePreviews((prev) => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.productName ||
      !formData.categoryId ||
      !formData.sku ||
      !formData.unit ||
      formData.quantity <= 0 ||
      formData.unitPrice <= 0 ||
      formData.purchasePrice <= 0
    ) {
      toast.error("Please fill in all required fields with valid values");
      return;
    }

    console.log("[v0] Form data before submit:", formData);

    try {
      setIsSubmitting(true);
      const response = await productService.createProduct(formData);
      if (response.success) {
        onSubmit?.(formData);
        toast.success("Product Createed successfully!");
        handleCancel();
      } else {
        toast.error(response.message || "Failed to Create product");
      }
    } catch (error: any) {
      console.error("Error Creating product:", error);
      toast.error(error.response?.data?.message || "Failed to Create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      productName: "",
      unitPrice: 0,
      purchasePrice: 0,
      categoryId: "",
      bonus: 0,
      sku: "",
      quantity: 0,
      images: [],
      expiryDate: undefined,
      unit: "",
    });
    setImagePreviews([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Images */}
          <div className="space-y-2">
            <Label>Product Images</Label>
            <div className="space-y-3">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-6 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative w-20 h-20 rounded-lg overflow-hidden border"
                    >
                      <Image
                        src={preview || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Left side */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) =>
                    handleInputChange("productName", e.target.value)
                  }
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price (RWF) *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.unitPrice || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "unitPrice",
                      Number.parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price (RWF) *</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.purchasePrice || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "purchasePrice",
                      Number.parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    handleInputChange("categoryId", value)
                  }
                  disabled={
                    isCategoriesLoading || activeCategories.length === 0
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isCategoriesLoading
                          ? "Loading categories..."
                          : activeCategories.length === 0
                          ? "No categories available"
                          : "Select category"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category?.name.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "quantity",
                      Number.parseInt(e.target.value) || 0
                    )
                  }
                  placeholder="0"
                  required
                />
              </div>
            </div>

            {/* Right side */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                  placeholder="Enter product SKU"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Unit *</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => handleInputChange("unit", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bonus">Bonus</Label>
                <Input
                  id="bonus"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.bonus || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "bonus",
                      Number.parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.expiryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.expiryDate ? (
                        format(formData.expiryDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.expiryDate}
                      onSelect={(date) => handleInputChange("expiryDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
