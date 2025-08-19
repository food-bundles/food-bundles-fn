"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "./product-cards";

type ProductCategory =
  | "VEGETABLES"
  | "FRUITS"
  | "GRAINS"
  | "TUBERS"
  | "LEGUMES"
  | "HERBS_SPICES";

type Product = {
  id: string;
  productName: string;
  unitPrice: number;
  unit: string;
  bonus: number;
  createdBy: string;
  expiryDate: Date;
  images: string[];
  quantity: number;
  sku: string;
  category: ProductCategory;
  rating: number;
  soldCount: number;
};

type Props = {
  products: Product[];
};

export function ProductGrid({ products }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "VEGETABLES", label: "Vegetables" },
    { value: "FRUITS", label: "Fruits" },
    { value: "GRAINS", label: "Grains" },
    { value: "TUBERS", label: "Tubers" },
    { value: "LEGUMES", label: "Legumes" },
    { value: "HERBS_SPICES", label: "Herbs & Spices" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-gray-600">
          Showing {filteredProducts.length} products
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
