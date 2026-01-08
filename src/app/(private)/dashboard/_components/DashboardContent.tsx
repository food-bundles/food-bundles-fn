"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "@/app/contexts/DashboardContext";
import { DashboardFilters } from "./DashboardFilters";
import { EnhancedMetricCard } from "./EnhancedMetricCard";
import { RecentActivity } from "./RecentActivity";
import { QuickStats } from "./QuickStats";
import { OrdersChart } from "./OrdersChart";
import { FinanceChart } from "./FinanceChart";
import { UsersChart } from "./UsersChart";
import { SystemStatus } from "./SystemStatus";
import {
  Users,
  ShoppingCart,
  DollarSign,
  CreditCard,
  Package,
} from "lucide-react";

export function DashboardContent() {
  const { stats, loading, error, refreshStats } = useDashboard();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timeInterval);
  }, []);

  // Prevent hydration mismatch by not rendering time until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 rounded-md">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex gap-3 justify-start items-center">
            <div className="h-6 w-48 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="h-16 bg-gray-200 animate-pulse rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 rounded-md">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border flex gap-4 items-center border-red-200 rounded-md p-4">
            <p className="text-red-800">Something went wrong </p>
            <button 
              onClick={refreshStats}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6 rounded-md">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex gap-3 justify-start items-center">
          <p className="text-gray-800 mt-1 flex items-center gap-2">
            {currentTime?.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="flex mt-1 items-center text-green-600 font-semibold">
            {currentTime?.getHours().toString().padStart(2, "0")}:{" "}
            {currentTime?.getMinutes().toString().padStart(2, "0")}:{" "}
            {currentTime?.getSeconds().toString().padStart(2, "0")}
          </p>
        </div>

        {/* Global Filters */}
        <DashboardFilters />

        {/* Enhanced Key Metrics - First Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedMetricCard
            title="Total Users"
            value={stats?.users?.totalUsers || 0}
            previousValue={stats?.users?.growth?.totalChange}
            icon={Users}
            color="from-yellow-500 to-yellow-600"
            loading={loading}
            subMetrics={[
              {
                label: "Restaurants",
                value: stats?.users?.restaurants || 0,
                color: "text-blue-600",
              },
              {
                label: "Farmers",
                value: stats?.users?.farmers || 0,
                color: "text-green-600",
              },
              {
                label: "Admins",
                value: stats?.users?.admins || 0,
                color: "text-purple-600",
              },
            ]}
          />
          <EnhancedMetricCard
            title="Total Orders"
            value={stats?.orders?.totalOrders || 0}
            previousValue={stats?.orders?.growth?.totalChange}
            icon={ShoppingCart}
            color="from-yellow-500 to-yellow-600"
            loading={loading}
            subMetrics={[
              {
                label: "Completed",
                value: stats?.orders?.completedOrders || 0,
                color: "text-green-600",
              },
              {
                label: "Cancelled",
                value: stats?.orders?.cancelledOrders || 0,
                color: "text-red-600",
              },
              {
                label: "Ongoing",
                value: stats?.orders?.ongoingOrders || 0,
                color: "text-blue-600",
              },
            ]}
          />
          <EnhancedMetricCard
            title="Finance Overview"
            value={stats?.finance?.totalRevenue || 0}
            previousValue={stats?.finance?.netProfit}
            icon={DollarSign}
            color="from-yellow-500 to-yellow-600"
            suffix=" RWF"
            loading={loading}
            subMetrics={[
              {
                label: "Revenue",
                value: stats?.finance?.totalRevenue || 0,
                color: "text-green-600",
              },
              {
                label: "Expenses",
                value: stats?.finance?.totalExpenses || 0,
                color: "text-red-600",
              },
            ]}
          />
          <EnhancedMetricCard
            title="Subscriptions"
            value={stats?.subscriptions?.totalSubscriptions || 0}
            previousValue={stats?.subscriptions?.growth?.totalChange}
            icon={CreditCard}
            color="from-yellow-500 to-yellow-600"
            loading={loading}
            subMetrics={[
              {
                label: "Active",
                value: stats?.subscriptions?.activeSubscriptions || 0,
                color: "text-green-600",
              },
              {
                label: "Expired",
                value: stats?.subscriptions?.expiredSubscriptions || 0,
                color: "text-red-600",
              },
            ]}
          />
        </div>

        {/* Enhanced Secondary Metrics - Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <EnhancedMetricCard
            title="Vouchers"
            value={stats?.vouchers?.totalVouchers || 0}
            previousValue={stats?.vouchers?.growth?.totalChange}
            icon={Package}
            color="from-green-600 to-green-700"
            loading={loading}
            subMetrics={[
              {
                label: "Used",
                value: stats?.vouchers?.usedVouchers || 0,
                color: "text-green-600",
              },
              {
                label: "Matured",
                value: stats?.vouchers?.maturedVouchers || 0,
                color: "text-blue-600",
              },
            ]}
          />
          <QuickStats loading={loading} stats={stats} />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OrdersChart loading={loading} data={stats?.orders} />
          <FinanceChart loading={loading} data={stats?.finance} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users Chart */}
          <div className="lg:col-span-2">
            <UsersChart loading={loading} data={stats?.users} />
          </div>

          {/* Recent Activities */}
          <div>
            <RecentActivity activities={stats?.recentActivities || []} loading={loading} />
          </div>
        </div>

        {/* System Status */}
        <SystemStatus />
      </div>
    </div>
  );
}