/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useCallback, useState } from "react";
import {
  subscriptionService,
  SubscriptionPlan,
  RestaurantSubscription,
  SubscriptionHistory,
  CreateSubscriptionPlanData,
  UpdateSubscriptionPlanData,
  CreateRestaurantSubscriptionData,
  UpdateRestaurantSubscriptionData,
  UpgradeSubscriptionData,
  DowngradeSubscriptionData,
  SubscriptionPlansResponse,
  SubscriptionsResponse,
  SubscriptionResponse,
  SubscriptionPlanResponse,
  SubscriptionHistoryResponse,
} from "@/app/services/subscriptionService";
import { paymentMethodService, PaymentMethod } from "@/app/services/paymentMethodService";
import { useAuth } from "./auth-context";

interface SubscriptionContextType {
  subscriptionPlans: SubscriptionPlan[];
  mySubscriptions: RestaurantSubscription[];
  allSubscriptions: RestaurantSubscription[];
  subscriptionHistory: SubscriptionHistory[];
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: string | null;

  createSubscriptionPlan: (data: CreateSubscriptionPlanData) => Promise<SubscriptionPlanResponse>;
  getAllSubscriptionPlans: (params?: any) => Promise<SubscriptionPlansResponse>;
  getSubscriptionPlanById: (planId: string) => Promise<SubscriptionPlanResponse>;
  updateSubscriptionPlan: (planId: string, data: UpdateSubscriptionPlanData) => Promise<SubscriptionPlanResponse>;
  deleteSubscriptionPlan: (planId: string) => Promise<{ success: boolean; message?: string }>;

  createRestaurantSubscription: (data: CreateRestaurantSubscriptionData) => Promise<SubscriptionResponse>;
  getMySubscriptions: () => Promise<SubscriptionResponse>;
  getSubscriptionById: (subscriptionId: string) => Promise<SubscriptionResponse>;
  updateRestaurantSubscription: (subscriptionId: string, data: UpdateRestaurantSubscriptionData) => Promise<SubscriptionResponse>;
  cancelSubscription: (subscriptionId: string, reason?: string) => Promise<SubscriptionResponse>;
  renewSubscription: (subscriptionId: string) => Promise<SubscriptionResponse>;
  upgradeSubscription: (subscriptionId: string, data: UpgradeSubscriptionData) => Promise<SubscriptionResponse>;
  downgradeSubscription: (subscriptionId: string, data: DowngradeSubscriptionData) => Promise<SubscriptionResponse>;
  getSubscriptionHistory: (subscriptionId: string) => Promise<SubscriptionHistoryResponse>;

  getAllSubscriptions: (params?: any) => Promise<SubscriptionsResponse>;
  checkExpiredSubscriptions: () => Promise<any>;

  getActivePaymentMethods: () => Promise<void>;
  getPaymentMethodById: (id: string) => PaymentMethod | undefined;

  refreshSubscriptionPlans: () => Promise<void>;
  refreshMySubscriptions: () => Promise<void>;
  refreshAllSubscriptions: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [mySubscriptions, setMySubscriptions] = useState<RestaurantSubscription[]>([]);
  const [allSubscriptions, setAllSubscriptions] = useState<RestaurantSubscription[]>([]);
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, isAuthenticated } = useAuth();

  const createSubscriptionPlan = useCallback(async (data: CreateSubscriptionPlanData): Promise<SubscriptionPlanResponse> => {
    try {
      setLoading(true);
      const response = await subscriptionService.createSubscriptionPlan(data);
      if (response.success) {
        await refreshSubscriptionPlans();
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create subscription plan");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllSubscriptionPlans = useCallback(async (params?: any): Promise<SubscriptionPlansResponse> => {
    try {
      setLoading(true);
      const response = await subscriptionService.getAllSubscriptionPlans(params);
      if (response.success) {
        setSubscriptionPlans(response.data || []);
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch subscription plans");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSubscriptionPlanById = useCallback(async (planId: string): Promise<SubscriptionPlanResponse> => {
    try {
      setLoading(true);
      return await subscriptionService.getSubscriptionPlanById(planId);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch subscription plan");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSubscriptionPlan = useCallback(async (planId: string, data: UpdateSubscriptionPlanData): Promise<SubscriptionPlanResponse> => {
    try {
      setLoading(true);
      const response = await subscriptionService.updateSubscriptionPlan(planId, data);
      if (response.success) {
        await refreshSubscriptionPlans();
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update subscription plan");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSubscriptionPlan = useCallback(async (planId: string) => {
    try {
      setLoading(true);
      const response = await subscriptionService.deleteSubscriptionPlan(planId);
      if (response.success) {
        await refreshSubscriptionPlans();
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete subscription plan");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createRestaurantSubscription = useCallback(async (data: CreateRestaurantSubscriptionData): Promise<SubscriptionResponse> => {
    try {
      setLoading(true);
      const response = await subscriptionService.createRestaurantSubscription(data);
      if (response.success) {
        await refreshMySubscriptions();
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create subscription");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMySubscriptions = useCallback(async (): Promise<SubscriptionResponse> => {
    try {
      setLoading(true);
      const response = await subscriptionService.getMySubscriptions();
      if (response.success) {
        setMySubscriptions(response.data ? [response.data] : []);
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch subscriptions");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSubscriptionById = useCallback(async (subscriptionId: string): Promise<SubscriptionResponse> => {
    try {
      setLoading(true);
      return await subscriptionService.getSubscriptionById(subscriptionId);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch subscription");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRestaurantSubscription = useCallback(async (subscriptionId: string, data: UpdateRestaurantSubscriptionData): Promise<SubscriptionResponse> => {
    try {
      setLoading(true);
      const response = await subscriptionService.updateSubscription(subscriptionId, data);
      if (response.success) {
        await refreshMySubscriptions();
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update subscription");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelSubscription = useCallback(async (subscriptionId: string, reason?: string): Promise<SubscriptionResponse> => {
    try {
      setLoading(true);
      const response = await subscriptionService.cancelSubscription(subscriptionId, { reason });
      if (response.success) {
        await refreshMySubscriptions();
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to cancel subscription");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const renewSubscription = useCallback(async (subscriptionId: string): Promise<SubscriptionResponse> => {
    try {
      setLoading(true);
      const response = await subscriptionService.renewSubscription(subscriptionId);
      if (response.success) {
        await refreshMySubscriptions();
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to renew subscription");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const upgradeSubscription = useCallback(async (subscriptionId: string, data: UpgradeSubscriptionData): Promise<SubscriptionResponse> => {
    try {
      setLoading(true);
      const response = await subscriptionService.upgradeSubscription(subscriptionId, data);
      if (response.success) {
        await refreshMySubscriptions();
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upgrade subscription");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const downgradeSubscription = useCallback(async (subscriptionId: string, data: DowngradeSubscriptionData): Promise<SubscriptionResponse> => {
    try {
      setLoading(true);
      const response = await subscriptionService.downgradeSubscription(subscriptionId, data);
      if (response.success) {
        await refreshMySubscriptions();
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to downgrade subscription");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSubscriptionHistory = useCallback(async (subscriptionId: string): Promise<SubscriptionHistoryResponse> => {
    try {
      setLoading(true);
      const response = await subscriptionService.getSubscriptionHistory(subscriptionId);
      if (response.success) {
        setSubscriptionHistory(response.data || []);
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch subscription history");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllSubscriptions = useCallback(async (params?: any): Promise<SubscriptionsResponse> => {
    try {
      setLoading(true);
      const response = await subscriptionService.getAllSubscriptions(params);
      if (response.success) {
        setAllSubscriptions(response.data || []);
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch all subscriptions");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkExpiredSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      return await subscriptionService.checkExpiredSubscriptions();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to check expired subscriptions");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSubscriptionPlans = useCallback(async () => {
    try {
      setLoading(true);
      const response = await subscriptionService.getAllSubscriptionPlans();
      if (response.success) {
        setSubscriptionPlans(response.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch subscription plans");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshMySubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await subscriptionService.getMySubscriptions();
      if (response.success) {
        setMySubscriptions(response.data ? [response.data] : []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch subscriptions");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAllSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await subscriptionService.getAllSubscriptions();
      if (response.success) {
        setAllSubscriptions(response.data || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch all subscriptions");
    } finally {
      setLoading(false);
    }
  }, []);

  const getActivePaymentMethods = useCallback(async () => {
    try {
      setLoading(true);
      const response = await paymentMethodService.getActivePaymentMethods();
      if (response.data) {
        setPaymentMethods(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch payment methods");
    } finally {
      setLoading(false);
    }
  }, []);

  const getPaymentMethodById = useCallback((id: string): PaymentMethod | undefined => {
    return paymentMethods.find(method => method.id === id);
  }, [paymentMethods]);

  React.useEffect(() => {
    if (isAuthenticated) {
      refreshSubscriptionPlans();
      getActivePaymentMethods();
      if (user?.role === "RESTAURANT") {
        refreshMySubscriptions();
      }
      if (user?.role === "ADMIN") {
        refreshAllSubscriptions();
      }
    }
  }, [isAuthenticated, user?.role, refreshSubscriptionPlans, refreshMySubscriptions, refreshAllSubscriptions, getActivePaymentMethods]);

  const contextValue: SubscriptionContextType = {
    subscriptionPlans,
    mySubscriptions,
    allSubscriptions,
    subscriptionHistory,
    paymentMethods,
    loading,
    error,
    createSubscriptionPlan,
    getAllSubscriptionPlans,
    getSubscriptionPlanById,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
    createRestaurantSubscription,
    getMySubscriptions,
    getSubscriptionById,
    updateRestaurantSubscription,
    cancelSubscription,
    renewSubscription,
    upgradeSubscription,
    downgradeSubscription,
    getSubscriptionHistory,
    getAllSubscriptions,
    checkExpiredSubscriptions,
    getActivePaymentMethods,
    getPaymentMethodById,
    refreshSubscriptionPlans,
    refreshMySubscriptions,
    refreshAllSubscriptions,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscriptions must be used within a SubscriptionProvider");
  }
  return context;
}