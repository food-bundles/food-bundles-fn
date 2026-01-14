/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DashboardStats,
  statisticsService,
  StatsFilters,
} from "@/app/services/statisticsService";

interface OrdersChartProps {
  loading?: boolean;
  data?: DashboardStats["orders"];
}

export function OrdersChart({ loading = false, data }: OrdersChartProps) {
  const [apiData, setApiData] = useState<any>(null);
  const [localFilters, setLocalFilters] = useState<StatsFilters | null>(null);
  const [localData, setLocalData] = useState<DashboardStats["orders"] | null>(
    null
  );
  const [localLoading, setLocalLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: "Jan" },
    { value: 2, label: "Feb" },
    { value: 3, label: "Mar" },
    { value: 4, label: "Apr" },
    { value: 5, label: "May" },
    { value: 6, label: "Jun" },
    { value: 7, label: "Jul" },
    { value: 8, label: "Aug" },
    { value: 9, label: "Sep" },
    { value: 10, label: "Oct" },
    { value: 11, label: "Nov" },
    { value: 12, label: "Dec" },
  ];


  const fetchApiData = async (year?: number, month?: number) => {
    try {
      const filters: StatsFilters = {};
      if (year) filters.year = year;
      if (month) filters.month = month;
      const response = await statisticsService.getOrderStats(filters);
      setApiData(response.data);
    } catch (error) {
      console.error("Error fetching API data:", error);
    }
  };

  useEffect(() => {
    fetchApiData();
  }, []);

  const fetchLocalData = async (filters: StatsFilters) => {
    setLocalLoading(true);
    try {
      const response = await statisticsService.getOrderStats(filters);
      setLocalData(response.data);
    } catch (error) {
      console.error("Error fetching local orders data:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  const transformApiToChart = (apiData: any, year?: number, month?: number) => {
    if (!apiData?.timeBreakdown) return [];
    
    if (!year) {
      return Object.values(apiData.timeBreakdown).map((yearData: any) => ({
        date: yearData.year.toString(),
        completed: yearData.completed || 0,
        cancelled: yearData.cancelled || 0,
        ongoing: yearData.ongoing || 0,
        total: yearData.total || 0,
      }));
    } else if (year && !month) {
      const yearData = apiData.timeBreakdown[year];
      if (!yearData?.months) return [];
      
      return Object.values(yearData.months)
        .sort((a: any, b: any) => a.month - b.month)
        .map((monthData: any) => ({
          date: monthData.monthName,
          completed: monthData.completed || 0,
          cancelled: monthData.cancelled || 0,
          ongoing: monthData.ongoing || 0,
          total: monthData.total || 0,
        }));
    } else if (year && month) {
      const monthData = apiData.timeBreakdown[year]?.months[month];
      if (!monthData?.weeks) return [];
      
      return Object.values(monthData.weeks)
        .sort((a: any, b: any) => a.week - b.week)
        .map((weekData: any) => ({
          date: `Week ${weekData.week}`,
          completed: weekData.completed || 0,
          cancelled: weekData.cancelled || 0,
          ongoing: weekData.ongoing || 0,
          total: weekData.total || 0,
        }));
    }
    return [];
  };

  const activeData = localData || data;
  const isLoading = loading || localLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = apiData
    ? transformApiToChart(apiData, localFilters?.year, localFilters?.month)
    : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold">
              Orders Trend
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={localFilters?.year?.toString() || "all"}
              onValueChange={(value) => {
                const newFilters = { 
                  year: value === "all" ? undefined : parseInt(value),
                  month: undefined
                };
                setLocalFilters(newFilters);
                if (value !== "all") {
                  fetchApiData(parseInt(value));
                } else {
                  fetchApiData();
                }
              }}
            >
              <SelectTrigger className="h-5 text-xs w-20">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All</SelectItem>
                {years.map((year) => (
                  <SelectItem
                    key={year}
                    value={year.toString()}
                    className="text-xs"
                  >
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={localFilters?.month?.toString() || "all"}
              onValueChange={(value) => {
                const newFilters = {
                  ...localFilters,
                  month: value === "all" ? undefined : parseInt(value),
                };
                setLocalFilters(newFilters);
                if (value !== "all" && localFilters?.year) {
                  fetchApiData(localFilters.year, parseInt(value));
                } else if (value === "all" && localFilters?.year) {
                  fetchApiData(localFilters.year);
                }
              }}
              disabled={!localFilters?.year}
            >
              <SelectTrigger className="h-5 text-xs w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All
                </SelectItem>
                {months.map((month) => (
                  <SelectItem
                    key={month.value}
                    value={month.value.toString()}
                    className="text-xs"
                  >
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#666" />
            <YAxis tick={{ fontSize: 10 }} stroke="#666" />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                fontSize: "12px", 
              }}
              labelStyle={{
                fontSize: "12px",
                marginBottom: "2px",
              }}
              itemStyle={{
                fontSize: "12px", 
                padding: "1px 0",
              }}
            />

            <Line
              type="monotone"
              dataKey="completed"
              stroke="#10B981"
              strokeWidth={1.5}
              name="Completed"
              dot={{ fill: "#10B981", strokeWidth: 1, r: 2 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="cancelled"
              stroke="#EF4444"
              strokeWidth={1.5}
              name="Cancelled"
              dot={{ fill: "#EF4444", strokeWidth: 1, r: 2 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="ongoing"
              stroke="#3B82F6"
              strokeWidth={1.5}
              name="Ongoing"
              dot={{ fill: "#3B82F6", strokeWidth: 1, r: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4  border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            <p className="text-xs font-semibold text-green-600">
              {(apiData?.completedOrders || activeData?.completedOrders || 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-xs text-gray-500">Cancelled</p>
            </div>
            <p className="text-xs font-semibold text-red-600">
              {(apiData?.cancelledOrders || activeData?.cancelledOrders || 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-xs text-gray-500">Ongoing</p>
            </div>
            <p className="text-xs font-semibold text-blue-600">
              {(apiData?.ongoingOrders || activeData?.ongoingOrders || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
