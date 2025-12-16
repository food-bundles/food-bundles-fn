/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { MetricCard } from "./_components/MetricCard";
import { RecentActivity } from "./_components/RecentActivity";
import { QuickStats } from "./_components/QuickStats";
import { ChartCard } from "./_components/ChartCard";
import { DashboardService, type DashboardMetrics, type ActivityItem, type ChartData } from "./_components/DashboardService";
import {
  Users,
  Store,
  ShoppingCart,
  DollarSign,
  CreditCard,
  Package,
  Clock,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [ordersChart, setOrdersChart] = useState<ChartData[]>([]);
  const [subscriptionsChart, setSubscriptionsChart] = useState<ChartData[]>([]);
  const [revenueChart, setRevenueChart] = useState<ChartData[]>([]);
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

      const [
        metricsData,
        activitiesData,
        ordersData,
        subscriptionsData,
        revenueData
      ] = await Promise.all([
        DashboardService.getDashboardMetrics(),
        DashboardService.getRecentActivity(),
        DashboardService.getOrdersChartData(),
        DashboardService.getSubscriptionsChartData(),
        DashboardService.getRevenueChartData()
      ]);

      setMetrics(metricsData);
      setActivities(activitiesData);
      setOrdersChart(ordersData);
      setSubscriptionsChart(subscriptionsData);
      setRevenueChart(revenueData);
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

  const quickStats = [
    {
      label: "Order Completion Rate",
      value: metrics?.completedOrders || 0,
      total: metrics?.totalOrders || 1,
      color: "#10B981",
      trend: "up" as const
    },
    {
      label: "Active Subscriptions",
      value: metrics?.activeSubscriptions || 0,
      total: (metrics?.activeSubscriptions || 0) + 20,
      color: "#3B82F6",
      trend: "up" as const
    },
    {
      label: "Pending Orders",
      value: metrics?.pendingOrders || 0,
      total: metrics?.totalOrders || 1,
      color: "#F59E0B",
      trend: "stable" as const
    },
    {
      label: "Active Vouchers",
      value: metrics?.activeVouchers || 0,
      total: (metrics?.activeVouchers || 0) + 10,
      color: "#8B5CF6",
      trend: "up" as const
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-linear-to-r from-green-600 to-green-700 text-white px-8 py-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-center gap-2 font-mono">
                {/* Hours */}
                <span className=" text-3xl font-bold text-green-300">
                  {currentTime.getHours().toString().padStart(2, "0")}
                </span>

                <span className="text-2xl pb-1 text-green-300">:</span>

                {/* Minutes */}
                <span className=" text-3xl font-bold text-green-300">
                  {currentTime.getMinutes().toString().padStart(2, "0")}
                </span>

                <span className="text-2xl  pb-1 text-green-300">:</span>

                {/* Seconds */}
                <span className="w-5  text-xl font-semibold text-yellow-300">
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Users"
            value={metrics?.totalUsers || 0}
            previousValue={metrics?.previousPeriodData?.totalUsers}
            icon={Users}
            color="from-yellow-500 to-yellow-600"
            loading={loading}
          />
          <MetricCard
            title="Total Restaurants"
            value={metrics?.totalRestaurants || 0}
            previousValue={metrics?.previousPeriodData?.totalRestaurants}
            icon={Store}
            color="from-yellow-500 to-yellow-600"
            loading={loading}
          />
          <MetricCard
            title="Total Orders"
            value={metrics?.totalOrders || 0}
            previousValue={metrics?.previousPeriodData?.totalOrders}
            icon={ShoppingCart}
            color="from-yellow-500 to-yellow-600"
            loading={loading}
          />
          <MetricCard
            title="Total Revenue"
            value={metrics?.totalRevenue || 0}
            previousValue={metrics?.previousPeriodData?.totalRevenue}
            icon={DollarSign}
            color="from-yellow-500 to-yellow-600"
            suffix=" RWF"
            loading={loading}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Active Subscriptions"
            value={metrics?.activeSubscriptions || 0}
            icon={CreditCard}
            color="from-green-600 to-green-700"
            loading={loading}
          />
          <MetricCard
            title="Active Vouchers"
            value={metrics?.activeVouchers || 0}
            icon={Package}
            color="from-green-600 to-green-700"
            loading={loading}
          />
          <MetricCard
            title="Pending Orders"
            value={metrics?.pendingOrders || 0}
            icon={Clock}
            color="from-green-600 to-green-700"
            loading={loading}
          />
          <MetricCard
            title="Completed Orders"
            value={metrics?.completedOrders || 0}
            icon={CheckCircle}
            color="from-green-600 to-green-700"
            loading={loading}
          />
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts */}
          <div className="lg:col-span-2 space-y-6">
            <ChartCard
              title="Orders by Status"
              data={ordersChart}
              type="pie"
              loading={loading}
            />

            <ChartCard
              title="Monthly Revenue Trend"
              data={revenueChart}
              type="line"
              loading={loading}
              trend={{
                value: 12.5,
                isPositive: true,
              }}
            />

            <ChartCard
              title="Subscription Status"
              data={subscriptionsChart}
              type="bar"
              loading={loading}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QuickStats stats={quickStats} loading={loading} />
            <RecentActivity activities={activities} loading={loading} />
          </div>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    API Status
                  </p>
                  <p className="text-xs text-green-600">
                    All systems operational
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800">Online</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-800">Database</p>
                  <p className="text-xs text-blue-600">Response time: 45ms</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Healthy</Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-purple-800">
                    WebSocket
                  </p>
                  <p className="text-xs text-purple-600">
                    Real-time updates active
                  </p>
                </div>
                <Badge className="bg-purple-100 text-purple-800">
                  Connected
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}