/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useOrders } from "@/app/contexts/orderContext";
import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardOverview } from "./_components/dashboard-overview";
import { toast } from "sonner";

export default function RestaurantDashboard() {
  const {
    orders,
    statistics,
    loading,
    statsLoading,
    refreshOrders,
    refreshStatistics,
    reorderOrder,
  } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  useEffect(() => {
    refreshOrders();
    refreshStatistics();
    console.log("[Dashboard] Refreshing orders & statistics...");
  }, []);

  useEffect(() => {
    if (orders.length > 0 && !selectedOrder) {
      setSelectedOrder(orders[0]);
    }
  }, [orders, selectedOrder]);

  console.log("[Dashboard] Orders:", orders);
  console.log("[Dashboard] Statistics |||:", statistics);

  const handleReorder = useCallback(async (orderId: string) => {
    try {
      console.log("[Dashboard] Reorder clicked for:", orderId);
      setReorderingId(orderId);
      const response = await reorderOrder(orderId);

      if (response.success) {
        toast.success("Order reordered successfully!");
      } else {
        toast.error(response.message || "Failed to reorder");
      }
    } catch (err: any) {
      console.error("[Dashboard] Reorder error:", err);
      toast.error(err.response?.data?.message || "Failed to reorder order");
    } finally {
      setTimeout(() => {
        setReorderingId(null);
      }, 500);
    }
  }, [reorderOrder]);

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen bg-white">
        <main className="container mx-auto px-6 py-8">
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    );
  }

  const dashboardData = {
    date: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    metrics: {
      totalSales: {
        current: statistics?.revenue?.total || 0,
        previous: 0,
        change: 0,
        period: "last week",
      },
      totalOrders: {
        current: statistics?.totalOrders || 0,
        previous: 0,
        change: 0,
        period: "last week",
      },
      averageOrderValue: {
        current: statistics?.revenue?.average || 0,
        previous: 0,
        change: 0,
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
    recentOrders: orders.slice(0, 3).map((order) => {
      const statusMap: Record<string, any> = {
        PROCESSING: "PREPARING",
        SHIPPED: "IN_TRANSIT",
        READY_FOR_PICKUP: "READY",
      };

      return {
        id: order.orderNumber,
        customer: order.billingName || "Unknown",
        items:
          order.orderItems?.map((item: any) => ({
            name: item.productName || "Unknown Product",
            image: item.images?.[0] || "/imgs/eggs.svg",
            quantity: item.quantity,
          })) ||
          order.items?.map((item: any) => ({
            name: item.productName || "Unknown Product",
            image: item.image || "/imgs/eggs.svg",
            quantity: item.quantity,
          })) ||
          [],
        total: order.totalAmount || 0,
        status: statusMap[order.status] || order.status,
        timeAgo: new Date(order.createdAt).toLocaleDateString(),
        originalData: order,
      };
    }),
    selectedOrderForTracking: selectedOrder,
    ordersByStatus: statistics?.ordersByStatus || {},
  };

  console.log("[Dashboard] dashboardData prepared:", dashboardData);

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-6 py-8">
        <DashboardOverview
          data={dashboardData}
          onReorder={handleReorder}
          reorderingId={reorderingId}
        />
      </main>
    </div>
  );
}
