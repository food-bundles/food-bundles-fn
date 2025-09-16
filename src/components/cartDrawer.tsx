/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { X, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useCart } from "@/app/contexts/cart-context";
import Link from "next/link";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const {
    cartItems,
    updateCartItem,
    removeCartItem,
    clearCart,
    isLoading,
    error,
    totalItems,
    totalAmount,
  } = useCart();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleClearCart = async () => {
    await clearCart();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-opacity-50 z-40" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[540px] bg-white text-gray-900 z-50 transform transition-all duration-300 ease-in-out overflow-y-auto shadow-2xl border-l border-gray-200 scrollbar-hide ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 flex justify-between items-center p-6">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-gray-600" />
            <span className="text-xl font-bold text-gray-900">My Cart</span>
            {totalItems > 0 && (
              <Badge className="bg-red-500 text-white text-xs">
                {totalItems}
              </Badge>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors hover:rotate-90 transform duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Clear cart button */}
          {cartItems.length > 0 && (
            <div className="flex justify-between items-center">
              <p className="text-gray-600 text-sm">
                You have {totalItems} items in your cart
              </p>
              <Button
                onClick={handleClearCart}
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
              >
                Clear Cart
                <Trash2 className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Cart items list */}
          <div className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">Loading cart...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-red-500">Error loading cart</p>
                  <p className="text-gray-400 text-sm mt-2">{error}</p>
                </CardContent>
              </Card>
            ) : cartItems.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Add some products to get started
                  </p>
                </CardContent>
              </Card>
            ) : (
              cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onQuantityUpdate={updateCartItem}
                  onDelete={removeCartItem}
                />
              ))
            )}
          </div>

          {/* Total and checkout button */}
          {cartItems.length > 0 && (
            <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 pb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-lg font-bold">
                  {totalAmount.toFixed(2)} Rwf
                </span>
              </div>
              <Link href="/restaurant/checkout">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          )}

          <div className="h-8"></div>
        </div>
      </div>
    </>
  );
}

function CartItem({
  item,
  onQuantityUpdate,
  onDelete,
}: {
  item: any;
  onQuantityUpdate: (itemId: string, quantity: number) => Promise<boolean>;
  onDelete: (itemId: string) => Promise<boolean>;
}) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [inputValue, setInputValue] = useState(item.quantity.toString());
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setQuantity(item.quantity);
    setInputValue(item.quantity.toString());
  }, [item.quantity]);

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
  console.log("Updating quantity for item:", item.id, "to:", inputValue);
  const finalQuantity = Number.parseInt(inputValue) || 1;
  console.log("Final quantity:", finalQuantity);

  setIsUpdating(true);
  const success = await onQuantityUpdate(item.id, finalQuantity);
  console.log("Update result:", success);
  setIsUpdating(false);
};

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      await handleQuantityUpdate();
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(item.id);
    setIsDeleting(false);
  };

  const totalAmount = item.subtotal || item.unitPrice * quantity;

  return (
    <Card className="border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Product Image */}
          <div className="w-16 h-16 rounded-lg overflow-hidden border bg-gray-100 flex-shrink-0">
            <Image
              src={
                item.product?.images?.[0] ||
                item.images?.[0] ||
                "/placeholder.svg"
              }
              alt={item.product?.productName || item.productName || "Product"}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
              {item.product?.productName ||
                item.productName ||
                "Unknown Product"}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Rwf {item.unitPrice.toFixed(2)} /{" "}
              {item.product?.unit || item.unit || "unit"}
            </p>

            {/* Quantity Controls */}
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={inputValue}
                onChange={handleQuantityChange}
                onKeyDown={handleKeyDown}
                disabled={isUpdating}
                className="w-12 h-8 text-center text-sm font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              />
              <Button
                onClick={handleQuantityUpdate}
                disabled={
                  isUpdating || Number.parseInt(inputValue) === item.quantity
                }
                size="sm"
                className="h-8 text-xs bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
              >
                {isUpdating ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>

          {/* Price and Remove Button */}
          <div className="flex flex-col items-end justify-between h-full">
            <p className="font-semibold text-gray-900 text-sm">
              {totalAmount.toFixed(2)} Rwf
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50 bg-transparent"
            >
              {isDeleting ? "Removing..." : "Remove"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
