/* eslint-disable @typescript-eslint/no-explicit-any */
import { orderService } from "@/app/services/orderService";
import { subscriptionService } from "@/app/services/subscriptionService";
import { voucherService } from "@/app/services/voucherService";
import { restaurantService } from "@/app/services/restaurantService";
import { usersService } from "@/app/services/usersService";

export interface DashboardMetrics {
  totalUsers: number;
  totalRestaurants: number;
  totalOrders: number;
  totalRevenue: number;
  activeSubscriptions: number;
  activeVouchers: number;
  pendingOrders: number;
  completedOrders: number;
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
    try {
      // Fetch data from multiple services
      const [
        ordersResponse,
        subscriptionsResponse,
        vouchersResponse,
        restaurantsResponse,
        usersResponse
      ] = await Promise.allSettled([
        orderService.getAllOrdersByAdmin({ limit: 1000 }),
        subscriptionService.getAllSubscriptions({ limit: 1000 }),
        voucherService.getAllVouchers({ limit: 1000 }),
        restaurantService.getAllRestaurants({ limit: 1000 }),
        usersService.getAllUsers({ limit: 1000 })
      ]);

      // Process orders data
      const orders = ordersResponse.status === 'fulfilled' ? ordersResponse.value.data : [];
      const totalOrders = orders.length;
      const totalRevenue = orders
        .filter((order: any) => order.status === 'DELIVERED')
        .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
      const pendingOrders = orders.filter((order: any) => 
        ['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status)
      ).length;
      const completedOrders = orders.filter((order: any) => 
        order.status === 'DELIVERED'
      ).length;

      // Process subscriptions data
      const subscriptions = subscriptionsResponse.status === 'fulfilled' ? subscriptionsResponse.value.data : [];
      const activeSubscriptions = subscriptions.filter((sub: any) => sub.status === 'ACTIVE').length;

      // Process vouchers data
      const vouchers = vouchersResponse.status === 'fulfilled' ? vouchersResponse.value.data : [];
      const activeVouchers = vouchers.filter((voucher: any) => voucher.status === 'ACTIVE').length;

      // Process restaurants data
      const restaurants = restaurantsResponse.status === 'fulfilled' ? restaurantsResponse.value.data : [];
      const totalRestaurants = restaurants.length;

      // Process users data (if available)
      const users = usersResponse.status === 'fulfilled' ? usersResponse.value.data : [];
      const totalUsers = users.length;

      return {
        totalUsers,
        totalRestaurants,
        totalOrders,
        totalRevenue,
        activeSubscriptions,
        activeVouchers,
        pendingOrders,
        completedOrders,
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      // Return default values if API calls fail
      return {
        totalUsers: 0,
        totalRestaurants: 0,
        totalOrders: 0,
        totalRevenue: 0,
        activeSubscriptions: 0,
        activeVouchers: 0,
        pendingOrders: 0,
        completedOrders: 0,
      };
    }
  }

  static async getRecentActivity(): Promise<ActivityItem[]> {
    try {
      const activities: ActivityItem[] = [];

      // Get recent orders
      const ordersResponse = await orderService.getAllOrdersByAdmin({ 
        limit: 10,
        page: 1 
      });
      
      if (ordersResponse.success) {
        ordersResponse.data.forEach((order: any) => {
          activities.push({
            id: `order-${order.id}`,
            type: "order_placed",
            title: "New Order Placed",
            description: `Order ${order.orderNumber} from ${order.restaurant?.name || 'Unknown'}`,
            timestamp: order.createdAt,
            status: order.status === 'DELIVERED' ? 'success' : 
                   order.status === 'CANCELLED' ? 'failed' : 'pending',
            amount: order.totalAmount
          });
        });
      }

      // Get recent subscriptions
      const subscriptionsResponse = await subscriptionService.getAllSubscriptions({ 
        limit: 5,
        page: 1 
      });
      
      if (subscriptionsResponse.success) {
        subscriptionsResponse.data.forEach((subscription: any) => {
          activities.push({
            id: `subscription-${subscription.id}`,
            type: "subscription",
            title: "Subscription Activity",
            description: `${subscription.restaurant?.name} - ${subscription.plan?.name}`,
            timestamp: subscription.createdAt,
            status: subscription.status === 'ACTIVE' ? 'success' : 
                   subscription.status === 'EXPIRED' ? 'failed' : 'pending'
          });
        });
      }

      // Sort by timestamp (most recent first)
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
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
        .slice(-6) // Last 6 months
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
}