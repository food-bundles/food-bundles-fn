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
};

export function CheckoutSummary({
  totalQuantities,
  subtotal,
  discount,
  deliveryFee,
  total,
}: Props) {
  const router = useRouter();

  const handleCheckout = () => {
    // Simulate payment processing
    setTimeout(() => {
      router.push("/restaurant/cart/confirmation");
    }, 1000);
  };

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
              <span>{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleCheckout}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3"
        >
          Continue Checkout
        </Button>
      </CardContent>
    </Card>
  );
}
