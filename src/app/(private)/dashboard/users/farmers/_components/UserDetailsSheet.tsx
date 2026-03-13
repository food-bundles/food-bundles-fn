"use client";

import { useEffect, useState } from "react";
import { X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { userLookupService, UserLookupResult } from "@/app/services/userLookupService";
import { toast } from "sonner";

interface UserDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
}

export default function UserDetailsSheet({
  isOpen,
  onClose,
  userId,
}: UserDetailsSheetProps) {
  const [userData, setUserData] = useState<UserLookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [vouchersPage, setVouchersPage] = useState(1);
  const [activeTab, setActiveTab] = useState("");
  const ordersPerPage = 5;
  const vouchersPerPage = 5;

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserData();
    }
  }, [isOpen, userId]);

  const fetchUserData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await userLookupService.getUserById(userId);
      if (response.success && response.data) {
        setUserData(response.data);
        setActiveTab(response.data.userType === "FARMER" ? "submissions" : "orders");
      } else {
        toast.error("User not found");
        onClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch user details");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case "FARMER":
        return "bg-green-500";
      case "RESTAURANT":
        return "bg-blue-500";
      case "AFFILIATOR":
        return "bg-purple-500";
      case "ADMIN":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-opacity-50 z-[60]" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-full bg-white text-gray-900 z-[70] transform transition-all duration-300 ease-in-out overflow-y-auto shadow-2xl border-l border-gray-200 scrollbar-hide
          w-[90vw] sm:w-[500px] md:w-[600px]
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="sticky top-0 z-10 bg-green-700 border-b border-gray-200 flex justify-between items-center px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xl text-white font-bold">User Details</span>
            {userData && (
              <Badge className={getUserTypeColor(userData.userType)}>
                {userData.userType}
              </Badge>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors hover:rotate-90 transform duration-200"
          >
            <X className="w-6 h-6 text-white cursor-pointer" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-green-700" />
            </div>
          ) : userData ? (
            <>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">{userData.name}</h2>
                <p className="text-sm text-gray-500">Complete user information</p>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <nav className="-mb-px flex space-x-8 border-b border-gray-200">
                  {userData.userType === "FARMER" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveTab("submissions")}
                        className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                          activeTab === "submissions"
                            ? "border-green-500 text-green-600"
                            : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        Submissions
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveTab("orders")}
                        className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                          activeTab === "orders"
                            ? "border-green-500 text-green-600"
                            : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        Orders
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("vouchers")}
                        className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                          activeTab === "vouchers"
                            ? "border-green-500 text-green-600"
                            : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        Vouchers
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("wallet")}
                        className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                          activeTab === "wallet"
                            ? "border-green-500 text-green-600"
                            : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        Wallet
                      </button>
                    </>
                  )}
                </nav>

                <TabsList className="hidden">
                  {userData.userType === "FARMER" ? (
                    <>
                      <TabsTrigger value="submissions">Submissions</TabsTrigger>
                    </>
                  ) : (
                    <>
                      <TabsTrigger value="orders">Orders</TabsTrigger>
                      <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
                      <TabsTrigger value="wallet">Wallet</TabsTrigger>
                    </>
                  )}
                </TabsList>

                {userData.userType === "FARMER" ? (
                  <>
                    <TabsContent value="submissions" className="space-y-4 mt-4">
                      {userData.submissions && userData.submissions.length > 0 && (
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 rounded-lg border bg-blue-50 transition-all duration-200 hover:shadow-md">
                            <div className="space-y-1">
                              <p className="text-xs text-gray-600 font-medium">Total Submissions</p>
                              <p className="text-sm font-bold text-blue-600">
                                {userData.submissions.filter((submission: any, index: number, self: any[]) => 
                                  index === self.findIndex((s: any) => s.id === submission.id)
                                ).length}
                              </p>
                            </div>
                          </div>
                          <div className="p-4 rounded-lg border bg-green-50 transition-all duration-200 hover:shadow-md">
                            <div className="space-y-1">
                              <p className="text-xs text-gray-600 font-medium">Approved</p>
                              <p className="text-sm font-bold text-green-600">
                                {userData.submissions.filter((sub: any, index: number, self: any[]) => 
                                  index === self.findIndex((s: any) => s.id === sub.id) && sub.status === 'APPROVED'
                                ).length}
                              </p>
                            </div>
                          </div>
                          <div className="p-4 rounded-lg border bg-yellow-50 transition-all duration-200 hover:shadow-md">
                            <div className="space-y-1">
                              <p className="text-xs text-gray-600 font-medium">Pending</p>
                              <p className="text-sm font-bold text-yellow-600">
                                {userData.submissions.filter((sub: any, index: number, self: any[]) => 
                                  index === self.findIndex((s: any) => s.id === sub.id) && sub.status === 'PENDING'
                                ).length}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      <Card>
                        <CardContent className="p-4">
                          {userData.submissions && userData.submissions.length > 0 ? (
                            <div className="space-y-3">
                              {userData.submissions
                                .filter((submission: any, index: number, self: any[]) => 
                                  index === self.findIndex((s: any) => s.id === submission.id)
                                )
                                .map((submission: any) => (
                                <div key={submission.id} className="border-b pb-3 last:border-0">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900">
                                        {submission.approvedProduct?.name || submission.productName || 'N/A'}
                                      </p>
                                      <p className="text-xs text-gray-500">{new Date(submission.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right ml-4">
                                      <p className="text-sm font-medium text-gray-900">{submission.quantity} {submission.unit}</p>
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        submission.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                        submission.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                      }`}>
                                        {submission.status}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-4">No submissions found</p>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </>
                ) : (
                  <>
                    <TabsContent value="orders" className="space-y-4 mt-4">
                  {userData.orders && userData.orders.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg border bg-blue-50 transition-all duration-200 hover:shadow-md">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600 font-medium">Total Orders</p>
                          <p className="text-sm font-bold text-blue-600">{userData.orders.length}</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg border bg-green-50 transition-all duration-200 hover:shadow-md">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600 font-medium">Total Amount</p>
                          <p className="text-sm font-bold text-green-600">
                            {userData.orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0).toLocaleString()} RWF
                          </p>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg border bg-purple-50 transition-all duration-200 hover:shadow-md">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600 font-medium">Delivered</p>
                          <p className="text-sm font-bold text-purple-600">
                            {userData.orders.filter((order: any) => order.status === 'DELIVERED').length}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <Card>
                    <CardContent className="p-4">
                      {userData.orders && userData.orders.length > 0 ? (
                        <div className="space-y-3">
                          {userData.orders.slice((ordersPage - 1) * ordersPerPage, ordersPage * ordersPerPage).map((order: any) => (
                            <div key={order.id} className="border-b pb-3 last:border-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900">{order.totalAmount?.toLocaleString()} RWF</p>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {userData.orders.length > ordersPerPage && (
                            <div className="flex items-center justify-between pt-3">
                              <p className="text-xs text-gray-500">
                                Showing {((ordersPage - 1) * ordersPerPage) + 1}-{Math.min(ordersPage * ordersPerPage, userData.orders.length)} of {userData.orders.length} orders
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                                  disabled={ordersPage === 1}
                                  className="h-7 w-7 p-0"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setOrdersPage(p => Math.min(Math.ceil(userData.orders.length / ordersPerPage), p + 1))}
                                  disabled={ordersPage >= Math.ceil(userData.orders.length / ordersPerPage)}
                                  className="h-7 w-7 p-0"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No orders found</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="vouchers" className="space-y-4 mt-4">
                  {userData.Voucher && userData.Voucher.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg border bg-blue-50 transition-all duration-200 hover:shadow-md">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600 font-medium">Total Vouchers</p>
                          <p className="text-sm font-bold text-blue-600">{userData.Voucher.length}</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg border bg-green-50 transition-all duration-200 hover:shadow-md">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600 font-medium">Total Credit</p>
                          <p className="text-sm font-bold text-green-600">
                            {userData.Voucher.reduce((sum: number, voucher: any) => sum + (voucher.creditLimit || 0), 0).toLocaleString()} RWF
                          </p>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg border bg-purple-50 transition-all duration-200 hover:shadow-md">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600 font-medium">Active</p>
                          <p className="text-sm font-bold text-purple-600">
                            {userData.Voucher.filter((voucher: any) => voucher.status === 'ACTIVE').length}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <Card>
                    <CardContent className="p-4">
                      {userData.Voucher && userData.Voucher.length > 0 ? (
                        <div className="space-y-3">
                          {userData.Voucher.slice((vouchersPage - 1) * vouchersPerPage, vouchersPage * vouchersPerPage).map((voucher: any) => (
                            <div key={voucher.id} className="border-b pb-3 last:border-0">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{voucher.voucherCode}</p>
                                  <p className="text-xs text-gray-500">{voucher.voucherType}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900">{voucher.creditLimit?.toLocaleString()} RWF</p>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    voucher.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                    voucher.status === 'USED' ? 'bg-gray-100 text-gray-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {voucher.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {userData.Voucher.length > vouchersPerPage && (
                            <div className="flex items-center justify-between pt-3">
                              <p className="text-xs text-gray-500">
                                Showing {((vouchersPage - 1) * vouchersPerPage) + 1}-{Math.min(vouchersPage * vouchersPerPage, userData.Voucher.length)} of {userData.Voucher.length} vouchers
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setVouchersPage(p => Math.max(1, p - 1))}
                                  disabled={vouchersPage === 1}
                                  className="h-7 w-7 p-0"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setVouchersPage(p => Math.min(Math.ceil(userData.Voucher.length / vouchersPerPage), p + 1))}
                                  disabled={vouchersPage >= Math.ceil(userData.Voucher.length / vouchersPerPage)}
                                  className="h-7 w-7 p-0"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No vouchers found</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="wallet" className="space-y-4 mt-4">
                  {userData.Wallet && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border bg-green-50 transition-all duration-200 hover:shadow-md">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600 font-medium">Balance</p>
                          <p className="text-sm font-bold text-green-600">{userData.Wallet.balance?.toLocaleString()} RWF</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg border bg-blue-50 transition-all duration-200 hover:shadow-md">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600 font-medium">Total Deposited</p>
                          <p className="text-sm font-bold text-blue-600">{userData.Wallet.totalDeposited?.toLocaleString()} RWF</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {userData.Wallet && userData.Wallet.transactions && userData.Wallet.transactions.length > 0 && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-700">Recent Transactions</p>
                          {userData.Wallet.transactions.slice(0, 5).map((transaction: any) => (
                            <div key={transaction.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                              <div>
                                <p className="text-xs font-medium text-gray-900">{transaction.type}</p>
                                <p className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                              </div>
                              <p className={`text-sm font-medium ${
                                transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.amount > 0 ? '+' : ''}{transaction.amount?.toLocaleString()} RWF
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {!userData.Wallet && (
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-500 text-center py-4">No wallet information</p>
                      </CardContent>
                    </Card>
                  )}
                    </TabsContent>
                  </>
                )}
              </Tabs>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No user data available</p>
              </CardContent>
            </Card>
          )}

          <div className="h-8"></div>
        </div>
      </div>
    </>
  );
}
