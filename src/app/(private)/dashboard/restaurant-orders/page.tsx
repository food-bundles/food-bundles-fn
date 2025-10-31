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
  const [totalOrders, setTotalOrders] = useState(0);

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
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const params: any = {};

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
        setTotalOrders(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [
    selectedStatus,
    selectedPaymentStatus,
    selectedRestaurantId,
    dateFrom,
    dateTo,
  ]);

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
      // Create HTML content for PDF
      const htmlContent = `
            <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Order ${order.orderNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              max-width: 900px; 
              margin: 0 auto; 
              padding: 30px;
              font-size: 12px;
              line-height: 1.5;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              padding-bottom: 20px;
              border-bottom: 3px solid #15803D;
            }
            .header img {
              width: 80px;
              height: 80px;
              margin-bottom: 10px;
            }
            .header h1 { 
              font-size: 24px; 
              color: #22c55e; 
              margin-bottom: 5px;
            }
            .header h2 { 
              font-size: 16px; 
              color: #64748b; 
              font-weight: normal;
            }
            .info-container {
              display: flex;
              gap: 20px;
              margin-bottom: 25px;
            }
            .info-section {
              flex: 1;
              background: #f8fafc;
              padding: 5px 10px;
              border-radius: 6px;
              border-left: 3px solid #22c55e;
            }
            .info-section h3 { 
              font-size: 13px; 
              color: #22c55e; 
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-row {
              margin-bottom: 6px;
              font-size: 11px;
            }
            .label { 
              font-weight: 600; 
              color: #475569;
              display: inline-block;
              min-width: 100px;
            }
            .value {
              color: #1e293b;
            }
            .items-section {
              margin-top: 25px;
            }
            .items-section h3 {
              font-size: 14px;
              color: #22c55e;
              margin-bottom: 12px;
              text-align: center;
            }
            .items { 
              border-collapse: collapse; 
              width: 100%; 
              font-size: 11px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .items th { 
              background: linear-gradient(to bottom, #15803D, #22c55e);
              color: white;
              padding: 10px;
              text-align: left;
              font-weight: 600;
              text-transform: uppercase;
              font-size: 10px;
              letter-spacing: 0.5px;
            }
            .items td { 
              border: 1px solid #e2e8f0; 
              padding: 10px;
              background: white;
            }
            .items tbody tr:hover {
              background: #f8fafc;
            }
            .items .product-cell {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .items .product-img {
              width: 30px;
              height: 30px;
              border-radius: 4px;
              object-fit: cover;
            }
            .total-section { 
              display: flex;
              justify-content: end;
              align-items: center;
              gap:10px;
              margin-top: 20px;
              padding: 15px;
              background: #f8fafc;
              border-radius: 8px;
            }
            .total-section .total-label {
              font-size: 14px;
              color: #64748b;
              margin-bottom: 5px;
            }
            .total-section .total-amount {
              font-size: 20px;
              font-weight: bold;
              color: #22c55e;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #64748b;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="logo">FB</div>
              <img src="https://res.cloudinary.com/dzxyelclu/image/upload/v1760111270/Food_bundle_logo_cfsnsw.png" alt="Logo">
              <h1>Food Bundle</h1>
              <p>Order Receipt</p>
            </div>
            
            <div class="order-info">
              <h2>Order Information</h2>
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
                  <div class="info-label">Customer Name</div>
                  <div class="info-value">${order.billingName}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Phone Number</div>
                  <div class="info-value">${order.billingPhone}</div>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">Delivery Address</div>
                <div class="info-value">${order.billingAddress}</div>
              </div>
            </div>
            
            <div class="items-section">
              <h3>Order Items</h3>
              <div class="items-container">
                ${order.orderItems.map(item => `
                  <div class="item">
                    <span class="item-name">${item.quantity}x ${item.productName}</span>
                    <span class="item-price">$${item.subtotal.toFixed(2)}</span>
                  </div>
                `).join('')}
                <div class="item" style="background: #f0fdf4; font-weight: bold;">
                  <span class="item-name">Total</span>
                  <span class="item-price" style="color: #22c55e; font-size: 16px;">$${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div class="delivery-payment">
              <div class="delivery-info">
                <div class="section-title">Delivery Information</div>
                <div class="section-content">
                  <strong>Status:</strong> ${order.status}<br>
                  <strong>Estimated Delivery:</strong> ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleString() : 'TBD'}
                </div>
              </div>
              <div class="payment-info">
                <div class="section-title">Payment Information</div>
                <div class="section-content">
                  <strong>Method:</strong> ${order.paymentMethod}<br>
                  <strong>Status:</strong> ${order.paymentStatus}
                </div>
              </div>
            </div>
            
            <div class="footer">
              <p>Thank you for choosing Food Bundle!</p>
              <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `order-${order.orderNumber}-receipt.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Receipt downloaded successfully!');
    } catch (error) {
      console.error('Failed to download receipt:', error);
      toast.error('Failed to download receipt');
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
          description={`Total: ${totalOrders} orders`}
          showColumnVisibility={false}
          showPagination={true}
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
