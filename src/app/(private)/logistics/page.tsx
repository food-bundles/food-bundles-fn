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
  Truck,
  RefreshCw,
  X
} from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

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
  const [refreshing, setRefreshing] = useState(false);
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

  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
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
        if (isRefresh) {
          toast.success('Orders refreshed!');
        }
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchOrders(true);
  };
  console.log('Rendering LogisticsPage with orders:', orders);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await orderService.getDeliveryOrderDetails(orderId);
      console.log(`Response from fetchOrderDetails:`, response);
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
      case 'PENDING': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PREPARING': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'READY': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'IN_TRANSIT': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
        className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-green-500 bg-white overflow-hidden"
        onClick={() => fetchOrderDetails(order.id)}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-green-600"></div>
        <CardContent className="p-4 sm:p-5">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm sm:text-base truncate text-gray-900 group-hover:text-green-700 transition-colors">
                {order.restaurantName}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">{order.orderNumber}</p>
              <p className="text-xs text-gray-500 mt-1 truncate">{order.customerName}</p>
            </div>
            <Badge className={`${getStatusColor(order.status)} text-xs px-2 py-1 border font-semibold whitespace-nowrap`}>
              {order.status.replace('_', ' ')}
            </Badge>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm font-bold text-green-700">{order.totalAmount.toLocaleString()} Rwf</span>
            <Eye className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
          </div>
        </CardContent>
      </Card>
    );
  };

  const FullOrderCard = ({ order }: { order: LogisticsOrder }) => {
    const nextStatus = getNextStatus(order.status);

    return (
      <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-500 bg-white">
        <div className="absolute top-0 left-0 w-full h-1 bg-green-600"></div>
        <CardContent className="p-4 sm:p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-sm sm:text-base text-gray-900">{order.orderNumber}</h3>
              <p className="text-xs sm:text-sm text-gray-700 mt-1 font-medium">{order.customerName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{order.restaurantName}</p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Badge className={`${getStatusColor(order.status)} text-xs px-3 py-1 border font-semibold`}>
                {order.status.replace('_', ' ')}
              </Badge>
              <span className="text-sm font-bold text-green-700">{order.totalAmount.toLocaleString()} Rwf</span>
            </div>
          </div>

          <div className="space-y-2 text-xs sm:text-sm mb-4">
            <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
              <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 flex-1">{order.deliveryAddress}</span>
            </div>
            <div className="flex items-start gap-2 p-2 bg-orange-50 rounded-lg">
              <Package className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 flex-1">{order.items}</span>
            </div>
            {order.productImages && order.productImages.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {order.productImages.slice(0, 4).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt="Product"
                    className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg border-2 border-white shadow-md hover:scale-110 transition-transform"
                  />
                ))}
                {order.productImages.length > 4 && (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-500 rounded-lg border-2 border-white shadow-md flex items-center justify-center text-xs font-bold text-white">
                    +{order.productImages.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {nextStatus && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
              <Button
                size="sm"
                onClick={() => updateOrderStatus(order.id, nextStatus as 'PREPARING' | 'READY' | 'IN_TRANSIT' | 'CANCELLED')}
                disabled={updatingStatus === order.id}
                className="flex-1 min-w-[120px] h-9 text-xs sm:text-sm font-semibold bg-green-600 hover:bg-green-700 shadow-md"
              >
                {updatingStatus === order.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-1" />
                    {nextStatus.replace('_', ' ')}
                  </>
                )}
              </Button>
            )}

            {(order.status === 'CONFIRMED' || order.status === 'PREPARING' || order.status === 'READY') && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                disabled={updatingStatus === order.id}
                className="flex-1 min-w-[100px] h-9 text-xs sm:text-sm font-semibold shadow-md"
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
                className="flex-1 min-w-[120px] h-9 text-xs sm:text-sm font-semibold bg-green-700 hover:bg-green-800 shadow-md"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Delivered
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderOrderGrid = (orderList: LogisticsOrder[], emptyMessage: string) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {orderList.map((order) => (
        <SmallOrderCard key={order.id} order={order} />
      ))}
      {orderList.length === 0 && (
        <div className="col-span-full text-center py-12 sm:py-16">
          <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm sm:text-base font-medium">{emptyMessage}</p>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
      <Spinner variant="ring" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Order Management</h2>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          size="sm"
          variant="outline"
          className="flex items-center gap-2 border-2 hover:border-green-600 hover:bg-green-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        <Card className=" text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-3 sm:p-5 text-center text-blue-600">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-90" />
            <div className="text-2xl sm:text-3xl font-bold mb-1">{unfollowedOrders.length}</div>
            <div className="text-xs sm:text-sm opacity-90 font-medium">Unfollowed</div>
          </CardContent>
        </Card>

        <Card className=" text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-3 sm:p-5 text-center text-orange-500">
            <Truck className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-90" />
            <div className="text-2xl sm:text-3xl font-bold mb-1">{followedOrders.length}</div>
            <div className="text-xs sm:text-sm opacity-90 font-medium ">Followed</div>
          </CardContent>
        </Card>

        <Card className=" text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-3 sm:p-5 text-center text-green-600">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-90" />
            <div className="text-2xl sm:text-3xl font-bold mb-1">{deliveredOrders.length}</div>
            <div className="text-xs sm:text-sm opacity-90 font-medium">Delivered</div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full ">
        <TabsList className="grid w-full grid-cols-3 mb-6 h-10 ">
          <TabsTrigger value="unfollowed" className="flex items-center gap-2 text-xs sm:text-sm  h-8   data-[state=active]:text-green-400 data-[state=active]:shadow-md">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Unfollowed</span>
            <span className="sm:hidden">New</span>
            <span className="ml-1 ">[{unfollowedOrders.length}]</span>
          </TabsTrigger>
          <TabsTrigger value="followed" className="flex items-center gap-2 text-xs sm:text-sm h-8  data-[state=active]:text-green-400 data-[state=active]:shadow-md">
            <Truck className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Followed</span>
            <span className="sm:hidden">Active</span>
            <span className="ml-1 ">[{followedOrders.length}]</span>
          </TabsTrigger>
          <TabsTrigger value="delivered" className="flex items-center gap-2 text-xs sm:text-sm h-8 data-[state=active]:text-green-400 data-[state=active]:shadow-none">
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Delivered</span>
            <span className="sm:hidden">Done</span>
            <span className="ml-1 ">[{deliveredOrders.length}]</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unfollowed" className="mt-0">
          <Card className="border-none shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg">Unfollowed Orders (CONFIRMED)</CardTitle>
            </CardHeader>
            <CardContent>
              {renderOrderGrid(unfollowedOrders, "No unfollowed orders")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="followed" className="mt-0">
          <Card className="border-none shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg">Followed Orders (PREPARING, READY, IN-TRANSIT)</CardTitle>
            </CardHeader>
            <CardContent>
              {renderOrderGrid(followedOrders, "No followed orders")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivered" className="mt-0">
          <Card className="border-none shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg">Delivered Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {renderOrderGrid(deliveredOrders, "No delivered orders")}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 sm:p-6">
          <DialogHeader className="p-4 sm:p-0 pb-4 border-b sm:border-0">
            <DialogTitle className="text-lg sm:text-xl flex items-center justify-between">
              Order Details
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetailsModal(false)}
                className="sm:hidden h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedOrderDetails && selectedOrderDetails.data && (() => {
            const orderData = selectedOrderDetails.data.order;
            const currentOrder = orders.find(o => o.id === orderData.id);
            const nextStatus = currentOrder ? getNextStatus(currentOrder.status) : null;

            return (
              <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
                {/* Order Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-xs sm:text-sm font-medium text-gray-600">Order Number</label>
                    <p className="text-sm sm:text-base text-gray-900 font-semibold mt-1">{orderData.orderNumber}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-xs sm:text-sm font-medium text-gray-600">Status</label>
                    <div className="mt-1">
                      <Badge className={`${getStatusColor(selectedOrderDetails.data.status)} border font-semibold`}>
                        {selectedOrderDetails.data.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-xs sm:text-sm font-medium text-gray-600">Total Amount</label>
                    <p className="text-sm sm:text-base text-green-700 font-bold mt-1">{orderData.totalAmount.toLocaleString()} RWF</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <label className="text-xs sm:text-sm font-medium text-gray-600">Payment Status</label>
                    <div className="mt-1">
                      <Badge variant="outline" className="font-semibold">{orderData.paymentStatus}</Badge>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {currentOrder && (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    {nextStatus && currentOrder.status !== 'DELIVERED' && currentOrder.status !== 'CANCELLED' && (
                      <Button
                        onClick={() => {
                          updateOrderStatus(currentOrder.id, nextStatus as 'PREPARING' | 'READY' | 'IN_TRANSIT' | 'CANCELLED');
                          setShowDetailsModal(false);
                        }}
                        disabled={updatingStatus === currentOrder.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 font-semibold shadow-md"
                      >
                        {updatingStatus === currentOrder.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                          <>
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Mark as {nextStatus.replace('_', ' ')}
                          </>
                        )}
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
                        className="flex-1 font-semibold shadow-md"
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
                        className="flex-1 bg-green-700 hover:bg-green-800 font-semibold shadow-md"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                )}

                {/* Customer Info */}
                <div className="border-t pt-4">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
                    <User className="h-5 w-5 text-green-700" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Name</label>
                      <p className="text-sm sm:text-base text-gray-900 mt-1">{orderData.billingName}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-sm sm:text-base text-gray-900 mt-1">{orderData.billingPhone}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Email</label>
                      <p className="text-sm sm:text-base text-gray-900 mt-1 break-all">{orderData.billingEmail}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Address</label>
                      <p className="text-sm sm:text-base text-gray-900 mt-1">{orderData.billingAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Restaurant Info */}
                <div className="border-t pt-4">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-5 w-5 text-orange-600" />
                    Restaurant Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Name</label>
                      <p className="text-sm sm:text-base text-gray-900 mt-1">{orderData.restaurant.name}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-sm sm:text-base text-gray-900 mt-1">{orderData.restaurant.phone}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Location</label>
                      <p className="text-sm sm:text-base text-gray-900 mt-1">{orderData.restaurant.location}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Province</label>
                      <p className="text-sm sm:text-base text-gray-900 mt-1">{orderData.restaurant.province}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t pt-4">
                  <h3 className="text-base sm:text-lg font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {orderData.orderItems.map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 sm:gap-4 p-3 border-2 rounded-lg bg-white hover:border-green-400 transition-colors">
                        {item.images && item.images[0] && (
                          <img
                            src={item.images[0]}
                            alt={item.productName}
                            className="w-14 h-14 sm:w-20 sm:h-20 object-cover rounded-lg border-2 border-gray-200"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm sm:text-base text-gray-900">{item.productName}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">Category: {item.category}</p>
                          <p className="text-xs sm:text-sm text-gray-600">Quantity: {item.quantity} {item.unit}</p>
                          <p className="text-xs sm:text-sm font-medium text-gray-700 mt-1">Price: {item.unitPrice.toLocaleString()} RWF</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm sm:text-base text-green-700">{item.subtotal.toLocaleString()} RWF</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Info */}
                <div className="border-t pt-4">
                  <h3 className="text-base sm:text-lg font-semibold mb-3">Payment Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Payment Method</label>
                      <p className="text-sm sm:text-base text-gray-900 mt-1">{orderData.paymentMethod}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Payment Provider</label>
                      <p className="text-sm sm:text-base text-gray-900 mt-1">{orderData.paymentProvider}</p>
                    </div>
                    {orderData.voucherCode && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <label className="text-xs sm:text-sm font-medium text-gray-600">Voucher Code</label>
                        <p className="text-sm sm:text-base text-gray-900 mt-1">{orderData.voucherCode}</p>
                      </div>
                    )}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-xs sm:text-sm font-medium text-gray-600">Transaction ID</label>
                      <p className="text-sm sm:text-base text-gray-900 mt-1 break-all">{orderData.transactionId}</p>
                    </div>
                  </div>
                </div>

                {/* Logistics Info */}
                {selectedOrderDetails.data.logistics && (
                  <div className="border-t pt-4">
                    <h3 className="text-base sm:text-lg font-semibold mb-3">Logistics Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <label className="text-xs sm:text-sm font-medium text-gray-600">Logistics Partner</label>
                        <p className="text-sm sm:text-base text-gray-900 mt-1">{selectedOrderDetails.data.logistics.username}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <label className="text-xs sm:text-sm font-medium text-gray-600">Contact</label>
                        <p className="text-sm sm:text-base text-gray-900 mt-1">{selectedOrderDetails.data.logistics.phone}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {orderData.notes && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-gray-600">Notes</label>
                    <p className="text-sm text-gray-900 mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">{orderData.notes}</p>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* OTP Verification Modal */}
      <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
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
                className="mt-2 text-center text-lg sm:text-xl font-bold tracking-widest h-12"
                autoFocus
              />
            </div>
            {selectedOrder && (
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <p className="text-sm text-gray-800">
                  <strong className="text-green-800">Order:</strong> {selectedOrder.orderNumber}<br />
                  <strong className="text-green-800">Customer:</strong> {selectedOrder.customerName}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowOtpModal(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleOtpVerification} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 font-semibold">
              Verify & Deliver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}