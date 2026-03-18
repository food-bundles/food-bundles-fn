"use client";

import { useState } from "react";
import { Search, User, Mail, Phone, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { userLookupService, UserLookupResult } from "@/app/services/userLookupService";
import { toast } from "sonner";

export default function UserLookupPage() {
  const [searchType, setSearchType] = useState<"id" | "email" | "phone">("id");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserLookupResult | null>(null);
  const [ordersPage, setOrdersPage] = useState(1);
  const [vouchersPage, setVouchersPage] = useState(1);
  const [activeTab, setActiveTab] = useState("basic");
  const ordersPerPage = 5;
  const vouchersPerPage = 5;

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error("Please enter a search value");
      return;
    }

    setLoading(true);
    try {
      let result;
      if (searchType === "id") {
        result = await userLookupService.getUserById(searchValue.trim());
      } else if (searchType === "email") {
        result = await userLookupService.getUserByEmail(searchValue.trim());
      } else {
        result = await userLookupService.getUserByPhone(searchValue.trim());
      }

      if (result.success && result.data) {
        setUserData(result.data);
        toast.success("User found successfully");
      } else {
        setUserData(null);
        toast.error("User not found");
      }
    } catch (error: any) {
      setUserData(null);
      toast.error(error.response?.data?.message || "Failed to fetch user");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Lookup</h1>
        <p className="text-sm text-muted-foreground">Search for users by ID, email, or phone number</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search User</CardTitle>
          <CardDescription className="text-sm">Enter user ID, email, or phone number to find user information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <nav className="-mb-px flex space-x-8 ">
            <button
              type="button"
              onClick={() => setSearchType("id")}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                searchType === "id"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <User className="w-4 h-4" />
              User ID
            </button>
            <button
              type="button"
              onClick={() => setSearchType("email")}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                searchType === "email"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => setSearchType("phone")}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                searchType === "phone"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Phone className="w-4 h-4" />
              Phone
            </button>
          </nav>

          <div className="flex gap-2 ">
            <Input
              placeholder={
                searchType === "id"
                  ? "Enter user ID..."
                  : searchType === "email"
                  ? "Enter email address..."
                  : "Enter phone number..."
              }
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="text-sm max-w-md"
            />
            <Button onClick={handleSearch} disabled={loading} className="bg-green-700 hover:bg-green-600 text-sm">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {userData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{userData.name}</CardTitle>
                <CardDescription className="text-sm">User Information</CardDescription>
              </div>
              <Badge className={getUserTypeColor(userData.userType)}>{userData.userType}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <nav className="-mb-px flex space-x-8 border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("basic")}
                  className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === "basic"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Basic Info
                </button>
                {userData.orders && userData.orders.length > 0 && (
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
                )}
                {userData.Voucher && userData.Voucher.length > 0 && (
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
                )}
                {userData.Wallet && (
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
                )}
              </nav>

              <TabsList className="hidden">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                {userData.orders && userData.orders.length > 0 && (
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                )}
                {userData.Voucher && userData.Voucher.length > 0 && (
                  <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
                )}
                {userData.Wallet && (
                  <TabsTrigger value="wallet">Wallet</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">User ID</p>
                    <p className="text-sm">{userData.id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">User Type</p>
                    <p className="text-sm">{userData.userType}</p>
                  </div>
                  {userData.email && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Email</p>
                      <p className="text-sm">{userData.email}</p>
                    </div>
                  )}
                  {userData.phone && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Phone</p>
                      <p className="text-sm">{userData.phone}</p>
                    </div>
                  )}
                  {userData.location && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Location</p>
                      <p className="text-sm">{userData.location}</p>
                    </div>
                  )}
                  {userData.province && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Province</p>
                      <p className="text-sm">{userData.province}</p>
                    </div>
                  )}
                  {userData.district && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">District</p>
                      <p className="text-sm">{userData.district}</p>
                    </div>
                  )}
                  {userData.createdAt && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Created At</p>
                      <p className="text-sm">{new Date(userData.createdAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {userData.orders && userData.orders.length > 0 && (
                <TabsContent value="orders" className="space-y-4 mt-4">
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
                  <Card>
                    <CardContent className="p-4">
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
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {userData.Voucher && userData.Voucher.length > 0 && (
                <TabsContent value="vouchers" className="space-y-4 mt-4">
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
                  <Card>
                    <CardContent className="p-4">
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
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {userData.Wallet && (
                <TabsContent value="wallet" className="space-y-4 mt-4">
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
                  {userData.Wallet.transactions && userData.Wallet.transactions.length > 0 && (
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
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
