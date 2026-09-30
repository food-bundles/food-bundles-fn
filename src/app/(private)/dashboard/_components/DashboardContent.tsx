"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "@/app/contexts/DashboardContext";
import { DashboardFilters } from "./DashboardFilters";
import { DashboardStatCard } from "./DashboardStatCard";
import { RecentActivity } from "./RecentActivity";
import { OrdersChart } from "./OrdersChart";
import { FinanceChart } from "./FinanceChart";
import { UsersChart } from "./UsersChart";
import { SystemStatus } from "./SystemStatus";
import { MarketPriceComparison } from "./MarketPriceComparison";

export function DashboardContent() {
  const { stats, error, refreshStats, sectionLoading } = useDashboard();
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
              <div key={i} className="h-[150px] bg-gray-200 animate-pulse rounded-2xl"></div>
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
      

        {/* Global Filters */}
        <DashboardFilters />

        {/* Enhanced Key Metrics - First Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardStatCard
            title="Total Users"
            value={stats?.users?.totalUsers || 0}
            previousValue={stats?.users?.growth?.totalChange}
            gradient="from-emerald-600 to-green-800"
            loading={sectionLoading.users}
            subMetrics={[
              { label: "Restaurants", value: stats?.users?.restaurants || 0 },
              { label: "Farmers", value: stats?.users?.farmers || 0 },
              { label: "Admins", value: stats?.users?.admins || 0 },
            ]}
          />
          <DashboardStatCard
            title="Total Orders"
            value={stats?.orders?.totalOrders || 0}
            previousValue={stats?.orders?.growth?.totalChange}
            gradient="from-blue-600 to-blue-900"
            loading={sectionLoading.orders}
            subMetrics={[
              { label: "Completed", value: stats?.orders?.completedOrders || 0 },
              { label: "Cancelled", value: stats?.orders?.cancelledOrders || 0 },
              { label: "Ongoing", value: stats?.orders?.ongoingOrders || 0 },
            ]}
          />
          <DashboardStatCard
            title="Finance Overview"
            value={stats?.finance?.totalRevenue || 0}
            previousValue={stats?.finance?.netProfit}
            gradient="from-indigo-600 to-indigo-900"
            suffix=" RWF"
            loading={sectionLoading.finance}
            subMetrics={[
              { label: "Revenue", value: stats?.finance?.totalRevenue || 0 },
              { label: "Expenses", value: stats?.finance?.totalExpenses || 0 },
            ]}
          />
          <DashboardStatCard
            title="Subscriptions"
            value={stats?.subscriptions?.totalSubscriptions || 0}
            previousValue={stats?.subscriptions?.growth?.totalChange}
            gradient="from-amber-500 to-orange-700"
            loading={sectionLoading.subscriptions}
            subMetrics={[
              { label: "Active", value: stats?.subscriptions?.activeSubscriptions || 0 },
              { label: "Expired", value: stats?.subscriptions?.expiredSubscriptions || 0 },
            ]}
          />
        </div>

        {/* Enhanced Secondary Metrics - Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <DashboardStatCard
            title="Vouchers"
            value={stats?.vouchers?.totalVouchers || 0}
            previousValue={stats?.vouchers?.growth?.totalChange}
            gradient="from-teal-600 to-cyan-900"
            loading={sectionLoading.vouchers}
            subMetrics={[
              { label: "Used", value: stats?.vouchers?.usedVouchers || 0 },
              { label: "Matured", value: stats?.vouchers?.maturedVouchers || 0 },
            ]}
          />
          {/* <QuickStats loading={sectionLoading.quickStats} stats={stats} /> */}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OrdersChart loading={sectionLoading.orders} data={stats?.orders} />
          <FinanceChart loading={sectionLoading.finance} data={stats?.finance} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users Chart */}
          <div className="lg:col-span-2">
            <UsersChart loading={sectionLoading.users} data={stats?.users} />
          </div>

          {/* Recent Activities */}
          <div>
            <RecentActivity activities={stats?.recentActivities || []} loading={sectionLoading.activities} />
          </div>
        </div>

        {/* Market Price Comparison */}
        <MarketPriceComparison />

        {/* System Status */}
        <SystemStatus />
      </div>
    </div>
  );
}