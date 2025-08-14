"use client";

import type React from "react";

import { useState, useRef } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type CartItem = {
  id: string;
  productName: string;
  unitPrice: number;
  unit: string;
  quantity: number;
  images: string[];
  createdBy: string;
  category: string;
};

type Props = {
  cartItems: CartItem[];
};

export function CartContent({ cartItems: initialItems }: Props) {
  const [cartItems, setCartItems] = useState(initialItems);

  const handleDelete = (itemId: string) => {
    setCartItems((items) => items.filter((item) => item.id !== itemId));
  };

  const handleQuantityUpdate = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems((items) =>
      items.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          My Cart
        </h1>
        <Button
          variant="outline"
          onClick={handleClearCart}
          className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
        >
          Clear Cart
          <Trash2 className="h-4 w-4 mr-2" />
        </Button>
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
                  onQuantityUpdate={handleQuantityUpdate}
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
  item: CartItem;
  onQuantityUpdate: (itemId: string, quantity: number) => void;
  onDelete: (itemId: string) => void;
}) {
  const [quantity, setQuantity] = useState(item.quantity);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Number.parseInt(e.target.value) || 1;
    setQuantity(newQuantity);
    onQuantityUpdate(item.id, newQuantity);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      onQuantityUpdate(item.id, newQuantity);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const newQuantity = Math.max(1, quantity - 1);
      setQuantity(newQuantity);
      onQuantityUpdate(item.id, newQuantity);
    }
  };

  const totalAmount = item.unitPrice * quantity;

  return (
    <div className="flex items-center justify-between  border-b border-gray-200">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-lg overflow-hidden border-b border-gray-200 bg-gray-100">
          <Image
            src={item.images[0] || "/placeholder.svg"}
            alt={item.productName}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            {item.productName}
          </h3>
          <p className="text-sm text-gray-600 mb-1">{item.createdBy}</p>
          <p className="text-sm text-gray-600">
            Unit Price: Rwf {item.unitPrice.toFixed(2)}/{item.unit}
          </p>
        </div>
      </div>
      {/* use start */}
      <div className="flex items-center justify-between gap-10">
        <div className="w-[20rem]  flex items-center space-x-4">
          <div className=" flex items-start">
            <input
              ref={inputRef}
              type="number"
              min="1"
              value={quantity}
              onChange={handleQuantityChange}
              onKeyDown={handleKeyDown}
              className="w-20 h-10 text-center text-lg font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
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
            onClick={() => onDelete(item.id)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
