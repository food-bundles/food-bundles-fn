"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Clock, CreditCard, Eye, Printer, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type OrderData = {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  phoneNumber: string;
  deliveryAddress: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  estimatedDelivery: string;
  paymentMethod: string;
};

type Props = {
  orderData: OrderData;
};

export function ConfirmationContent({ orderData }: Props) {
  const [animationPhase, setAnimationPhase] = useState<
    "success" | "expanding" | "receipt"
  >("success");

  useEffect(() => {
    // Show success animation for 2 seconds
    const successTimer = setTimeout(() => {
      setAnimationPhase("expanding");
    }, 2000);

    // Show expanding animation for 0.8 seconds, then show receipt
    const expandTimer = setTimeout(() => {
      setAnimationPhase("receipt");
    }, 2800);

    return () => {
      clearTimeout(successTimer);
      clearTimeout(expandTimer);
    };
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 -mt-4">
      {/* Success Animation */}
      <div
        className={`absolute inset-0 flex items-start justify-center pt-8 transition-all duration-700 ease-in-out ${
          animationPhase === "success"
            ? "opacity-100 scale-100"
            : "opacity-0 scale-120 pointer-events-none"
        }`}
      >
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-28 h-28 mx-auto bg-gradient-to-r from-green-200 via-green-300 to-green-400 rounded-full flex items-center justify-center shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-r from-green-300 via-green-400 to-green-500 rounded-full flex items-center justify-center">
                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-7 w-7 text-white" strokeWidth={3} />
                </div>
              </div>
            </div>
            {/* Enhanced pulse animation */}
            <div className="absolute inset-0 w-28 h-28 mx-auto bg-green-300 rounded-full opacity-30 animate-ping"></div>
            <div className="absolute inset-0 w-28 h-28 mx-auto bg-green-400 rounded-full opacity-20 animate-pulse"></div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Order successully!
          </h1>
          <p className="text-gray-600 text-base">Thank you for your purchase</p>

          {/* Loading dots */}
          <div className="flex justify-center mt-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Receipt */}
      <div
        className={`transition-all duration-800 ${
          animationPhase === "receipt"
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8 pointer-events-none"
        }`}
      >
        <div className="w-full max-w-3xl mx-auto mt-4">
          <Card className="bg-green-50 border-green-200 shadow-lg">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              {/* Order Information Header */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Order Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order Number</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      {orderData.orderNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order Date</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      {orderData.orderDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Customer Name</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      {orderData.customerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">
                      {orderData.phoneNumber}
                    </p>
                  </div>
                </div>

                <div className="mb-4 sm:mb-6">
                  <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">
                    {orderData.deliveryAddress}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
                  Order Items
                </h3>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-green-100">
                  <div className="space-y-2 sm:space-y-3">
                    {orderData.orderItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2"
                      >
                        <span className="text-gray-900 text-sm sm:text-base">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-semibold text-gray-900 text-sm sm:text-base">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-gray-300 pt-3 mt-3 sm:mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-base sm:text-lg font-bold text-gray-900">
                          Total
                        </span>
                        <span className="text-base sm:text-lg font-bold text-green-600">
                          ${orderData.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery & Payment Info */}
              <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                    <Clock className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                      Estimated Delivery Time
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">
                      {orderData.estimatedDelivery}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                    <CreditCard className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                      Payment Method
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">
                      {orderData.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-3">
                <Link href="/restaurant/orders">
                  <Button className="bg-green-600 hover:bg-green-700 cursor-pointer text-white flex items-center justify-center gap-2 text-sm">
                    <Eye className="h-4 w-4" />
                    View Orders
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="flex items-center justify-center cursor-pointer gap-2 bg-transparent text-sm"
                >
                  <Printer className="h-4 w-4" />
                  Print Receipt
                </Button>
                <Link href="/restaurant/help">
                <Button
                  variant="outline"
                  className="flex items-center justify-center cursor-pointer gap-2 bg-transparent text-sm"
                >
                  <Phone className="h-4 w-4" />
                  Contact Customer
                  </Button>
                </Link>
              </div>

              <div className="text-center mt-4 sm:mt-6">
                <Link
                  href="/restaurant/dashboard"
                  className="text-green-600 hover:text-green-700 transition-colors text-sm sm:text-base"
                >
                  Continue Shopping →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
