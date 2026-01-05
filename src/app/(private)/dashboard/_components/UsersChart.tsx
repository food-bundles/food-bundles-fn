"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, RotateCcw, Users, TrendingUp, TrendingDown } from "lucide-react";
import { DashboardStats, statisticsService, StatsFilters } from "@/app/services/statisticsService";

interface UsersChartProps {
  loading?: boolean;
  data?: DashboardStats['users'];
}

export function UsersChart({ loading = false, data }: UsersChartProps) {
  const [localFilters, setLocalFilters] = useState<StatsFilters | null>(null);
  const [localData, setLocalData] = useState<DashboardStats['users'] | null>(null);
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
      const response = await statisticsService.getUserStats(filters);
      setLocalData(response.data);
    } catch (error) {
      console.error('Error fetching local users data:', error);
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
    period: item.period,
    restaurants: item.restaurants,
    farmers: item.farmers,
    admins: item.admins,
    affiliators: item.affiliators,
    total: item.total
  })) || [];

  const totalChange = activeData?.growth?.totalChange || 0;
  const isGrowth = totalChange >= 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-sm font-semibold">Users Growth</CardTitle>
              {getFilterDisplay() && (
                <span className="text-xs text-blue-600 font-medium">{getFilterDisplay()}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>Total: {(activeData?.totalUsers || 0).toLocaleString()}</span>
              {isGrowth ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
              <span className={`${isGrowth ? 'text-green-600' : 'text-red-600'}`}>
                {isGrowth ? '+' : ''}{totalChange.toFixed(1)}%
              </span>
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
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRestaurants" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorFarmers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorAdmins" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="period"
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number, name: string) => [
                value,
                name === 'restaurants' ? 'Restaurants' : 
                name === 'farmers' ? 'Farmers' : 
                name === 'admins' ? 'Admins' : 'Affiliators'
              ]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="restaurants"
              stackId="1"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#colorRestaurants)"
              name="Restaurants"
            />
            <Area
              type="monotone"
              dataKey="farmers"
              stackId="1"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#colorFarmers)"
              name="Farmers"
            />
            <Area
              type="monotone"
              dataKey="admins"
              stackId="1"
              stroke="#F59E0B"
              strokeWidth={2}
              fill="url(#colorAdmins)"
              name="Admins"
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* User Type Summary */}
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-xs text-gray-500">Restaurants</p>
            </div>
            <p className="text-xs font-semibold text-blue-600">
              {(activeData?.restaurants || 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-xs text-gray-500">Farmers</p>
            </div>
            <p className="text-xs font-semibold text-green-600">
              {(activeData?.farmers || 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <p className="text-xs text-gray-500">Admins</p>
            </div>
            <p className="text-xs font-semibold text-orange-600">
              {(activeData?.admins || 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <p className="text-xs text-gray-500">Affiliators</p>
            </div>
            <p className="text-xs font-semibold text-purple-600">
              {(activeData?.affiliators || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}