/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { Order, createOrdersColumns } from "./_components/order-colmuns";
import {
  createCommonFilters,
  TableFilters,
} from "../../../../components/filters";
import { DataTable } from "@/components/data-table";
import { toast } from "sonner";
import { orderService } from "@/app/services/orderService";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { ViewOrderModal, CancelOrderModal } from "./_components/order-modals";
import { useWebSocket } from "@/hooks/useOrderWebSocket";
import { useAuth } from "@/app/contexts/auth-context";

const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Ready", value: "READY" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Refunded", value: "REFUNDED" },
];

const paymentStatusOptions = [
  { label: "All Payment Status", value: "all" },
  { label: "Pending", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Failed", value: "FAILED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Refunded", value: "REFUNDED" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const { user } = useAuth();

  // WebSocket integration for real-time updates
  const { isConnected, orderUpdates } = useWebSocket(
    user?.id || "",
    "" // Admin sees all orders, no specific restaurant filter
  );

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter states
  const [searchValue, setSearchValue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  // Fetch orders with filters
  const fetchOrders = async (page = pagination.page, limit = pagination.limit) => {
    try {
      setLoading(true);

      const params: any = {
        page,
        limit,
      };

      // Add filters only if they have values
      if (selectedStatus !== "all") params.status = selectedStatus;
      if (selectedPaymentStatus !== "all")
        params.paymentStatus = selectedPaymentStatus;
      if (selectedRestaurantId) params.restaurantId = selectedRestaurantId;
      if (dateFrom) params.dateFrom = dateFrom.toISOString().split("T")[0];
      if (dateTo) params.dateTo = dateTo.toISOString().split("T")[0];

      const response = await orderService.getAllOrdersByAdmin(params);

      if (response.success) {
        // Map API response to match Order interface
        const mappedOrders = response.data.map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          restaurantId: order.restaurantId,
          totalAmount: order.totalAmount,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          billingName: order.billingName,
          billingPhone: order.billingPhone,
          billingEmail: order.billingEmail,
          billingAddress: order.billingAddress,
          notes: order.notes,
          requestedDelivery: order.requestedDelivery,
          estimatedDelivery: order.estimatedDelivery,
          actualDelivery: order.actualDelivery,
          paymentReference: order.paymentReference,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          restaurant: order.restaurant,
          orderItems: order.orderItems || [],
          _count: order._count || { orderItems: 0 },
        }));

        setOrders(mappedOrders);
        setPagination({
          page: response.pagination?.page || 1,
          limit: response.pagination?.limit || 10,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1, pagination.limit);
  }, [
    selectedStatus,
    selectedPaymentStatus,
    selectedRestaurantId,
    dateFrom,
    dateTo,
  ]);

  const handlePaginationChange = (page: number, limit: number) => {
    fetchOrders(page, limit);
  };

  // Handle real-time order updates from WebSocket
  useEffect(() => {
    if (orderUpdates.length > 0) {
      const latestUpdate = orderUpdates[orderUpdates.length - 1];
      toast.success(
        `Order ${latestUpdate.orderId} status updated: ${latestUpdate.status}`,
        {
          duration: 5000,
        }
      );

      // Refresh orders to get updated data
      fetchOrders();
    }
  }, [orderUpdates]);

  const filteredOrders = useMemo(() => {
    if (!searchValue) return orders;

    return orders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
        order.billingName.toLowerCase().includes(searchValue.toLowerCase()) ||
        order.billingEmail.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [orders, searchValue]);

  // Modal handlers
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setViewModalOpen(true);
  };

  const handleDownloadPDF = (order: Order) => {
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
          <title>Order Invoice - ${order.orderNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; }
            .invoice { max-width: 700px; margin: 0 auto; border: 2px solid #22c55e; border-radius: 8px; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #22c55e; padding-bottom: 15px; }
            .logo { width: 50px; height: 50px; margin: 0 auto 10px; background: #22c55e; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; }
            .header h1 { color: #22c55e; margin-bottom: 5px; }
            .info-section { margin: 20px 0; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
            .info-item { background: #f8fafc; padding: 10px; border-radius: 5px; border-left: 3px solid #22c55e; }
            .info-label { font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 3px; }
            .info-value { font-weight: 600; color: #1f2937; }
            .items { margin: 20px 0; }
            .items table { width: 100%; border-collapse: collapse; }
            .items th, .items td { padding: 8px; border: 1px solid #e5e7eb; text-align: left; }
            .items th { background: #22c55e; color: white; }
            .total { background: #f0fdf4; font-weight: bold; color: #22c55e; text-align: right; padding: 15px; margin-top: 10px; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; color: #64748b; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="header">
              <img src="https://res.cloudinary.com/dzxyelclu/image/upload/v1760111270/Food_bundle_logo_cfsnsw.png" alt="Logo" style="width: 50px; height: 50px; margin: 0 auto 10px; border-radius: 50%;">
              <h1>FoodBundles</h1>
              <p>Order Invoice</p>
            </div>
            <div class="info-section">
              <h3>Order Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Order Number</div>
                  <div class="info-value">${order.orderNumber}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Order Date</div>
                  <div class="info-value">${new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Restaurant</div>
                  <div class="info-value">${order.restaurant.name}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Status</div>
                  <div class="info-value">${order.status}</div>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">Customer</div>
                <div class="info-value">${order.billingName} - ${order.billingPhone}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Delivery Address</div>
                <div class="info-value">${order.billingAddress}</div>
              </div>
            </div>
            <div class="items">
              <h3>Order Items</h3>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.orderItems.map(item => `
                    <tr>
                      <td>${item.productName}</td>
                      <td>${item.quantity} ${item.unit}</td>
                      <td>${item.unitPrice.toLocaleString()} RWF</td>
                      <td>${item.subtotal.toLocaleString()} RWF</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <div class="total">
              <strong>Total Amount: ${order.totalAmount.toLocaleString()} RWF</strong>
            </div>
            <div class="footer">
              <p>Thank you for your order!</p>
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
      
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handleCancelOrder = (order: Order) => {
    setSelectedOrder(order);
    setCancelModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedOrder(null);
    setViewModalOpen(false);
    setCancelModalOpen(false);
  };

  const handleOrderUpdate = () => {
    fetchOrders();
    handleModalClose();
  };

  // Status update handlers
  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await orderService.updateOrder(orderId, { status });
      toast.success("Order status updated successfully");
      fetchOrders();
    } catch (error: any) {
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const handlePaymentStatusUpdate = async (
    orderId: string,
    paymentStatus: string
  ) => {
    try {
      await orderService.updateOrder(orderId, { paymentStatus });
      toast.success("Payment status updated successfully");
      fetchOrders();
    } catch (error: any) {
      console.error("Failed to update payment status:", error);
      toast.error("Failed to update payment status");
    }
  };

  const ordersColumns = createOrdersColumns({
    onView: handleViewOrder,
    onDownloadPDF: handleDownloadPDF,
    onCancel: handleCancelOrder,
    onStatusUpdate: handleStatusUpdate,
    onPaymentStatusUpdate: handlePaymentStatusUpdate,
  });

  const filters = [
    createCommonFilters.search(
      searchValue,
      setSearchValue,
      "Search by order no, restaurant"
    ),
    createCommonFilters.status(
      selectedStatus,
      setSelectedStatus,
      statusOptions
    ),
    {
      type: "select" as const,
      key: "paymentStatus",
      label: "Payment Status",
      options: paymentStatusOptions,
      value: selectedPaymentStatus,
      onChange: setSelectedPaymentStatus,
      width: "min-w-[160px]",
    },

    createCommonFilters.dateRange(
      { from: dateFrom, to: dateTo },
      ({ from, to }) => {
        setDateFrom(from);
        setDateTo(to);
      },
      "Date Range"
    ),
  ];

  return (
    <div className="p-4 space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[18px] font-medium">Restaurant Orders</h1>
        </div>
      </div>

      <TableFilters filters={filters} />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner variant="ring" />
        </div>
      ) : (
        <DataTable
          columns={ordersColumns}
          data={filteredOrders}
          description={`Total: ${pagination.total} orders`}
          showColumnVisibility={false}
          showPagination={true}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          isLoading={loading}
        />
      )}

      {/* Modals */}
      <ViewOrderModal
        open={viewModalOpen}
        onClose={handleModalClose}
        order={selectedOrder}
      />

      <CancelOrderModal
        open={cancelModalOpen}
        onClose={handleModalClose}
        order={selectedOrder}
        onCancel={handleOrderUpdate}
      />
    </div>
  );
}
