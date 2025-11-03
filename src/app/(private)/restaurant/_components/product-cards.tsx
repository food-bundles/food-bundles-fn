"use client";

import React from "react";
import { useState, useRef } from "react";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCart, useCartItem } from "@/app/contexts/cart-context";
import { toast } from "sonner";

type Product = {
  id: string;
  productName: string;
  unitPrice: number;
  unit: string;
  bonus: number;
  createdBy: string;
  expiryDate: Date | null;
  images: string[];
  quantity: number;
  sku: string;
  category: string;
  rating?: number;
  soldCount?: number;
  status: string;
};

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const { addToCart, updateCartItem } = useCart();
  const cartItem = useCartItem(product.id);
  const [quantity, setQuantity] = useState(cartItem?.quantity || 1);
  const [inputValue, setInputValue] = useState(
    cartItem?.quantity?.toString() || "1"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if product is in cart
  const isInCart = !!cartItem;

  const handleCartAction = async () => {
    const finalQuantity = Number.parseInt(inputValue) || 0;

    if (finalQuantity <= 0) {
      toast.error("Please enter a valid quantity greater than 0");
      return;
    }

    if (finalQuantity > product.quantity) {
      toast.error(`Maximum available quantity is ${product.quantity}`);
      return;
    }

    setIsProcessing(true);

    try {
      let success = false;
      if (isInCart && cartItem) {
        success = await updateCartItem(cartItem.id, finalQuantity);
      } else {
        success = await addToCart(product.id, finalQuantity);
      }

      if (success) {
        setQuantity(finalQuantity);
        setInputValue(finalQuantity.toString());
      }
    } catch (error) {
      console.error("Cart action error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "" || /^\d+$/.test(value)) {
      setInputValue(value);

      const numValue = Number.parseInt(value) || 0;
      if (numValue > 0) {
        setQuantity(Math.min(numValue, product.quantity));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const newQuantity = Math.min(quantity + 1, product.quantity);
      setQuantity(newQuantity);
      setInputValue(newQuantity.toString());
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const newQuantity = Math.max(1, quantity - 1);
      setQuantity(newQuantity);
      setInputValue(newQuantity.toString());
    } else if (e.key === "Enter") {
      handleCartAction();
    }
  };

  // Update quantity when cart item changes
  React.useEffect(() => {
    if (cartItem) {
      setQuantity(cartItem.quantity);
      setInputValue(cartItem.quantity.toString());
    }
  }, [cartItem]);


  return (
    <Card className="w-full max-w-sm bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden py-0">
      <CardContent className="p-0">
        <div className="relative">
          <OptimizedImage
            src={product.images[0] || "/placeholder.svg"}
            alt={product.productName}
            width={300}
            height={200}
            className="w-full h-48 object-cover"
            transformation={[
              { width: 600, height: 400, crop: "fill", quality: "80" }
            ]}
          />
          {product.bonus > 0 && (
            <div className="absolute top-3 right-3 bg-red-500 text-white text-sm font-semibold px-2 py-1 rounded">
              -{product.bonus}%
            </div>
          )}
          {isInCart && (
            <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
              In Cart
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
   
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
            {product.productName}
          </h3>

          {(product.rating || product.soldCount) && (
            <div className="flex items-center justify-between">
              {product.rating && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating!)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">
                    ({product.rating})
                  </span>
                </div>
              )}

              {product.soldCount && product.soldCount > 0 && (
                <Badge className="bg-orange-100 text-orange-600 text-xs font-medium border-0">
                  {product.soldCount.toLocaleString()} sold
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="text-xl font-bold text-gray-900">
              {product.unitPrice.toLocaleString()} RWF/{product.unit}
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleQuantityChange}
                onKeyDown={handleKeyDown}
                disabled={isProcessing}
                className="w-16 h-8 text-center text-lg font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              />

              <Button
                onClick={handleCartAction}
                disabled={isProcessing}
                size="sm"
                className={`cursor-pointer ${
                  isInCart
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-green-500 hover:bg-green-600"
                } text-white`}
              >
                {isProcessing
                  ? isInCart
                    ? "Updating..."
                    : "Adding..."
                  : isInCart
                  ? "Update"
                  : "Buy now"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
