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
import { useRouter } from "next/navigation";

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
  const router = useRouter();

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
    router.push(`/restaurant/orders/view/${order.orderId}`);
  };

  const handleDownload = (order: any) => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to download PDF');
        return;
      }
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Order Receipt - ${order.orderId}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; }
            .receipt { max-width: 600px; margin: 0 auto; border: 2px solid #22c55e; border-radius: 8px; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #22c55e; padding-bottom: 15px; }
            .logo { width: 50px; height: 50px; margin: 0 auto 10px; background: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; }
            .header h1 { color: #22c55e; margin-bottom: 5px; }
            .info-section { margin: 20px 0; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
            .info-item { background: #f8fafc; padding: 10px; border-radius: 5px; border-left: 3px solid #22c55e; }
            .info-label { font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 3px; }
            .info-value { font-weight: 600; color: #1f2937; }
            .items { margin: 20px 0; }
            .item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #e5e7eb; }
            .total { background: #f0fdf4; font-weight: bold; color: #22c55e; }
            .footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="logo">FB</div>
              <h1>Food Bundle</h1>
              <p>Order Receipt</p>
            </div>
            <div class="info-section">
              <h3>Order Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Order Number</div>
                  <div class="info-value">#${order.orderId}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Order Date</div>
                  <div class="info-value">${order.orderedDate}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Customer</div>
                  <div class="info-value">${order.customerName}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Status</div>
                  <div class="info-value">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</div>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">Delivery Address</div>
                <div class="info-value">${order.deliveryAddress}</div>
              </div>
            </div>
            <div class="items">
              <h3>Order Items</h3>
              <div class="item">
                <span>${order.items}</span>
                <span>${order.totalAmount} Rwf</span>
              </div>
              <div class="item total">
                <span>Total</span>
                <span>${order.totalAmount} Rwf</span>
              </div>
            </div>
            <div class="footer">
              <p>Thank you for choosing Food Bundle!</p>
              <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
      
      toast.success('PDF print dialog opened');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Failed to generate PDF');
    }
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
            columns={ordersColumns(handleViewOrder, handleDownload, handleReorder)}
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
