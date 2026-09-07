"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import {
  orderService,
  PublicOrderSummary,
} from "@/app/services/orderService";

export default function PayOrderPage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;

  const [order, setOrder] = useState<PublicOrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "MOBILE_MONEY" | "CARD" | "BANK_TRANSFER"
  >("MOBILE_MONEY");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orderService.getOrderByPaymentLink(token);
        setOrder(response.data);
      } catch (err) {
        const message = isAxiosError<{ message?: string }>(err)
          ? err.response?.data?.message
          : undefined;
        setError(message || "This payment link is invalid or has expired.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [token]);

  const handlePay = async () => {
    if (paymentMethod === "MOBILE_MONEY" && !phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }

    setIsPaying(true);
    try {
      await orderService.payViaPaymentLink(token, {
        paymentMethod,
        phoneNumber: paymentMethod === "MOBILE_MONEY" ? phoneNumber : undefined,
      });
      toast.success("Payment submitted");
      setPaid(true);
    } catch (err) {
      const message = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      toast.error(message || "Payment failed. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner variant="ring" className="w-10 h-10" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-6 text-center">
          <h1 className="text-lg font-semibold text-red-600 mb-2">
            Payment Link Unavailable
          </h1>
          <p className="text-sm text-gray-600">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-10">
      <Card className="max-w-md w-full p-6 space-y-6">
        <div>
          <h1 className="text-lg font-semibold">Pay for Order</h1>
          <p className="text-sm text-gray-600">
            {order.restaurantName} — Order #{order.orderNumber}
          </p>
        </div>

        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex justify-between text-sm text-gray-700"
            >
              <span>
                {item.productName} × {item.quantity} {item.unit}
              </span>
              <span>{item.subtotal.toLocaleString()} {order.currency}</span>
            </div>
          ))}
          <div className="flex justify-between font-semibold border-t pt-2">
            <span>Total</span>
            <span>
              {order.totalAmount.toLocaleString()} {order.currency}
            </span>
          </div>
        </div>

        {paid ? (
          <p className="text-sm text-green-600 text-center">
            Payment submitted successfully. Thank you!
          </p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(
                    value as "CASH" | "MOBILE_MONEY" | "CARD" | "BANK_TRANSFER"
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === "MOBILE_MONEY" && (
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  placeholder="e.g. 0788123456"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            )}

            <Button
              onClick={handlePay}
              disabled={isPaying}
              className="w-full"
              variant="green"
            >
              {isPaying
                ? "Processing..."
                : `Pay ${order.totalAmount.toLocaleString()} ${order.currency}`}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
