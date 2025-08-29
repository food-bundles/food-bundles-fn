/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import type { Product } from "@/app/contexts/product-context";
import type { ProductFormData } from "./create-product-modal";

interface EditProductModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (productData: ProductFormData) => void;
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

export function EditProductModal({
  product,
  open,
  onOpenChange,
  onSubmit,
}: EditProductModalProps) {
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

  useEffect(() => {
    if (product) {
      setFormData({
        productName: product.productName,
        unitPrice: product.unitPrice,
        purchasePrice: 0, // This might need to be fetched separately
        categoryId: product.category,
        bonus: product.bonus,
        sku: product.sku,
        quantity: product.quantity,
        images: [],
        expiryDate: product.expiryDate
          ? new Date(product.expiryDate)
          : undefined,
        unit: product.unit,
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) =>
                  handleInputChange("productName", e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange("sku", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  handleInputChange("quantity", Number(e.target.value))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
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
              <Label htmlFor="unitPrice">Unit Price (RWF)</Label>
              <Input
                id="unitPrice"
                type="number"
                value={formData.unitPrice}
                onChange={(e) =>
                  handleInputChange("unitPrice", Number(e.target.value))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonus">Bonus (%)</Label>
              <Input
                id="bonus"
                type="number"
                value={formData.bonus}
                onChange={(e) =>
                  handleInputChange("bonus", Number(e.target.value))
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-green-500 hover:bg-green-600">
              Update Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
