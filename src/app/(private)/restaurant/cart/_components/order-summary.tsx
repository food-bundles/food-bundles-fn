"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/app/contexts/cart-context";

export interface OrderSummaryData {
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  discount?: number;
  deliveryFee?: number;
  total?: number;
}

type Props = {
  variant?: "cart" | "checkout" | "confirmation";
  onAction?: () => void;
  // For checkout/confirmation: pass static data
  staticData?: OrderSummaryData;
};

export function OrderSummary({
  variant = "cart",
  onAction,
  staticData,
}: Props) {
  const router = useRouter();
  const { totalItems, totalQuantity, totalAmount, isLoading } = useCart();

  // Determine data source based on variant
  const summaryData = (() => {
    if (staticData && (variant === "checkout" || variant === "confirmation")) {
      // Use static data for checkout/confirmation
      return {
        totalItems: staticData.totalItems,
        totalQuantity: staticData.totalQuantity,
        subtotal: staticData.subtotal,
        discount: staticData.discount ?? 0,
        deliveryFee: staticData.deliveryFee ?? 0,
        total:
          staticData.total ??
          staticData.subtotal +
            (staticData.deliveryFee ?? 0) -
            (staticData.discount ?? 0),
      };
    } else {
      // Use cart context data for cart variant (and fallback for others)
      return {
        totalItems,
        totalQuantity,
        subtotal: totalAmount,
        discount: 0,
        deliveryFee: 0,
        total: totalAmount,
      };
    }
  })();

  const getButtonConfig = () => {
    switch (variant) {
      case "cart":
        return {
          text: "Checkout",
          action: () => router.push("/restaurant/cart/checkout"),
        };
      case "checkout":
        return {
          text: "Buy now",
          action: () => {
            setTimeout(() => {
              router.push("/restaurant/cart/confirmation");
            }, 1000);
          },
        };
      case "confirmation":
        return {
          text: "Continue Shopping",
          action: () => router.push("/restaurant"),
        };
      default:
        return {
          text: "Continue",
          action: () => {},
        };
    }
  };

  const { text, action } = getButtonConfig();
  const finalAction = onAction || action;

  // Show loading only for cart variant when cart context is loading and no static data
  if (isLoading && variant === "cart" && !staticData) {
    return (
      <Card className="sticky top-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <p className="text-gray-500">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Items</span>
            <span className="font-medium">{summaryData.totalItems}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Quantity</span>
            <span className="font-medium">{summaryData.totalQuantity}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">
              Rwf {summaryData.subtotal.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="font-medium">
              {summaryData.discount.toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery fee</span>
            <span className="font-medium">
              {summaryData.deliveryFee.toFixed(1)} Rwf
            </span>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>Rwf {summaryData.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={finalAction}
          disabled={variant === "cart" && summaryData.totalItems === 0}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {text}
        </Button>
      </CardContent>
    </Card>
  );
}
