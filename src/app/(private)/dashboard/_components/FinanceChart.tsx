"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import { DashboardService } from "./DashboardService";

interface FinanceChartProps {
  loading?: boolean;
}

export function FinanceChart({ loading = false }: FinanceChartProps) {
  const [financeData, setFinanceData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  const fetchFinanceData = async () => {
    setChartLoading(true);
    try {
      const data = await DashboardService.getFinanceData();
      
      // Transform data for chart
      const chartData = data.revenue.map((item, index) => ({
        month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
        revenue: item.amount,
        expenses: data.expenses[index]?.amount || 0,
        profit: item.amount - (data.expenses[index]?.amount || 0),
      }));
      
      setFinanceData(chartData);
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchFinanceData();
    }
  }, [loading]);
  
  // Calculate total revenue and expenses
  const totalRevenue = financeData.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = financeData.reduce((sum, item) => sum + item.expenses, 0);
  const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100).toFixed(1) : '0';

  if (loading || chartLoading) {
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Finance Summary - Last 12 Months</CardTitle>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">{profitMargin}% Profit Margin</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={financeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#666"
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
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
              dot={{ fill: '#10B981', strokeWidth: 2, r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#EF4444" 
              strokeWidth={3}
              name="Expenses"
              dot={{ fill: '#EF4444', strokeWidth: 2, r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-500">Total Revenue</p>
            <p className="text-sm font-semibold text-green-600">
              {totalRevenue.toLocaleString()} RWF
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Total Expenses</p>
            <p className="text-sm font-semibold text-red-600">
              {totalExpenses.toLocaleString()} RWF
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Net Profit</p>
            <p className="text-sm font-semibold text-blue-600">
              {(totalRevenue - totalExpenses).toLocaleString()} RWF
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}