/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { type Key, useState, useMemo, useEffect } from "react";
import { Truck, Home, ShoppingBag, ChefHat, Package } from "lucide-react";
import {  CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import type { Order } from "@/lib/types";
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

export function DashboardOverview({
  data,
  onReorder,
  reorderingId,
  loading,
}: Props) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderToTrack, setOrderToTrack] = useState<any>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    value: number;
    day: string;
    type?: string;
    orders?: any[];
  } | null>(null);

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
        (firstOrder as any).originalData?.id || firstOrder.orderNumber;
      setSelectedOrderId(firstOrderId);
      setOrderToTrack(firstOrder);
    }
  }, [data.selectedOrderForTracking, data.recentOrders]);

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
        label: "Confirmed",
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
      label: "Confirmed",
      icon: Package,
      status: "CONFIRMED",
    },
    {
      label: "Preparing",
      icon: ChefHat,
      status: ["PREPARING", "READY"],
    },
    {
      label: "Shipped",
      icon: Truck,
      status: ["IN_TRANSIT"],
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
        currentStep: -1,
        steps: [],
        orderNumber: "No orders",
        isEmpty: true,
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
    // Process real order data to create chart data
    const processOrderData = () => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      // Debug: Log the raw order data
      
      return days.map(day => {
        // Count orders by day and status from ALL available orders
        const ordersForDay = data.recentOrders.filter(order => {
          const orderDate = new Date(order.createdAt || order.time);
          const dayName = orderDate.toLocaleDateString('en-US', { weekday: 'short' });
          return dayName === day;
        });
        
        const totalForDay = ordersForDay.length;
        const deliveredForDay = ordersForDay.filter(order => 
          order.status === 'DELIVERED' || order.status === 'READY'
        ).length;
        const cancelledForDay = ordersForDay.filter(order => 
          order.status === 'CANCELLED'
        ).length;
        
        // console.log(`${day}: total=${totalForDay}, delivered=${deliveredForDay}, cancelled=${cancelledForDay}`);
        
        return {
          day,
          total: totalForDay,
          delivered: deliveredForDay,
          cancelled: cancelledForDay,
          orders: ordersForDay
        };
      });
    };

   

    const chartData = processOrderData();

    
    const maxValue = Math.max(
      ...chartData.map(d => Math.max(d.total, d.delivered, d.cancelled)),
      5 
    );

    const generateYAxisValues = (max: number) => {
      if (max <= 5) return [0, 1, 2, 3, 4, 5];
      if (max <= 10) return [0, 2, 4, 6, 8, 10];
      if (max <= 20) return [0, 5, 10, 15, 20];
      if (max <= 50) return [0, 10, 20, 30, 40, 50];
      const step = Math.ceil(max / 5);
      return Array.from({ length: 6 }, (_, i) => i * step);
    };

    const yAxisValues = generateYAxisValues(maxValue);
    const chartMaxValue = Math.max(maxValue, yAxisValues[yAxisValues.length - 1]);

    const chartWidth = 800;
    const chartHeight = 240;
    const padding = 50;

    const getX = (index: number) =>
      padding +
      (index * (chartWidth - 2 * padding)) /
        (chartData.length - 1);
    const getY = (value: number) =>
      chartHeight - padding - (value / chartMaxValue) * (chartHeight - 2 * padding);

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
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                style={{ stopColor: "#3b82f6", stopOpacity: 0.3 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "#3b82f6", stopOpacity: 0.05 }}
              />
            </linearGradient>
            <linearGradient
              id="orangeGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
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

          {yAxisValues.map((value) => (
            <g key={value}>
              <text
                x="20"
                y={getY(value) + 5}
                className="text-[16px] fill-white"
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

          {/* Total orders line (blue) */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            points={chartData
              .map((d, i) => `${getX(i)},${getY(d.total)}`)
              .join(" ")}
          />

          {chartData.map((d, i) => (
            <circle
              key={`total-${i}`}
              cx={getX(i)}
              cy={getY(d.total)}
              r="5"
              fill="#3b82f6"
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer hover:r-7 transition-all"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredPoint({
                  x: rect.left,
                  y: rect.top,
                  value: d.total,
                  day: d.day,
                  type: "Total",
                  orders: d.orders,
                });
              }}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {/* Delivered orders line (orange) */}
          <polyline
            fill="none"
            stroke="#fb923c"
            strokeWidth="3"
            points={chartData
              .map((d, i) => `${getX(i)},${getY(d.delivered)}`)
              .join(" ")}
          />

          {chartData.map((d, i) => (
            <circle
              key={`delivered-${i}`}
              cx={getX(i)}
              cy={getY(d.delivered)}
              r="5"
              fill="#fb923c"
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer hover:r-7 transition-all"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredPoint({
                  x: rect.left,
                  y: rect.top,
                  value: d.delivered,
                  day: d.day,
                  type: "Delivered",
                  orders: d.orders.filter(
                    (order) => order.status === "DELIVERED"
                  ),
                });
              }}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {/* Cancelled orders line (red) */}
          <polyline
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            points={chartData
              .map((d, i) => `${getX(i)},${getY(d.cancelled)}`)
              .join(" ")}
          />

          {chartData.map((d, i) => (
            <circle
              key={`cancelled-${i}`}
              cx={getX(i)}
              cy={getY(d.cancelled)}
              r="5"
              fill="#ef4444"
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer hover:r-7 transition-all"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredPoint({
                  x: rect.left,
                  y: rect.top,
                  value: d.cancelled,
                  day: d.day,
                  type: "Cancelled",
                  orders: d.orders.filter(
                    (order) => order.status === "CANCELLED"
                  ),
                });
              }}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {chartData.map((d, i) => (
            <text
              key={d.day}
              x={getX(i)}
              y={chartHeight + 20}
              className="text-[16px] fill-white"
              textAnchor="middle"
            >
              {d.day}
            </text>
          ))}
        </svg>

        <div className="absolute -left-8 top-1/2 transform -rotate-90 -translate-y-1/2 text-xs text-white">
          Orders
        </div>

        <div className="flex items-center justify-center flex-wrap space-x-4 sm:space-x-6 mt-2 gap-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-blue-500 rounded"></div>
            <span className="text-[12px] text-white">Total Orders</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-orange-400 rounded"></div>
            <span className="text-[12px] text-white">Delivered Orders</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-red-500 rounded"></div>
            <span className="text-[12px] text-white">Cancelled Orders</span>
          </div>
        </div>
        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute bg-gray-900 text-white px-3 py-2 rounded text-xs pointer-events-none z-10 shadow-lg max-w-xs"
            style={{
              left: hoveredPoint.x - 60,
              top: hoveredPoint.y - 80,
            }}
          >
            <div className="font-semibold mb-1">{hoveredPoint.day}</div>
            <div
              className={`mb-2 ${
                (hoveredPoint as any).type === "Total"
                  ? "text-blue-300"
                  : (hoveredPoint as any).type === "Delivered"
                  ? "text-orange-300"
                  : "text-red-300"
              }`}
            >
              {(hoveredPoint as any).type}: {hoveredPoint.value} orders
            </div>
            {(hoveredPoint as any).orders &&
              (hoveredPoint as any).orders.length > 0 && (
                <div className="border-t border-gray-600 pt-1">
                  {(hoveredPoint as any).orders
                    .slice(0, 3)
                    .map((order: any, index: number) => (
                      <div key={index} className="text-xs text-gray-300">
                        {order.orderNumber} -{" "}
                        {order.orderItems?.[0]?.productName || "N/A"}
                      </div>
                    ))}
                  {(hoveredPoint as any).orders.length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{(hoveredPoint as any).orders.length - 3} more
                    </div>
                  )}
                </div>
              )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-0">
      <div className="flex flex-col lg:flex-row gap-6 w-full">
        <div className="w-full lg:w-1/2 space-y-0">
          {/* Order Tracking */}

          <div className=" relative  bg-white rounded shadow-lg hover:shadow-xl transition-shadow mt-6 pt-8 pb-4 px-6">
            {/* Header absolute block */}
            <div className="absolute -top-6 left-4 right-4 rounded  bg-linear-to-tr from-green-400 to-green-600 px-6  py-2 flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-semibold text-white">
                Track Order
              </h2>
              <p className="text-xs sm:text-sm text-white font-medium">
                {orderTrackingData.orderNumber}
              </p>
            </div>

            {/* Order tracking content */}
            <div className="">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Spinner variant="ring" />
                  <p className="text-sm text-gray-600 ml-2">
                    Loading order status...
                  </p>
                </div>
              ) : orderTrackingData.isEmpty ? (
                <div className="flex items-center justify-center py-4">
                  <p className="text-sm text-gray-500">No orders to track</p>
                </div>
              ) : isFailedOrder ? (
                <div className="flex gap-4 items-center justify-center py-4">
                  <p className="text-[13px] text-red-700 font-medium">
                    Your order has failed. Please reorder.
                  </p>
                  <button
                    onClick={() => {
                      if (onReorder && orderToTrack) {
                        const orderId =
                          (orderToTrack as any).originalData?.id ||
                          orderToTrack.id;
                        onReorder(orderId);
                      }
                    }}
                    disabled={
                      !onReorder ||
                      !orderToTrack ||
                      reorderingId ===
                        ((orderToTrack as any)?.originalData?.id ||
                          orderToTrack?.id)
                    }
                    className={`flex items-center gap-1 text-[13px] px-4 border border-green-500 rounded-full transition-all ${
                      reorderingId ===
                      ((orderToTrack as any)?.originalData?.id ||
                        orderToTrack?.id)
                        ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                        : "text-green-500 hover:bg-green-500 hover:text-white hover:shadow-md cursor-pointer"
                    }`}
                  >
                    {reorderingId ===
                    ((orderToTrack as any)?.originalData?.id ||
                      orderToTrack?.id) ? (
                      <Spinner variant="ring" />
                    ) : (
                      "Reorder"
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-1 xs:gap-2 sm:gap-3 md:gap-6 w-full">
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
                              duration={1000}
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
                          className={`text-[9px] xs:text-[10px] sm:text-xs mt-2 font-medium text-center leading-tight ${
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
              )}
            </div>
          </div>

          <div className="w-full mt-8 bg-white rounded p-4">
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
                    className={`flex items-start space-x-3 py-2 px-4 rounded cursor-pointer hover:shadow-lg ${
                      isSelected
                        ? "border border-green-500 bg-green-50 shadow-lg"
                        : "border border-gray-200 hover:border-green-300 bg-white shadow-md"
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
                          {order.orderNumber} 
                        </p>
                        <div className="flex gap-4">
                          <div
                            className={`px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.border} border transition-all duration-300`}
                          >
                            <p
                              className={`text-[10px] font-medium lowercase ${statusConfig.text}`}
                            >
                              {statusConfig.label}
                            </p>
                          </div>
                          {(order as any).originalData?.paymentMethod !== "VOUCHER" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onReorder) {
                                  onReorder(originalOrderId);
                                }
                              }}
                              disabled={isReordering || !onReorder}
                              className={`flex items-center gap-1 transition-all duration-200 ${
                                isReordering
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-green-500 hover:text-green-600 cursor-pointer"
                              }`}
                            >
                              {isReordering ? (
                                <Spinner variant="ring" />
                              ) : (
                                <p className="text-[13px] font-medium">Reorder</p>
                              )}
                            </button>
                          )}
                        </div>
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
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="px-2 w-full">
            <div className="flex gap-6">
              <div className="flex-1 relative pt-6">
                <div className="absolute top-0 left-4 bg-linear-to-tr from-orange-300 to-orange-400 rounded py-4 px-6 shadow-xl z-10">
                  <Package className="w-10 h-10 text-white" />
                </div>

                <div className="bg-white rounded shadow-lg hover:shadow-xl transition-shadow pt-6 pb-2 sm-pb-6 px-6">
                  <div className="mt-8 sm:mt-0">
                    <div className="text-right">
                      <p className="text-[13px] text-gray-500 font-medium">
                        Total Orders
                      </p>
                    </div>
                    <div className="text-end space-y-3">
                      <p className="text-4xl sm:text-2xl font-bold text-gray-900">
                        {data.metrics.totalOrders.current}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 lg:mt-4 pt-0 border-t border-gray-100">
                    <p className="text-xs text-orange-500 flex items-center gap-2">
                      <span className="text-lg">⚠</span>
                      View more..
                    </p>
                  </div>
                </div>
              </div>

              {/* Fees Saved card - Green theme */}
              <div className="flex-1 relative pt-6">
                {/* Floating icon box */}
                <div className="absolute top-0 left-4 bg-linear-to-tr from-green-400 to-green-600 rounded py-4 px-6 shadow-xl z-10">
                  <ShoppingBag className="w-10 h-10 text-white" />
                </div>

                {/* White card */}
                <div className="bg-white rounded shadow-lg hover:shadow-xl transition-shadow pt-6 pb-2 sm-pb-6 px-6">
                  <div className="mt-8 sm:mt-0">
                    <div className="text-right">
                      <p className="text-sm text-gray-500 font-medium">
                        Saved Fees
                      </p>
                    </div>
                    <div className="text-end space-y-3">
                      <p className="text-4xl sm:text-2xl font-bold text-gray-900">
                        0{" "}
                        <span className="text-[12px] font-normal text-gray-500">
                          RWF
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 lg:mt-4 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 flex items-center gap-2">
                      <span className="text-base"></span>
                      2025 year
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison section */}
          </div>

          <div className="w-full border-0 shadow rounded py-0  overflow-hidden">
            <CardHeader className="bg-white pt-2">
                <div className="flex justify-between items-center">
                  <div className="text-[14px]">
                   <p>Weekly Report</p>
                  </div>
                </div>
            </CardHeader>
            <CardContent className="bg-linear-to-br from-green-500 to-green-800 p-6">
              <LineChart />
            </CardContent>
          </div>
        </div>
      </div>
    </div>
  );
}
