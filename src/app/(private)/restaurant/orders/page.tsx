/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useOrders } from "@/app/contexts/orderContext";
import { useAuth } from "@/app/contexts/auth-context"; // Import your auth context
import { DataTable } from "@/components/data-table";
import { ordersColumns } from "./_components/orders-columns";
import {
  createCommonFilters,
  TableFilters,
} from "../../../../components/filters";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { useWebSocket } from "@/hooks/useOrderWebSocket";

export default function RestaurantOrdersPage() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const { user } = useAuth(); // Get current user
  const {
    orders: backendOrders,
    loading,
    error,
    refreshOrders,
    reorderOrder,
  } = useOrders();

  const [formattedOrders, setFormattedOrders] = useState<any[]>([]);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  // WebSocket integration
  const { isConnected, orderUpdates, reconnect } = useWebSocket(
    user?.id || "", // User ID from auth
    user?.restaurantId || "" // Restaurant ID from auth
  );


  // Format backend orders to frontend format
  useEffect(() => {
    if (backendOrders && backendOrders.length > 0) {
      const formatted = backendOrders.map((order: any) => ({
        id: order.id,
        orderId: order.orderNumber,
        customerName: order.restaurant?.name || "Unknown Restaurant",
        orderedDate: new Date(order.createdAt).toLocaleDateString(),
        items:
          order.orderItems
            ?.map(
              (item: any) => `${item.product?.productName} (${item.quantity})`
            )
            .join(", ") || "No items",
        totalAmount: order.totalAmount || 0,
        deliveryAddress: order.billingAddress || "No address provided",
        status: mapBackendStatus(order.status),
        originalData: order,
      }));

      setFormattedOrders(formatted);
    } else {
      setFormattedOrders([]);
    }
  }, [backendOrders]);

  // Handle real-time order updates from WebSocket
  useEffect(() => {
    if (orderUpdates.length > 0) {
      const latestUpdate = orderUpdates[orderUpdates.length - 1];
      toast.success(
        `Order ${latestUpdate.orderId} status: ${latestUpdate.status}`,
        {
          duration: 5000,
        }
      );

      // Refresh orders to get updated data
      refreshOrders();
    }
  }, [orderUpdates, refreshOrders]);

  const mapBackendStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: "pending",
      CONFIRMED: "confirmed",
      PROCESSING: "processing",
      READY: "ready",
      SHIPPED: "ready",
      DELIVERED: "delivered",
      CANCELLED: "cancelled",
      REFUNDED: "refunded",
    };
    return statusMap[status] || "pending";
  };

  const filteredData = formattedOrders.filter((order) => {
    if (
      searchValue &&
      !order.orderId.toLowerCase().includes(searchValue.toLowerCase()) &&
      !order.customerName.toLowerCase().includes(searchValue.toLowerCase()) &&
      !order.items.toLowerCase().includes(searchValue.toLowerCase())
    ) {
      return false;
    }

    if (selectedStatus !== "all" && order.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  const statusOptions = [
    { label: "All Status", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Processing", value: "processing" },
    { label: "Ready", value: "ready" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Refunded", value: "refunded" },
  ];

  const filters = [
    createCommonFilters.search(
      searchValue,
      setSearchValue,
      "Search orders, items"
    ),
    createCommonFilters.status(
      selectedStatus,
      setSelectedStatus,
      statusOptions
    ),
    createCommonFilters.date(selectedDate, setSelectedDate, "Order Date"),
  ];

  const handleExport = () => {
    toast("Export functionality will be handled by backend");
  };


  const handleViewOrder = (order: any) => {
    toast.info(`Viewing order: ${order.orderId}`);
  };

  const handleReorder = async (orderId: string) => {
    try {
      setReorderingId(orderId);
      const response = await reorderOrder(orderId);

      if (response.success) {
        toast.success("Order reordered successfully!");
      } else {
        toast.error(response.message || "Failed to reorder");
      }
    } catch (err: any) {
      console.error("Reorder error:", err);
      toast.error(err.response?.data?.message || "Failed to reorder order");
    } finally {
      setReorderingId(null);
    }
  };

  const handleReconnectWebSocket = () => {
    reconnect();
    toast.info("Attempting to reconnect WebSocket...");
  };

  if (loading && formattedOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Failed to load orders
              </h3>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-2 py-2">
        <div className="bg-white rounded shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-[16px] font-medium text-gray-900">
                Orders Management
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {/* <div
                  className={`flex items-center gap-1 text-sm ${
                    isConnected ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isConnected ? (
                    <Wifi className="h-4 w-4" />
                  ) : (
                    <WifiOff className="h-4 w-4" />
                  )}
                  <span>
                    WebSocket: {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div> */}
                {!isConnected && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReconnectWebSocket}
                    className="h-6 text-xs"
                  >
                    Reconnect
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="border-2 px-4 text-[13px] bg-green-700 border-green-500 text-white hover:bg-green-800 cursor-pointer rounded"
              >
                Export
              </button>
            </div>
          </div>

          <DataTable
            columns={ordersColumns(handleViewOrder, handleReorder)}
            data={filteredData}
            title=""
            showExport={false}
            onExport={handleExport}
            customFilters={<TableFilters filters={filters} />}
            showSearch={false}
            showColumnVisibility={true}
            showPagination={true}
            showRowSelection={true}
          />

          {/* Debug: Check if columns are loaded */}
          {/* {process.env.NODE_ENV === "development" && (
            <div className="text-xs text-gray-400 mt-2">
              Columns count:{" "}
              {ordersColumns(handleViewOrder, handleReorder).length} |
              WebSocket: {isConnected ? "Connected" : "Disconnected"} | Updates
              received: {orderUpdates.length}
            </div>
          )} */}

          {filteredData.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders found</p>
              <Button
                onClick={() => {
                  setSearchValue("");
                  setSelectedStatus("all");
                  setSelectedDate(undefined);
                }}
                variant="outline"
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
