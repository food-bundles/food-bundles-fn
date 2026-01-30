/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { orderService } from "@/app/services/orderService";
import { toast } from "sonner";
import { Order } from "./order-colmuns";

// View Order Modal
interface ViewOrderModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
}

export function ViewOrderModal({ open, onClose, order }: ViewOrderModalProps) {
  if (!order) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-RW", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED": return "bg-blue-100 text-blue-800";
      case "PROCESSING": return "bg-purple-100 text-purple-800";
      case "READY": return "bg-cyan-100 text-cyan-800";
      case "DELIVERED": return "bg-green-100 text-green-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      case "REFUNDED": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>Order Details - {order.orderNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Order Information */}
          <div className=" grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Information</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium">Order #:</span>
                  <span className="col-span-2 text-sm">
                    {order.orderNumber}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <div className="col-span-2">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium">Payment:</span>
                  <div className="col-span-2">
                    <Badge className={getStatusColor(order.paymentStatus)}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium">Total:</span>
                  <div className="col-span-2">
                    {order.originalAmount && order.originalAmount !== order.totalAmount ? (
                      <div>
                        <div className="text-gray-500 line-through text-xs">
                          {order.originalAmount.toLocaleString()} RWF
                        </div>
                        <div className="text-green-600 font-medium">
                          {order.totalAmount.toLocaleString()} RWF
                        </div>
                        <div className="text-xs text-green-500">
                          Saved: {(order.originalAmount - order.totalAmount).toLocaleString()} RWF
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm font-medium">
                        {order.totalAmount.toLocaleString()} RWF
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium">Payment Method:</span>
                  <span className="col-span-2 text-sm">
                    {order.paymentMethod}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">
                Customer Information
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium">Name:</span>
                  <span className="col-span-2 text-sm">
                    {order.billingName}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium">Email:</span>
                  <span className="col-span-2 text-sm">
                    {order.billingEmail}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium">Phone:</span>
                  <span className="col-span-2 text-sm">
                    {order.billingPhone}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium">Address:</span>
                  <span className="col-span-2 text-sm">
                    {order.billingAddress}
                  </span>
                </div>
                {order.notes && (
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-medium">Notes:</span>
                    <span className="col-span-2 text-sm">{order.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Restaurant Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Restaurant Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-sm font-medium">Name:</span>
                <span className="col-span-2 text-sm">
                  {order.restaurant.name}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-sm font-medium">Email:</span>
                <span className="col-span-2 text-sm">
                  {order.restaurant.email}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Order Items ({order._count.orderItems})
            </h3>
            <div className="space-y-3">
              {order.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 border rounded-lg"
                >
                  {item.images[0] && (
                    <img
                      src={item.images[0]}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{item.productName}</div>
                    <div className="text-sm text-gray-600">{item.category}</div>
                    <div className="text-sm">
                      {item.quantity} {item.unit} ×{" "}
                      {item.unitPrice.toLocaleString()} RWF ={" "}
                      {item.subtotal.toLocaleString()} RWF
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Timeline</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-sm font-medium">Created:</span>
                <span className="col-span-2 text-sm">
                  {formatDate(order.createdAt)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-sm font-medium">Updated:</span>
                <span className="col-span-2 text-sm">
                  {formatDate(order.updatedAt)}
                </span>
              </div>
              {order.requestedDelivery && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium">Requested:</span>
                  <span className="col-span-2 text-sm">
                    {formatDate(order.requestedDelivery)}
                  </span>
                </div>
              )}
              {order.estimatedDelivery && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium">Estimated:</span>
                  <span className="col-span-2 text-sm">
                    {formatDate(order.estimatedDelivery)}
                  </span>
                </div>
              )}
              {order.actualDelivery && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-sm font-medium">Delivered:</span>
                  <span className="col-span-2 text-sm">
                    {formatDate(order.actualDelivery)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}



// Cancel Order Modal
interface CancelOrderModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
  onCancel: () => void;
}

export function CancelOrderModal({ open, onClose, order, onCancel }: CancelOrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");

  const handleCancel = async () => {
    if (!order) return;

    try {
      setLoading(true);
      
      // Close modal immediately for better UX
      onClose();
      setReason("");
      
      // Cancel order in backend
      await orderService.cancelOrder(order.id, { reason });
      toast.success("Order cancelled successfully");
      
      // Trigger silent refresh in parent
      onCancel();
    } catch (error: any) {
      console.error("Failed to cancel order:", error);
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Order</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-gray-900">
            Are you sure you want to cancel order <strong>{order?.orderNumber}</strong>? This action cannot be undone.
          </p>

          <div>
            <Label className="mb-2">Reason for cancellation</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? "Cancelling..." : "Cancel Order"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}