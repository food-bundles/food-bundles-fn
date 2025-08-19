"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import Image from "next/image";
import { recentOrdersColumns, type RecentOrder } from "./recent-orders-columns";
import { DataTable } from "@/components/data-table";

type DashboardData = {
  date: string;
  metrics: {
    totalSales: {
      current: number;
      previous: number;
      change: number;
      period: string;
    };
    totalOrders: {
      current: number;
      previous: number;
      change: number;
      period: string;
    };
    averageOrderValue: {
      current: number;
      previous: number;
      change: number;
      period: string;
    };
    onTimeDeliveryRate: {
      current: number;
      note: string;
    };
  };
  salesChart: {
    currentPeriod: Array<{ day: string; sales: number }>;
    previousPeriod: Array<{ day: string; sales: number }>;
    stats: {
      min: number;
      avg: number;
      max: number;
    };
  };
  topProducts: Array<{
    id: string;
    name: string;
    unitsSold: number;
    image: string;
  }>;
  recentOrders: Array<{
    id: string;
    customer: string;
    products: string;
    total: number;
    status: string;
    date: string;
  }>;
};

type Props = {
  data: DashboardData;
};

export function DashboardOverview({ data }: Props) {
  const [chartPeriod, setChartPeriod] = useState<"week" | "month">("week");
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const LineChart = () => {
    const maxValue = Math.max(
      ...data.salesChart.currentPeriod.map((d) => d.sales),
      ...data.salesChart.previousPeriod.map((d) => d.sales)
    );
    const chartWidth = 600;
    const chartHeight = 200;
    const padding = 40;

    const getX = (index: number) =>
      padding +
      (index * (chartWidth - 2 * padding)) /
        (data.salesChart.currentPeriod.length - 1);
    const getY = (value: number) =>
      chartHeight - padding - (value / maxValue) * (chartHeight - 2 * padding);

    return (
      <div className="w-full h-64 relative">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${chartWidth} ${chartHeight + 60}`}
          className="overflow-visible"
        >
          {/* Grid lines */}
          <defs>
            <pattern
              id="grid"
              width="100"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 100 0 L 0 0 0 40"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            </pattern>
          </defs>
          <rect width="100%" height={chartHeight} fill="url(#grid)" />

          {/* Y-axis labels */}
          {[0, 9, 18, 27, 36].map((value) => (
            <g key={value}>
              <text
                x="20"
                y={getY(value) + 5}
                className="text-xs fill-gray-500"
                textAnchor="end"
              >
                {value}
              </text>
              <line
                x1={padding}
                y1={getY(value)}
                x2={chartWidth - padding}
                y2={getY(value)}
                stroke="#f3f4f6"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            </g>
          ))}

          {/* Current Week Line */}
          <polyline
            fill="none"
            stroke="#1e40af"
            strokeWidth="2"
            points={data.salesChart.currentPeriod
              .map((d, i) => `${getX(i)},${getY(d.sales)}`)
              .join(" ")}
          />

          {/* Current Week Points */}
          {data.salesChart.currentPeriod.map((d, i) => (
            <circle
              key={`current-${i}`}
              cx={getX(i)}
              cy={getY(d.sales)}
              r="4"
              fill="#1e40af"
              stroke="white"
              strokeWidth="2"
            />
          ))}

          {/* Previous Week Line */}
          <polyline
            fill="none"
            stroke="#93c5fd"
            strokeWidth="2"
            points={data.salesChart.previousPeriod
              .map((d, i) => `${getX(i)},${getY(d.sales)}`)
              .join(" ")}
          />

          {/* Previous Week Points */}
          {data.salesChart.previousPeriod.map((d, i) => (
            <circle
              key={`previous-${i}`}
              cx={getX(i)}
              cy={getY(d.sales)}
              r="4"
              fill="#93c5fd"
              stroke="white"
              strokeWidth="2"
            />
          ))}

          {/* X-axis labels */}
          {data.salesChart.currentPeriod.map((d, i) => (
            <text
              key={d.day}
              x={getX(i)}
              y={chartHeight + 20}
              className="text-xs fill-gray-600"
              textAnchor="middle"
            >
              {d.day}
            </text>
          ))}
        </svg>

        {/* Y-axis label */}
        <div className="absolute left-2 top-1/2 transform -rotate-90 -translate-y-1/2 text-xs text-gray-500">
          Units
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-blue-600"></div>
            <span className="text-sm text-gray-700">
              Current {chartPeriod === "week" ? "Week" : "Month"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-blue-300"></div>
            <span className="text-sm text-gray-400">
              Previous {chartPeriod === "week" ? "Week" : "Month"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const BarChart = () => {
    const maxValue = Math.max(
      ...data.salesChart.currentPeriod.map((d) => d.sales),
      ...data.salesChart.previousPeriod.map((d) => d.sales)
    );
    const chartWidth = 600;
    const chartHeight = 240;
    const padding = 60;
    const barWidth = 24;
    const barSpacing = 8;
    const groupSpacing = 40;

    const getX = (index: number) =>
      padding + index * (groupSpacing + barWidth * 2 + barSpacing);
    const getBarHeight = (value: number) =>
      (value / maxValue) * (chartHeight - 2 * padding);

    return (
      <div className="w-full h-64 relative">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`}
          className="overflow-visible"
        >
          {/* Grid lines */}
          <defs>
            <pattern
              id="grid"
              width="100"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 100 0 L 0 0 0 40"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            </pattern>
          </defs>

          {/* Y-axis labels and grid lines */}
          {[0, 9, 18, 27, 36].map((value) => (
            <g key={value}>
              <text
                x="35"
                y={chartHeight - padding - getBarHeight(value) + 5}
                className="text-xs fill-gray-500"
                textAnchor="end"
              >
                {value}
              </text>
              <line
                x1={padding}
                y1={chartHeight - padding - getBarHeight(value)}
                x2={chartWidth - padding}
                y2={chartHeight - padding - getBarHeight(value)}
                stroke="#f3f4f6"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            </g>
          ))}

          {/* Bars */}
          {data.salesChart.currentPeriod.map((d, i) => {
            const x = getX(i);
            const currentHeight = getBarHeight(d.sales);
            const previousHeight = getBarHeight(
              data.salesChart.previousPeriod[i].sales
            );

            return (
              <g key={d.day}>
                {/* Current Period Bar */}
                <rect
                  x={x}
                  y={chartHeight - padding - currentHeight}
                  width={barWidth}
                  height={currentHeight}
                  fill="#1e40af"
                  rx="2"
                />

                {/* Previous Period Bar */}
                <rect
                  x={x + barWidth + barSpacing}
                  y={chartHeight - padding - previousHeight}
                  width={barWidth}
                  height={previousHeight}
                  fill="#93c5fd"
                  rx="2"
                />

                {/* Value labels on top of bars */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - padding - currentHeight - 8}
                  className="text-xs fill-gray-700 font-medium"
                  textAnchor="middle"
                >
                  {d.sales}
                </text>
                <text
                  x={x + barWidth + barSpacing + barWidth / 2}
                  y={chartHeight - padding - previousHeight - 8}
                  className="text-xs fill-gray-500"
                  textAnchor="middle"
                >
                  {data.salesChart.previousPeriod[i].sales}
                </text>

                {/* X-axis labels */}
                <text
                  x={x + barWidth + barSpacing / 2}
                  y={chartHeight - padding + 20}
                  className="text-xs fill-gray-600"
                  textAnchor="middle"
                >
                  {d.day}
                </text>
              </g>
            );
          })}

          {/* X-axis line */}
          <line
            x1={padding}
            y1={chartHeight - padding}
            x2={chartWidth - padding}
            y2={chartHeight - padding}
            stroke="#e5e7eb"
            strokeWidth="1"
          />

          {/* Y-axis line */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={chartHeight - padding}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        </svg>

        {/* Y-axis label */}
        <div className="absolute left-2 top-1/2 transform -rotate-90 -translate-y-1/2 text-xs text-gray-500">
          Units
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
            <span className="text-sm text-gray-700">
              Current {chartPeriod === "week" ? "Week" : "Month"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-300 rounded-sm"></div>
            <span className="text-sm text-gray-400">
              Previous {chartPeriod === "week" ? "Week" : "Month"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const recentOrdersData: RecentOrder[] = data.recentOrders
    .slice(0, 3)
    .map((order) => ({
      id: order.id,
      customer: order.customer,
      products: order.products,
      total: order.total,
      status: order.status,
      date: order.date,
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">{data.date}</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.metrics.totalSales.current)}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    {data.metrics.totalSales.change}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Compared to {formatCurrency(data.metrics.totalSales.previous)}{" "}
                  {data.metrics.totalSales.period}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.metrics.totalOrders.current}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    {data.metrics.totalOrders.change}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Compared to {data.metrics.totalOrders.previous}{" "}
                  {data.metrics.totalOrders.period}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Average Order Value
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data.metrics.averageOrderValue.current)}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600 font-medium">
                    {Math.abs(data.metrics.averageOrderValue.change)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Compared to{" "}
                  {formatCurrency(data.metrics.averageOrderValue.previous)}{" "}
                  {data.metrics.averageOrderValue.period}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  On-time Delivery Rate
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.metrics.onTimeDeliveryRate.current}%
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${data.metrics.onTimeDeliveryRate.current}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {data.metrics.onTimeDeliveryRate.note}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-3">
              <CardTitle>Products Sold by Restaurant</CardTitle>
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChartType("line")}
                  className={`px-3 py-1 text-xs transition-all ${
                    chartType === "line"
                      ? "bg-white text-blue-600 shadow-sm hover:bg-white"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {/* Line Chart */}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChartType("bar")}
                  className={`px-3 py-1 text-xs transition-all ${
                    chartType === "bar"
                      ? "bg-white text-blue-600 shadow-sm hover:bg-white"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  {/* Bar Chart */}
                </Button>
              </div>
            </div>
            <Select
              value={chartPeriod}
              onValueChange={(value: "week" | "month") => setChartPeriod(value)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {chartType === "line" ? <LineChart /> : <BarChart />}

            <div className="flex justify-between text-sm text-gray-600 mt-6 pt-5 ">
              <span>
                Min Products Sold:{" "}
                <strong>{data.salesChart.stats.min} units</strong>
              </span>
              <span>
                Avg Products Sold:{" "}
                <strong>{data.salesChart.stats.avg} units</strong>
              </span>
              <span>
                Max Products Sold:{" "}
                <strong>{data.salesChart.stats.max} units</strong>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Three Sold Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-10">
            {data.topProducts.map((product) => (
              <div key={product.id} className="flex items-center space-x-3">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  width={40}
                  height={40}
                  className="rounded-lg object-cover w-30 h-20"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">
                    {product.unitsSold} units sold
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders - Using reusable DataTable component */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/restaurant/dashboard/orders">View All Orders</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={recentOrdersColumns}
            data={recentOrdersData}
            showSearch={false}
            showColumnVisibility={false}
            showPagination={false}
            showRowSelection={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
