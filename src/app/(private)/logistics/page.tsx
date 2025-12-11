/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
// Removed shadcn imports - using native HTML elements

import { orderService } from "@/app/services/orderService";
import {
  Package,
  CheckCircle,
  MapPin,
  User,
  ArrowRight,
  Eye,
  Clock,
  Truck,
  RefreshCw,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

type DeliveryStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

interface LogisticsOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  restaurantName: string;
  items: string;
  totalAmount: number;
  status: DeliveryStatus;
  paymentStatus: string;
  productImages: string[];
  createdAt: string;
}

export default function LogisticsPage() {
  const [orders, setOrders] = useState<LogisticsOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<LogisticsOrder | null>(
    null
  );
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("unfollowed");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await orderService.getDeliveryOrders({
        page: 1,
        limit: 50,
      });
      if (response.success) {
        const formattedOrders = response.data.map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.billingName,
          customerPhone: order.billingPhone,
          deliveryAddress: order.billingAddress,
          restaurantName: order.restaurant?.name || "Unknown Restaurant",
          items:
            order.orderItems
              ?.map((item: any) => `${item.productName} (${item.quantity})`)
              .join(", ") || "No items",
          totalAmount: order.totalAmount,
          status: order.status as DeliveryStatus,
          paymentStatus: order.paymentStatus,
          productImages:
            order.orderItems?.flatMap((item: any) => item.images || []) || [],
          createdAt: order.createdAt,
        }));
        setOrders(formattedOrders);
        if (isRefresh) {
          toast.success("Orders refreshed!");
        }
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchOrders(true);
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await fetch(`https://server.food.rw/deliveries/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('auth-token=')[1]?.split(';')[0]}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log(`Response from fetchOrderDetails:`, data);
      if (response.ok) {
        setSelectedOrderDetails(data);
        setShowDetailsModal(true);
      } else {
        toast.error("Failed to fetch order details");
      }
    } catch (error) {
      toast.error("Failed to fetch order details");
    }
  };

  const unfollowedOrders = orders.filter(
    (order) => order.status === "CONFIRMED"
  );
  const followedOrders = orders.filter((order) =>
    ["PREPARING", "READY", "IN_TRANSIT"].includes(order.status)
  );
  const deliveredOrders = orders.filter(
    (order) => order.status === "DELIVERED"
  );

  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PREPARING":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "READY":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "IN_TRANSIT":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getNextStatus = (
    currentStatus: DeliveryStatus
  ): DeliveryStatus | null => {
    const workflow: Record<DeliveryStatus, DeliveryStatus | null> = {
      PENDING: null,
      CONFIRMED: "PREPARING",
      PREPARING: "READY",
      READY: "IN_TRANSIT",
      IN_TRANSIT: "DELIVERED",
      DELIVERED: null,
      CANCELLED: null,
    };
    return workflow[currentStatus];
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: "PREPARING" | "READY" | "IN_TRANSIT" | "CANCELLED"
  ) => {
    try {
      setUpdatingStatus(orderId);
      const response = await fetch(`https://server.food.rw/deliveries/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${document.cookie.split('auth-token=')[1]?.split(';')[0]}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (response.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? { ...order, status: newStatus as DeliveryStatus }
              : order
          )
        );
        toast.success(data.message || `Order status updated to ${newStatus.toLowerCase().replace("_", " ")}!`);
      } else {
        toast.error(data.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Failed to update order:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleOtpVerification = async () => {
    if (!selectedOrder || !otp) {
      toast.error("Please enter the OTP");
      return;
    }

    try {
      const response = await orderService.verifyDeliveryOTP(
        selectedOrder.id,
        otp
      );
      if (response.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === selectedOrder.id
              ? { ...order, status: "DELIVERED" as DeliveryStatus }
              : order
          )
        );
        setShowOtpModal(false);
        setOtp("");
        setSelectedOrder(null);
        toast.success("Order delivered successfully!");
      } else {
        toast.error(response.error || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to verify OTP");
    }
  };

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [expandedOrderDetails, setExpandedOrderDetails] = useState<any>(null);
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [quickModalOrder, setQuickModalOrder] = useState<LogisticsOrder | null>(null);
  const [quickModalDetails, setQuickModalDetails] = useState<any>(null);

  const handleCardClick = async (order: LogisticsOrder) => {
    if (expandedOrderId === order.id) {
      setExpandedOrderId(null);
      setExpandedOrderDetails(null);
    } else {
      setExpandedOrderId(order.id);
      await fetchOrderDetailsForCard(order.id);
    }
  };

  const fetchOrderDetailsForCard = async (orderId: string) => {
    try {
      const response = await fetch(`https://server.food.rw/deliveries/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('auth-token=')[1]?.split(';')[0]}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        setExpandedOrderDetails(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
  };

  const handleQuickModalOpen = async (order: LogisticsOrder) => {
    setQuickModalOrder(order);
    setShowQuickModal(true);
    await fetchQuickModalDetails(order.id);
  };

  const fetchQuickModalDetails = async (orderId: string) => {
    try {
      const response = await fetch(`https://server.food.rw/deliveries/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${document.cookie.split('auth-token=')[1]?.split(';')[0]}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        setQuickModalDetails(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
  };

  const SimpleOrderCard = ({ order }: { order: LogisticsOrder }) => {
    return (
      <div className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-green-500 bg-white overflow-hidden rounded-lg" onClick={() => handleQuickModalOpen(order)}>
        <div className="p-4">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm truncate text-gray-900 group-hover:text-green-700 transition-colors">
                {order.restaurantName}
              </h3>
              <p className="text-xs text-gray-600 font-medium mt-1">
                {order.orderNumber}
              </p>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {order.customerPhone}
              </p>
            </div>
            <span className={`${getStatusColor(order.status)} text-xs px-2 py-1 border font-semibold whitespace-nowrap rounded`}>
              {order.status.replace("_", " ")}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm font-bold text-green-700">
              {order.totalAmount.toLocaleString()} Rwf
            </span>
            <Eye className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
          </div>
        </div>
      </div>
    );
  };

  const ExpandableOrderCard = ({ order }: { order: LogisticsOrder }) => {
    const isExpanded = expandedOrderId === order.id;
    const nextStatus = getNextStatus(order.status);
    
    return (
      <div className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-green-500 bg-white overflow-hidden rounded-lg">
        <div className="p-0">
          {/* Main Card Content */}
          <div className="p-4 sm:p-5" onClick={() => handleCardClick(order)}>
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm sm:text-base truncate text-gray-900 group-hover:text-green-700 transition-colors">
                  {order.restaurantName}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                  {order.orderNumber}
                </p>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {order.customerPhone}
                </p>
              </div>
              <span className={`${getStatusColor(order.status)} text-xs px-2 py-1 border font-semibold whitespace-nowrap rounded`}>
                {order.status.replace("_", " ")}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm font-bold text-green-700">
                {order.totalAmount.toLocaleString()} Rwf
              </span>
              <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
              </div>
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && expandedOrderDetails && (
            <div className="border-t bg-gray-50 p-4 sm:p-5 space-y-4 animate-in slide-in-from-top-2 duration-300">
              {/* Address */}
              <div className="bg-white p-3 rounded-lg border">
                <label className="text-xs font-medium text-gray-600">Delivery Address</label>
                <p className="text-sm text-gray-900 mt-1">{expandedOrderDetails.order?.billingAddress || expandedOrderDetails.billingAddress || 'N/A'}</p>
              </div>

              {/* Order Items */}
              <div className="bg-white p-3 rounded-lg border">
                <label className="text-xs font-medium text-gray-600 mb-2 block">Order Items</label>
                <div className="space-y-2">
                  {(expandedOrderDetails.order?.orderItems || expandedOrderDetails.orderItems)?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-900">{item.productName} x{item.quantity}</span>
                      <span className="font-medium text-green-700">{item.subtotal?.toLocaleString() || '0'} RWF</span>
                    </div>
                  )) || <p className="text-sm text-gray-500">No items available</p>}
                </div>
              </div>

              {/* Total Amount */}
              <div className="bg-white p-3 rounded-lg border">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-600">Total Amount</label>
                  <span className="text-lg font-bold text-green-700">
                    {(expandedOrderDetails.order?.totalAmount || expandedOrderDetails.totalAmount || 0).toLocaleString()} RWF
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                {nextStatus && order.status !== "DELIVERED" && order.status !== "CANCELLED" && order.status !== "IN_TRANSIT" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateOrderStatus(order.id, nextStatus as "PREPARING" | "READY" | "IN_TRANSIT" | "CANCELLED");
                    }}
                    disabled={updatingStatus === order.id}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-4 py-2 rounded disabled:opacity-50"
                  >
                    {updatingStatus === order.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto" />
                    ) : (
                      `Mark as ${nextStatus.replace("_", " ")}`
                    )}
                  </button>
                )}

                {order.status === "IN_TRANSIT" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                      setShowOtpModal(true);
                    }}
                    className="flex-1 bg-green-700 hover:bg-green-800 text-white text-xs sm:text-sm px-4 py-2 rounded"
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };



  const renderOrderGrid = (
    orderList: LogisticsOrder[],
    emptyMessage: string
  ) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {orderList.map((order) => (
        <div key={order.id}>
          <div className="sm:hidden">
            <ExpandableOrderCard order={order} />
          </div>
          <div className="hidden sm:block">
            <SimpleOrderCard order={order} />
          </div>
        </div>
      ))}
      {orderList.length === 0 && (
        <div className="col-span-full text-center py-12 sm:py-16">
          <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm sm:text-base font-medium">
            {emptyMessage}
          </p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-center h-64 sm:h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base font-medium">
              Loading orders...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-gray-900">
          Order Management
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="h-32 lg:h-36 text-white border-0 shadow-lg hover:shadow-xl transition-shadow rounded-lg bg-white">
          <div className="flex items-center justify-center gap-2 p-3 sm:p-5 text-center text-blue-600 h-full">
            <div className="w-20 h-15  flex items-center justify-center rounded-lg">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-90" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold mb-1">
                {unfollowedOrders.length}
              </div>
              <div className="text-[10px] sm:text-[12px] opacity-90 font-medium">
                Unfollowed
              </div>
            </div>
          </div>
        </div>
        <div className="h-32 lg:h-36 text-white border-0 shadow-lg hover:shadow-xl transition-shadow rounded-lg bg-white">
          <div className="flex items-center justify-center gap-2 p-3 sm:p-5 text-center text-orange-600 h-full">
            <div className="w-20 h-15 flex items-center justify-center rounded-lg">
              <Truck className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-90" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold mb-1">
                {followedOrders.length}
              </div>
              <div className="text-[10px] sm:text-[12px] opacity-90 font-medium">
                followed
              </div>
            </div>
          </div>
        </div>
        <div className="h-32 lg:h-36 text-white border-0 shadow-lg hover:shadow-xl transition-shadow rounded-lg bg-white">
          <div className="flex items-center justify-center gap-2 p-3 sm:p-5 text-center text-green-600 h-full">
            <div className="w-20 h-15  flex items-center justify-center rounded-lg">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-90" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold mb-1">
                {deliveredOrders.length}
              </div>
              <div className="text-[10px] sm:text-[12px] opacity-90 font-medium">
                Delivered
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="w-full">
        <div className="grid w-full grid-cols-3 mb-6 h-10 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("unfollowed")}
            className={`flex items-center justify-center gap-2 text-xs sm:text-sm h-8 rounded transition-all ${
              activeTab === "unfollowed" ? "bg-white text-green-600 shadow-md" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Unfollowed</span>
            <span className="sm:hidden">New</span>
            <span className="ml-1">[{unfollowedOrders.length}]</span>
          </button>
          <button
            onClick={() => setActiveTab("followed")}
            className={`flex items-center justify-center gap-2 text-xs sm:text-sm h-8 rounded transition-all ${
              activeTab === "followed" ? "bg-white text-green-600 shadow-md" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Truck className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Followed</span>
            <span className="sm:hidden">Active</span>
            <span className="ml-1">[{followedOrders.length}]</span>
          </button>
          <button
            onClick={() => setActiveTab("delivered")}
            className={`flex items-center justify-center gap-2 text-xs sm:text-sm h-8 rounded transition-all ${
              activeTab === "delivered" ? "bg-white text-green-600 shadow-md" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Delivered</span>
            <span className="sm:hidden">Done</span>
            <span className="ml-1">[{deliveredOrders.length}]</span>
          </button>
        </div>

        {activeTab === "unfollowed" && (
          <div className="mt-0">
            <div className="border-none shadow-none">
              <div className="pb-4">
                <h3 className="text-base sm:text-lg text-gray-500 font-semibold">
                  Unfollowed Orders
                </h3>
              </div>
              <div>
                {renderOrderGrid(unfollowedOrders, "No unfollowed orders")}
              </div>
            </div>
          </div>
        )}

        {activeTab === "followed" && (
          <div className="mt-0">
            <div className="border-none shadow-none">
              <div className="pb-4">
                <h3 className="text-base sm:text-lg text-gray-500 font-semibold">
                  Followed Orders 
                </h3>
              </div>
              <div>
                {renderOrderGrid(followedOrders, "No followed orders")}
              </div>
            </div>
          </div>
        )}

        {activeTab === "delivered" && (
          <div className="mt-0">
            <div className="border-none shadow-none">
              <div className="pb-4">
                <h3 className="text-base sm:text-lg text-gray-500 font-semibold">
                  Delivered Orders
                </h3>
              </div>
              <div>
                {renderOrderGrid(deliveredOrders, "No delivered orders")}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full">
            <div className="p-4 sm:p-6 pb-4 border-b sm:border-0">
              <div className="text-lg sm:text-xl flex items-center justify-between font-semibold">
                Order Details
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="sm:hidden h-8 w-8 p-0 hover:bg-gray-100 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          {selectedOrderDetails &&
            selectedOrderDetails.data &&
            (() => {
              const orderData = selectedOrderDetails.data;
              console.log("Rendering order details for:", orderData);
              const currentOrder = orderData ? orders.find((o) => o.id === orderData.id) : null;
              const nextStatus = currentOrder
                ? getNextStatus(currentOrder.status)
                : null;

              return (
                <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
                  {/* Order Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs sm:text-sm font-medium text-gray-600">
                        Order Number
                      </label>
                      <p className="text-sm sm:text-base text-gray-900 font-semibold mt-1">
                        {orderData.orderNumber}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs sm:text-sm font-medium text-gray-600">
                        Status
                      </label>
                      <div className="mt-1">
                        <span
                          className={`${getStatusColor(
                            orderData.status
                          )} border font-semibold px-2 py-1 rounded text-xs`}
                        >
                          {orderData.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs sm:text-sm font-medium text-gray-600">
                        Total Amount
                      </label>
                      <p className="text-sm sm:text-base text-green-700 font-bold mt-1">
                        {orderData.totalAmount ? orderData.totalAmount.toLocaleString() : '0'} RWF
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs sm:text-sm font-medium text-gray-600">
                        Payment Status
                      </label>
                      <div className="mt-1">
                        <span className="border border-gray-300 px-2 py-1 rounded text-xs font-semibold">
                          {orderData.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {currentOrder && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                      {nextStatus &&
                        currentOrder.status !== "DELIVERED" &&
                        currentOrder.status !== "CANCELLED" &&
                        currentOrder.status !== "IN_TRANSIT" && (
                          <button
                            onClick={() => {
                              updateOrderStatus(
                                currentOrder.id,
                                nextStatus as
                                  | "PREPARING"
                                  | "READY"
                                  | "IN_TRANSIT"
                                  | "CANCELLED"
                              );
                              setShowDetailsModal(false);
                            }}
                            disabled={updatingStatus === currentOrder.id}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md px-4 py-2 rounded disabled:opacity-50"
                          >
                            {updatingStatus === currentOrder.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto" />
                            ) : (
                              <div className="flex items-center justify-center">
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Mark as {nextStatus.replace("_", " ")}
                              </div>
                            )}
                          </button>
                        )}

                    

                      {currentOrder.status === "IN_TRANSIT" && (
                        <button
                          onClick={() => {
                            setSelectedOrder(currentOrder);
                            setShowDetailsModal(false);
                            setShowOtpModal(true);
                          }}
                          className="flex-1 bg-green-700 hover:bg-green-800 text-white font-semibold shadow-md px-4 py-2 rounded"
                        >
                          <div className="flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Delivered
                          </div>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Customer Info */}
                  <div className="border-t pt-4">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
                      <User className="h-5 w-5 text-green-700" />
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <label className="text-xs sm:text-sm font-medium text-gray-600">
                          Name
                        </label>
                        <p className="text-sm sm:text-base text-gray-900 mt-1">
                          {orderData.billingName}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <label className="text-xs sm:text-sm font-medium text-gray-600">
                          Phone
                        </label>
                        <p className="text-sm sm:text-base text-gray-900 mt-1">
                          {orderData.billingPhone}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <label className="text-xs sm:text-sm font-medium text-gray-600">
                          Email
                        </label>
                        <p className="text-sm sm:text-base text-gray-900 mt-1 break-all">
                          {orderData.billingEmail}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <label className="text-xs sm:text-sm font-medium text-gray-600">
                          Address
                        </label>
                        <p className="text-sm sm:text-base text-gray-900 mt-1">
                          {orderData.billingAddress}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Restaurant Info */}
                  <div className="border-t pt-4">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
                      <Package className="h-5 w-5 text-orange-600" />
                      Restaurant Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <label className="text-xs sm:text-sm font-medium text-gray-600">
                          Name
                        </label>
                        <p className="text-sm sm:text-base text-gray-900 mt-1">
                          {orderData.restaurant?.name || 'N/A'}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <label className="text-xs sm:text-sm font-medium text-gray-600">
                          Phone
                        </label>
                        <p className="text-sm sm:text-base text-gray-900 mt-1">
                          {orderData.restaurant?.phone || 'N/A'}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <label className="text-xs sm:text-sm font-medium text-gray-600">
                          Location
                        </label>
                        <p className="text-sm sm:text-base text-gray-900 mt-1">
                          {orderData.restaurant?.location || 'N/A'}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <label className="text-xs sm:text-sm font-medium text-gray-600">
                          Province
                        </label>
                        <p className="text-sm sm:text-base text-gray-900 mt-1">
                          {orderData.restaurant?.province || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t pt-4">
                    <h3 className="text-base sm:text-lg font-semibold mb-3">
                      Order Items
                    </h3>
                    <div className="space-y-3">
                      {orderData.orderItems?.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 sm:gap-4 p-3 border-2 rounded-lg bg-white hover:border-green-400 transition-colors"
                        >
                          {item.images && item.images[0] && (
                            <img
                              src={item.images[0]}
                              alt={item.productName}
                              className="w-14 h-14 sm:w-20 sm:h-20 object-cover rounded-lg border-2 border-gray-200"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm sm:text-base text-gray-900">
                              {item.productName}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">
                              Category: {item.category}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Quantity: {item.quantity} {item.unit}
                            </p>
                            <p className="text-xs sm:text-sm font-medium text-gray-700 mt-1">
                              Price: {item.unitPrice.toLocaleString()} RWF
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm sm:text-base text-green-700">
                              {item.subtotal.toLocaleString()} RWF
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="border-t pt-4">
                    <h3 className="text-base sm:text-lg font-semibold mb-3">
                      Payment Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <label className="text-xs sm:text-sm font-medium text-gray-600">
                          Payment Method
                        </label>
                        <p className="text-sm sm:text-base text-gray-900 mt-1">
                          {orderData.paymentMethod}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <label className="text-xs sm:text-sm font-medium text-gray-600">
                          Payment Provider
                        </label>
                        <p className="text-sm sm:text-base text-gray-900 mt-1">
                          {orderData.paymentProvider}
                        </p>
                      </div>
                      {orderData.voucherCode && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <label className="text-xs sm:text-sm font-medium text-gray-600">
                            Voucher Code
                          </label>
                          <p className="text-sm sm:text-base text-gray-900 mt-1">
                            {orderData.voucherCode}
                          </p>
                        </div>
                      )}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <label className="text-xs sm:text-sm font-medium text-gray-600">
                          Transaction ID
                        </label>
                        <p className="text-sm sm:text-base text-gray-900 mt-1 break-all">
                          {orderData.transactionId}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Logistics Info */}
                  {selectedOrderDetails.data.logistics && (
                    <div className="border-t pt-4">
                      <h3 className="text-base sm:text-lg font-semibold mb-3">
                        Logistics Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <label className="text-xs sm:text-sm font-medium text-gray-600">
                            Logistics Partner
                          </label>
                          <p className="text-sm sm:text-base text-gray-900 mt-1">
                            {selectedOrderDetails.data.logistics.username}
                          </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <label className="text-xs sm:text-sm font-medium text-gray-600">
                            Contact
                          </label>
                          <p className="text-sm sm:text-base text-gray-900 mt-1">
                            {selectedOrderDetails.data.logistics.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {orderData.notes && (
                    <div className="border-t pt-4">
                      <label className="text-sm font-medium text-gray-600">
                        Notes
                      </label>
                      <p className="text-sm text-gray-900 mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        {orderData.notes}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Quick Order Modal */}
      {showQuickModal && quickModalOrder && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Order Details</h3>
              <button onClick={() => setShowQuickModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {quickModalDetails && (
                <>
                  {/* Address */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="text-xs font-medium text-gray-600">Delivery Address</label>
                    <p className="text-sm text-gray-900 mt-1">{quickModalDetails.order?.billingAddress || quickModalDetails.billingAddress || 'N/A'}</p>
                  </div>

                  {/* Order Items */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <label className="text-xs font-medium text-gray-600 mb-2 block">Order Items</label>
                    <div className="space-y-2">
                      {(quickModalDetails.order?.orderItems || quickModalDetails.orderItems)?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-900">{item.productName} x{item.quantity}</span>
                          <span className="font-medium text-green-700">{item.subtotal?.toLocaleString() || '0'} RWF</span>
                        </div>
                      )) || <p className="text-sm text-gray-500">No items available</p>}
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-600">Total Amount</label>
                      <span className="text-lg font-bold text-green-700">
                        {(quickModalDetails.order?.totalAmount || quickModalDetails.totalAmount || 0).toLocaleString()} RWF
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    {(() => {
                      const nextStatus = getNextStatus(quickModalOrder.status);
                      return (
                        <>
                          {nextStatus && quickModalOrder.status !== "DELIVERED" && quickModalOrder.status !== "CANCELLED" && quickModalOrder.status !== "IN_TRANSIT" && (
                            <button
                              onClick={() => {
                                updateOrderStatus(quickModalOrder.id, nextStatus as "PREPARING" | "READY" | "IN_TRANSIT" | "CANCELLED");
                                setShowQuickModal(false);
                              }}
                              disabled={updatingStatus === quickModalOrder.id}
                              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded disabled:opacity-50"
                            >
                              {updatingStatus === quickModalOrder.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto" />
                              ) : (
                                `Mark as ${nextStatus.replace("_", " ")}`
                              )}
                            </button>
                          )}

                          {quickModalOrder.status === "IN_TRANSIT" && (
                            <button
                              onClick={() => {
                                setSelectedOrder(quickModalOrder);
                                setShowQuickModal(false);
                                setShowOtpModal(true);
                              }}
                              className="w-full bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-2 rounded"
                            >
                              Mark as Delivered
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 text-lg sm:text-xl font-semibold">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                Verify Delivery OTP
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Please enter the OTP provided by the customer to confirm delivery.
              </p>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  OTP Code
                </label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="mt-2 w-full text-center text-lg sm:text-xl font-bold tracking-widest h-12 border border-gray-300 rounded px-3"
                  autoFocus
                />
              </div>
              {selectedOrder && (
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                  <p className="text-sm text-gray-800">
                    <strong className="text-green-800">Order:</strong>{" "}
                    {selectedOrder.orderNumber}
                    <br />
                    <strong className="text-green-800">Customer:</strong>{" "}
                    {selectedOrder.customerName}
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-6">
              <button
                onClick={() => setShowOtpModal(false)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleOtpVerification}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
              >
                Verify & Deliver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
