"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, TrendingUp } from "lucide-react";
import { DashboardService } from "./DashboardService";

interface UsersChartProps {
  loading?: boolean;
}

export function UsersChart({ loading = false }: UsersChartProps) {
  const [viewType, setViewType] = useState("daily");
  const [usersData, setUsersData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  const fetchUsersData = async () => {
    setChartLoading(true);
    try {
      const data = await DashboardService.getUsersGrowthData();
      
      // Transform data for chart
      const chartData = data.restaurants.map((item, index) => ({
        period: viewType === "daily" ? 
          new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
          new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
        date: item.date,
        restaurants: item.count,
        farmers: data.farmers[index]?.count || 0,
        administrators: data.admins[index]?.count || 0,
      }));
      
      setUsersData(chartData);
    } catch (error) {
      console.error('Error fetching users data:', error);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchUsersData();
    }
  }, [viewType, loading]);
  
  // Calculate totals
  const totalRestaurants = usersData.reduce((sum, item) => sum + item.restaurants, 0);
  const totalFarmers = usersData.reduce((sum, item) => sum + item.farmers, 0);
  const totalAdmins = usersData.reduce((sum, item) => sum + item.administrators, 0);
  const totalUsers = totalRestaurants + totalFarmers + totalAdmins;

  if (loading || chartLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold">Users Overview & Growth</CardTitle>
          </div>
          <Select value={viewType} onValueChange={setViewType}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Total Users: </span>
          <span className="font-semibold text-blue-600">{totalUsers.toLocaleString()}</span>
          <TrendingUp className="w-4 h-4 text-green-500 ml-2" />
          <span className="text-green-600 font-medium">+12.5%</span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={usersData}>
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
                name === 'farmers' ? 'Farmers' : 'Administrators'
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
              dataKey="administrators"
              stackId="1"
              stroke="#F59E0B"
              strokeWidth={2}
              fill="url(#colorAdmins)"
              name="Administrators"
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* User Type Summary */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <p className="text-xs text-gray-500">Restaurants</p>
            </div>
            <p className="text-sm font-semibold text-blue-600">
              {totalRestaurants.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <p className="text-xs text-gray-500">Farmers</p>
            </div>
            <p className="text-sm font-semibold text-green-600">
              {totalFarmers.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <p className="text-xs text-gray-500">Admins</p>
            </div>
            <p className="text-sm font-semibold text-orange-600">
              {totalAdmins.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}