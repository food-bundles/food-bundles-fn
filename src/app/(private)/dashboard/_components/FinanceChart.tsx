/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown } from "lucide-react";
import { DashboardStats, statisticsService, StatsFilters } from "@/app/services/statisticsService";

interface FinanceChartProps {
  loading?: boolean;
  data?: DashboardStats['finance'];
}

export function FinanceChart({ loading = false, data }: FinanceChartProps) {
  const [localFilters, setLocalFilters] = useState<StatsFilters>({});
  const [localData, setLocalData] = useState<DashboardStats['finance'] | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: "Jan" }, { value: 2, label: "Feb" }, { value: 3, label: "Mar" },
    { value: 4, label: "Apr" }, { value: 5, label: "May" }, { value: 6, label: "Jun" },
    { value: 7, label: "Jul" }, { value: 8, label: "Aug" }, { value: 9, label: "Sep" },
    { value: 10, label: "Oct" }, { value: 11, label: "Nov" }, { value: 12, label: "Dec" }
  ];




  const fetchLocalData = async (filters: StatsFilters) => {
    setLocalLoading(true);
    try {
      const response = await statisticsService.getFinanceStats(filters);
      setLocalData(response.data);
    } catch (error) {
      console.error('Error fetching local finance data:', error);
    } finally {
      setLocalLoading(false);
    }
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

  const transformTimeBreakdown = () => {
    if (!activeData?.timeSeriesData) return [];
    
    const data: Array<{ date: string; revenue: number; expenses: number; profit: number }> = [];
    
    // Use the existing timeSeriesData structure
    activeData.timeSeriesData.forEach((item: any) => {
      data.push({
        date: item.period || item.date,
        revenue: item.revenue || 0,
        expenses: item.expenses || 0,
        profit: (item.revenue || 0) - (item.expenses || 0)
      });
    });
    
    return data;
  };

  const chartData = transformTimeBreakdown();

  const isProfit = (activeData?.netProfit || 0) >= 0;
  const profitMargin = activeData?.profitMargin || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold">Finance Overview</CardTitle>
            </div>
            <div className={`flex items-center gap-1 text-xs ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
              {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{profitMargin.toFixed(1)}% Margin</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select
              value={localFilters?.year?.toString() || "all"}
              onValueChange={(value) => {
                const newFilters = { 
                  year: value === "all" ? undefined : parseInt(value),
                  month: undefined // Always reset month when year changes
                };
                setLocalFilters(newFilters);
                fetchLocalData(newFilters);
              }}
            >
              <SelectTrigger className="h-7 text-xs w-20">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()} className="text-xs">{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={localFilters?.month?.toString() || 'all'}
              onValueChange={(value) => {
                const newFilters = { 
                  ...localFilters, 
                  month: value === 'all' ? undefined : parseInt(value) 
                };
                setLocalFilters(newFilters);
                fetchLocalData(newFilters);
              }}
              disabled={!localFilters?.year} // Disable when no year selected or "all" years
            >
              <SelectTrigger className="h-7 text-xs w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All</SelectItem>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value.toString()} className="text-xs">{month.label}</SelectItem>
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
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10 }}
              stroke="#666"
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              stroke="#666"
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontSize: '12px'
              }}
              labelStyle={{
                fontSize: '12px',
                marginBottom: '4px',
                fontWeight: 'bold'
              }}
              itemStyle={{
                fontSize: '12px',
                padding: '2px 0'
              }}
              formatter={(value: number | undefined, name: string | undefined) => [
                `${(value || 0).toLocaleString()} RWF`,
                name === 'revenue' ? 'Revenue' : name === 'expenses' ? 'Expenses' : 'Profit'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10B981" 
              strokeWidth={2}
              name="revenue"
              dot={{ fill: '#10B981', strokeWidth: 1, r: 3 }}
              isAnimationActive={false}
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#EF4444" 
              strokeWidth={2}
              name="expenses"
              dot={{ fill: '#EF4444', strokeWidth: 1, r: 3 }}
              isAnimationActive={false}
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="profit"
              dot={{ fill: '#3B82F6', strokeWidth: 1, r: 3 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-500">Total Revenue</p>
            <p className="text-xs font-semibold text-green-600">
              {(activeData?.totalRevenue || 0).toLocaleString()} RWF
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Total Expenses</p>
            <p className="text-xs font-semibold text-red-600">
              {(activeData?.totalExpenses || 0).toLocaleString()} RWF
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Net Profit</p>
            <p className={`text-xs font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
              {(activeData?.netProfit || 0).toLocaleString()} RWF
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}