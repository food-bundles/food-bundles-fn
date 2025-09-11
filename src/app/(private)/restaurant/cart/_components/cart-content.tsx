/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/app/contexts/cart-context";

export function CartContent() {
  const {
    cartItems,
    updateCartItem,
    removeCartItem,
    clearCart,
    isLoading,
    error,
  } = useCart();

  console.log("cartItems ================ ", cartItems);

  const handleDelete = async (itemId: string) => {
    await removeCartItem(itemId);
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading cart...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">Error loading cart</p>
            <p className="text-gray-400 text-sm mt-2">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          My Cart
        </h1>
        {cartItems.length > 0 && (
          <Button
            variant="outline"
            onClick={handleClearCart}
            className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
          >
            Clear Cart
            <Trash2 className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Your cart is empty</p>
              <p className="text-gray-400 text-sm mt-2">
                Add some products to get started
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onQuantityUpdate={updateCartItem}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CartItemRow({
  item,
  onQuantityUpdate,
  onDelete,
}: {
  item: any;
  onQuantityUpdate: (itemId: string, quantity: number) => void;
  onDelete: (itemId: string) => void;
}) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [inputValue, setInputValue] = useState(item.quantity.toString());
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "" || /^\d+$/.test(value)) {
      setInputValue(value);

      const numValue = Number.parseInt(value) || 0;
      if (numValue > 0) {
        setQuantity(numValue);
      }
    }
  };

  const handleQuantityUpdate = async () => {
    const finalQuantity = Number.parseInt(inputValue) || 1;

    if (finalQuantity <= 0) {
      alert("Please enter a valid quantity greater than 0");
      return;
    }

    if (finalQuantity === item.quantity) {
      return; // No change needed
    }

    setIsUpdating(true);
    await onQuantityUpdate(item.id, finalQuantity);
    setIsUpdating(false);
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      setInputValue(newQuantity.toString());
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const newQuantity = Math.max(1, quantity - 1);
      setQuantity(newQuantity);
      setInputValue(newQuantity.toString());
    } else if (e.key === "Enter") {
      await handleQuantityUpdate();
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(item.id);
    setIsDeleting(false);
  };

 useEffect(() => {
   setQuantity(item.quantity);
   setInputValue(item.quantity.toString());
 }, [item.quantity]);
  const totalAmount = item.subtotal || item.unitPrice * quantity;

  return (
    <div className="flex items-center justify-between border-b border-gray-200 pb-6">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-lg overflow-hidden border bg-gray-100">
          <Image
            src={
              item.product?.images?.[0] ||
              item.images?.[0] ||
              "/placeholder.svg" ||
              "/placeholder.svg"
            }
            alt={item.product?.productName || item.productName || "Product"}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            {item.product?.productName || item.productName || "Unknown Product"}
          </h3>
          <p className="text-sm text-gray-600">
            Unit Price: Rwf {item.unitPrice.toFixed(2)}/
            {item.product?.unit || item.unit || "unit"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-10">
        <div className="w-[20rem] flex items-center space-x-4">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleQuantityChange}
              onKeyDown={handleKeyDown}
              disabled={isUpdating}
              className="w-20 h-10 text-center text-lg font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
            />
            <Button
              onClick={handleQuantityUpdate}
              disabled={
                isUpdating || Number.parseInt(inputValue) === item.quantity
              }
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
            >
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </div>
          <div className="text-center items-end">
            <p className="font-semibold text-gray-900">
              {totalAmount.toFixed(2)} Rwf
            </p>
          </div>
        </div>

        <div className="">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50 bg-transparent"
          >
            {isDeleting ? "Removing..." : "Remove"}
          </Button>
        </div>
      </div>
    </div>
  );
}
