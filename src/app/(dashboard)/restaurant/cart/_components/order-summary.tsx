"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  totalQuantities: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  variant?: "cart" | "checkout" | "confirmation";
  onAction?: () => void; 
};

export function OrderSummary({
  totalQuantities,
  subtotal,
  discount,
  deliveryFee,
  total,
  variant = "cart",
  onAction,
}: Props) {
  const router = useRouter();

  const getButtonConfig = () => {
    switch (variant) {
      case "cart":
        return {
          text: "Checkout",
          action: () => router.push("/restaurant/cart/checkout"),
        };
      case "checkout":
        return {
          text: "Continue Checkout",
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

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Quantities</span>
            <span className="font-medium">{totalQuantities}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">Rwf {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="font-medium">{discount.toFixed(1)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery fee</span>
            <span className="font-medium">{deliveryFee.toFixed(1)} Rwf</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>Rwf {total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={finalAction}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3"
        >
          {text}
        </Button>
      </CardContent>
    </Card>
  );
}
