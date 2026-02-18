"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { statisticsService, DashboardStats, StatsFilters } from '@/app/services/statisticsService';

interface DashboardContextType {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  filters: StatsFilters;
  refreshStats: () => Promise<void>;
  updateFilters: (newFilters: Partial<StatsFilters>) => void;
  sectionLoading: {
    users: boolean;
    orders: boolean;
    finance: boolean;
    subscriptions: boolean;
    vouchers: boolean;
    quickStats: boolean;
    activities: boolean;
  };
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState<StatsFilters>({});
  const [sectionLoading, setSectionLoading] = useState({
    users: true,
    orders: true,
    finance: true,
    subscriptions: true,
    vouchers: true,
    quickStats: true,
    activities: true,
  });
  
  const fetchingRef = useRef(false);

  const fetchStats = useCallback(async () => {
    if (!mounted || fetchingRef.current) return;
    
    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // Fetch all sections in parallel
      const [usersRes, ordersRes, financeRes, subscriptionsRes, vouchersRes, quickStatsRes, activitiesRes] = await Promise.allSettled([
        statisticsService.getUserStats(filters).then(res => {
          setSectionLoading(prev => ({ ...prev, users: false }));
          return res;
        }),
        statisticsService.getOrderStats(filters).then(res => {
          setSectionLoading(prev => ({ ...prev, orders: false }));
          return res;
        }),
        statisticsService.getFinanceStats(filters).then(res => {
          setSectionLoading(prev => ({ ...prev, finance: false }));
          return res;
        }),
        statisticsService.getSubscriptionStats(filters).then(res => {
          setSectionLoading(prev => ({ ...prev, subscriptions: false }));
          return res;
        }),
        statisticsService.getVoucherStats(filters).then(res => {
          setSectionLoading(prev => ({ ...prev, vouchers: false }));
          return res;
        }),
        statisticsService.getQuickStats(filters).then(res => {
          setSectionLoading(prev => ({ ...prev, quickStats: false }));
          return res;
        }),
        statisticsService.getRecentActivities(filters).then(res => {
          setSectionLoading(prev => ({ ...prev, activities: false }));
          return res;
        }),
      ]);

      // Combine results
      const combinedStats: DashboardStats = {
        users: usersRes.status === 'fulfilled' ? usersRes.value.data : { totalUsers: 0, restaurants: 0, farmers: 0, admins: 0, affiliators: 0, logistics: 0, timeSeriesData: [], growth: { totalChange: 0, restaurantChange: 0, farmerChange: 0, adminChange: 0 } },
        orders: ordersRes.status === 'fulfilled' ? ordersRes.value.data : { totalOrders: 0, completedOrders: 0, cancelledOrders: 0, ongoingOrders: 0, timeSeriesData: [], growth: { totalChange: 0, completedChange: 0 } },
        finance: financeRes.status === 'fulfilled' ? financeRes.value.data : { totalRevenue: 0, totalExpenses: 0, netProfit: 0, profitMargin: 0, timeSeriesData: [], revenueBreakdown: { orders: 0, subscriptions: 0, vouchers: 0 }, expenseBreakdown: { usedVouchers: 0, maturedVouchers: 0, nearMaturityVouchers: 0, farmerPayments: 0 } },
        subscriptions: subscriptionsRes.status === 'fulfilled' ? subscriptionsRes.value.data : { totalSubscriptions: 0, activeSubscriptions: 0, expiredSubscriptions: 0, planBreakdown: [], growth: { totalChange: 0, activeChange: 0 } },
        vouchers: vouchersRes.status === 'fulfilled' ? vouchersRes.value.data : { totalVouchers: 0, usedVouchers: 0, maturedVouchers: 0, nearMaturityVouchers: 0, totalValue: 0, usedValue: 0, timeSeriesData: [], growth: { totalChange: 0, usedChange: 0 } },
        quickStats: quickStatsRes.status === 'fulfilled' ? quickStatsRes.value.data : { totalUsers: { value: 0, change: 0 }, totalOrders: { value: 0, change: 0 }, totalRevenue: { value: 0, change: 0 }, activeSubscriptions: { value: 0, change: 0 }, usedVouchers: { value: 0, change: 0 }, completionRate: { value: 0, change: 0 } },
        recentActivities: activitiesRes.status === 'fulfilled' ? activitiesRes.value.data : [],
      };

      setStats(combinedStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [filters, mounted]);

  const refreshStats = useCallback(async () => {
    setSectionLoading({
      users: true,
      orders: true,
      finance: true,
      subscriptions: true,
      vouchers: true,
      quickStats: true,
      activities: true,
    });
    await fetchStats();
  }, [fetchStats]);

  const updateFilters = useCallback((newFilters: Partial<StatsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setSectionLoading({
        users: true,
        orders: true,
        finance: true,
        subscriptions: true,
        vouchers: true,
        quickStats: true,
        activities: true,
      });
      fetchStats();
    }
  }, [filters, mounted, fetchStats]);

  const value: DashboardContextType = {
    stats,
    loading,
    error,
    filters,
    refreshStats,
    updateFilters,
    sectionLoading,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
