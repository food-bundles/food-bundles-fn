import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CartContent } from "./_components/cart-content";
import { OrderSummary } from "./_components/order-summary";
import { CheckoutProgress } from "./_components/checkout-progress";

type CartItem = {
  id: string;
  productName: string;
  unitPrice: number;
  unit: string;
  quantity: number;
  images: string[];
  createdBy: string;
  category: string;
};

async function getCartItems(): Promise<CartItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  return [
    {
      id: "1",
      productName: "Organic Tomatoes",
      unitPrice: 4.99,
      unit: "lb",
      quantity: 4,
      images: ["/imgs/eggs.svg"],
      createdBy: "Green Valley Farms",
      category: "VEGETABLES",
    },
    {
      id: "2",
      productName: "Fresh Atlantic Salmon",
      unitPrice: 18.99,
      unit: "lb",
      quantity: 7,
      images: ["/imgs/eggs.svg"],
      createdBy: "Ocean Harvest",
      category: "VEGETABLES",
    },
    {
      id: "3",
      productName: "Artisan Sourdough Bread",
      unitPrice: 7.99,
      unit: "loaf",
      quantity: 2,
      images: ["/imgs/eggs.svg"],
      createdBy: "Hearth Bakery",
      category: "GRAINS",
    },
  ];
}

export default async function CartPage() {
  const cartItems = await getCartItems();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const totalQuantities = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const deliveryFee = 0.0;
  const discount = 0.0;
  const total = subtotal + deliveryFee - discount;

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/restaurant"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue shoping
          </Link>
        </div>
        <CheckoutProgress currentStep="cart" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CartContent cartItems={cartItems} />
          </div>
          <div className="lg:col-span-1">
            <OrderSummary
              totalQuantities={totalQuantities}
              subtotal={subtotal}
              discount={discount}
              deliveryFee={deliveryFee}
              total={total}
              variant="cart"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
