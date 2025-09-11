"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CartContent } from "./_components/cart-content";
import { OrderSummary } from "./_components/order-summary";
import { CheckoutProgress } from "./_components/checkout-progress";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/restaurant"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue shopping
          </Link>
        </div>

        <CheckoutProgress currentStep="cart" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CartContent />
          </div>
          <div className="lg:col-span-1">
            <OrderSummary variant="cart" />
          </div>
        </div>
      </main>
    </div>
  );
}
