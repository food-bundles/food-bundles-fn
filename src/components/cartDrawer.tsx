/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useCart } from "@/app/contexts/cart-context";
import { Spinner } from "./ui/shadcn-io/spinner";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const {
    // cart,
    cartItems,
    updateCartItem,
    removeCartItem,
    clearCart,
    isLoading,
    totalItems,
    totalAmount,
  } = useCart();

  // Check subscription benefits
  // const cartWithRestaurant = cart as any;
  // const hasActiveSubscription = cartWithRestaurant?.restaurant?.subscriptions?.some(
  //   (sub: any) => sub.status === 'ACTIVE' && sub.plan
  // );
  // const subscriptionPlan = hasActiveSubscription 
  //   ? cartWithRestaurant?.restaurant?.subscriptions?.find((sub: any) => sub.status === 'ACTIVE')?.plan 
  //   : null;
  
  // const hasFreeDelivery = subscriptionPlan?.freeDelivery || false;
  // const deliveryFee = hasFreeDelivery ? 0 : totalAmount < 100000 ? 5000 : 0;

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

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full bg-white text-gray-900 z-50 transform transition-all duration-300 ease-in-out overflow-y-auto shadow-2xl  scrollbar-hide
          w-[90vw] sm:w-[300px] md:w-[350px] lg:w-[400px]
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-green-700  flex justify-between items-center px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-base font-medium text-white">
              My Cart
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white transition-colors hover:rotate-90 transform duration-200"
          >
            <X className="w-6 h-6 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-2 pt-6 space-y-3">
          {/* Clear cart button */}
          {cartItems.length > 0 && (
            <div className="flex justify-between items-center">
              <p className="text-gray-600 text-sm sm:text-xs lg:text-sm">
                You have{" "}
                <span className="text-green-500 font-bold">{totalItems}</span>{" "}
                items in your cart
              </p>
              <button
                onClick={handleClearCart}
                className="text-red-600 text-sm sm:text-xs lg:text-sm hover:text-red-500 border-0 shadow-none hover:bg-transparent bg-transparent px-1"
              >
                Clear Cart
              </button>
            </div>
          )}

          {/* Cart items list */}
          <div className="space-y-0">
            {isLoading && cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Spinner variant="ring" />
              </div>
            ) : cartItems.length === 0 ? (
              <Card className="border-0 shadow-none">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500 text-sm sm:text-xs">
                    Your cart is empty
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    Dear customer, add some products to your cart
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
            <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 pb-6 px-2 sm:px-1">
              <div className="flex justify-between text-gray-900">
                <span className="text-[14px]">Delivery fee</span>
                <span className="line-through text-[14px] text-gray-400">
                  Rwf 5,000
                </span>
              </div>
              <div className="flex justify-between items-center mb-2 sm:mb-1">
                <span className="text-lg sm:text-sm font-semibold">Total:</span>
                <span className="text-lg sm:text-sm font-bold">
                  {totalAmount} Rwf
                </span>
              </div>

              <a href="/restaurant/checkout">
                <Button className="w-full sm:py-2 py-1 text-sm sm:text-xs bg-green-700 hover:bg-green-800 rounded-none">
                  Buy Now
                </Button>
              </a>
            </div>
          )}
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
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setInputValue(value);
      const numValue = Number.parseFloat(value) || 0;
      if (numValue > 0) setQuantity(numValue);
    }
  };

  const handleQuantityUpdate = async () => {
    const finalQuantity = Number.parseFloat(inputValue) || 1;
    setIsUpdating(true);
    await onQuantityUpdate(item.id, finalQuantity);
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(item.id);
    setIsDeleting(false);
  };

  const totalAmount = item.subtotal || item.unitPrice * quantity;

  return (
    <Card className="border-0 shadow-none hover:shadow-none border-b rounded-none">
      <CardContent className="p-0">
        <div className="flex items-start gap-2">
          {/* Product Image */}
          <div className="w-16 h-20 sm:w-12 sm:h-16 p-1 rounded-lg overflow-hidden border shrink-0">
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
            <h3 className="font-semibold text-gray-900 lg:text-sm text-xs mb-1 truncate">
              {item.product?.productName ||
                item.productName ||
                "Unknown Product"}
            </h3>
            <p className="lg:text-sm text-xs text-gray-600">
              {item.unitPrice}
              <span className="ml-1 text-xs">
                Rwf ({item.product?.unit || item.unit || "unit"})
              </span>
            </p>
            <p className="text-green-700 font-medium lg:text-sm text-xs">
              {totalAmount}
              <span className="ml-1 text-xs">Rwf (Total)</span>
            </p>
          </div>

          <div className="flex flex-col items-end justify-between h-full space-y-0">
            <div className="flex flex-col items-end justify-between h-full space-y-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      const newValue = Math.max(
                        0.1,
                        (Number.parseFloat(inputValue) || 1) - 1
                      );
                      setInputValue(newValue.toString());
                      setQuantity(newValue);
                    }}
                    disabled={isUpdating}
                    className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
                  >
                    -
                  </button>

                  <input
                    type="number"
                    value={inputValue}
                    onChange={handleQuantityChange}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") await handleQuantityUpdate();
                    }}
                    step="0.01"
                    min="0.1"
                    disabled={isUpdating}
                    className="w-12 text-center text-sm font-semibold focus:outline-none disabled:bg-gray-100 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const newValue = (Number.parseFloat(inputValue) || 0) + 1;
                      setInputValue(newValue.toString());
                      setQuantity(newValue);
                    }}
                    disabled={isUpdating}
                    className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Update Button */}
                <Button
                  onClick={handleQuantityUpdate}
                  disabled={
                    isUpdating || Number.parseFloat(inputValue) === item.quantity
                  }
                  size="sm"
                  className="w-12 h-6 text-xs bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 flex items-center justify-center rounded-full cursor-pointer"
                >
                  🗸
                </Button>
              </div>
            </div>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-green-500 hover:text-green-400 transition-colors hover:rotate-90 transform duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-8 sm:w-6 h-8 sm:h-6" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
