/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { EnhancedMetricCard } from "./_components/EnhancedMetricCard";
import { RecentActivity } from "./_components/RecentActivity";
import { QuickStats } from "./_components/QuickStats";
import { OrdersChart } from "./_components/OrdersChart";
import { FinanceChart } from "./_components/FinanceChart";
import { UsersChart } from "./_components/UsersChart";
import { SystemStatus } from "./_components/SystemStatus";
import { DashboardService, type DashboardMetrics, type ActivityItem } from "./_components/DashboardService";
import {
  Users,
  ShoppingCart,
  DollarSign,
  CreditCard,
  Package,
} from "lucide-react";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [metricsData, activitiesData] = await Promise.all([
        DashboardService.getEnhancedDashboardMetrics(),
        DashboardService.getEnhancedRecentActivity(),
      ]);

      setMetrics(metricsData);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timeInterval);
  }, []);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-linear-to-r from-green-600 to-green-700 text-white px-8 py-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-center gap-2 font-mono">
                <span className="text-3xl font-bold text-green-300">
                  {currentTime.getHours().toString().padStart(2, "0")}
                </span>
                <span className="text-2xl pb-1 text-green-300">:</span>
                <span className="text-3xl font-bold text-green-300">
                  {currentTime.getMinutes().toString().padStart(2, "0")}
                </span>
                <span className="text-2xl pb-1 text-green-300">:</span>
                <span className="w-5 text-xl font-semibold text-yellow-300">
                  {currentTime.getSeconds().toString().padStart(2, "0")}
                </span>
              </div>
            </div>
            <div>
              <p className="text-gray-800 mt-1 flex items-center gap-2">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Key Metrics - First Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedMetricCard
            title="Total Users"
            value={metrics?.totalUsers || 0}
            previousValue={metrics?.previousPeriodData?.totalUsers}
            icon={Users}
            color="from-yellow-500 to-yellow-600"
            loading={loading}
            subMetrics={[
              { label: "Restaurants", value: metrics?.totalRestaurants || 0, color: "text-blue-600" },
              { label: "Farmers", value: metrics?.totalFarmers || 0, color: "text-green-600" },
              { label: "Admins", value: metrics?.totalAdmins || 0, color: "text-purple-600" },
            ]}
          />
          <EnhancedMetricCard
            title="Total Orders"
            value={metrics?.totalOrders || 0}
            previousValue={metrics?.previousPeriodData?.totalOrders}
            icon={ShoppingCart}
            color="from-yellow-500 to-yellow-600"
            loading={loading}
            subMetrics={[
              { label: "Completed", value: metrics?.completedOrders || 0, color: "text-green-600" },
              { label: "Cancelled", value: metrics?.cancelledOrders || 0, color: "text-red-600" },
              { label: "Ongoing", value: metrics?.ongoingOrders || 0, color: "text-blue-600" },
            ]}
          />
          <EnhancedMetricCard
            title="Finance Overview"
            value={metrics?.totalRevenue || 0}
            previousValue={metrics?.previousPeriodData?.totalRevenue}
            icon={DollarSign}
            color="from-yellow-500 to-yellow-600"
            suffix=" RWF"
            loading={loading}
            subMetrics={[
              { label: "Revenue", value: metrics?.totalRevenue || 0, color: "text-green-600" },
              { label: "Expenses", value: metrics?.totalExpenses || 0, color: "text-red-600" },
            ]}
          />
          <EnhancedMetricCard
            title="Subscriptions"
            value={metrics?.totalSubscriptions || 0}
            icon={CreditCard}
            color="from-yellow-500 to-yellow-600"
            loading={loading}
            subMetrics={[
              { label: "Active", value: metrics?.activeSubscriptions || 0, color: "text-green-600" },
              { label: "Expired", value: metrics?.expiredSubscriptions || 0, color: "text-red-600" },
            ]}
          />
        </div>

        {/* Enhanced Secondary Metrics - Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <EnhancedMetricCard
            title="Vouchers"
            value={metrics?.totalVouchers || 0}
            icon={Package}
            color="from-green-600 to-green-700"
            loading={loading}
            subMetrics={[
              { label: "Used", value: metrics?.usedVouchers || 0, color: "text-green-600" },
              { label: "Matured", value: metrics?.maturedVouchers || 0, color: "text-blue-600" },
            ]}
          />
          <QuickStats loading={loading} metrics={metrics} />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OrdersChart loading={loading} />
          <FinanceChart loading={loading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users Chart */}
          <div className="lg:col-span-2">
            <UsersChart loading={loading} />
          </div>

          {/* Recent Activities */}
          <div>
            <RecentActivity activities={activities} loading={loading} />
          </div>
        </div>

        {/* System Status */}
        <SystemStatus />
      </div>
    </div>
  );
}