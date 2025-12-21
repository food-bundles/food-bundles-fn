/* eslint-disable @typescript-eslint/no-explicit-any */
import { orderService } from "@/app/services/orderService";
import { subscriptionService } from "@/app/services/subscriptionService";

export interface DashboardMetrics {
  totalUsers: number;
  totalRestaurants: number;
  totalFarmers: number;
  totalAdmins: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  ongoingOrders: number;
  totalRevenue: number;
  totalExpenses: number;
  activeSubscriptions: number;
  totalSubscriptions: number;
  expiredSubscriptions: number;
  totalVouchers: number;
  usedVouchers: number;
  maturedVouchers: number;
  activeVouchers: number;
  pendingOrders: number;
  previousPeriodData?: {
    totalUsers: number;
    totalRestaurants: number;
    totalOrders: number;
    totalRevenue: number;
  };
}

export interface ActivityItem {
  id: string;
  type: "user_signup" | "order_placed" | "subscription" | "voucher" | "payment";
  title: string;
  description: string;
  timestamp: string;
  status?: "success" | "pending" | "failed";
  amount?: number;
}

export interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export class DashboardService {
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    // Using dummy data for UI/UX purposes
    return {
      totalUsers: 1250,
      totalRestaurants: 340,
      totalFarmers: 850,
      totalAdmins: 60,
      totalOrders: 2840,
      completedOrders: 2156,
      cancelledOrders: 284,
      ongoingOrders: 400,
      totalRevenue: 45600000,
      totalExpenses: 12300000,
      activeSubscriptions: 180,
      totalSubscriptions: 220,
      expiredSubscriptions: 40,
      totalVouchers: 450,
      usedVouchers: 320,
      maturedVouchers: 130,
      activeVouchers: 95,
      pendingOrders: 120,
    };
  }

  static async getRecentActivity(): Promise<ActivityItem[]> {
    // Using dummy data for UI/UX purposes
    return [
      {
        id: "order-1",
        type: "order_placed",
        title: "New Order Placed",
        description: "Order #ORD-2024-001 from Green Valley Restaurant",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: "pending",
        amount: 125000
      },
      {
        id: "voucher-1",
        type: "voucher",
        title: "Voucher Used",
        description: "DISC50-2024 - Mountain View Cafe",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: "success"
      },
      {
        id: "subscription-1",
        type: "subscription",
        title: "Subscription Renewed",
        description: "Urban Bistro - Premium Plan",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: "success"
      },
      {
        id: "order-2",
        type: "order_placed",
        title: "Order Delivered",
        description: "Order #ORD-2024-002 from Sunset Grill",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        status: "success",
        amount: 89000
      },
      {
        id: "user-1",
        type: "user_signup",
        title: "New User Registration",
        description: "FARMER - john.doe@email.com",
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        status: "success"
      }
    ];
  }

  static async getOrdersChartData(): Promise<ChartData[]> {
    try {
      const response = await orderService.getAllOrdersByAdmin({ limit: 1000 });
      
      if (!response.success) return [];

      const orders = response.data;
      const statusCounts: { [key: string]: number } = {};

      orders.forEach((order: any) => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });

      return Object.entries(statusCounts).map(([status, count]) => ({
        label: status.replace('_', ' '),
        value: count,
        color: this.getStatusColor(status)
      }));
    } catch (error) {
      console.error('Error fetching orders chart data:', error);
      return [];
    }
  }

  static async getSubscriptionsChartData(): Promise<ChartData[]> {
    try {
      const response = await subscriptionService.getAllSubscriptions({ limit: 1000 });
      
      if (!response.success) return [];

      const subscriptions = response.data;
      const statusCounts: { [key: string]: number } = {};

      subscriptions.forEach((subscription: any) => {
        statusCounts[subscription.status] = (statusCounts[subscription.status] || 0) + 1;
      });

      return Object.entries(statusCounts).map(([status, count]) => ({
        label: status,
        value: count,
        color: this.getSubscriptionStatusColor(status)
      }));
    } catch (error) {
      console.error('Error fetching subscriptions chart data:', error);
      return [];
    }
  }

  static async getRevenueChartData(): Promise<ChartData[]> {
    try {
      const response = await orderService.getAllOrdersByAdmin({ limit: 1000 });
      
      if (!response.success) return [];

      const orders = response.data;
      const monthlyRevenue: { [key: string]: number } = {};

      orders
        .filter((order: any) => order.status === 'DELIVERED')
        .forEach((order: any) => {
          const month = new Date(order.createdAt).toLocaleDateString('en-US', { 
            month: 'short',
            year: 'numeric'
          });
          monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (order.totalAmount || 0);
        });

      return Object.entries(monthlyRevenue)
        .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
        .slice(-6)
        .map(([month, revenue]) => ({
          label: month,
          value: revenue,
          color: '#10B981'
        }));
    } catch (error) {
      console.error('Error fetching revenue chart data:', error);
      return [];
    }
  }

  private static getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'PENDING': '#F59E0B',
      'CONFIRMED': '#3B82F6',
      'PREPARING': '#8B5CF6',
      'READY': '#06B6D4',
      'IN_TRANSIT': '#F97316',
      'DELIVERED': '#10B981',
      'CANCELLED': '#EF4444'
    };
    return colors[status] || '#6B7280';
  }

  private static getSubscriptionStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'ACTIVE': '#10B981',
      'EXPIRED': '#EF4444',
      'CANCELLED': '#6B7280',
      'SUSPENDED': '#F59E0B',
      'PENDING': '#3B82F6'
    };
    return colors[status] || '#6B7280';
  }

  static async getEnhancedDashboardMetrics(): Promise<DashboardMetrics> {
    // Using dummy data for UI/UX purposes
    return {
      totalUsers: 1250,
      totalRestaurants: 340,
      totalFarmers: 850,
      totalAdmins: 60,
      totalOrders: 2840,
      completedOrders: 2156,
      cancelledOrders: 284,
      ongoingOrders: 400,
      totalRevenue: 45600000,
      totalExpenses: 12300000,
      activeSubscriptions: 180,
      totalSubscriptions: 220,
      expiredSubscriptions: 40,
      totalVouchers: 450,
      usedVouchers: 320,
      maturedVouchers: 130,
      activeVouchers: 95,
      pendingOrders: 120,
    };
  }

  static async getDailyOrdersData(month?: number): Promise<{
    completed: { date: string; count: number }[];
    cancelled: { date: string; count: number }[];
    ongoing: { date: string; count: number }[];
  }> {
    // Using dummy data for UI/UX purposes
    const now = new Date();
    const targetMonth = month !== undefined ? month : now.getMonth();
    const targetYear = now.getFullYear();
    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    
    const dailyData = {
      completed: [] as { date: string; count: number }[],
      cancelled: [] as { date: string; count: number }[],
      ongoing: [] as { date: string; count: number }[]
    };

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${targetYear}-${(targetMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      dailyData.completed.push({
        date: dateStr,
        count: Math.floor(Math.random() * 50) + 10
      });
      
      dailyData.cancelled.push({
        date: dateStr,
        count: Math.floor(Math.random() * 8) + 1
      });
      
      dailyData.ongoing.push({
        date: dateStr,
        count: Math.floor(Math.random() * 20) + 5
      });
    }

    return dailyData;
  }

  static async getFinanceData(): Promise<{
    revenue: { date: string; amount: number }[];
    expenses: { date: string; amount: number }[];
  }> {
    // Using dummy data for UI/UX purposes
    const now = new Date();
    const monthlyData = {
      revenue: [] as { date: string; amount: number }[],
      expenses: [] as { date: string; amount: number }[]
    };

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toISOString().slice(0, 7);

      const monthRevenue = Math.floor(Math.random() * 5000000) + 2000000;
      const monthExpenses = Math.floor(Math.random() * 1500000) + 500000;

      monthlyData.revenue.push({ date: monthStr, amount: monthRevenue });
      monthlyData.expenses.push({ date: monthStr, amount: monthExpenses });
    }

    return monthlyData;
  }

  static async getUsersGrowthData(): Promise<{
    restaurants: { date: string; count: number }[];
    farmers: { date: string; count: number }[];
    admins: { date: string; count: number }[];
  }> {
    // Using dummy data for UI/UX purposes
    const now = new Date();
    const dailyData = {
      restaurants: [] as { date: string; count: number }[],
      farmers: [] as { date: string; count: number }[],
      admins: [] as { date: string; count: number }[]
    };

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().slice(0, 10);

      const dayRestaurants = Math.floor(Math.random() * 8) + 1;
      const dayFarmers = Math.floor(Math.random() * 12) + 2;
      const dayAdmins = Math.floor(Math.random() * 2);

      dailyData.restaurants.push({ date: dateStr, count: dayRestaurants });
      dailyData.farmers.push({ date: dateStr, count: dayFarmers });
      dailyData.admins.push({ date: dateStr, count: dayAdmins });
    }

    return dailyData;
  }

  static async getEnhancedRecentActivity(): Promise<ActivityItem[]> {
    // Using dummy data for UI/UX purposes
    return [
      {
        id: "order-1",
        type: "order_placed",
        title: "New Order Placed",
        description: "Order #ORD-2024-001 - Green Valley Restaurant",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: "pending",
        amount: 125000
      },
      {
        id: "voucher-1",
        type: "voucher",
        title: "Voucher Used",
        description: "DISC50-2024 - Mountain View Cafe",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: "success"
      },
      {
        id: "subscription-1",
        type: "subscription",
        title: "Subscription Renewed",
        description: "Urban Bistro - Premium Plan",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: "success"
      },
      {
        id: "order-2",
        type: "order_placed",
        title: "Order Cancelled",
        description: "Order #ORD-2024-003 - Riverside Diner",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        status: "failed",
        amount: 67000
      },
      {
        id: "user-1",
        type: "user_signup",
        title: "New User Registration",
        description: "FARMER - john.farmer@email.com",
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        status: "success"
      },
      {
        id: "order-3",
        type: "order_placed",
        title: "Order Delivered",
        description: "Order #ORD-2024-004 - Sunset Grill",
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        status: "success",
        amount: 89000
      },
      {
        id: "voucher-2",
        type: "voucher",
        title: "Voucher Matured",
        description: "CREDIT100-2024 - Downtown Eatery",
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        status: "success"
      },
      {
        id: "subscription-2",
        type: "subscription",
        title: "Subscription Expired",
        description: "Corner Cafe - Basic Plan",
        timestamp: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
        status: "failed"
      },
      {
        id: "user-2",
        type: "user_signup",
        title: "New Restaurant Registration",
        description: "RESTAURANT - newbistro@email.com",
        timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
        status: "success"
      },
      {
        id: "order-4",
        type: "order_placed",
        title: "Order In Transit",
        description: "Order #ORD-2024-005 - Garden Fresh",
        timestamp: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
        status: "pending",
        amount: 156000
      }
    ];
  }
}