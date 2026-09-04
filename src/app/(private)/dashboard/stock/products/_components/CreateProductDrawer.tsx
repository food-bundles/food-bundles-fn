/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { productService } from "@/app/services/productService";
import { unitService } from "@/app/services/unitService";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X, Package } from "lucide-react";
import { useCategory } from "@/app/contexts/category-context";

export interface ProductFormData {
  productName: string;
  description: string;
  unitPrice: number;
  restaurantPrice?: number;
  hotelPrice?: number;
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

export function CreateProductDrawer({
  isOpen,
  onClose,
  onSubmit,
}: CreateProductDrawerProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    productName: "",
    description: "",
    unitPrice: 0,
    restaurantPrice: undefined,
    hotelPrice: undefined,
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
  const [units, setUnits] = useState<any[]>([]);
  const [isUnitsLoading, setIsUnitsLoading] = useState(false);

  const {
    activeCategories,
    isLoading: isCategoriesLoading,
    refreshActiveCategories,
  } = useCategory();

  useEffect(() => {
    if (isOpen) {
      refreshActiveCategories();
      fetchUnits();
    }
  }, [isOpen, refreshActiveCategories]);

  const fetchUnits = async () => {
    try {
      setIsUnitsLoading(true);
      const response = await unitService.getAllUnits({ limit: 100 }); // Increased limit to get all units
      if (response.data) {
        const activeUnits = response.data.filter((unit: any) => unit.isActive);
        setUnits(activeUnits);
      } else {
        setUnits([]);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
      toast.error("Failed to load units");
      setUnits([]);
    } finally {
      setIsUnitsLoading(false);
    }
  };

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
      const missingFields = [];
      if (!formData.productName) missingFields.push('Product Name');
      if (!formData.categoryId) missingFields.push('Category');
      if (!formData.sku) missingFields.push('SKU');
      if (!formData.unit) missingFields.push('Unit');
      if (formData.quantity <= 0) missingFields.push('Quantity (must be > 0)');
      if (formData.unitPrice <= 0) missingFields.push('Unit Price (must be > 0)');
      if (formData.purchasePrice <= 0) missingFields.push('Purchase Price (must be > 0)');
      
      console.log('Missing required fields:', missingFields);
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      setIsSubmitting(true);
      
      const selectedUnit = units.find(u => u.name === formData.unit);
      
      if (!selectedUnit) {
        toast.error("Invalid unit selected");
        return;
      }

      // Create product in Food Bundles
      const foodBundlesData = {
        ...formData,
        unitId: selectedUnit.id
      };

      const response = await productService.createProduct(foodBundlesData);
      
      if (response.success) {
        onSubmit?.(formData);
        toast.success("Product created successfully");
        resetForm();
        onClose();
      } else {
        toast.error(response.message || "Failed to create product in Food Bundles");
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
      description: "",
      unitPrice: 0,
      restaurantPrice: undefined,
      hotelPrice: undefined,
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
        <div
          className="fixed inset-0 bg-black/70 bg-opacity-50 z-40"
          onClick={onClose}
        />
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
            <span className="text-[15px] text-white font-bold">
              Create Product
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors hover:rotate-90 transform duration-200"
          >
            <X className="w-5 h-5 text-white cursor-pointer" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Images */}
            <div className="bg-white p-4 rounded-lg border space-y-3">
              <Label className="text-xs font-semibold text-gray-700">
                Product Images
              </Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="cursor-pointer border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors"
              />
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-3">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors"
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
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div className="bg-white p-4 rounded-lg border space-y-4">
              <h3 className="text-xs font-semibold text-gray-700 border-b pb-2">
                Basic Information
              </h3>

              <div className="flex gap-6">
                {/* Left Side */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="productName"
                      className="text-xs font-medium"
                    >
                      Product Name *
                    </Label>
                    <Input
                      id="productName"
                      value={formData.productName}
                      onChange={(e) =>
                        handleInputChange("productName", e.target.value)
                      }
                      placeholder="Enter product name"
                      className="focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku" className="text-xs font-medium">
                      SKU *
                    </Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange("sku", e.target.value)}
                      placeholder="PRD-0001"
                      className="focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    {/* <Label className="text-xs font-medium">Category *</Label> */}
                    {isCategoriesLoading ? (
                      <div className="flex items-center justify-center py-3 border rounded-md">
                        <div className="text-xs text-gray-500">
                          Loading categories...
                        </div>
                      </div>
                    ) : activeCategories.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-3 border-2 border-dashed border-gray-300 rounded-md">
                        <div className="text-xs text-gray-500">
                          No categories available
                        </div>
                      </div>
                    ) : (
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) =>
                          handleInputChange("categoryId", value)
                        }
                        disabled={
                          isCategoriesLoading || activeCategories.length === 0
                        }
                      >
                        <SelectTrigger className="focus:ring-2 focus:ring-green-500 focus:border-green-500">
                          <SelectValue
                            placeholder="Select category"
                            className="text-xs text-gray-200"
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {activeCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <p className="text-xs">
                                {" "}
                                {category?.name.replace(/_/g, " ")}
                              </p>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="bg-white p-4 rounded-lg border space-y-4">
              <h3 className="text-xs font-semibold text-gray-700 border-b pb-2">
                Pricing & Stock
              </h3>

              <div className="flex gap-6">
                {/* Left Side */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice" className="text-xs font-medium">
                      Default Price *
                    </Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.unitPrice || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "unitPrice",
                          Number.parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="0"
                      className="focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="restaurantPrice" className="text-xs font-medium">
                      Restaurant Price
                    </Label>
                    <Input
                      id="restaurantPrice"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.restaurantPrice || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "restaurantPrice",
                          e.target.value ? Number.parseFloat(e.target.value) : undefined,
                        )
                      }
                      placeholder="Optional - defaults to unit price"
                      className="focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hotelPrice" className="text-xs font-medium">
                      Hotel Price
                    </Label>
                    <Input
                      id="hotelPrice"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.hotelPrice || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "hotelPrice",
                          e.target.value ? Number.parseFloat(e.target.value) : undefined,
                        )
                      }
                      placeholder="Optional - defaults to unit price"
                      className="focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Unit *</Label>
                    {isUnitsLoading ? (
                      <div className="flex items-center justify-center py-3 border rounded-md">
                        <div className="text-xs text-gray-500">
                          Loading units...
                        </div>
                      </div>
                    ) : units.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-3 border-2 border-dashed border-gray-300 rounded-md">
                        <div className="text-xs text-gray-500">
                          No units available
                        </div>
                      </div>
                    ) : (
                      <Select
                        value={formData.unit}
                        onValueChange={(value) =>
                          handleInputChange("unit", value)
                        }
                        disabled={isUnitsLoading || units.length === 0}
                      >
                        <SelectTrigger className="focus:ring-2 focus:ring-green-500 focus:border-green-500">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit.id} value={unit.name}>
                              {unit.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bonus" className="text-xs font-medium">
                      Bonus
                    </Label>
                    <Input
                      id="bonus"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.bonus || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "bonus",
                          Number.parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="0"
                      className="focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="purchasePrice"
                      className="text-xs font-medium"
                    >
                      Purchase Price *
                    </Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.purchasePrice || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "purchasePrice",
                          Number.parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="0"
                      className="focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-xs font-medium">
                      Quantity *
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "quantity",
                          Number.parseInt(e.target.value) || 0,
                        )
                      }
                      placeholder="0"
                      className="focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Expiry Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal focus:ring-2 focus:ring-green-500 focus:border-green-500",
                            !formData.expiryDate && "text-muted-foreground",
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
                          onSelect={(date) =>
                            handleInputChange("expiryDate", date)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 bg-white p-4 rounded-lg border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
