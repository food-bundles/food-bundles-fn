"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { statisticsService, DashboardStats, StatsFilters } from '@/app/services/statisticsService';

interface DashboardContextType {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  filters: StatsFilters;
  refreshStats: () => Promise<void>;
  updateFilters: (newFilters: Partial<StatsFilters>) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<StatsFilters>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await statisticsService.getDashboardStats(filters);
      setStats(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    await fetchStats();
  };

  const updateFilters = (newFilters: Partial<StatsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  useEffect(() => {
    fetchStats();
  }, [filters]);

  const value: DashboardContextType = {
    stats,
    loading,
    error,
    filters,
    refreshStats,
    updateFilters
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