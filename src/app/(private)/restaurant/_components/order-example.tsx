import { OrderDetailsCard } from "../_components/order-details-card";

// Example usage with your order data
export default function OrderDetailsExample() {
  const orderData = {
    id: "920732f8-2f1a-46a5-abad-afa06f432937",
    orderNumber: "ORD2601090008",
    totalAmount: 5600,
    billingName: "Sostene",
    status: "CONFIRMED",
    orderItems: [
      {
        id: "01fa55cb-13ed-4902-a0b2-e1aca8a6caa4",
        productName: "Egg",
        quantity: 1,
        unitPrice: 5000,
        subtotal: 5000,
        unit: "kg",
        images: ["https://res.cloudinary.com/dzxyelclu/image/upload/v1767461295/uemeox9muf0kvu7wezvh.jpg"],
        category: "Animal Products"
      },
      {
        id: "5c8b01ca-3b4a-4cbc-8772-27c39aeb5e89",
        productName: "Sweet patatoes",
        quantity: 1,
        unitPrice: 600,
        subtotal: 600,
        unit: "kg",
        images: ["https://res.cloudinary.com/dzxyelclu/image/upload/v1762778410/pfxulhjossssqvxq2pmw.webp"],
        category: "Others"
      }
    ],
    restaurant: {
      name: "Sostene",
      email: "sbananayo98@gmail.com",
      phone: "+250788724867"
    }
  };

  return (
    <div className="p-6">
      <OrderDetailsCard orderData={orderData} />
    </div>
  );
}