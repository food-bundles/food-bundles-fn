/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { productService } from "@/app/services/productService";
import { toast } from "sonner";
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
import { CalendarIcon, X, Package } from "lucide-react";
import { useCategory } from "@/app/contexts/category-context";

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

interface CreateProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (productData: ProductFormData) => void;
}

const units = [
  "kg", "g", "piece", "tray", "liter", "ml", "bunch", "cup", "bottle", "crate",
  "box", "dozen", "lbs", "oz", "ton", "pack", "packet", "set", "bundle", "carton",
  "bag", "sack", "jar", "can", "sachet", "bar",
];


export function CreateProductDrawer({
  isOpen,
  onClose,
  onSubmit,
}: CreateProductDrawerProps) {
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

  const {
    activeCategories,
    isLoading: isCategoriesLoading,
    refreshActiveCategories,
  } = useCategory();

  useEffect(() => {
    if (isOpen) {
      refreshActiveCategories();
    }
  }, [isOpen, refreshActiveCategories]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

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

    try {
      setIsSubmitting(true);
      const response = await productService.createProduct(formData);
      if (response.success) {
        onSubmit?.(formData);
        toast.success("Product created successfully!");
        resetForm();
        onClose();
      } else {
        toast.error(response.message || "Failed to create product");
      }
    } catch (error: any) {
      console.error("Error creating product:", error);
      toast.error(error.response?.data?.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
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
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 z-40" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-full bg-white text-gray-900 z-50 transform transition-all duration-300 ease-in-out overflow-y-auto shadow-2xl border-l border-gray-200 scrollbar-hide
          w-[90vw] sm:w-[500px] md:w-[600px]
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-green-700 border-b border-gray-200 flex justify-between items-center px-6 py-3">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-white" />
            <span className="text-xl text-white font-bold">Create Product</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors hover:rotate-90 transform duration-200"
          >
            <X className="w-6 h-6 text-white cursor-pointer" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Images */}
            <div className="space-y-2">
              <Label>Product Images</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
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

            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => handleInputChange("productName", e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price (RWF) *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.unitPrice || ""}
                  onChange={(e) =>
                    handleInputChange("unitPrice", Number.parseFloat(e.target.value) || 0)
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
                    handleInputChange("purchasePrice", Number.parseFloat(e.target.value) || 0)
                  }
                  placeholder="0"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category *</Label>
              {isCategoriesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="text-sm text-gray-500">Loading categories...</div>
                </div>
              ) : activeCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-sm text-gray-500">No categories available</div>
                </div>
              ) : (
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => handleInputChange("categoryId", value)}
                  disabled={isCategoriesLoading || activeCategories.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category?.name.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* SKU and Unit */}
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            {/* Quantity and Bonus */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity || ""}
                  onChange={(e) =>
                    handleInputChange("quantity", Number.parseInt(e.target.value) || 0)
                  }
                  placeholder="0"
                  required
                />
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
                    handleInputChange("bonus", Number.parseFloat(e.target.value) || 0)
                  }
                  placeholder="0"
                />
              </div>
            </div>

            {/* Expiry Date */}
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

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}