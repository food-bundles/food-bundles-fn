import { Order, OrderStatus } from "@/lib/types";
import { DashboardOverview } from "./_components/dashboard-overview";

// Dummy analytics data
async function getDashboardData() {
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    date: "Wednesday, August 13, 2025",
    metrics: {
      totalSales: {
        current: 12547,
        previous: 10934,
        change: 14.8,
        period: "last week",
      },
      totalOrders: {
        current: 387,
        previous: 358,
        change: 8.4,
        period: "last week",
      },
      averageOrderValue: {
        current: 32.42,
        previous: 33.12,
        change: -2.1,
        period: "last week",
      },
      onTimeDeliveryRate: {
        current: 94.7,
        note: "less deliveries this week",
      },
    },
    salesChart: {
      currentPeriod: [
        { day: "Mon", sales: 27 },
        { day: "Tue", sales: 25 },
        { day: "Wed", sales: 36 },
        { day: "Thu", sales: 30 },
        { day: "Fri", sales: 24 },
        { day: "Sat", sales: 33 },
        { day: "Sun", sales: 28 },
      ],
      previousPeriod: [
        { day: "Mon", sales: 24 },
        { day: "Tue", sales: 23 },
        { day: "Wed", sales: 32 },
        { day: "Thu", sales: 28 },
        { day: "Fri", sales: 22 },
        { day: "Sat", sales: 29 },
        { day: "Sun", sales: 26 },
      ],
      stats: {
        min: 25,
        avg: 29.5,
        max: 35,
      },
    },
    topProducts: [
      {
        id: "1",
        name: "Organic Mixed Greens",
        unitsSold: 250,
        image: "/imgs/eggs.svg",
      },
      {
        id: "2",
        name: "Premium Beef Sirloin",
        unitsSold: 185,
        image: "/imgs/eggs.svg",
      },
      {
        id: "3",
        name: "Artisanal Bread",
        unitsSold: 142,
        image: "/imgs/eggs.svg",
      },
    ],
    recentOrders: [
      {
        id: "#ORD-7829",
        customer: "John Smith",
        items: [
          { name: "Mixed Greens", image: "/imgs/eggs.svg", quantity: 2 },
          { name: "Beef Sirloin", image: "/imgs/eggs.svg", quantity: 1 },
        ],
        total: 85.2,
        status: OrderStatus.DELIVERED,
        timeAgo: "2 hours ago",
      },
      {
        id: "#ORD-7830",
        customer: "Emma Wilson",
        items: [
          { name: "Artisanal Bread", image: "/imgs/eggs.svg", quantity: 1 },
          { name: "Olive Oil", image: "/imgs/eggs.svg", quantity: 1 },
        ],
        total: 32.45,
        status: OrderStatus.PREPARING,
        timeAgo: "3 hours ago",
      },
      {
        id: "#ORD-7831",
        customer: "Michael Brown",
        items: [
          { name: "Chicken Breast", image: "/imgs/eggs.svg", quantity: 2 },
          { name: "Fresh Tomatoes", image: "/imgs/eggs.svg", quantity: 3 },
        ],
        total: 64.8,
        status: OrderStatus.PENDING,
        timeAgo: "4 hours ago",
      },
      {
        id: "#ORD-7832",
        customer: "Sofia Garcia",
        items: [
          {
            name: "Premium Beef Sirloin",
            image: "/imgs/eggs.svg",
            quantity: 1,
          },
        ],
        total: 72.5,
        status: OrderStatus.DELIVERED,
        timeAgo: "1 day ago",
      },
      {
        id: "#ORD-7833",
        customer: "David Lee",
        items: [
          { name: "Mixed Greens", image: "/imgs/eggs.svg", quantity: 1 },
          { name: "Artisanal Bread", image: "/imgs/eggs.svg", quantity: 2 },
        ],
        total: 28.9,
        status: OrderStatus.DELIVERED,
        timeAgo: "1 day ago",
      },
    ] as Order[],
  };
}

export default async function RestaurantDashboard() {
  const dashboardData = await getDashboardData();

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-6 py-8">
        <DashboardOverview data={dashboardData} />
      </main>
    </div>
  );
}
