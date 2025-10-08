/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Key, useState, useMemo, useEffect } from "react";
import {
  TrendingUp,
  BarChart3,
  Truck,
  Home,
  ShoppingBag,
  ChefHat,
  Package,
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
import { Order } from "@/lib/types";
import { MovingBorderCircle } from "@/components/ui/moving-border-circle";

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
  selectedOrderForTracking?: any;
};

type Props = {
  data: DashboardData;
  onReorder?: (orderId: string) => void;
  reorderingId?: string | null;
};

export function DashboardOverview({ data, onReorder, reorderingId }: Props) {
  const [chartPeriod, setChartPeriod] = useState<"week" | "month">("week");
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderToTrack, setOrderToTrack] = useState<any>(null);

  // Initialize with the first order or selected order
  useEffect(() => {
    if (data.selectedOrderForTracking) {
      const orderId =
        (data.selectedOrderForTracking as any).originalData?.id ||
        data.selectedOrderForTracking.id;
      setSelectedOrderId(orderId);
      setOrderToTrack(data.selectedOrderForTracking);
    } else if (data.recentOrders.length > 0 && !selectedOrderId) {
      const firstOrder = data.recentOrders[0];
      const firstOrderId =
        (firstOrder as any).originalData?.id || firstOrder.id;
      setSelectedOrderId(firstOrderId);
      setOrderToTrack(firstOrder);
    }
  }, [data.selectedOrderForTracking, data.recentOrders.length]);

  // Update orderToTrack whenever selectedOrderId changes
  useEffect(() => {
    if (selectedOrderId) {
      const foundOrder = data.recentOrders.find(
        (order) =>
          order.id === selectedOrderId ||
          (order as any).originalData?.id === selectedOrderId
      );

      if (foundOrder) {
        setOrderToTrack(foundOrder);
      } else if (data.selectedOrderForTracking) {
        setOrderToTrack(data.selectedOrderForTracking);
      }
    }
  }, [selectedOrderId, data.recentOrders, data.selectedOrderForTracking]);

  // Check if order is failed/cancelled
  const isFailedOrder = useMemo(() => {
    if (!orderToTrack) return false;
    return (
      orderToTrack.status === "FAILED" || orderToTrack.status === "CANCELLED"
    );
  }, [orderToTrack]);

  // Get status display label and color configuration
  const getStatusConfig = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; bg: string; text: string; border: string }
    > = {
      PENDING: {
        label: "Pending",
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
      },
      CONFIRMED: {
        label: "Paid",
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
      },
      PREPARING: {
        label: "Preparing",
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
      },
      READY: {
        label: "Shipped",
        bg: "bg-cyan-50",
        text: "text-cyan-700",
        border: "border-cyan-200",
      },
      IN_TRANSIT: {
        label: "Shipped",
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        border: "border-indigo-200",
      },
      DELIVERED: {
        label: "Delivered",
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
      },
      CANCELLED: {
        label: "Failed",
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
      },
      FAILED: {
        label: "Failed",
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
      },
      REFUNDED: {
        label: "Refunded",
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
      },
      PROCESSING: {
        label: "Processing",
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-200",
      },
    };
    return (
      statusConfig[status] || {
        label: status,
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
      }
    );
  };

  // Define all possible order statuses with their icons
  const allOrderSteps = [
    {
      label: "Pending",
      icon: ShoppingBag,
      status: "PENDING",
    },
    {
      label: "paid",
      icon: Package,
      status: "CONFIRMED",
    },
    {
      label: "Preparing",
      icon: ChefHat,
      status: ["PREPARING"],
    },
    {
      label: "Shipped",
      icon: Truck,
      status: ["READY", "IN_TRANSIT"],
    },
    {
      label: "Delivered",
      icon: Home,
      status: "DELIVERED",
    },
  ];

  // Dynamically generate order tracking data based on actual order
  const orderTrackingData = useMemo(() => {
    if (!orderToTrack) {
      return {
        currentStep: 0,
        steps: allOrderSteps.map((step) => ({
          ...step,
          completed: false,
          time: "",
        })),
        orderNumber: "No orders",
      };
    }

    const currentStatus = orderToTrack.status;

    // Find current step index
    const currentStepIndex = allOrderSteps.findIndex((step) => {
      if (Array.isArray(step.status)) {
        return step.status.includes(currentStatus);
      }
      return step.status === currentStatus;
    });

    // Generate steps with completion status
    const steps = allOrderSteps.map((step, index) => {
      const isCompleted =
        index < currentStepIndex ||
        (Array.isArray(step.status) && step.status.includes(currentStatus)) ||
        step.status === currentStatus;

      return {
        label: step.label,
        icon: step.icon,
        completed: isCompleted,
        status: Array.isArray(step.status) ? step.status[0] : step.status,
      };
    });

    return {
      currentStep: currentStepIndex >= 0 ? currentStepIndex : 0,
      steps,
      orderNumber: orderToTrack.orderNumber || orderToTrack.id || "N/A",
    };
  }, [orderToTrack]);

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

          <polyline
            fill="none"
            stroke="#1e40af"
            strokeWidth="2"
            points={data.salesChart.currentPeriod
              .map((d, i) => `${getX(i)},${getY(d.sales)}`)
              .join(" ")}
          />

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

          <polyline
            fill="none"
            stroke="#93c5fd"
            strokeWidth="2"
            points={data.salesChart.previousPeriod
              .map((d, i) => `${getX(i)},${getY(d.sales)}`)
              .join(" ")}
          />

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

        <div className="absolute left-2 top-1/2 transform -rotate-90 -translate-y-1/2 text-xs text-gray-500">
          Units
        </div>

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

          {data.salesChart.currentPeriod.map((d, i) => {
            const x = getX(i);
            const currentHeight = getBarHeight(d.sales);
            const previousHeight = getBarHeight(
              data.salesChart.previousPeriod[i].sales
            );

            return (
              <g key={d.day}>
                <rect
                  x={x}
                  y={chartHeight - padding - currentHeight}
                  width={barWidth}
                  height={currentHeight}
                  fill="#1e40af"
                  rx="2"
                />

                <rect
                  x={x + barWidth + barSpacing}
                  y={chartHeight - padding - previousHeight}
                  width={barWidth}
                  height={previousHeight}
                  fill="#93c5fd"
                  rx="2"
                />

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

          <line
            x1={padding}
            y1={chartHeight - padding}
            x2={chartWidth - padding}
            y2={chartHeight - padding}
            stroke="#e5e7eb"
            strokeWidth="1"
          />

          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={chartHeight - padding}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        </svg>

        <div className="absolute left-2 top-1/2 transform -rotate-90 -translate-y-1/2 text-xs text-gray-500">
          Units
        </div>

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
        <div className="w-full lg:w-7/10 space-y-0">
          {/* Order Tracking */}
          <Card className="mb-4 gradient-card rounded shadow-md border-gray-100 ">
            <CardHeader className="">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    Track Order
                  </CardTitle>
                  <p className="text-sm text-green-600">
                    #{orderTrackingData.orderNumber}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="">
              {isFailedOrder ? (
                <div className=" ">
                  <p className="text-sm font-medium text-red-700">
                    Your order has failed. Please reorder.
                  </p>
                </div>
              ) : (
              <div className="flex items-center justify-between overflow-x-auto pb-4">
                  {orderTrackingData.steps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = step.completed;
                    const isCurrent = index === orderTrackingData.currentStep;
                    const isNext = index === orderTrackingData.currentStep + 1;

                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center min-w-0 flex-1"
                      >
                        <div className="relative">
                          {isNext ? (
                            <MovingBorderCircle
                              duration={2000}
                              borderClassName="h-1.5 w-1.5 bg-gradient-to-r from-green-400 to-green-600"
                            >
                              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white text-green-400 border-2 border-green-300 transition-all">
                                <Icon className="w-5 h-5" />
                              </div>
                            </MovingBorderCircle>
                          ) : (
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                isCompleted
                                  ? "bg-green-500 text-white shadow-lg border-2 border-green-600"
                                  : isCurrent
                                  ? "bg-green-100 text-green-600 border-2 border-green-500"
                                  : "bg-gray-100 text-gray-400 border-2 border-gray-300"
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="text-center mt-3">
                          <p
                            className={`text-xs font-medium ${
                              isCompleted
                                ? "text-green-600"
                                : isCurrent
                                ? "text-green-600"
                                : isNext
                                ? "text-green-400"
                                : "text-gray-400"
                            }`}
                          >
                            {step.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="w-full border-none shadow-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-3">
                <CardTitle className="text-[14px] font-medium">
                  Orders
                </CardTitle>
                <div className="flex items-center space-x-2 bg-white shadow rounded p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setChartType("line")}
                    className={`px-3 text-xs transition-all ${
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
                    className={`px-3 text-xs transition-all ${
                      chartType === "bar"
                        ? "bg-white text-green-600 shadow-sm hover:bg-white"
                        : "text-gray-600 hover:bg-gray-50"
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
                <SelectContent>
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

        <div className="hidden lg:block w-[0.5px] bg-gray-300" />

        <div className="w-full lg:w-3/10 space-y-6">
          <div className="px-2 w-full">
            {/* Top metrics row */}
            <div className="flex gap-4">
              {/* Total Orders card */}
              <div className="flex-1 border border-orange-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[13px] text-gray-600 font-medium">
                  Total Orders
                </p>
                <p className="text-lg font-semibold text-yellow-500 mt-1">
                  {data.metrics.totalOrders.current}
                </p>
              </div>

              {/* Amount you would have paid in fees card */}
              <div className="flex-1 border border-green-500 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <p className="text-[13px] text-gray-600 font-medium">
                  Amount you would have paid in fees
                </p>
                <p className="text-lg font-semibold text-green-600 mt-1">
                  RWF 2,000
                </p>
              </div>
            </div>

            {/* Comparison section */}
            <div className="mt-3  pt-2 text-center">
              <p className="text-sm text-gray-800">
                Compared to{" "}
                <span className="font-bold text-green-500">
                  {data.metrics.totalOrders.previous}
                </span>{" "}
                {data.metrics.totalOrders.period}
              </p>
            </div>
          </div>

          <div className="w-full px-2">
            <h3 className="text-[14px] font-semibold text-green-500 pb-2">
              Latest Orders
            </h3>
            <div className="space-y-4">
              {data.recentOrders.slice(0, 3).map((order) => {
                const originalOrderId =
                  (order as any).originalData?.id || order.id;
                const isReordering = reorderingId === originalOrderId;
                const isSelected =
                  selectedOrderId === originalOrderId ||
                  selectedOrderId === order.id;
                const statusConfig = getStatusConfig(order.status);

                return (
                  <div
                    key={order.id}
                    onClick={() => {
                      setSelectedOrderId(originalOrderId || order.id);
                    }}
                    className={`flex items-start space-x-3 p-4 rounded cursor-pointer transition-all duration-300 transform hover:scale-[1.01] hover:shadow-md ${
                      isSelected
                        ? "border-2 border-green-500 bg-green-50 shadow-md"
                        : "border border-gray-200 hover:border-green-300 bg-white"
                    }`}
                  >
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
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {order.id}
                        </p>
                        <div
                          className={`px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.border} border transition-all duration-300`}
                        >
                          <p
                            className={`text-[10px] font-medium lowercase ${statusConfig.text}`}
                          >
                            {statusConfig.label}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onReorder) {
                              console.log(
                                "Reorder clicked for:",
                                originalOrderId
                              );
                              onReorder(originalOrderId);
                            }
                          }}
                          disabled={isReordering || !onReorder}
                          className={`flex items-center gap-1 transition-all duration-200 ${
                            isReordering
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-green-500 hover:text-green-600 hover:scale-110 cursor-pointer"
                          }`}
                          title={isReordering ? "Reordering..." : "Reorder"}
                        >
                          <p className="text-[10px] font-medium">
                            {isReordering ? "..." : "Reorder"}
                          </p>
                        </button>
                      </div>

                      <p className="text-xs text-gray-900 mb-1 line-clamp-1">
                        {order.items
                          .map((item: { name: any }) => item.name)
                          .join(", ")}
                      </p>

                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">
                          RWF {order.total.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-gray-900">
                          {order.timeAgo}
                        </p>
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
