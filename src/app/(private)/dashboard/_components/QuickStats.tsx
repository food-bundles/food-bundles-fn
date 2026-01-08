"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  CreditCard, 
  Package,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { DashboardStats } from "@/app/services/statisticsService";

interface QuickStatsProps {
  loading?: boolean;
  stats?: DashboardStats | null;
}

export function QuickStats({ loading = false, stats }: QuickStatsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading || !mounted) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const quickStats = [
    {
      label: "Total Users",
      value: stats?.quickStats?.totalUsers?.value || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: `${stats?.quickStats?.totalUsers?.change?.toFixed(1) || 0}%`,
      trend: (stats?.quickStats?.totalUsers?.change || 0) >= 0 ? "up" as const : "down" as const
    },
    {
      label: "Total Orders",
      value: stats?.quickStats?.totalOrders?.value || 0,
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: `${stats?.quickStats?.totalOrders?.change?.toFixed(1) || 0}%`,
      trend: (stats?.quickStats?.totalOrders?.change || 0) >= 0 ? "up" as const : "down" as const
    },
    {
      label: "Total Revenue",
      value: `${(stats?.quickStats?.totalRevenue?.value || 0).toLocaleString()} RWF`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      change: `${stats?.quickStats?.totalRevenue?.change?.toFixed(1) || 0}%`,
      trend: (stats?.quickStats?.totalRevenue?.change || 0) >= 0 ? "up" as const : "down" as const
    },
    {
      label: "Active Subscriptions",
      value: stats?.quickStats?.activeSubscriptions?.value || 0,
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: `${stats?.quickStats?.activeSubscriptions?.change?.toFixed(1) || 0}%`,
      trend: (stats?.quickStats?.activeSubscriptions?.change || 0) >= 0 ? "up" as const : "down" as const
    },
    {
      label: "Used Vouchers",
      value: stats?.quickStats?.usedVouchers?.value || 0,
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: `${stats?.quickStats?.usedVouchers?.change?.toFixed(1) || 0}%`,
      trend: (stats?.quickStats?.usedVouchers?.change || 0) >= 0 ? "up" as const : "down" as const
    },
    {
      label: "Completion Rate",
      value: `${stats?.quickStats?.completionRate?.value || 0}%`,
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      change: `${stats?.quickStats?.completionRate?.change?.toFixed(1) || 0}%`,
      trend: (stats?.quickStats?.completionRate?.change || 0) >= 0 ? "up" as const : "down" as const
    }
  ];

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3 h-3" />;
      case "down":
        return <TrendingDown className="w-3 h-3" />;
      case "stable":
        return <Minus className="w-3 h-3" />;
    }
  };

  const getTrendColor = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      case "stable":
        return "text-gray-600";
    }
  };

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="text-ms font-semibold">Quick Stats</CardTitle>
        <p className="text-xs text-gray-600">Key metrics with percentage change from last period</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={stat.label}
                className={`p-4 rounded-lg border ${stat.bgColor} transition-all duration-200 hover:shadow-md`}
                style={{
                  animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className={`w-5 h-5 ${stat.color}`} />
                  <Badge 
                    className={`text-xs ${getTrendColor(stat.trend)} bg-transparent border-0 p-0`}
                  >
                    <div className="flex items-center gap-1">
                      {getTrendIcon(stat.trend)}
                      {stat.change}
                    </div>
                  </Badge> 
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
                  <p className={`text-sm font-bold ${stat.color}`}>
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Card>
  );
}