/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { productService } from "@/app/services/productService";
import { unitService } from "@/app/services/unitService";
import { tableTronicService } from "@/app/services/tableTronicService";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X, Package, Check, ChevronsUpDown } from "lucide-react";
import { useCategory } from "@/app/contexts/category-context";

export interface ProductFormData {
  productName: string;
  description: string;
  unitPrice: number;
  purchasePrice: number;
  categoryId: string;
  bonus: number;
  sku: string;
  quantity: number;
  images: File[];
  expiryDate: Date | undefined;
  unit: string;
  taxId: number;
  ebmProductType: string;
  ebmCountryOfOrigin: string;
  ebmPackagingUnit: string;
  ebmQuantityUnit: string;
  ebmItemClassCode: { label: string; value: string };
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
    purchasePrice: 0,
    categoryId: "",
    bonus: 0,
    sku: "",
    quantity: 0,
    images: [],
    expiryDate: undefined,
    unit: "",
    taxId: 0,
    ebmProductType: "3", // Default to Service
    ebmCountryOfOrigin: "RW", // Default to Rwanda
    ebmPackagingUnit: "",
    ebmQuantityUnit: "",
    ebmItemClassCode: { label: "", value: "" },
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [units, setUnits] = useState<any[]>([]);
  const [isUnitsLoading, setIsUnitsLoading] = useState(false);
  const [taxes, setTaxes] = useState<any[]>([]);
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [packagingUnits, setPackagingUnits] = useState<any[]>([]);
  const [quantityUnits, setQuantityUnits] = useState<any[]>([]);
  const [itemClassCodes, setItemClassCodes] = useState<any[]>([]);
  const [itemClassSearchTerm, setItemClassSearchTerm] = useState("");
  const [isLoadingItemClass, setIsLoadingItemClass] = useState(false);
  const [countrySearchOpen, setCountrySearchOpen] = useState(false);
  const [itemClassSearchOpen, setItemClassSearchOpen] = useState(false);

  const {
    activeCategories,
    isLoading: isCategoriesLoading,
    refreshActiveCategories,
  } = useCategory();

  useEffect(() => {
    if (isOpen) {
      refreshActiveCategories();
      fetchUnits();
      fetchTableTronicData();
    }
  }, [isOpen, refreshActiveCategories]);

  const fetchTableTronicData = async () => {
    try {
      const [taxesRes, productTypesRes, countriesRes, packagingRes, quantityRes] = await Promise.all([
        tableTronicService.getTaxes(),
        tableTronicService.getEbmProductTypes(),
        tableTronicService.getEbmCountries(),
        tableTronicService.getEbmPackagingUnits(),
        tableTronicService.getEbmQuantityUnits()
      ]);
      
      setTaxes(taxesRes.results || []);
      setProductTypes(productTypesRes || []);
      setCountries(countriesRes || []);
      setPackagingUnits(packagingRes || []);
      setQuantityUnits(quantityRes || []);
      
      // Load initial agriculture-related item class codes
      await searchItemClassCodes("agriculture");
    } catch (error) {
      console.error("Error fetching Table Tronic data:", error);
      toast.error("Failed to load some form data");
    }
  };

  const searchItemClassCodes = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setItemClassCodes([]);
      return;
    }

    try {
      setIsLoadingItemClass(true);
      const response = await tableTronicService.getEbmItemClassCodes({ page: 1, limit: 100 });
      
      if (response.itemClassCodes) {
        // Filter for agriculture, food, animal, vegetable, fruit related items
        const agricultureKeywords = [
          'agriculture', 'agricultural', 'farm', 'food', 'fruit', 'vegetable', 
          'animal', 'livestock', 'crop', 'grain', 'meat', 'dairy', 'fish',
          'beverage', 'drink', 'organic', 'fresh', 'produce', 'harvest'
        ];
        
        const filtered = response.itemClassCodes.filter((item: any) => {
          const itemName = item.itemClsNm.toLowerCase();
          const searchLower = searchTerm.toLowerCase();
          
          // Check if search term matches item name or if item contains agriculture keywords
          return itemName.includes(searchLower) || 
                 agricultureKeywords.some(keyword => itemName.includes(keyword));
        });
        
        setItemClassCodes(filtered);
      }
    } catch (error) {
      console.error("Error searching item class codes:", error);
    } finally {
      setIsLoadingItemClass(false);
    }
  };

  // Debounced search for item class codes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (itemClassSearchTerm) {
        searchItemClassCodes(itemClassSearchTerm);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [itemClassSearchTerm]);

  const fetchUnits = async () => {
    try {
      setIsUnitsLoading(true);
      const response = await unitService.getAllUnits();
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
      !formData.description ||
      !formData.categoryId ||
      !formData.sku ||
      !formData.unit ||
      formData.quantity <= 0 ||
      formData.unitPrice <= 0 ||
      formData.purchasePrice <= 0 ||
      !formData.taxId ||
      !formData.ebmPackagingUnit ||
      !formData.ebmQuantityUnit ||
      !formData.ebmItemClassCode.value
    ) {
      toast.error("Please fill in all required fields with valid values");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Find selected unit and category
      const selectedUnit = units.find(u => u.name === formData.unit);
      const selectedCategory = activeCategories.find(c => c.id === formData.categoryId);
      
      if (!selectedUnit || !selectedCategory) {
        toast.error("Invalid unit or category selected");
        return;
      }

      // Check if Table Tronic product ID exists in localStorage
      const storedTableTronicId = localStorage.getItem('pendingTableTronicId');
      let tableTronicProductId = null;

      if (storedTableTronicId) {
        // Use existing Table Tronic ID from localStorage
        tableTronicProductId = parseInt(storedTableTronicId);
        console.log("Using stored Table Tronic ID:", tableTronicProductId);
      } else {
        // Create product in Table Tronic first
        const categoryId = selectedCategory.tableTronicId || 1;
        const unitId = crypto.randomUUID();
        
        const tableTronicData = {
          name: formData.productName,
          description: formData.description,
          photo: "",
          itemCode: formData.sku,
          categoryId: categoryId,
          taxId: formData.taxId,
          units: [{
            id: unitId,
            unitId: selectedUnit.tableTronicId.toString(),
            cost: formData.purchasePrice,
            price: formData.unitPrice
          }],
          baseUnitId: unitId,
          ebmProductType: formData.ebmProductType,
          ebmCountryOfOrigin: formData.ebmCountryOfOrigin,
          ebmPackagingUnit: formData.ebmPackagingUnit,
          ebmQuantityUnit: formData.ebmQuantityUnit,
          ebmItemClassCode: formData.ebmItemClassCode,
          ebmOpeningStock: formData.quantity.toString()
        };

        const tableTronicResponse = await tableTronicService.createProduct(tableTronicData);
        
        if (!tableTronicResponse || !tableTronicResponse.id) {
          throw new Error("Failed to create product in Table Tronic - no ID returned");
        }

        tableTronicProductId = tableTronicResponse.id;
        // Store Table Tronic ID in localStorage
        localStorage.setItem('pendingTableTronicId', tableTronicProductId.toString());
        console.log("Created and stored Table Tronic ID:", tableTronicProductId);
      }

      // Create product in Food Bundles with Table Tronic ID
      const foodBundlesData = {
        ...formData,
        tableTronicId: tableTronicProductId,
        unitId: selectedUnit.id
      };

      const response = await productService.createProduct(foodBundlesData);
      
      if (response.success) {
        // Remove stored Table Tronic ID after successful Food Bundles creation
        localStorage.removeItem('pendingTableTronicId');
        console.log("Removed stored Table Tronic ID after successful creation");
        
        onSubmit?.(formData);
        toast.success("Product created successfully in both systems!");
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
      purchasePrice: 0,
      categoryId: "",
      bonus: 0,
      sku: "",
      quantity: 0,
      images: [],
      expiryDate: undefined,
      unit: "",
      taxId: 0,
      ebmProductType: "3",
      ebmCountryOfOrigin: "RW",
      ebmPackagingUnit: "",
      ebmQuantityUnit: "",
      ebmItemClassCode: { label: "", value: "" },
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
                    <Label className="text-xs font-medium">Tax *</Label>
                    <Select
                      value={formData.taxId.toString()}
                      onValueChange={(value) =>
                        handleInputChange("taxId", parseInt(value))
                      }
                    >
                      <SelectTrigger className="focus:ring-2 focus:ring-green-500 focus:border-green-500">
                        <SelectValue placeholder="Select tax" />
                      </SelectTrigger>
                      <SelectContent>
                        {taxes.map((tax) => (
                          <SelectItem key={tax.id} value={tax.id.toString()}>
                            {tax.name} ({tax.rate}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                      Selling Price *
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
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      className="focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
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
                          Number.parseFloat(e.target.value) || 0
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
                          Number.parseFloat(e.target.value) || 0
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
                          Number.parseInt(e.target.value) || 0
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

            {/* Tax & Compliance */}
            <div className="bg-white p-4 rounded-lg border space-y-4">
              <h3 className="text-xs font-semibold text-gray-700 border-b pb-2">
                Tax & Compliance
              </h3>

              <div className="flex gap-6">
                {/* Left Side */}
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
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      className="focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">
                      Country of Origin *
                    </Label>
                    <Popover
                      open={countrySearchOpen}
                      onOpenChange={setCountrySearchOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={countrySearchOpen}
                          className="w-full justify-between focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          {formData.ebmCountryOfOrigin
                            ? countries.find(
                                (country) =>
                                  country.code === formData.ebmCountryOfOrigin
                              )?.name
                            : "Select country..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search country..." />
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup>
                            {countries.map((country) => (
                              <CommandItem
                                key={country.code}
                                value={country.name}
                                onSelect={() => {
                                  handleInputChange(
                                    "ebmCountryOfOrigin",
                                    country.code
                                  );
                                  setCountrySearchOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.ebmCountryOfOrigin === country.code
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {country.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">
                      Quantity Unit *
                    </Label>
                    <Select
                      value={formData.ebmQuantityUnit}
                      onValueChange={(value) =>
                        handleInputChange("ebmQuantityUnit", value)
                      }
                    >
                      <SelectTrigger className="focus:ring-2 focus:ring-green-500 focus:border-green-500">
                        <SelectValue placeholder="Select quantity unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {quantityUnits.map((unit) => (
                          <SelectItem key={unit.code} value={unit.code}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">
                      Product Type *
                    </Label>
                    <Select
                      value={formData.ebmProductType}
                      onValueChange={(value) =>
                        handleInputChange("ebmProductType", value)
                      }
                    >
                      <SelectTrigger className="focus:ring-2 focus:ring-green-500 focus:border-green-500">
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                      <SelectContent>
                        {productTypes.map((type) => (
                          <SelectItem key={type.code} value={type.code}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">
                      Packaging Unit *
                    </Label>
                    <Select
                      value={formData.ebmPackagingUnit}
                      onValueChange={(value) =>
                        handleInputChange("ebmPackagingUnit", value)
                      }
                    >
                      <SelectTrigger className="focus:ring-2 focus:ring-green-500 focus:border-green-500">
                        <SelectValue placeholder="Select packaging unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {packagingUnits.map((unit) => (
                          <SelectItem key={unit.code} value={unit.code}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">
                      Item Class Code *
                    </Label>
                    <Popover
                      open={itemClassSearchOpen}
                      onOpenChange={setItemClassSearchOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={itemClassSearchOpen}
                          className="w-full justify-between focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          {formData.ebmItemClassCode.value
                            ? `${formData.ebmItemClassCode.value} - ${formData.ebmItemClassCode.label}`
                            : "Search agriculture, food..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search agriculture, food, fruits, vegetables..."
                            value={itemClassSearchTerm}
                            onValueChange={setItemClassSearchTerm}
                          />
                          {isLoadingItemClass ? (
                            <div className="p-4 text-center text-xs text-gray-500">
                              Searching...
                            </div>
                          ) : itemClassCodes.length === 0 ? (
                            <CommandEmpty>
                              {itemClassSearchTerm
                                ? "No matching items found."
                                : "Type to search for agriculture-related items..."}
                            </CommandEmpty>
                          ) : (
                            <CommandGroup className="max-h-64 overflow-y-auto">
                              {itemClassCodes.map((item) => (
                                <CommandItem
                                  key={item.itemClsCd}
                                  value={`${item.itemClsCd}-${item.itemClsNm}`}
                                  onSelect={() => {
                                    handleInputChange("ebmItemClassCode", {
                                      label: item.itemClsNm,
                                      value: item.itemClsCd,
                                    });
                                    setItemClassSearchOpen(false);
                                    setItemClassSearchTerm("");
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.ebmItemClassCode.value ===
                                        item.itemClsCd
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {item.itemClsCd}
                                    </span>
                                    <span className="text-xs text-gray-600">
                                      {item.itemClsNm}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </Command>
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