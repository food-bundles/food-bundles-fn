"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
  category: string;
  rating: number;
  soldCount: number;
};

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (change: number) => {
    setQuantity(Math.max(1, quantity + change));
  };

  const handleAddToCart = () => {
    console.log(
      `Adding ${quantity} ${product.unit} of ${product.productName} to cart`
    );
    // Here you would typically call your cart service
  };

  const getCategoryBadge = (category: string) => {
    const badges = {
      VEGETABLES: { label: "Organic", color: "bg-green-100 text-green-800" },
      FRUITS: { label: "Fresh", color: "bg-orange-100 text-orange-800" },
      GRAINS: { label: "Artisan", color: "bg-amber-100 text-amber-800" },
      TUBERS: { label: "Farm Fresh", color: "bg-yellow-100 text-yellow-800" },
      LEGUMES: { label: "Organic", color: "bg-green-100 text-green-800" },
      HERBS_SPICES: {
        label: "Premium",
        color: "bg-purple-100 text-purple-800",
      },
    };
    return (
      badges[category as keyof typeof badges] || {
        label: "Fresh",
        color: "bg-blue-100 text-blue-800",
      }
    );
  };

  const categoryBadge = getCategoryBadge(product.category);

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-0">
        <div className="relative">
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.productName}
            width={300}
            height={200}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          {product.bonus > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              -{product.bonus}%
            </Badge>
          )}
          <div className="absolute top-2 right-2">
            <Badge className={`${categoryBadge.color} text-xs`}>
              {categoryBadge.label}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-2">
            <p className="text-sm text-gray-600">{product.createdBy}</p>
            <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
              {product.productName}
            </h3>
          </div>

          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">({product.rating})</span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-lg font-bold text-gray-900">
                ${product.unitPrice.toFixed(2)}/{product.unit}
              </span>
              {product.soldCount > 0 && (
                <p className="text-xs text-gray-500">
                  {product.soldCount.toLocaleString()} sold
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleQuantityChange(1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={handleAddToCart}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
