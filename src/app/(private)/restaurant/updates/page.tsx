/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useOrders } from "@/app/contexts/orderContext";
import { useEffect, useState, useCallback } from "react";
import { DashboardOverview } from "./_components/dashboard-overview";
import { toast } from "sonner";
import { useWebSocket } from "@/hooks/useOrderWebSocket";
import { useAuth } from "@/app/contexts/auth-context";

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
  const [localOrders, setLocalOrders] = useState<any[]>([]);
  const [localStatistics, setLocalStatistics] = useState<any>(null);
  const { user } = useAuth();

  // WebSocket integration for real-time updates
  const { isConnected, orderUpdates } = useWebSocket(
    user?.id || "",
    user?.id || ""
  );

  useEffect(() => {
    refreshOrders();
    refreshStatistics();
  }, []);

  // Sync local state with context data
  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  useEffect(() => {
    setLocalStatistics(statistics);
  }, [statistics]);

  useEffect(() => {
    if (localOrders.length > 0 && !selectedOrder) {
      setSelectedOrder(localOrders[0]);
    }
  }, [localOrders, selectedOrder]);

  // Handle real-time order updates from WebSocket - silent updates
  useEffect(() => {
    if (orderUpdates.length > 0) {
      const latestUpdate = orderUpdates[orderUpdates.length - 1];
      
      // Update local orders silently
      setLocalOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === latestUpdate.orderId 
            ? { ...order, status: latestUpdate.status, paymentStatus: latestUpdate.paymentStatus }
            : order
        )
      );

      setSelectedOrder((prevSelected: any) => 
        prevSelected?.id === latestUpdate.orderId 
          ? { ...prevSelected, status: latestUpdate.status, paymentStatus: latestUpdate.paymentStatus }
          : prevSelected
      );

    }
  }, [orderUpdates]);


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
        current: localStatistics?.revenue?.total || 0,
        previous: 0,
        change: 0,
        period: "last week",
      },
      totalOrders: {
        current: localStatistics?.totalOrders || 0,
        previous: 0,
        change: 0,
        period: "last week",
      },
      averageOrderValue: {
        current: localStatistics?.revenue?.average || 0,
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
        { day: "Mon", sales: localStatistics?.totalOrders || 0 },
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
        avg: localStatistics?.totalOrders || 0,
        max: localStatistics?.totalOrders || 0,
      },
    },
    topProducts: [],
    recentOrders: localOrders.map((order) => {
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
        originalData: order,
      } as any;
    }),
    selectedOrderForTracking: selectedOrder,
    ordersByStatus: localStatistics?.ordersByStatus || {},
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
