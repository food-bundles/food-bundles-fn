/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useOrders } from "@/app/contexts/orderContext";
import { useEffect, useState, useCallback } from "react";
import { DashboardOverview } from "./_components/dashboard-overview";
import { toast } from "sonner";

export default function RestaurantDashboard() {
  const {
    orders,
    statistics,
    refreshOrders,
    refreshStatistics,
    reorderOrder,
    loading,
  } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  useEffect(() => {
    refreshOrders();
    refreshStatistics();
  }, []);

  useEffect(() => {
    if (orders.length > 0 && !selectedOrder) {
      setSelectedOrder(orders[0]);
    }
  }, [orders, selectedOrder]);


  const handleReorder = useCallback(
    async (orderId: string) => {
      try {
        setReorderingId(orderId);
        const response = await reorderOrder(orderId);

        if (response.success) {
          toast.success("Order reordered successfully!");
        } else {
          toast.error(response.message || "Failed to reorder");
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to reorder order");
      } finally {
        setTimeout(() => {
          setReorderingId(null);
        }, 500);
      }
    },
    [reorderOrder]
  );



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
        { day: "Mon", sales: statistics?.totalOrders || 0 },
        { day: "Tue", sales: 0 },
        { day: "Wed", sales: 0 },
        { day: "Thu", sales: 0 },
        { day: "Fri", sales: 0 },
        { day: "Sat", sales: 0 },
        { day: "Sun", sales: 0 },
      ],
      previousPeriod: [
        { day: "Mon", sales: 0 },
        { day: "Tue", sales: 0 },
        { day: "Wed", sales: 0 },
        { day: "Thu", sales: 0 },
        { day: "Fri", sales: 0 },
        { day: "Sat", sales: 0 },
        { day: "Sun", sales: 0 },
      ],
      stats: {
        min: 0,
        avg: statistics?.totalOrders || 0,
        max: statistics?.totalOrders || 0,
      },
    },
    topProducts: [],
    recentOrders: orders.map((order) => {
      const statusMap: Record<string, any> = {
        PROCESSING: "PREPARING",
        SHIPPED: "IN_TRANSIT",
        READY_FOR_PICKUP: "READY",
      };

      return {
        id: order.id,
        orderNumber: order.orderNumber,
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
        time: new Date(order.createdAt).toLocaleString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      } as any;
    }),
    selectedOrderForTracking: selectedOrder,
    ordersByStatus: statistics?.ordersByStatus || {},
  };


  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-6 py-8">
        <DashboardOverview
          data={dashboardData}
          onReorder={handleReorder}
          reorderingId={reorderingId}
          loading={loading}
        />
      </main>
    </div>
  );
}
