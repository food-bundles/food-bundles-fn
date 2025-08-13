import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CheckoutProgress } from "../_components/checkout-progress";
import { PaymentMethods } from "../_components/payment-methods";
import { DeliveryForm } from "../_components/delivery-form";
import { OrderSummary } from "../_components/order-summary";

async function getCheckoutData() {
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    totalQuantities: 13,
    subtotal: 168.87,
    discount: 0.0,
    deliveryFee: 0.0,
    total: 168.87,
  };
}

export default async function CheckoutPage() {
  const checkoutData = await getCheckoutData();

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="container mx-auto px-6 py-8">
        <div className="flex justify-between">
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/restaurant/cart"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to cart
            </Link>
          </div>
        </div>
        <CheckoutProgress currentStep="checkout" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <PaymentMethods />
            <DeliveryForm />
          </div>
          <div className="lg:col-span-1">
            <OrderSummary
              totalQuantities={checkoutData.totalQuantities}
              subtotal={checkoutData.subtotal}
              discount={checkoutData.discount}
              deliveryFee={checkoutData.deliveryFee}
              total={checkoutData.total}
              variant="checkout"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
