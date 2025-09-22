/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useOrders } from "@/app/contexts/orderContext";
import { DataTable } from "@/components/data-table";
import { ordersColumns } from "./_components/orders-columns";
import {
  createCommonFilters,
  TableFilters,
} from "../../../../components/filters";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";

export default function RestaurantOrdersPage() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const { orders: backendOrders, loading, error, refreshOrders } = useOrders();
  const [formattedOrders, setFormattedOrders] = useState<any[]>([]);

  console.log("Backend orders:", backendOrders); // Debug log
  console.log("Loading:", loading); // Debug log
  console.log("Error:", error); // Debug log

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
              (item: any) => `${item.quantity}x ${item.product?.productName}`
            )
            .join(", ") || "No items",
        totalAmount: order.totalAmount || 0,
        deliveryAddress: order.deliveryLocation || "No address provided",
        status: mapBackendStatus(order.status),
        originalData: order,
      }));


      setFormattedOrders(formatted);
      console.log("Formatted orders:", formatted); // Debug log
    } else {
      setFormattedOrders([]);
    }
  }, [backendOrders]);

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
      "Search orders, customers, or items..."
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

  const handleRefresh = async () => {
    try {
      await refreshOrders();
      // toast.success("Orders refreshed successfully");
    } catch (err) {
      toast.error("Failed to refresh orders");
    }
  };

  const handleViewOrder = (order: any) => {
    console.log("View order:", order);
    toast.info(`Viewing order: ${order.orderId}`);
    // You can implement navigation to order details page here
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
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Orders Management
              </h1>
   
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleExport} variant="outline" size="sm">
                Export
              </Button>
            </div>
          </div>

          <DataTable
            columns={ordersColumns(handleViewOrder)}
            data={filteredData}
            title=""
            descrption=""
            showExport={false}
            onExport={handleExport}
            customFilters={<TableFilters filters={filters} />}
            showSearch={false}
            showColumnVisibility={true}
            showPagination={true}
            showRowSelection={true}
            // isLoading={loading}
          />

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
