/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useCallback, useState } from "react";
import {
  orderService,
  Order,
  OrderStatistics,
  CreateOrderFromCheckoutData,
  CreateDirectOrderData,
  UpdateOrderData,
  OrdersResponse,
  OrderResponse,
  StatisticsResponse,
} from "@/app/services/orderService";
import { useAuth } from "./auth-context";

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  statistics: OrderStatistics | null;
  statsLoading: boolean;
  statsError: string | null;
  createOrderFromCheckout: (
    data: CreateOrderFromCheckoutData
  ) => Promise<OrderResponse>;
  createDirectOrder: (data: CreateDirectOrderData) => Promise<OrderResponse>;
  getOrderById: (orderId: string) => Promise<OrderResponse>;
  getOrderByNumber: (orderNumber: string) => Promise<OrderResponse>;
  getAllOrders: (params?: any) => Promise<OrdersResponse>;
  getMyOrders: (params?: any) => Promise<OrdersResponse>;
  updateOrder: (
    orderId: string,
    data: UpdateOrderData
  ) => Promise<OrderResponse>;
  cancelOrder: (orderId: string) => Promise<OrderResponse>;
  reorderOrder: (orderId: string) => Promise<OrderResponse>;
  deleteOrder: (
    orderId: string
  ) => Promise<{ success: boolean; message?: string }>;
  getOrderStatistics: (params?: any) => Promise<StatisticsResponse>;
  refreshOrders: () => Promise<void>;
  refreshStatistics: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

interface OrderProviderProps {
  children: React.ReactNode;
}

export function OrderProvider({ children }: OrderProviderProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statistics, setStatistics] = useState<OrderStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  const { user, isAuthenticated } = useAuth();

  const createOrderFromCheckout = useCallback(
    async (data: CreateOrderFromCheckoutData) => {
      try {
        setLoading(true);
        const response = await orderService.createOrderFromCheckout(data);
        if (response.success) {
          await refreshOrders();
        }
        return response;
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to create order");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createDirectOrder = useCallback(async (data: CreateDirectOrderData) => {
    try {
      setLoading(true);
      const response = await orderService.createDirectOrder(data);
      if (response.success) {
        await refreshOrders();
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create direct order");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrderById = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      return await orderService.getOrderById(orderId);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch order");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrderByNumber = useCallback(async (orderNumber: string) => {
    try {
      setLoading(true);
      return await orderService.getOrderByNumber(orderNumber);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch order");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllOrders = useCallback(async (params?: any) => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders(params);
      if (response.success) {
        setOrders(response.data || []);
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch orders");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMyOrders = useCallback(async (params?: any) => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders(params);
      if (response.success) {
        setOrders(response.data || []);
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch orders");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrder = useCallback(
    async (orderId: string, data: UpdateOrderData) => {
      try {
        setLoading(true);
        const response = await orderService.updateOrder(orderId, data);
        if (response.success) {
          await refreshOrders();
        }
        return response;
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to update order");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const cancelOrder = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      const response = await orderService.cancelOrder(orderId);
      if (response.success) {
        await refreshOrders();
        await refreshStatistics();
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to cancel order");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reorderOrder = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      const response = await orderService.reorderOrder(orderId);
      if (response.success) {
        await refreshOrders();
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reorder");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteOrder = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      const response = await orderService.deleteOrder(orderId);
      if (response.success) {
        await refreshOrders();
        await refreshStatistics();
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete order");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrderStatistics = useCallback(async (params?: any) => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      const response = await orderService.getOrderStatistics(params);
      console.log("[OrderContext] Statistics response:", response);
      if (response.success && response.data) {
        setStatistics(response.data);
        console.log("[OrderContext] Statistics set:", response.data);
      }
      return response;
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Failed to fetch statistics";
      setStatsError(errorMsg);
      console.error("[OrderContext] Statistics error:", errorMsg);
      throw err;
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    if (user?.role === "ADMIN") {
      await getAllOrders();
    } else {
      await getMyOrders();
    }
  }, [user?.role, getAllOrders, getMyOrders]);

  const refreshStatistics = useCallback(async () => {
    await getOrderStatistics();
  }, [getOrderStatistics]);

  React.useEffect(() => {
    if (isAuthenticated) {
      refreshOrders();
      refreshStatistics();
    }
  }, [isAuthenticated, refreshOrders, refreshStatistics]);

  const contextValue: OrderContextType = {
    orders,
    loading,
    error,
    statistics,
    statsLoading,
    statsError,
    createOrderFromCheckout,
    createDirectOrder,
    getOrderById,
    getOrderByNumber,
    getAllOrders,
    getMyOrders,
    updateOrder,
    cancelOrder,
    reorderOrder,
    deleteOrder,
    getOrderStatistics,
    refreshOrders,
    refreshStatistics,
  };

  return (
    <OrderContext.Provider value={contextValue}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
}
