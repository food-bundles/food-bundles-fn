"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { orderService } from "@/app/services/orderService";
import { 
  Package, 
  CheckCircle, 
  MapPin,
  User,
  ArrowRight,
  Eye,
  Clock,
  Truck
} from "lucide-react";
import { toast } from "sonner";

type DeliveryStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

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
  const [selectedOrder, setSelectedOrder] = useState<LogisticsOrder | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('unfollowed');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getDeliveryOrders({ page: 1, limit: 50 });
      if (response.success) {
        const formattedOrders = response.data.map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.billingName,
          customerPhone: order.billingPhone,
          deliveryAddress: order.billingAddress,
          restaurantName: order.restaurant?.name || 'Unknown Restaurant',
          items: order.orderItems?.map((item: any) => `${item.productName} (${item.quantity})`).join(', ') || 'No items',
          totalAmount: order.totalAmount,
          status: order.status as DeliveryStatus,
          paymentStatus: order.paymentStatus,
          productImages: order.orderItems?.flatMap((item: any) => item.images || []) || [],
          createdAt: order.createdAt
        }));
        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await orderService.getDeliveryOrderDetails(orderId);
      if (response.success) {
        setSelectedOrderDetails(response.data);
        setShowDetailsModal(true);
      } else {
        toast.error('Failed to fetch order details');
      }
    } catch (error) {
      toast.error('Failed to fetch order details');
    }
  };

  const unfollowedOrders = orders.filter(order => order.status === 'CONFIRMED');
  const followedOrders = orders.filter(order => ['PREPARING', 'READY', 'IN_TRANSIT'].includes(order.status));
  const deliveredOrders = orders.filter(order => order.status === 'DELIVERED');

  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-gray-100 text-gray-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'PREPARING': return 'bg-orange-100 text-orange-800';
      case 'READY': return 'bg-purple-100 text-purple-800';
      case 'IN_TRANSIT': return 'bg-yellow-100 text-yellow-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus: DeliveryStatus): DeliveryStatus | null => {
    const workflow: Record<DeliveryStatus, DeliveryStatus | null> = {
      'PENDING': null,
      'CONFIRMED': 'PREPARING',
      'PREPARING': 'READY',
      'READY': 'IN_TRANSIT',
      'IN_TRANSIT': 'DELIVERED',
      'DELIVERED': null,
      'CANCELLED': null
    };
    return workflow[currentStatus];
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'PREPARING' | 'READY' | 'IN_TRANSIT' | 'CANCELLED') => {
    try {
      setUpdatingStatus(orderId);
      const response = await orderService.updateDeliveryStatus(orderId, newStatus);
      if (response.success) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus as DeliveryStatus } : order
        ));
        toast.success(`Order status updated to ${newStatus.toLowerCase().replace('_', ' ')}!`);
      } else {
        toast.error(response.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Failed to update order:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleOtpVerification = async () => {
    if (!selectedOrder || !otp) {
      toast.error('Please enter the OTP');
      return;
    }
    
    try {
      const response = await orderService.verifyDeliveryOTP(selectedOrder.id, otp);
      if (response.success) {
        setOrders(prev => prev.map(order => 
          order.id === selectedOrder.id ? { ...order, status: 'DELIVERED' as DeliveryStatus } : order
        ));
        setShowOtpModal(false);
        setOtp('');
        setSelectedOrder(null);
        toast.success('Order delivered successfully!');
      } else {
        toast.error(response.error || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to verify OTP');
    }
  };

  const SmallOrderCard = ({ order }: { order: LogisticsOrder }) => {
    return (
      <Card 
        className="mb-2 cursor-pointer hover:shadow-md transition-shadow" 
        onClick={() => fetchOrderDetails(order.id)}
      >
        <CardContent className="p-3">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h3 className="font-semibold text-sm truncate">{order.restaurantName}</h3>
              <p className="text-xs text-gray-600">{order.orderNumber}</p>
            </div>
            <Badge className={`${getStatusColor(order.status)} text-xs px-2 py-1 ml-2`}>
              {order.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  const FullOrderCard = ({ order }: { order: LogisticsOrder }) => {
    const nextStatus = getNextStatus(order.status);
    
    return (
      <Card className="mb-2">
        <CardContent className="p-3">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-sm">{order.orderNumber}</h3>
              <p className="text-xs text-gray-600">{order.customerName}</p>
              <p className="text-xs text-gray-500">{order.restaurantName}</p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <Badge className={`${getStatusColor(order.status)} text-xs px-2 py-1`}>
                {order.status.replace('_', ' ')}
              </Badge>
              <span className="text-xs font-semibold text-green-600">{order.totalAmount} Rwf</span>
            </div>
          </div>
          
          <div className="space-y-1 text-xs mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600 truncate">{order.deliveryAddress}</span>
            </div>
            <div className="flex items-center gap-1">
              <Package className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600">{order.items}</span>
            </div>
            {order.productImages && order.productImages.length > 0 && (
              <div className="flex gap-1 mt-2">
                {order.productImages.slice(0, 3).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt="Product"
                    className="w-8 h-8 object-cover rounded border"
                  />
                ))}
                {order.productImages.length > 3 && (
                  <div className="w-8 h-8 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                    +{order.productImages.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex gap-1">
            {nextStatus && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
              <Button 
                size="sm" 
                onClick={() => updateOrderStatus(order.id, nextStatus as 'PREPARING' | 'READY' | 'IN_TRANSIT' | 'CANCELLED')}
                disabled={updatingStatus === order.id}
                className="flex-1 h-7 text-xs px-2"
              >
                {updatingStatus === order.id ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                ) : (
                  <ArrowRight className="h-3 w-3 mr-1" />
                )}
                {updatingStatus === order.id ? 'Updating...' : `${nextStatus.replace('_', ' ')}`}
              </Button>
            )}
            
            {(order.status === 'CONFIRMED' || order.status === 'PREPARING' || order.status === 'READY') && (
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                disabled={updatingStatus === order.id}
                className="flex-1 h-7 text-xs px-2"
              >
                Cancel
              </Button>
            )}
            
            {order.status === 'IN_TRANSIT' && (
              <Button 
                size="sm" 
                onClick={() => {
                  setSelectedOrder(order);
                  setShowOtpModal(true);
                }}
                className="flex-1 h-7 text-xs px-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Delivered
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOrderGrid = (orderList: LogisticsOrder[], emptyMessage: string) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {orderList.map((order) => (
        <SmallOrderCard key={order.id} order={order} />
      ))}
      {orderList.length === 0 && (
        <div className="col-span-full text-center text-gray-500 py-8">
          {emptyMessage}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{unfollowedOrders.length}</div>
            <div className="text-sm text-gray-500">Unfollowed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">{followedOrders.length}</div>
            <div className="text-sm text-gray-500">Followed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{deliveredOrders.length}</div>
            <div className="text-sm text-gray-500">Delivered</div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="unfollowed" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Unfollowed ({unfollowedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="followed" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Followed ({followedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="delivered" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Delivered ({deliveredOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unfollowed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Unfollowed Orders (CONFIRMED)</CardTitle>
            </CardHeader>
            <CardContent>
              {renderOrderGrid(unfollowedOrders, "No unfollowed orders")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="followed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Followed Orders (PREPARING, READY, IN-TRANSIT)</CardTitle>
            </CardHeader>
            <CardContent>
              {renderOrderGrid(followedOrders, "No followed orders")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivered" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivered Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {renderOrderGrid(deliveredOrders, "No delivered orders")}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrderDetails && selectedOrderDetails.data && (() => {
            const orderData = selectedOrderDetails.data.order;
            const currentOrder = orders.find(o => o.id === orderData.id);
            const nextStatus = currentOrder ? getNextStatus(currentOrder.status) : null;
            
            return (
              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Order Number</label>
                    <p className="text-sm text-gray-600">{orderData.orderNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Badge className={getStatusColor(selectedOrderDetails.data.status)}>
                      {selectedOrderDetails.data.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Total Amount</label>
                    <p className="text-sm text-gray-600">{orderData.totalAmount} RWF</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Payment Status</label>
                    <Badge variant="outline">{orderData.paymentStatus}</Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                {currentOrder && (
                  <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
                    {nextStatus && currentOrder.status !== 'DELIVERED' && currentOrder.status !== 'CANCELLED' && (
                      <Button 
                        onClick={() => {
                          updateOrderStatus(currentOrder.id, nextStatus as 'PREPARING' | 'READY' | 'IN_TRANSIT' | 'CANCELLED');
                          setShowDetailsModal(false);
                        }}
                        disabled={updatingStatus === currentOrder.id}
                        className="flex items-center gap-2"
                      >
                        {updatingStatus === currentOrder.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                        {updatingStatus === currentOrder.id ? 'Updating...' : `Mark as ${nextStatus.replace('_', ' ')}`}
                      </Button>
                    )}
                    
                    {(currentOrder.status === 'CONFIRMED' || currentOrder.status === 'PREPARING' || currentOrder.status === 'READY') && (
                      <Button 
                        variant="destructive"
                        onClick={() => {
                          updateOrderStatus(currentOrder.id, 'CANCELLED');
                          setShowDetailsModal(false);
                        }}
                        disabled={updatingStatus === currentOrder.id}
                      >
                        Cancel Order
                      </Button>
                    )}
                    
                    {currentOrder.status === 'IN_TRANSIT' && (
                      <Button 
                        onClick={() => {
                          setSelectedOrder(currentOrder);
                          setShowDetailsModal(false);
                          setShowOtpModal(true);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                )}

                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <p className="text-sm text-gray-600">{orderData.billingName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <p className="text-sm text-gray-600">{orderData.billingPhone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <p className="text-sm text-gray-600">{orderData.billingEmail}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Address</label>
                      <p className="text-sm text-gray-600">{orderData.billingAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Restaurant Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Restaurant Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <p className="text-sm text-gray-600">{orderData.restaurant.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <p className="text-sm text-gray-600">{orderData.restaurant.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Location</label>
                      <p className="text-sm text-gray-600">{orderData.restaurant.location}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Province</label>
                      <p className="text-sm text-gray-600">{orderData.restaurant.province}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {orderData.orderItems.map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                        {item.images && item.images[0] && (
                          <img
                            src={item.images[0]}
                            alt={item.productName}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{item.productName}</h4>
                          <p className="text-sm text-gray-600">Category: {item.category}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity} {item.unit}</p>
                          <p className="text-sm font-medium">Price: {item.unitPrice} RWF</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{item.subtotal} RWF</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Payment Method</label>
                      <p className="text-sm text-gray-600">{orderData.paymentMethod}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Payment Provider</label>
                      <p className="text-sm text-gray-600">{orderData.paymentProvider}</p>
                    </div>
                    {orderData.voucherCode && (
                      <div>
                        <label className="text-sm font-medium">Voucher Code</label>
                        <p className="text-sm text-gray-600">{orderData.voucherCode}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium">Transaction ID</label>
                      <p className="text-sm text-gray-600">{orderData.transactionId}</p>
                    </div>
                  </div>
                </div>

                {/* Logistics Info */}
                {selectedOrderDetails.data.logistics && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Logistics Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Logistics Partner</label>
                        <p className="text-sm text-gray-600">{selectedOrderDetails.data.logistics.username}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Contact</label>
                        <p className="text-sm text-gray-600">{selectedOrderDetails.data.logistics.phone}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {orderData.notes && (
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <p className="text-sm text-gray-600">{orderData.notes}</p>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

        {/* OTP Verification Modal */}
        <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Verify Delivery OTP
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Please enter the OTP provided by the customer to confirm delivery.
              </p>
              <div>
                <label className="text-sm font-medium text-gray-700">OTP Code</label>
                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="mt-1"
                />
              </div>
              {selectedOrder && (
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Order:</strong> {selectedOrder.orderNumber}<br/>
                    <strong>Customer:</strong> {selectedOrder.customerName}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowOtpModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleOtpVerification}>
                Verify & Deliver
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}