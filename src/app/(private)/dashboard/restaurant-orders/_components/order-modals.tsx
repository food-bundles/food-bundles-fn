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

/* =========================
   View Order Modal
========================= */
interface ViewOrderModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
}

export function ViewOrderModal({ open, onClose, order }: ViewOrderModalProps) {
  if (!order) return null;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-RW", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "PROCESSING":
        return "bg-purple-100 text-purple-800";
      case "READY":
        return "bg-cyan-100 text-cyan-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            Order Details – {order.orderNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order + Customer */}
          <div className="grid grid-cols-2 gap-6">
            {/* Order Info */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Order Information</h3>

              <div className="space-y-2">
                <div className="grid grid-cols-3">
                  <span className="text-xs text-gray-500">Order #</span>
                  <span className="col-span-2 text-sm">
                    {order.orderNumber}
                  </span>
                </div>

                <div className="grid grid-cols-3">
                  <span className="text-xs text-gray-500">Status</span>
                  <span className="col-span-2">
                    <Badge
                      className={`text-xs ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </Badge>
                  </span>
                </div>

                <div className="grid grid-cols-3">
                  <span className="text-xs text-gray-500">Payment</span>
                  <span className="col-span-2">
                    <Badge
                      className={`text-xs ${getStatusColor(
                        order.paymentStatus,
                      )}`}
                    >
                      {order.paymentStatus}
                    </Badge>
                  </span>
                </div>

                <div className="grid grid-cols-3">
                  <span className="text-xs text-gray-500">Method</span>
                  <span className="col-span-2 text-sm">
                    {order.paymentMethod}
                  </span>
                </div>

                <div className="grid grid-cols-3">
                  <span className="text-xs text-gray-500">Total</span>
                  <span className="col-span-2 text-sm font-medium text-green-600">
                    {order.totalAmount.toLocaleString()} RWF
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="text-sm font-semibold mb-3">
                Customer Information
              </h3>

              <div className="space-y-2">
                <div className="grid grid-cols-3">
                  <span className="text-xs text-gray-500">Name</span>
                  <span className="col-span-2 text-sm">
                    {order.billingName}
                  </span>
                </div>

                <div className="grid grid-cols-3">
                  <span className="text-xs text-gray-500">Email</span>
                  <span className="col-span-2 text-sm">
                    {order.billingEmail}
                  </span>
                </div>

                <div className="grid grid-cols-3">
                  <span className="text-xs text-gray-500">Phone</span>
                  <span className="col-span-2 text-sm">
                    {order.billingPhone}
                  </span>
                </div>

                <div className="grid grid-cols-3">
                  <span className="text-xs text-gray-500">Address</span>
                  <span className="col-span-2 text-sm">
                    {order.billingAddress}
                  </span>
                </div>

                {order.notes && (
                  <div className="grid grid-cols-3">
                    <span className="text-xs text-gray-500">Notes</span>
                    <span className="col-span-2 text-sm">{order.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-semibold mb-3">
              Order Items ({order.orderItems.length})
            </h3>

            <div className="flex flex-wrap gap-3">
              {order.orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 border rounded-md w-[calc(50%-6px)]"
                >
                  {item.images?.[0] && (
                    <img
                      src={item.images[0]}
                      alt={item.productName}
                      className="w-14 h-14 object-cover rounded"
                    />
                  )}

                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">
                      {item.productName}
                    </p>
                    <p className="text-xs text-gray-500">{item.category}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {item.quantity} {item.unit} ×{" "}
                      {item.unitPrice.toLocaleString()} RWF
                    </p>
                    <p className="text-xs font-medium mt-1">
                      {item.subtotal.toLocaleString()} RWF
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Timeline</h3>

            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm">{formatDate(order.createdAt)}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Updated</p>
                <p className="text-sm">{formatDate(order.updatedAt)}</p>
              </div>

              {order.requestedDelivery && (
                <div>
                  <p className="text-xs text-gray-500">Requested</p>
                  <p className="text-sm">
                    {formatDate(order.requestedDelivery)}
                  </p>
                </div>
              )}

              {order.estimatedDelivery && (
                <div>
                  <p className="text-xs text-gray-500">Estimated</p>
                  <p className="text-sm">
                    {formatDate(order.estimatedDelivery)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* =========================
   Cancel Order Modal
========================= */
interface CancelOrderModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
  onCancel: () => void;
}

export function CancelOrderModal({
  open,
  onClose,
  order,
  onCancel,
}: CancelOrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");

  const handleCancel = async () => {
    if (!order) return;

    try {
      setLoading(true);
      onClose();
      setReason("");

      await orderService.cancelOrder(order.id, { reason });
      toast.success("Order cancelled successfully");
      onCancel();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            Cancel Order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm">
            Cancel order <strong>{order?.orderNumber}</strong>?
          </p>

          <div>
            <Label className="text-xs mb-1">Reason</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for cancellation..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button size="sm" variant="outline" onClick={onClose}>
            Back
          </Button>
          <Button
            size="sm"
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
