
import { Checkout } from "./_components/delivery-form";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-8">
        <Checkout />
      </main>
    </div>
  );
}
