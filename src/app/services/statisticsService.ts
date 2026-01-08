import createAxiosClient from '@/app/hooks/axiosClient';

export interface DashboardStats {
  users: {
    totalUsers: number;
    restaurants: number;
    farmers: number;
    admins: number;
    affiliators: number;
    logistics: number;
    timeSeriesData: Array<{
      period: string;
      date: string;
      restaurants: number;
      farmers: number;
      admins: number;
      affiliators: number;
      total: number;
    }>;
    growth: {
      totalChange: number;
      restaurantChange: number;
      farmerChange: number;
      adminChange: number;
    };
  };
  orders: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    ongoingOrders: number;
    timeSeriesData: Array<{
      period: string;
      date: string;
      completed: number;
      cancelled: number;
      ongoing: number;
      total: number;
    }>;
    growth: {
      totalChange: number;
      completedChange: number;
    };
  };
  finance: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    timeSeriesData: Array<{
      period: string;
      date: string;
      revenue: number;
      expenses: number;
    }>;
    revenueBreakdown: {
      orders: number;
      subscriptions: number;
      vouchers: number;
    };
    expenseBreakdown: {
      usedVouchers: number;
      maturedVouchers: number;
      nearMaturityVouchers: number;
      farmerPayments: number;
    };
  };
  subscriptions: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    expiredSubscriptions: number;
    planBreakdown: Array<{
      planName: string;
      count: number;
      revenue: number;
    }>;
    growth: {
      totalChange: number;
      activeChange: number;
    };
  };
  vouchers: {
    totalVouchers: number;
    usedVouchers: number;
    maturedVouchers: number;
    nearMaturityVouchers: number;
    totalValue: number;
    usedValue: number;
    timeSeriesData: Array<{
      period: string;
      date: string;
      total: number;
      used: number;
      matured: number;
      totalValue: number;
      usedValue: number;
    }>;
    growth: {
      totalChange: number;
      usedChange: number;
    };
  };
  quickStats: {
    totalUsers: { value: number; change: number };
    totalOrders: { value: number; change: number };
    totalRevenue: { value: number; change: number };
    activeSubscriptions: { value: number; change: number };
    usedVouchers: { value: number; change: number };
    completionRate: { value: number; change: number };
  };
  recentActivities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    status: string;
    timestamp: string;
    metadata?: any;
  }>;
}

export interface StatsFilters {
  year?: number;
  month?: number;
  dateFrom?: string;
  dateTo?: string;
}

const axiosClient = createAxiosClient();

export const statisticsService = {
  async getDashboardStats(filters?: StatsFilters): Promise<{ message: string; data: DashboardStats }> {
    try {
      const params = new URLSearchParams();
      if (filters?.year) params.append('year', filters.year.toString());
      if (filters?.month) params.append('month', filters.month.toString());
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);

      const response = await axiosClient.get(`/stats/dashboard?${params.toString()}`, {
        timeout: 120000 // 2 minutes timeout
      });
      return response.data;
    } catch (error: any) {
      console.error('Dashboard stats error:', error);
      // Return fallback data on timeout or error
      return {
        message: 'Dashboard stats unavailable',
        data: {
          users: { totalUsers: 0, restaurants: 0, farmers: 0, admins: 0, affiliators: 0, logistics: 0, timeSeriesData: [], growth: { totalChange: 0, restaurantChange: 0, farmerChange: 0, adminChange: 0 } },
          orders: { totalOrders: 0, completedOrders: 0, cancelledOrders: 0, ongoingOrders: 0, timeSeriesData: [], growth: { totalChange: 0, completedChange: 0 } },
          finance: { totalRevenue: 0, totalExpenses: 0, netProfit: 0, profitMargin: 0, timeSeriesData: [], revenueBreakdown: { orders: 0, subscriptions: 0, vouchers: 0 }, expenseBreakdown: { usedVouchers: 0, maturedVouchers: 0, nearMaturityVouchers: 0, farmerPayments: 0 } },
          subscriptions: { totalSubscriptions: 0, activeSubscriptions: 0, expiredSubscriptions: 0, planBreakdown: [], growth: { totalChange: 0, activeChange: 0 } },
          vouchers: { totalVouchers: 0, usedVouchers: 0, maturedVouchers: 0, nearMaturityVouchers: 0, totalValue: 0, usedValue: 0, timeSeriesData: [], growth: { totalChange: 0, usedChange: 0 } },
          quickStats: { totalUsers: { value: 0, change: 0 }, totalOrders: { value: 0, change: 0 }, totalRevenue: { value: 0, change: 0 }, activeSubscriptions: { value: 0, change: 0 }, usedVouchers: { value: 0, change: 0 }, completionRate: { value: 0, change: 0 } },
          recentActivities: []
        } as DashboardStats
      };
    }
  },

  async getUserStats(filters?: StatsFilters): Promise<{ message: string; data: DashboardStats['users'] }> {
    const params = new URLSearchParams();
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    const response = await axiosClient.get(`/stats/users?${params.toString()}`);
    return response.data;
  },

  async getOrderStats(filters?: StatsFilters): Promise<{ message: string; data: DashboardStats['orders'] }> {
    const params = new URLSearchParams();
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    const response = await axiosClient.get(`/stats/orders?${params.toString()}`);
    return response.data;
  },

  async getFinanceStats(filters?: StatsFilters): Promise<{ message: string; data: DashboardStats['finance'] }> {
    const params = new URLSearchParams();
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    const response = await axiosClient.get(`/stats/finance?${params.toString()}`);
    return response.data;
  },

  async getSubscriptionStats(filters?: StatsFilters): Promise<{ message: string; data: DashboardStats['subscriptions'] }> {
    const params = new URLSearchParams();
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    const response = await axiosClient.get(`/stats/subscriptions?${params.toString()}`);
    return response.data;
  },

  async getVoucherStats(filters?: StatsFilters): Promise<{ message: string; data: DashboardStats['vouchers'] }> {
    const params = new URLSearchParams();
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    const response = await axiosClient.get(`/stats/vouchers?${params.toString()}`);
    return response.data;
  },

  async getQuickStats(filters?: StatsFilters): Promise<{ message: string; data: DashboardStats['quickStats'] }> {
    const params = new URLSearchParams();
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    const response = await axiosClient.get(`/stats/quick?${params.toString()}`);
    return response.data;
  },

  async getRecentActivities(filters?: StatsFilters): Promise<{ message: string; data: DashboardStats['recentActivities'] }> {
    const params = new URLSearchParams();
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.month) params.append('month', filters.month.toString());
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    const response = await axiosClient.get(`/stats/activities?${params.toString()}`);
    return response.data;
  },

  async getSystemStatus(): Promise<{ message: string; data: any }> {
    const response = await axiosClient.get('/stats/system-status');
    return response.data;
  }
};