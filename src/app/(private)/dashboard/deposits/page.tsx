/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/app/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, Loader2, CreditCard, Smartphone, Users, DollarSign, Search } from "lucide-react";
import { toast } from "sonner";
import { walletService } from "@/app/services/walletService";
import { restaurantService } from "@/app/services/restaurantService";

export default function DepositsManagementPage() {
  const { getMyWallet } = useWallet();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [walletPagination, setWalletPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [pageSize, setPageSize] = useState(5);
  const [transactionFilters, setTransactionFilters] = useState({ type: '', restaurantName: '' });
  const [transactionStats, setTransactionStats] = useState({ topUp: 0, payment: 0, total: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [isDepositLoading, setIsDepositLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");

  const [depositData, setDepositData] = useState({
    amount: "",
    description: "",
  });

  const fetchWallets = async (page = 1, search = searchQuery) => {
    try {
      const response = await walletService.getAllWallets({
        page,
        limit: 20,
        restaurantName: search || undefined
      });
      if (response && response.data) {
        setWallets(response.data);
        if (response.pagination) {
          setWalletPagination({
            page: response.pagination.page,
            limit: response.pagination.limit,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch wallets:", error);
    }
  };

  const fetchTransactions = async (page = 1) => {
    try {
      const filters: any = { page, limit: pageSize };
      if (transactionFilters.type) filters.type = transactionFilters.type;
      if (transactionFilters.restaurantName) filters.restaurantName = transactionFilters.restaurantName;
      
      const response = await walletService.getWalletTransactions(filters);
      if (response && response.data) {
        setTransactions(response.data);
        setPagination({
          page: response.pagination?.page || 1,
          limit: response.pagination?.limit || pageSize,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  const fetchTransactionStats = async () => {
    try {
      const topUpResponse = await walletService.getWalletTransactions({ type: 'TOP_UP', limit: 1000 });
      const paymentResponse = await walletService.getWalletTransactions({ type: 'PAYMENT', limit: 1000 });
      
      setTransactionStats({ 
        topUp: topUpResponse?.pagination?.total || 0,
        payment: paymentResponse?.pagination?.total || 0,
        total: (topUpResponse?.pagination?.total || 0) + (paymentResponse?.pagination?.total || 0)
      });
    } catch (error) {
      console.error("Failed to fetch transaction stats:", error);
    }
  };

  const fetchRestaurants = async (search = "") => {
    try {
      const response = await restaurantService.getAllRestaurants({ page: 1, limit: 100, search });
      // Be more resilient with response structure
      const restaurantData = response.data?.restaurants || response.restaurants || (Array.isArray(response.data) ? response.data : []);
      if (restaurantData) {
        setRestaurants(restaurantData);
      }
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setInitialLoading(true);
      try {
        // Load data in parallel for better performance and to ensure one failure doesn't block others
        await Promise.allSettled([
          fetchWallets(1),
          fetchTransactions(1),
          fetchTransactionStats(),
          fetchRestaurants()
        ]);
      } catch (error) {
        console.error("Error in initial data fetch:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    fetchTransactions(1);
  }, [pageSize]);

  const handleTransactionClick = async (transaction: any) => {
    try {
      setSelectedTransaction(transaction);
      setShowTransactionModal(true);
      const response = await walletService.getTransactionById(transaction.id);
      if (response.data) {
        setTransactionDetails(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch transaction details:", error);
      toast.error("Failed to load transaction details");
    }
  };

  const handleDeposit = async () => {
    if (!selectedRestaurantId) {
      toast.error("Please select a restaurant");
      return;
    }

    if (!depositData.amount || parseFloat(depositData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsDepositLoading(true);
    try {
      const response = await walletService.adminDeposit({
        restaurantId: selectedRestaurantId,
        amount: parseFloat(depositData.amount),
        description: depositData.description || "Admin deposit for promotional credit",
      });

      if (response.message) {
        toast.success("Deposit successful!");
        setShowDepositModal(false);
        setDepositData({ amount: "", description: "" });
        setSelectedWallet(null);
        setSelectedRestaurantId("");
        await fetchWallets(1);
        await fetchTransactions(pagination.page);
        await fetchTransactionStats();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process deposit");
    } finally {
      setIsDepositLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "TOP_UP":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case "PAYMENT":
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      case "REFUND":
        return <ArrowUpRight className="h-4 w-4 text-blue-600" />;
      default:
        return <Wallet className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-16 w-16 animate-spin text-green-600" />
      </div>
    );
  }

  const totalBalance = wallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);
  const activeWallets = wallets.filter(wallet => wallet.isActive).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-sm font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-green-700 bg-clip-text text-transparent">
            Deposit Management
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2 text-xs">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Manage restaurant wallet deposits and monitor transactions
          </p>
        </div>
        <Button
          onClick={() => setShowDepositModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl shadow-lg shadow-green-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add New Deposit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="border-none shadow-xl shadow-gray-100 bg-gradient-to-br from-white to-green-50/30 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-100/30 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>
          <CardContent className="p-8">
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-500 tracking-wider">
                  Total Balance
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-gray-900 tracking-tight">
                    {totalBalance.toLocaleString()}
                  </p>
                  <span className="text-sm font-bold text-green-600">RWF</span>
                </div>
              </div>
              <div className="p-4 bg-green-100 rounded-2xl">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-gray-100 bg-gradient-to-br from-white to-blue-50/30 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/30 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>
          <CardContent className="p-8">
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-500 tracking-wider">
                  Active Wallets
                </p>
                <p className="text-3xl font-black text-gray-900 tracking-tight">
                  {activeWallets}
                </p>
              </div>
              <div className="p-4 bg-blue-100 rounded-2xl">
                <Wallet className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-blue-600 font-medium text-xs">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              {((activeWallets / (walletPagination.total || 1)) * 100).toFixed(0)}% of total wallets
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-gray-100 bg-gradient-to-br from-white to-purple-50/30 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100/30 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>
          <CardContent className="p-8">
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-500 tracking-wider">
                  Total Wallets
                </p>
                <p className="text-3xl font-black text-gray-900 tracking-tight">
                  {walletPagination.total}
                </p>
              </div>
              <div className="p-4 bg-purple-100 rounded-2xl">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-gray-500 text-xs font-medium">
              Registered Wallets in system
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-gray-100 bg-gradient-to-br from-white to-green-50/30 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-100/30 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>
          <CardContent className="p-8">
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-500 tracking-wider">
                  Top-ups
                </p>
                <p className="text-3xl font-black text-gray-900 tracking-tight">
                  {transactionStats.topUp}
                </p>
              </div>
              <div className="p-4 bg-green-100 rounded-2xl">
                <ArrowUpRight className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-gray-100 bg-gradient-to-br from-white to-red-50/30 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-100/30 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>
          <CardContent className="p-8">
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-500 tracking-wider">
                  Payments
                </p>
                <p className="text-3xl font-black text-gray-900 tracking-tight">
                  {transactionStats.payment}
                </p>
              </div>
              <div className="p-4 bg-red-100 rounded-2xl">
                <ArrowDownRight className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Wallets Table */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-gray-100 rounded-2xl overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-50 pb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <CardTitle className="text-sm font-bold text-gray-900">Restaurant Wallets</CardTitle>
                <CardDescription className="text-gray-500 mt-1 text-xs">
                  Manage funds and monitor status per restaurant
                </CardDescription>
              </div>
              <div className="relative w-full md:w-80 group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                <Input
                  placeholder="Search by restaurant name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    fetchWallets(1, e.target.value);
                  }}
                  className="pl-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-green-500/20 focus:border-green-500 transition-all"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-xs tracking-wider">Restaurant</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-xs  tracking-wider">Balance</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-xs  tracking-wider">Activity</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600 text-xs  tracking-wider">Status</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-600 text-xs  tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {wallets.map((wallet) => (
                    <tr key={wallet.id} className="hover:bg-green-50/30 transition-colors">
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center text-green-700 font-bold text-lg">
                            {wallet.restaurant?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {wallet.restaurant?.name}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">
                              {wallet.restaurant?.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col">
                          <span className="font-black text-gray-900">{wallet.balance?.toLocaleString()}</span>
                          <span className="text-[10px] text-gray-400 font-bold tracking-tighter">RWF</span>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-sm">
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 w-fit">
                          <ArrowUpRight className="h-3.5 w-3.5" />
                          <span className="font-bold">{wallet._count?.transactions || 0}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        {wallet.isActive ? (
                          <Badge className="bg-green-100/50 text-green-700 border-none px-3 py-1 font-bold rounded-full">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100/50 text-red-700 border-none px-3 py-1 font-bold rounded-full">
                            Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="py-5 px-6 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedRestaurantId(wallet.restaurantId);
                            setShowDepositModal(true);
                          }}
                          className="text-white bg-green-500 hover:text-green-700 hover:bg-green-100 rounded-xl font-bold transition-all"
                        >
                          Deposit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Wallet Pagination */}
            {walletPagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 py-6 border-t border-gray-50">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={walletPagination.page <= 1}
                  onClick={() => fetchWallets(walletPagination.page - 1)}
                  className="rounded-xl px-4 border-gray-200"
                >
                  Previous
                </Button>
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, walletPagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (walletPagination.totalPages <= 5) pageNum = i + 1;
                    else if (walletPagination.page <= 3) pageNum = i + 1;
                    else if (walletPagination.page >= walletPagination.totalPages - 2) pageNum = walletPagination.totalPages - 4 + i;
                    else pageNum = walletPagination.page - 2 + i;

                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === walletPagination.page ? "default" : "ghost"}
                        size="sm"
                        onClick={() => fetchWallets(pageNum)}
                        className={`w-10 h-10 p-0 rounded-xl ${pageNum === walletPagination.page ? 'bg-green-600 shadow-lg shadow-green-200' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={walletPagination.page >= walletPagination.totalPages}
                  onClick={() => fetchWallets(walletPagination.page + 1)}
                  className="rounded-xl px-4 border-gray-200"
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions Column */}
        <div className="space-y-6">
          <Card className="border-none shadow-xl shadow-gray-100 rounded-2xl overflow-hidden h-full">
            <CardHeader className="bg-white border-b border-gray-50 pb-6">
              <CardTitle className="text-sm font-bold text-gray-900">All Transactions</CardTitle>
              <CardDescription className="text-gray-500 text-xs">Complete wallet transaction history</CardDescription>
              
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Select
                  value={transactionFilters.type || 'all'}
                  onValueChange={(value) => {
                    setTransactionFilters(prev => ({ ...prev, type: value === 'all' ? '' : value }));
                    fetchTransactions(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="TOP_UP">Top-up</SelectItem>
                    <SelectItem value="PAYMENT">Payment</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className="w-full sm:w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by restaurant name..."
                    value={transactionFilters.restaurantName}
                    onChange={(e) => {
                      setTransactionFilters(prev => ({ ...prev, restaurantName: e.target.value }));
                      fetchTransactions(1);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <div className="p-4 bg-gray-50 rounded-full mb-4">
                    <Wallet className="h-10 w-10 opacity-20" />
                  </div>
                  <p className="font-medium">No recent transactions</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="group flex items-start gap-4 hover:translate-x-1 transition-transform cursor-pointer"
                      onClick={() => handleTransactionClick(transaction)}
                    >
                      <div className={`p-3 rounded-2xl ${transaction.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} transition-colors`}>
                        {transaction.amount > 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate text-sm">
                          {transaction.description}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-black text-gray-400">
                            {transaction.wallet?.restaurant?.name}
                          </span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-[10px] font-bold text-gray-400">
                            {new Date(transaction.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className={`text-sm font-black ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? "+" : ""}{transaction.amount.toLocaleString()}
                        </span>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  ))}
                  
                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 pt-4 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page <= 1}
                        onClick={() => fetchTransactions(pagination.page - 1)}
                        className="rounded-xl px-4 border-gray-200"
                      >
                        Previous
                      </Button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) pageNum = i + 1;
                          else if (pagination.page <= 3) pageNum = i + 1;
                          else if (pagination.page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                          else pageNum = pagination.page - 2 + i;

                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === pagination.page ? "default" : "ghost"}
                              size="sm"
                              onClick={() => fetchTransactions(pageNum)}
                              className={`w-10 h-10 p-0 rounded-xl ${pageNum === pagination.page ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => fetchTransactions(pagination.page + 1)}
                        className="rounded-xl px-4 border-gray-200"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Deposit Modal */}
      <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
        <DialogContent className="sm:max-w-md bg-white border-none rounded-3xl shadow-2xl overflow-hidden p-0">
          <div className="bg-gradient-to-r from-green-600 to-green-500 p-8 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <DialogHeader className="text-left relative z-10">
              <DialogTitle className="text-2xl font-black tracking-tight">
                Add New Deposit
              </DialogTitle>
              <DialogDescription className="text-green-50/80 font-medium">
                Add promotional credit or top up restaurant wallet manually
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="restaurant" className="text-xs font-bold tracking-wider text-gray-500 ml-1">Select Restaurant</Label>
              <Select
                value={selectedRestaurantId}
                onValueChange={(value) => setSelectedRestaurantId(value)}
              >
                <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:ring-green-500/20">
                  <SelectValue placeholder="Search and select restaurant..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                  <div className="p-2 sticky top-0 bg-white z-10 border-b border-gray-50 mb-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Type to search..."
                        className="h-10 pl-10 bg-gray-50 border-none rounded-lg text-sm"
                        onChange={(e) => fetchRestaurants(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {restaurants.map((res) => (
                      <SelectItem key={res.id} value={res.id} className="rounded-xl mx-1 py-3 focus:bg-green-50 focus:text-green-700 cursor-pointer transition-colors">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-sm tracking-tight">{res.name}</span>
                          <span className="text-[10px] font-medium opacity-60 tracking-wider">{res.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-xs font-bold tracking-wider text-gray-500 ml-1">Amount (RWF)</Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 group-focus-within:text-green-500 transition-colors">
                  RWF
                </div>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  className="h-14 pl-14 text-lg font-black rounded-xl border-gray-100 bg-gray-50/50 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-gray-300"
                  value={depositData.amount}
                  onChange={(e) =>
                    setDepositData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-bold tracking-wider text-gray-500 ml-1">Manual Description</Label>
              <Input
                id="description"
                placeholder="e.g., Seasonal promotion bonus"
                className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:ring-green-500/20 focus:border-green-500 transition-all"
                value={depositData.description}
                onChange={(e) =>
                  setDepositData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter className="p-8 pt-0 flex gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setShowDepositModal(false);
                setSelectedWallet(null);
                setSelectedRestaurantId("");
              }}
              className="flex-1 h-12 rounded-xl font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeposit}
              disabled={isDepositLoading}
              className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition-all active:scale-95 disabled:opacity-70"
            >
              {isDepositLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Plus className="h-5 w-5 mr-2" />
              )}
              Confirm Deposit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Details Modal */}
      <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
        <DialogContent className="sm:max-w-lg bg-white border-none rounded-3xl shadow-2xl overflow-hidden p-0">
          <div className="bg-gradient-to-r from-green-600 to-green-500 p-8 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <DialogHeader className="text-left relative z-10">
              <DialogTitle className="text-2xl font-black tracking-tight">
                Transaction Details
              </DialogTitle>
              <DialogDescription className="text-blue-50/80 font-medium">
                Complete transaction information and metadata
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6">
            {transactionDetails ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold tracking-wider text-gray-500">Amount</p>
                    <p className={`text-2xl font-black ${transactionDetails.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transactionDetails.amount > 0 ? '+' : ''}{transactionDetails.amount?.toLocaleString()} RWF
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold tracking-wider text-gray-500">Status</p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(transactionDetails.status)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-bold tracking-wider text-gray-500">Restaurant</p>
                  <p className="text-lg font-bold text-gray-900">{transactionDetails.wallet?.restaurant?.name}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-bold tracking-wider text-gray-500">Description</p>
                  <p className="text-gray-700">{transactionDetails.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold tracking-wider text-gray-500">Previous Balance</p>
                    <p className="text-gray-900 font-bold">{transactionDetails.previousBalance?.toLocaleString()} RWF</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold tracking-wider text-gray-500">New Balance</p>
                    <p className="text-gray-900 font-bold">{transactionDetails.newBalance?.toLocaleString()} RWF</p>
                  </div>
                </div>
                
                {transactionDetails.paymentMethod && (
                  <div className="space-y-1">
                    <p className="text-xs font-bold tracking-wider text-gray-500">Payment Method</p>
                    <p className="text-gray-700">{transactionDetails.paymentMethod}</p>
                  </div>
                )}
                
                <div className="space-y-1">
                  <p className="text-xs font-bold tracking-wider text-gray-500">Transaction Date</p>
                  <p className="text-gray-700">{new Date(transactionDetails.createdAt).toLocaleString()}</p>
                </div>
                
                {transactionDetails.metadata && (
                  <div className="space-y-1">
                    <p className="text-xs font-bold tracking-wider text-gray-500">Additional Info</p>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      {Object.entries(transactionDetails.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600">{key}:</span>
                          <span className="text-gray-900 font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            )}
          </div>
          <DialogFooter className="p-8 pt-0">
            <Button
              onClick={() => {
                setShowTransactionModal(false);
                setTransactionDetails(null);
              }}
              className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold transition-all"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}