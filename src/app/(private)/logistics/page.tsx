"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { orderService } from "@/app/services/orderService";
import { 
  Package, 
  CheckCircle, 
  MapPin,
  User,
  ArrowRight,
  AlertCircle,
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
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryCode, setDeliveryCode] = useState('');

  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

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

  const pendingOrders = orders.filter(order => order.status === 'PENDING');
  const confirmedOrders = orders.filter(order => order.status === 'CONFIRMED');
  const preparingOrders = orders.filter(order => order.status === 'PREPARING');
  const readyOrders = orders.filter(order => order.status === 'READY');
  const inTransitOrders = orders.filter(order => order.status === 'IN_TRANSIT');
  const deliveredOrders = orders.filter(order => order.status === 'DELIVERED');
  const cancelledOrders = orders.filter(order => order.status === 'CANCELLED');

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

  const OrderCard = ({ order }: { order: LogisticsOrder }) => {
    const nextStatus = getNextStatus(order.status);
    
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
              <p className="text-sm text-gray-600">{order.customerName}</p>
              <p className="text-xs text-gray-500">{order.restaurantName}</p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Badge className={getStatusColor(order.status)}>
                {order.status.replace('_', ' ')}
              </Badge>
              <span className="text-sm font-semibold text-green-600">{order.totalAmount} Rwf</span>
            </div>
          </div>
          
          <div className="space-y-2 text-sm mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 truncate">{order.deliveryAddress}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{order.items}</span>
            </div>
            {order.assignedPersonnel && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-blue-600">Assigned: {order.assignedPersonnel}</span>
              </div>
            )}
            {order.productImages && order.productImages.length > 0 && (
              <div className="flex gap-2 mt-3">
                {order.productImages.slice(0, 3).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt="Product"
                    className="w-12 h-12 object-cover rounded-md border"
                  />
                ))}
                {order.productImages.length > 3 && (
                  <div className="w-12 h-12 bg-gray-100 rounded-md border flex items-center justify-center text-xs text-gray-500">
                    +{order.productImages.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            {['DELIVERED', 'IN_TRANSIT', 'CANCELLED', 'PREPARING'].includes(order.status) && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => fetchOrderDetails(order.id)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                {/* View */}
              </Button>
            )}
            
            {nextStatus && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
              <Button 
                size="sm" 
                onClick={() => updateOrderStatus(order.id, nextStatus as 'PREPARING' | 'READY' | 'IN_TRANSIT' | 'CANCELLED')}
                disabled={updatingStatus === order.id}
                className="flex-1"
              >
                {updatingStatus === order.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                {updatingStatus === order.id ? 'Updating...' : `Mark as ${nextStatus.replace('_', ' ')}`}
              </Button>
            )}
            
            {(order.status === 'CONFIRMED' || order.status === 'PREPARING' || order.status === 'READY') && (
              <Button 
                size="sm" 
                variant="default"
                onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                disabled={updatingStatus === order.id}
                className="flex-1 bg-red-100 text-red-500"
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
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify OTP
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

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
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2 mb-6">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-gray-600 mb-1">{pendingOrders.length}</div>
              <div className="text-xs text-gray-500">Pending</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-blue-600 mb-1">{confirmedOrders.length}</div>
              <div className="text-xs text-gray-500">Confirmed</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-orange-600 mb-1">{preparingOrders.length}</div>
              <div className="text-xs text-gray-500">Preparing</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-purple-600 mb-1">{readyOrders.length}</div>
              <div className="text-xs text-gray-500">Ready</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-yellow-600 mb-1">{inTransitOrders.length}</div>
              <div className="text-xs text-gray-500">In Transit</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-green-600 mb-1">{deliveredOrders.length}</div>
              <div className="text-xs text-gray-500">Delivered</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-red-600 mb-1">{cancelledOrders.length}</div>
              <div className="text-xs text-gray-500">Cancelled</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>All Orders</span>
                <Badge variant="secondary">{orders.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
                {orders.length === 0 && (
                  <div className="col-span-full text-center text-gray-500 py-8">
                    No orders found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>
            {selectedOrderDetails && selectedOrderDetails.data && (
              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Order Number</label>
                    <p className="text-sm text-gray-600">{selectedOrderDetails.data.order.orderNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Badge className={getStatusColor(selectedOrderDetails.data.status)}>
                      {selectedOrderDetails.data.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Total Amount</label>
                    <p className="text-sm text-gray-600">{selectedOrderDetails.data.order.totalAmount} RWF</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Payment Status</label>
                    <Badge variant="outline">{selectedOrderDetails.data.order.paymentStatus}</Badge>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <p className="text-sm text-gray-600">{selectedOrderDetails.data.order.billingName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <p className="text-sm text-gray-600">{selectedOrderDetails.data.order.billingPhone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <p className="text-sm text-gray-600">{selectedOrderDetails.data.order.billingEmail}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Address</label>
                      <p className="text-sm text-gray-600">{selectedOrderDetails.data.order.billingAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Restaurant Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Restaurant Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <p className="text-sm text-gray-600">{selectedOrderDetails.data.order.restaurant.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <p className="text-sm text-gray-600">{selectedOrderDetails.data.order.restaurant.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Location</label>
                      <p className="text-sm text-gray-600">{selectedOrderDetails.data.order.restaurant.location}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Province</label>
                      <p className="text-sm text-gray-600">{selectedOrderDetails.data.order.restaurant.province}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrderDetails.data.order.orderItems.map((item: any, index: number) => (
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
                      <p className="text-sm text-gray-600">{selectedOrderDetails.data.order.paymentMethod}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Payment Provider</label>
                      <p className="text-sm text-gray-600">{selectedOrderDetails.data.order.paymentProvider}</p>
                    </div>
                    {selectedOrderDetails.data.order.voucherCode && (
                      <div>
                        <label className="text-sm font-medium">Voucher Code</label>
                        <p className="text-sm text-gray-600">{selectedOrderDetails.data.order.voucherCode}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium">Transaction ID</label>
                      <p className="text-sm text-gray-600">{selectedOrderDetails.data.order.transactionId}</p>
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
                {selectedOrderDetails.data.order.notes && (
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <p className="text-sm text-gray-600">{selectedOrderDetails.data.order.notes}</p>
                  </div>
                )}
              </div>
            )}
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