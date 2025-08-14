import { OrdersContent } from "./_components/orders-content";
import type { Order } from "./_components/orders-columns";

// Dummy orders data
async function getOrders(): Promise<Order[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  return [
    {
      id: "1",
      orderNumber: "#ORD-87429",
      orderDate: "July 12, 2024",
      payable: 31.95,
      status: "pending",
      logistics: { assigned: false },
      customerName: "John Doe",
      items: [
        { name: "Organic Tomatoes", quantity: 2, price: 9.98 },
        { name: "Free-Range Eggs", quantity: 1, price: 6.99 },
        { name: "Artisan Sourdough Bread", quantity: 1, price: 7.99 },
      ],
    },
    {
      id: "2",
      orderNumber: "#ORD-87430",
      orderDate: "July 12, 2024",
      payable: 45.5,
      status: "confirmed",
      logistics: { assigned: true, assignedTo: "John D." },
      customerName: "Sarah Johnson",
      items: [
        { name: "Fresh Atlantic Salmon", quantity: 1, price: 18.99 },
        { name: "Organic Spinach", quantity: 3, price: 10.47 },
        { name: "Grass-Fed Ground Beef", quantity: 1, price: 9.99 },
      ],
    },
    {
      id: "3",
      orderNumber: "#ORD-87418",
      orderDate: "July 11, 2024",
      payable: 28.99,
      status: "processing",
      logistics: { assigned: true, assignedTo: "Alex S." },
      customerName: "Mike Chen",
      items: [
        { name: "Artisan Sourdough Bread", quantity: 2, price: 15.98 },
        { name: "Organic Tomatoes", quantity: 1, price: 4.99 },
        { name: "Free-Range Eggs", quantity: 1, price: 6.99 },
      ],
    },
    {
      id: "4",
      orderNumber: "#ORD-87415",
      orderDate: "July 11, 2024",
      payable: 56.75,
      status: "ready",
      logistics: { assigned: true, assignedTo: "Michael T." },
      customerName: "Lisa Rodriguez",
      items: [
        { name: "Fresh Atlantic Salmon", quantity: 2, price: 37.98 },
        { name: "Organic Spinach", quantity: 2, price: 6.98 },
        { name: "Grass-Fed Ground Beef", quantity: 1, price: 9.99 },
      ],
    },
    {
      id: "5",
      orderNumber: "#ORD-87402",
      orderDate: "July 10, 2024",
      payable: 89.99,
      status: "delivered",
      logistics: { assigned: true, assignedTo: "Sarah L." },
      customerName: "David Wilson",
      items: [
        { name: "Fresh Atlantic Salmon", quantity: 3, price: 56.97 },
        { name: "Artisan Sourdough Bread", quantity: 2, price: 15.98 },
        { name: "Organic Tomatoes", quantity: 2, price: 9.98 },
      ],
    },
    {
      id: "6",
      orderNumber: "#ORD-87390",
      orderDate: "July 10, 2024",
      payable: 12.75,
      status: "cancelled",
      logistics: { assigned: false },
      customerName: "Emma Davis",
      items: [
        { name: "Organic Spinach", quantity: 2, price: 6.98 },
        { name: "Free-Range Eggs", quantity: 1, price: 6.99 },
      ],
    },
    {
      id: "7",
      orderNumber: "#ORD-87388",
      orderDate: "July 09, 2024",
      payable: 67.25,
      status: "refunded",
      logistics: { assigned: false },
      customerName: "Robert Brown",
      items: [
        { name: "Fresh Atlantic Salmon", quantity: 2, price: 37.98 },
        { name: "Grass-Fed Ground Beef", quantity: 2, price: 19.98 },
        { name: "Artisan Sourdough Bread", quantity: 1, price: 7.99 },
      ],
    },
  ];
}

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900 mb-2">My Orders</h1>
        </div>

        <OrdersContent orders={orders} />
      </main>
    </div>
  );
}
