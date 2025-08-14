import { CheckoutProgress } from "../_components/checkout-progress"
import { ConfirmationContent } from "../_components/confirmation-content"

async function getOrderData() {
  // Simulate fetching order data
  await new Promise((resolve) => setTimeout(resolve, 100))

  return {
    orderNumber: "ORD-87429",
    orderDate: "July 12, 2024 - 12:35 PM",
    customerName: "John Doe",
    phoneNumber: "(123) 456-7890",
    deliveryAddress: "123 Main St, Apt 4B",
    orderItems: [
      { name: "Organic Tomatoes", quantity: 2, price: 9.98 },
      { name: "Free-Range Eggs", quantity: 1, price: 6.99 },
      { name: "Artisan Sourdough Bread", quantity: 1, price: 7.99 },
    ],
    total: 31.95,
    estimatedDelivery: "Today, 35-50 minutes (by 1:25 PM)",
    paymentMethod: "Cash on Delivery - $31.95",
  }
}

export default async function ConfirmationPage() {
  const orderData = await getOrderData()

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="container mx-auto px-6 py-8">
        <CheckoutProgress currentStep="confirmation" />

        <ConfirmationContent orderData={orderData} />
      </main>
    </div>
  )
}
