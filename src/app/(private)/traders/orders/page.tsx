"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Building, Calendar, CreditCard } from "lucide-react";
import { traderService, type TraderOrder } from "@/app/services/traderService";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersPage() {
  const [orders, setOrders] = useState<TraderOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await traderService.getOrders();
        setOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "DELIVERED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600">Orders paid with vouchers you've approved</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-500">Orders paid with your vouchers will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    {order.orderNumber}
                  </CardTitle>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{order.restaurant.name}</p>
                      <p className="text-sm text-gray-500">Restaurant</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{order.totalAmount.toLocaleString()} RWF</p>
                      <p className="text-sm text-gray-500">Total Amount</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">Order Date</p>
                    </div>
                  </div>
                </div>

                {order.Voucher && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-800">Voucher Used</p>
                        <p className="text-sm text-blue-600">{order.Voucher.voucherCode}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-blue-800">{order.Voucher.discountPercentage}% Discount</p>
                        <p className="text-sm text-blue-600">Applied</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t pt-3">
                  <h4 className="font-medium mb-2">Order Items</h4>
                  <div className="space-y-2">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div>
                          <span className="font-medium">{item.productName}</span>
                          <span className="text-gray-500 ml-2">x{item.quantity} {item.unit}</span>
                        </div>
                        <span className="font-medium">{item.subtotal.toLocaleString()} RWF</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <div className="text-sm text-gray-500">
                    Payment: {order.paymentMethod} • Status: {order.paymentStatus}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {order.totalAmount.toLocaleString()} RWF
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}