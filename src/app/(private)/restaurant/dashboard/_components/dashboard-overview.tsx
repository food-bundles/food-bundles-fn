/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Key, useState } from "react";
import {
  TrendingUp,
  BarChart3,
  CheckCircle,
  Clock,
  Truck,
  Package,
  Home,
  ShoppingBag,
  ChefHat,
  XCircle,
  RotateCcw,
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
import Image from "next/image";
import { Order, OrderStatus } from "@/lib/types";

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
  recentOrders: Order[];
};

type Props = {
  data: DashboardData;
};

export function DashboardOverview({ data }: Props) {
  const [chartPeriod, setChartPeriod] = useState<"week" | "month">("week");
  const [chartType, setChartType] = useState<"line" | "bar">("line");

  // Get status icon and color based on OrderStatus
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return {
          icon: Clock,
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
        };
      case OrderStatus.CONFIRMED:
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bgColor: "bg-green-100",
        };
      case OrderStatus.PREPARING:
        return {
          icon: ChefHat,
          color: "text-orange-600",
          bgColor: "bg-orange-100",
        };
      case OrderStatus.READY:
        return {
          icon: Package,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        };
      case OrderStatus.IN_TRANSIT:
        return { icon: Truck, color: "text-green-600", bgColor: "bg-green-100" };
      case OrderStatus.DELIVERED:
        return { icon: Home, color: "text-green-600", bgColor: "bg-green-100" };
      case OrderStatus.CANCELLED:
        return { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100" };
      case OrderStatus.REFUNDED:
        return {
          icon: RotateCcw,
          color: "text-gray-600",
          bgColor: "bg-gray-100",
        };
      default:
        return { icon: Clock, color: "text-gray-600", bgColor: "bg-gray-100" };
    }
  };

  // Mock order tracking data - this would come from your backend
  const orderTrackingData = {
    currentStep: 2, // 0: Order placed, 1: Preparing, 2: Shipped, 3: Delivered
    steps: [
      {
        label: "Pending",
        icon: ShoppingBag,
        completed: true,
        time: "10:30 AM",
        status: OrderStatus.PENDING,
      },
      {
        label: "Confirmed",
        icon: ShoppingBag,
        completed: true,
        time: "10:30 AM",
        status: OrderStatus.CONFIRMED,
      },
      {
        label: "Preparing",
        icon: ChefHat,
        completed: true,
        time: "11:15 AM",
        status: OrderStatus.PREPARING,
      },
      {
        label: "Ready",
        icon: Truck,
        completed: true,
        time: "2:30 PM",
        status: OrderStatus.READY,
      },
      {
        label: "Shipped",
        icon: Truck,
        completed: true,
        time: "2:30 PM",
        status: OrderStatus.IN_TRANSIT,
      },
      {
        label: "Delivered",
        icon: Home,
        completed: false,
        time: "Expected 4:00 PM",
        status: OrderStatus.DELIVERED,
      },
    ],
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        <div className="w-full lg:w-7/10 space-y-6">
          <div className="w-full border-b border-gray-200 pb-2 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="px-4">
              <h3 className="text-[14px] font-medium">Track Order</h3>
              <input
                type="text"
                placeholder="Enter Order ID"
                value={""}
                // onChange={(e) => setOrderId(e.target.value)}
                className="w-30 border border-gray-300 text-[13px] rounded px-2 py-1 mt-2"
              />
            </div>
            <div className="px-4">
              <div className="flex items-center gap-2">
                {orderTrackingData.steps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = step.completed;
                  const isCurrent = index === orderTrackingData.currentStep;

                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center relative z-10"
                    >
                      <div className="relative">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 ${
                            isCompleted
                              ? "border-2 border-green-500 bg-green-700 text-green-500 shadow-md"
                              : isCurrent
                              ? " text-white animate-pulse"
                              : "border-2 border-gray-200 bg-white text-gray-900 shadow-md"
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>

                      {/* Step Label */}
                      <div className={`text-center mt-3 px-3 rounded-full border " ${
                        isCompleted
                          ? "border-green-500 shadow-md"
                          : isCurrent
                          ? " text-white animate-pulse"
                          : "border-2 border-gray-200 bg-white text-gray-900 shadow-md"
                      }  ` }>
                        <p
                          className={`text-[13px] font-medium ${
                            isCompleted
                              ? "text-green-600"
                              : isCurrent
                              ? "text-green-600"
                              : "text-gray-900"
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Statistics Chart */}
          <Card className="w-full border-none shadow-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-3">
                <CardTitle className="text-[14px] font-medium">
                  Products Sold by Restaurant
                </CardTitle>
                <div className="flex items-center space-x-2 bg-white shadow rounded p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setChartType("line")}
                    className={`px-3  text-xs transition-all ${
                      chartType === "line"
                        ? "bg-white text-green-600 shadow-sm hover:bg-white"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    <TrendingUp className="h-2 w-2 mr-1" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setChartType("bar")}
                    className={`px-3  text-xs transition-all ${
                      chartType === "bar"
                        ? "bg-white text-green-600 shadow-sm hover:bg-white"
                        : "text-gray-600  hover:bg-gray-50"
                    }`}
                  >
                    <BarChart3 className="h-2 w-2 mr-1" />
                  </Button>
                </div>
              </div>
              <Select
                value={chartPeriod}
                onValueChange={(value: "week" | "month") =>
                  setChartPeriod(value)
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="">
                  <SelectItem value="week" className="text-[12px]">
                    Week
                  </SelectItem>
                  <SelectItem value="month" className="text-[12px]">
                    Month
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {chartType === "line" ? <LineChart /> : <BarChart />}
              <div className="flex justify-between text-sm text-gray-900 mt-6 pt-5">
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
        </div>

        {/* Vertical divider */}
        <div className="hidden lg:block w-[0.5px] bg-gray-300" />

        {/* RIGHT SIDE */}
        <div className="w-full lg:w-3/10 space-y-6">
          <div className="px-2 w-full">
            <div className="">
              <div className="flex space-y-6">
                <div className="flex-1">
                  <p className="text-[14px]  text-gray-600">Total Orders</p>
                  <p className="text-[14px] font-bold text-gray-900">
                    {data.metrics.totalOrders.current}
                  </p>
                </div>
                {/* Profit Section */}
                <div className="flex-1">
                  <p className="text-[12px]  text-gray-600">
                    Amount you would have paid in fees
                  </p>
                  <p className="text-[12px] font-bold text-green-600">
                    RWF 2,000
                  </p>
                </div>
              </div>
            </div>
            <p className="text-[12px] text-gray-900 mt-1">
              Compared to{" "}
              <span className="font-bold text-green-500">
                {data.metrics.totalOrders.previous}
              </span>{" "}
              {data.metrics.totalOrders.period}
            </p>
          </div>

          <div className="w-full px-2">
              <h3 className="text-[14px] font-semibold text-green-500 pb-2">Latest Orders</h3>
            <div className="space-y-4">
              {data.recentOrders.slice(0, 3).map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={order.id}
                    className="flex items-start space-x-3 p-4 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                  >
                    {/* Order Items Images */}
                    <div className="flex -space-x-2">
                      {order.items
                        .slice(0, 1)
                        .map(
                          (
                            item: { image: any; name: string },
                            index: Key | null | undefined
                          ) => (
                            <Image
                              key={index}
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              width={40}
                              height={40}
                              className="rounded-full object-cover w-10 h-10 border-2 border-white"
                            />
                          )
                        )}
                      {order.items.length > 2 && (
                        <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-900">
                            +{order.items.length - 2}
                          </span>
                        </div>
                       )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Order ID and Status */}
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {order.id}
                        </p>
                        <div className="relative">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${statusConfig.bgColor}`}
                          >
                            <StatusIcon
                              className={`w-3 h-3 ${statusConfig.color}`}
                            />
                          </div>
                          {order.status === OrderStatus.DELIVERED && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Item Names */}
                      <p className="text-xs text-gray-900 mb-1 line-clamp-1">
                        {order.items
                          .map((item: { name: any }) => item.name)
                          .join(", ")}
                      </p>

                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">
                          RWF {order.total.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-900">{order.timeAgo}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
