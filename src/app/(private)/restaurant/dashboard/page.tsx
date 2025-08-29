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
        products: "Mixed Greens, Beef Sirloin",
        total: 85.2,
        status: "delivered",
        date: "Today, 2:30 PM",
      },
      {
        id: "#ORD-7830",
        customer: "Emma Wilson",
        products: "Artisanal Bread, Olive Oil",
        total: 32.45,
        status: "processing",
        date: "Today, 1:15 PM",
      },
      {
        id: "#ORD-7831",
        customer: "Michael Brown",
        products: "Chicken Breast, Fresh Tomatoes",
        total: 64.8,
        status: "pending",
        date: "Today, 11:45 AM",
      },
      {
        id: "#ORD-7832",
        customer: "Sofia Garcia",
        products: "Premium Beef Sirloin",
        total: 72.5,
        status: "delivered",
        date: "Yesterday, 7:20 PM",
      },
      {
        id: "#ORD-7833",
        customer: "David Lee",
        products: "Mixed Greens, Artisanal Bread",
        total: 28.9,
        status: "delivered",
        date: "Yesterday, 5:40 PM",
      },
    ],
  };
}

export default async function RestaurantDashboard() {
  const dashboardData = await getDashboardData();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-6 py-8">
        <DashboardOverview data={dashboardData} />
      </main>
    </div>
  );
}
