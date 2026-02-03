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
import { ViewOrderModal, CancelOrderModal } from "./_components/order-modals";
import { useWebSocket } from "@/hooks/useOrderWebSocket";
import { useAuth } from "@/app/contexts/auth-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
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
      if (searchValue.trim()) params.search = searchValue.trim();
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
          originalAmount: order.originalAmount,
          status: order.status as Order['status'],
          paymentStatus: order.paymentStatus as Order['paymentStatus'],
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
    const timeoutId = setTimeout(() => {
      fetchOrders(1, pagination.limit);
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [
    searchValue,
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

  // Remove frontend filtering since we're using backend search
  const displayOrders = orders;

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
          <title>${order.billingName}-Order Invoice-${order.orderNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Arial', sans-serif; padding: 20px; font-size: 0.875rem; color: #1f2937; }
            .invoice { max-width: 700px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #22c55e; padding-bottom: 15px; }
            .header h1 { color: #22c55e; font-size: 1.25rem; margin-bottom: 5px; font-weight: 600; }
            .header p { font-size: 0.875rem; color: #64748b; }
            .info-section { margin: 20px 0; font-size: 0.875rem; }
            .info-flex-container { display: flex; flex-wrap: wrap; gap: 12px; }
            .info-item { background: #f8fafc; padding: 10px; border-left: 3px solid #22c55e; flex: 1 1 calc(33.33% - 8px); }
            .info-label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
            .info-value { color: #1f2937; }
            .items { margin: 20px 0; font-size: 0.875rem; }
            .items table { width: 100%; border-collapse: collapse; }
            .items th, .items td { padding: 6px; border: 1px solid #e5e7eb; text-align: left; font-weight: normal; font-size: 0.875rem; }
            .items th { background: #22c55e; color: white; font-weight: 600; font-size: 0.875rem; }
            .total { background: #f0fdf4; text-align: right; padding: 12px; margin-top: 10px; border-radius: 5px; font-size: 0.875rem; color: #22c55e; }
            .total strong { font-size: 1rem; }
            .footer { text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid #e5e7eb; color: #64748b; font-size: 0.75rem; }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="header">
              <img src="https://res.cloudinary.com/dzxyelclu/image/upload/v1760111270/Food_bundle_logo_cfsnsw.png" alt="Logo" style="width: 50px; height: 50px; margin: 0 auto 8px; border-radius: 50%;">
              <h1>Food Bundles Ltd</h1>
              <p>Order Invoice</p>
            </div>
            <div class="info-section">
              <div class="info-flex-container">
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
                <div class="info-item">
                  <div class="info-label">Customer</div>
                  <div class="info-value">${order.billingName} - ${order.billingPhone}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Delivery Address</div>
                  <div class="info-value">${order.billingAddress}</div>
                </div>
              </div>
            </div>
            <div class="items">
              <h3 style="font-size: 0.875rem; margin-bottom: 8px;">Order Items</h3>
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
              <div style="margin-bottom: 6px; font-size: 0.875rem; color: #374151;">
                Subtotal: ${order.orderItems.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString()} RWF
              </div>
              ${(order.deliveryFee ?? 0) > 0 ? `<div style="color: #374151; margin-bottom: 4px;">Delivery Fee: +${(order.deliveryFee ?? 0).toLocaleString()} RWF</div>` : ''}
              ${(order.packagingFee ?? 0) > 0 ? `<div style="color: #374151; margin-bottom: 4px;">Packaging Fee: +${(order.packagingFee ?? 0).toLocaleString()} RWF</div>` : ''}
              ${order.originalAmount && order.totalAmount < order.originalAmount ? `<div style="color: #22c55e; margin-bottom: 4px;">Discount Applied: -${(order.originalAmount - order.totalAmount).toLocaleString()} RWF</div>` : ''}
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

  const handleDeleteOrder = (order: Order) => {
    setSelectedOrder(order);
    setDeleteModalOpen(true);
  };

  const confirmDeleteOrder = async () => {
    if (!selectedOrder) return;
    
    const orderToDelete = selectedOrder;
    
    try {
      // Optimistically remove from UI immediately
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderToDelete.id));
      setDeleteModalOpen(false);
      setSelectedOrder(null);
      
      // Delete from backend
      await orderService.deleteOrder(orderToDelete.id);
      toast.success("Order deleted successfully");
      
      // Silent refresh without loading state
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      
      if (selectedStatus !== "all") params.status = selectedStatus;
      if (selectedPaymentStatus !== "all") params.paymentStatus = selectedPaymentStatus;
      if (selectedRestaurantId) params.restaurantId = selectedRestaurantId;
      if (dateFrom) params.dateFrom = dateFrom.toISOString().split("T")[0];
      if (dateTo) params.dateTo = dateTo.toISOString().split("T")[0];
      
      const response = await orderService.getAllOrdersByAdmin(params);
      
      if (response.success) {
        const mappedOrders = response.data.map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          restaurantId: order.restaurantId,
          totalAmount: order.totalAmount,
          status: order.status as Order['status'],
          paymentStatus: order.paymentStatus as Order['paymentStatus'],
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
    } catch (error: any) {
      // Revert optimistic update on error - add the order back
      setOrders(prevOrders => [...prevOrders, orderToDelete].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
      console.error("Failed to delete order:", error);
      toast.error("Cancel Order before deletion");
    }
  };

  const handleModalClose = () => {
    setSelectedOrder(null);
    setViewModalOpen(false);
    setCancelModalOpen(false);
    setDeleteModalOpen(false);
  };

  const handleOrderUpdate = async () => {
    // Silent refresh without loading state
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      
      if (selectedStatus !== "all") params.status = selectedStatus;
      if (selectedPaymentStatus !== "all") params.paymentStatus = selectedPaymentStatus;
      if (selectedRestaurantId) params.restaurantId = selectedRestaurantId;
      if (dateFrom) params.dateFrom = dateFrom.toISOString().split("T")[0];
      if (dateTo) params.dateTo = dateTo.toISOString().split("T")[0];
      
      const response = await orderService.getAllOrdersByAdmin(params);
      
      if (response.success) {
        const mappedOrders = response.data.map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          restaurantId: order.restaurantId,
          totalAmount: order.totalAmount,
          status: order.status as Order['status'],
          paymentStatus: order.paymentStatus as Order['paymentStatus'],
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
      console.error("Failed to refresh orders:", error);
    }
    
    handleModalClose();
  };

  // Status update handlers
  const handleStatusUpdate = async (orderId: string, status: string) => {
    const previousOrders = [...orders];
    
    try {
      // Optimistic update
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: status as Order['status'] } : order
        )
      );
      
      await orderService.updateOrder(orderId, { status });
      toast.success("Order status updated successfully");
    } catch (error: any) {
      // Revert on error
      setOrders(previousOrders);
      console.error("Failed to update order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const handlePaymentStatusUpdate = async (
    orderId: string,
    paymentStatus: string
  ) => {
    const previousOrders = [...orders];
    
    try {
      // Optimistic update
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, paymentStatus: paymentStatus as any } : order
        )
      );
      
      await orderService.updateOrder(orderId, { paymentStatus });
      toast.success("Payment status updated successfully");
    } catch (error: any) {
      // Revert on error
      setOrders(previousOrders);
      console.error("Failed to update payment status:", error);
      toast.error("Failed to update payment status");
    }
  };

  const ordersColumns = createOrdersColumns({
    onView: handleViewOrder,
    onDownloadPDF: handleDownloadPDF,
    onCancel: handleCancelOrder,
    onDelete: handleDeleteOrder,
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
          <h1 className="text-[16px] font-medium">Restaurant Orders</h1>
        </div>
      </div>

      <TableFilters filters={filters} />

    
        <DataTable
          columns={ordersColumns}
          data={displayOrders}
          description={`Total: ${pagination.total} orders`}
          showColumnVisibility={false}
          showPagination={true}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          isLoading={loading}
        />
      

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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-red-100 flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-red-600" />
              </div>
              Delete Order
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-4 text-sm text-gray-800">
              Are you sure you want to delete order{" "}
              <strong className="text-green-600">{selectedOrder?.restaurant.name}</strong>:{" "}
              <strong>{selectedOrder?.orderNumber}</strong> ? 
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteOrder}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
