import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { CheckoutProgress } from "../_components/checkout-progress";
import { Button } from "@/components/ui/button";
import { TopNavigation } from "../../_components/restaurant-top-nav";

export default async function ConfirmationPage() {
  // Simulate order processing
  await new Promise((resolve) => setTimeout(resolve, 100));

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />

      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/restaurant"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>
        <CheckoutProgress currentStep="confirmation" />

        <div className="max-w-md mx-auto text-center mt-16">
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-24 h-24 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-white" strokeWidth={3} />
                </div>
              </div>
            </div>
            <div className="absolute inset-0 w-32 h-32 mx-auto bg-yellow-300 rounded-full opacity-20 animate-ping"></div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment successful!
          </h1>

          <div className="space-y-4">
            <Button
              asChild
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              <Link href="/restaurant/orders">Track your order →</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
