/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Key, useState, useMemo, useEffect } from "react";
import {
  Truck,
  Home,
  ShoppingBag,
  ChefHat,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Spinner } from "@/components/ui/shadcn-io/spinner";

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
  loading?: boolean;
};

export function DashboardOverview({ data, onReorder, reorderingId, loading }: Props) {
  const [chartPeriod, setChartPeriod] = useState<"week" | "month">("week");
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
    if (loading) {
      return {
        currentStep: 0,
        steps: allOrderSteps.map((step) => ({
          ...step,
          completed: false,
          time: "",
        })),
        orderNumber: "Loading...",
        isLoading: true,
      };
    }
    
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

  const chartWidth = 800;
  const chartHeight = 240;
  const padding = 50;

  const getX = (index: number) =>
    padding +
    (index * (chartWidth - 2 * padding)) /
      (data.salesChart.currentPeriod.length - 1);
  const getY = (value: number) =>
    chartHeight - padding - (value / maxValue) * (chartHeight - 2 * padding);

  return (
    <div className="w-full relative">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${chartWidth} ${chartHeight + 60}`}
        className="overflow-visible"
        preserveAspectRatio="xMidYMid meet"
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
          <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: "#fb923c", stopOpacity: 0.3 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#fb923c", stopOpacity: 0.05 }}
            />
          </linearGradient>
          <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: "#ef4444", stopOpacity: 0.3 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#ef4444", stopOpacity: 0.05 }}
            />
          </linearGradient>
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

        {/* Area fill for successful orders (orange) */}
        <path
          d={`M ${getX(0)},${
            chartHeight - padding
          } ${data.salesChart.currentPeriod
            .map((d, i) => `L ${getX(i)},${getY(d.sales)}`)
            .join(" ")} L ${getX(data.salesChart.currentPeriod.length - 1)},${
            chartHeight - padding
          } Z`}
          fill="url(#orangeGradient)"
        />

        {/* Area fill for failed orders (red) */}
        <path
          d={`M ${getX(0)},${
            chartHeight - padding
          } ${data.salesChart.previousPeriod
            .map((d, i) => `L ${getX(i)},${getY(d.sales)}`)
            .join(" ")} L ${getX(data.salesChart.previousPeriod.length - 1)},${
            chartHeight - padding
          } Z`}
          fill="url(#redGradient)"
        />

        {/* Successful orders line (orange) */}
        <polyline
          fill="none"
          stroke="#fb923c"
          strokeWidth="3"
          points={data.salesChart.currentPeriod
            .map((d, i) => `${getX(i)},${getY(d.sales)}`)
            .join(" ")}
        />

        {data.salesChart.currentPeriod.map((d, i) => (
          <circle
            key={`current-${i}`}
            cx={getX(i)}
            cy={getY(d.sales)}
            r="5"
            fill="#fb923c"
            stroke="white"
            strokeWidth="2"
          />
        ))}

        {/* Failed/Cancelled orders line (red) */}
        <polyline
          fill="none"
          stroke="#ef4444"
          strokeWidth="3"
          points={data.salesChart.previousPeriod
            .map((d, i) => `${getX(i)},${getY(d.sales)}`)
            .join(" ")}
        />

        {data.salesChart.previousPeriod.map((d, i) => (
          <circle
            key={`previous-${i}`}
            cx={getX(i)}
            cy={getY(d.sales)}
            r="5"
            fill="#ef4444"
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
        Orders
      </div>

      <div className="flex items-center justify-center flex-wrap space-x-4 sm:space-x-6 mt-2 gap-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-orange-400 rounded"></div>
          <span className="text-xs sm:text-sm text-gray-700">
            Successful Orders
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-red-500 rounded"></div>
          <span className="text-xs sm:text-sm text-gray-700">
            Failed Orders
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
          
          <div className="lg:flex md:block justify-between w-full bg-white rounded-lg shadow-md p-3 sm:p-4 border border-gray-100 mb-4">
            <></>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                  Track Order
                </h2>
                <p className="text-xs sm:text-sm text-green-600">
                  #{orderTrackingData.orderNumber}
                </p>
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center">
                <Spinner />
              </div>
            ) : ( isFailedOrder ? (
              <div className="flex items-center justify-between gap-1 xs:gap-2 sm:gap-3 md:gap-6 py-2 lg:py-4 text-center">
                <p className="text-[12px] text-red-700">
                  Your order has failed. Please reorder.
                </p>
                <button
                  onClick={() => {
                    if (onReorder && orderToTrack) {
                      const orderId = (orderToTrack as any).originalData?.id || orderToTrack.id;
                      onReorder(orderId);
                    }
                  }}
                  disabled={!onReorder || !orderToTrack || (reorderingId === ((orderToTrack as any)?.originalData?.id || orderToTrack?.id))}
                  className={`flex items-center gap-1 text-[14px] px-3  border border-green-500 rounded-full transition-all ${
                    reorderingId === ((orderToTrack as any)?.originalData?.id || orderToTrack?.id)
                      ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                      : "text-green-500 hover:bg-green-500 hover:text-white hover:shadow-md cursor-pointer"
                  }`}
                >
                  {reorderingId === ((orderToTrack as any)?.originalData?.id || orderToTrack?.id) ? (
                    <>
                      <Spinner />
                    </>
                  ) : (
                    "Reorder"
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-1 xs:gap-2 sm:gap-3 md:gap-6 py-2 w-full">
                {orderTrackingData.steps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = step.completed;
                  const isCurrent = index === orderTrackingData.currentStep;
                  const isNext = index === orderTrackingData.currentStep + 1;

                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center flex-1"
                    >
                      <div className="relative flex items-center justify-center">
                        {isNext ? (
                          <MovingBorderCircle
                            duration={2000}
                            borderClassName="h-1.5 w-1.5 bg-gradient-to-r from-green-400 to-green-600"
                          >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-white text-green-400 border-2 border-green-300 transition-all">
                              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                          </MovingBorderCircle>
                        ) : (
                          <div
                            className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${
                              isCompleted
                                ? "bg-green-500 text-white shadow-md border-2 border-green-600"
                                : isCurrent
                                ? "bg-green-100 text-green-600 border-2 border-green-500"
                                : "bg-gray-100 text-gray-400 border-2 border-gray-300"
                            }`}
                          >
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                        )}
                      </div>
                      <p
                        className={`text-[9px] xs:text-[10px] sm:text-xs mt-1 sm:mt-2 font-medium text-center leading-tight ${
                          isCompleted || isCurrent
                            ? "text-green-600"
                            : isNext
                            ? "text-green-400"
                            : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <Card className="w-full border shadow-none">
            <CardHeader className="flex  flex-row items-center justify-between">
              <div className="flex items-center space-x-3">
                <CardTitle className="text-[14px] font-medium">
                  Chart Orders
                </CardTitle>
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
              <LineChart />
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
                          {isReordering ? (
                            <Spinner variant="circle" size={10} />
                          ) : (
                            <p className="text-[10px] font-medium">Reorder</p>
                          )}
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
                          {order.time}
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
