import { CheckoutProgress } from "./_components/checkout-progress";
import { cartService } from "@/app/services/cartService";
import { roleGuard } from "@/lib/role-guard";
import { UserRole } from "@/lib/types";
import { CheckoutForm } from "./_components/delivery-form";

export const dynamic = "force-dynamic";

export interface OrderSummaryData {
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  discount?: number;
  deliveryFee?: number;
  total?: number;
}

async function getCheckoutData(): Promise<OrderSummaryData | null> {
  try {
    await roleGuard([UserRole.RESTAURANT]);

    const cartResponse = await cartService.getMyCart();

    if (!cartResponse.success || !cartResponse.data) {
      console.log("No cart data found, using cart context");
      return null;
    }

    const cartData = cartResponse.data;

    return {
      totalItems: cartData.totalItems,
      totalQuantity: cartData.totalQuantity,
      subtotal: cartData.totalAmount,
      discount: 0,
      deliveryFee: 0,
      total: cartData.totalAmount,
    };
  } catch (error) {
    console.error("Error fetching checkout data:", error);
    return null;
  }
}

export default async function CheckoutPage() {
  const checkoutData = await getCheckoutData();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-6 py-8">
        <div className="flex justify-between"></div>
        <CheckoutProgress currentStep="checkout" />

        <div className="mt-8">
          <CheckoutForm staticData={checkoutData || undefined} />
        </div>
      </main>
    </div>
  );
}
