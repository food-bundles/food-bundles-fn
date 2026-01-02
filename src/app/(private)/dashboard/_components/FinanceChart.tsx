"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, RotateCcw, TrendingUp, TrendingDown } from "lucide-react";
import { DashboardStats, statisticsService, StatsFilters } from "@/app/services/statisticsService";

interface FinanceChartProps {
  loading?: boolean;
  data?: DashboardStats['finance'];
}

export function FinanceChart({ loading = false, data }: FinanceChartProps) {
  const [localFilters, setLocalFilters] = useState<StatsFilters | null>(null);
  const [localData, setLocalData] = useState<DashboardStats['finance'] | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: "Jan" }, { value: 2, label: "Feb" }, { value: 3, label: "Mar" },
    { value: 4, label: "Apr" }, { value: 5, label: "May" }, { value: 6, label: "Jun" },
    { value: 7, label: "Jul" }, { value: 8, label: "Aug" }, { value: 9, label: "Sep" },
    { value: 10, label: "Oct" }, { value: 11, label: "Nov" }, { value: 12, label: "Dec" }
  ];

  const getFilterDisplay = () => {
    if (!localFilters?.year && !localFilters?.month) return null;
    const parts = [];
    if (localFilters?.year) parts.push(localFilters.year.toString());
    if (localFilters?.month) {
      const monthName = months.find(m => m.value === localFilters.month)?.label;
      parts.push(monthName);
    }
    return parts.length > 0 ? `(${parts.join(' ')})` : null;
  };

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

  const handleApplyFilters = () => {
    if (localFilters) {
      fetchLocalData(localFilters);
    }
  };

  const handleResetFilters = () => {
    setLocalFilters(null);
    setLocalData(null);
  };

  const activeData = localData || data;
  const isLoading = loading || localLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = activeData?.timeSeriesData?.map(item => ({
    date: item.period,
    revenue: item.revenue,
    expenses: item.expenses,
    profit: item.revenue - item.expenses
  })) || [];

  const isProfit = (activeData?.netProfit || 0) >= 0;
  const profitMargin = activeData?.profitMargin || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold">Finance Overview</CardTitle>
              {getFilterDisplay() && (
                <span className="text-xs text-blue-600 font-medium">{getFilterDisplay()}</span>
              )}
            </div>
            <div className={`flex items-center gap-1 text-xs ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
              {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{profitMargin.toFixed(1)}% Margin</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs h-7 px-2"
          >
            <Filter className="h-3 w-3 mr-1" />
            {showFilters ? 'Hide' : 'Filter'}
          </Button>
        </div>
        
        {showFilters && (
          <div className="mt-3 pt-3 border-t">
            <div className="grid grid-cols-4 gap-2">
              <Select
                value={localFilters?.year?.toString() || ''}
                onValueChange={(value) => setLocalFilters(prev => ({ ...prev, year: parseInt(value) }))}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()} className="text-xs">{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={localFilters?.month?.toString() || ''}
                onValueChange={(value) => setLocalFilters(prev => ({ ...prev, month: value === 'all' ? undefined : parseInt(value) }))}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All</SelectItem>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value.toString()} className="text-xs">{month.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-1">
                <Button size="sm" onClick={handleApplyFilters} className="text-xs h-7 px-2">
                  Apply
                </Button>
                <Button variant="outline" size="sm" onClick={handleResetFilters} className="text-xs h-7 px-1">
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#666"
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number, name: string) => [
                `${value.toLocaleString()} RWF`,
                name === 'revenue' ? 'Revenue' : name === 'expenses' ? 'Expenses' : 'Profit'
              ]}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10B981" 
              strokeWidth={3}
              name="Revenue"
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#EF4444" 
              strokeWidth={3}
              name="Expenses"
              dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
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