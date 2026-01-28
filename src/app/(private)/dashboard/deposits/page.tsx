/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useWallet } from "@/app/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  CreditCard,
  Smartphone,
  Users,
  DollarSign,
  Search,
  Package,
  Calendar,
  Mail,
  Phone,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { walletService } from "@/app/services/walletService";
import { restaurantService } from "@/app/services/restaurantService";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { DataTable } from "@/components/data-table";
import { TableFilters } from "@/components/filters";
import { createWalletColumns, WalletData } from "./_components/wallet-columns";
import { createTransactionColumns, TransactionData } from "./_components/transaction-columns";
import { createCommonFilters } from "./_components/filter-helpers";
import Image from "next/image";

export default function DepositsManagementPage() {
  const { getMyWallet } = useWallet();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [walletPagination, setWalletPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  });
  const [transactionFilterState, setTransactionFilterState] = useState({
    type: "",
    restaurantName: "",
  });
  const [transactionStats, setTransactionStats] = useState({
    topUp: 0,
    payment: 0,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [depositSearchQuery, setDepositSearchQuery] = useState("");
  const [filteredRestaurants, setFilteredRestaurants] = useState<any[]>([]);
  const [transactionSearchQuery, setTransactionSearchQuery] = useState("");
  const [walletStatusFilter, setWalletStatusFilter] = useState("all");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("all");
  const [transactionStatusFilter, setTransactionStatusFilter] = useState("all");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isOTPLoading, setIsOTPLoading] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [isDepositLoading, setIsDepositLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  const walletFilters = useMemo(() => {
    return [
      createCommonFilters.search(searchQuery, setSearchQuery, "Search restaurants..."),
      createCommonFilters.status(walletStatusFilter, setWalletStatusFilter, [
        { label: "All Status", value: "all" },
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ]),
    ];
  }, [searchQuery, walletStatusFilter]);

  const transactionFilters = useMemo(() => {
    return [
      createCommonFilters.search(transactionSearchQuery, setTransactionSearchQuery, "Search restaurants..."),
      createCommonFilters.type(transactionTypeFilter, setTransactionTypeFilter, [
        { label: "All Types", value: "all" },
        { label: "Top-up", value: "TOP_UP" },
        { label: "Payment", value: "PAYMENT" },
        { label: "Refund", value: "REFUND" },
      ]),
      createCommonFilters.status(transactionStatusFilter, setTransactionStatusFilter, [
        { label: "All Status", value: "all" },
        { label: "Completed", value: "COMPLETED" },
        { label: "Processing", value: "PROCESSING" },
        { label: "Failed", value: "FAILED" },
      ]),
    ];
  }, [transactionSearchQuery, transactionTypeFilter, transactionStatusFilter]);

  const walletColumns = useMemo(() => {
    return createWalletColumns({
      onToggleStatus: (walletId: string, currentStatus: boolean) => {
        handleWalletToggle(walletId, currentStatus);
      },
      onDeposit: (restaurantId: string) => {
        setSelectedRestaurantId(restaurantId);
        setShowDepositModal(true);
      },
      currentPage: walletPagination.page,
      pageSize: 20,
    });
  }, [walletPagination.page]);

  const transactionColumns = useMemo(() => {
    return createTransactionColumns({
      onViewDetails: (transaction: any) => {
        handleTransactionClick(transaction);
      },
      currentPage: pagination.page,
      pageSize: pagination.limit,
    });
  }, [pagination.page, pagination.limit]);

  const [depositData, setDepositData] = useState({
    amount: "",
    description: "",
  });

  const fetchWallets = async (page = 1, search = searchQuery, statusFilter = walletStatusFilter, limit = walletPagination.limit) => {
    try {
      const filters: any = {
        page,
        limit,
        restaurantName: search || undefined,
      };
      
      if (statusFilter !== "all") {
        filters.isActive = statusFilter === "true";
      }

      const response = await walletService.getAllWallets(filters);
      if (response && response.data) {
        setWallets(response.data);
        if (response.pagination) {
          setWalletPagination({
            page: response.pagination.page,
            limit: limit,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch wallets:", error);
    }
  };

  const fetchTransactions = async (
    page = 1,
    search = transactionSearchQuery,
    limit = pagination.limit,
    typeFilter = transactionTypeFilter,
    statusFilter = transactionStatusFilter
  ) => {
    try {
      const filters: any = { page, limit };
      
      if (typeFilter !== "all") {
        filters.type = typeFilter;
      }
      
      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }
      
      if (search) {
        filters.restaurantName = search;
      }

      const response = await walletService.getAllWalletTransactions(filters);
      if (response && response.data) {
        setTransactions(response.data);
        setPagination({
          page: response.pagination?.page || page,
          limit: limit,
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
      const topUpResponse = await walletService.getAllWalletTransactions({
        type: "TOP_UP",
        limit: 1000,
      });
      const paymentResponse = await walletService.getAllWalletTransactions({
        type: "PAYMENT",
        limit: 1000,
      });

      setTransactionStats({
        topUp: topUpResponse?.pagination?.total || 0,
        payment: paymentResponse?.pagination?.total || 0,
        total:
          (topUpResponse?.pagination?.total || 0) +
          (paymentResponse?.pagination?.total || 0),
      });
    } catch (error) {
      console.error("Failed to fetch transaction stats:", error);
    }
  };

  const fetchRestaurants = async (search = "") => {
    try {
      const response = await restaurantService.getAllRestaurants({
        page: 1,
        limit: 100,
        search,
      });
      // Be more resilient with response structure
      const restaurantData =
        response.data?.restaurants ||
        response.restaurants ||
        (Array.isArray(response.data) ? response.data : []);
      if (restaurantData) {
        setRestaurants(restaurantData);
        setFilteredRestaurants(restaurantData);
      }
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
    }
  };

  const handleDepositSearchChange = (value: string) => {
    setDepositSearchQuery(value);
    if (value.trim() === "") {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter(restaurant => 
        restaurant.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    setOrderLoading(true);
    try {
      const cookies = document.cookie.split(";");
      let token = null;
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === "auth-token") {
          token = decodeURIComponent(value);
          break;
        }
      }

      const response = await fetch(`https://server.food.rw/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.data) {
        setOrderDetails(data.data);
        setShowOrderModal(true);
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      toast.error("Failed to load order details");
    } finally {
      setOrderLoading(false);
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
          fetchRestaurants(),
        ]);
      } catch (error) {
        console.error("Error in initial data fetch:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, []);

  // Refetch wallets when filters change
  useEffect(() => {
    if (!initialLoading) {
      fetchWallets(1, searchQuery, walletStatusFilter, walletPagination.limit);
    }
  }, [walletStatusFilter]);

  // Refetch transactions when filters change
  useEffect(() => {
    if (!initialLoading) {
      fetchTransactions(1, transactionSearchQuery, pagination.limit, transactionTypeFilter, transactionStatusFilter);
    }
  }, [transactionTypeFilter, transactionStatusFilter]);



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

  const handleWalletToggle = async (
    walletId: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await walletService.updateWalletStatus(walletId, {
        isActive: !currentStatus,
      });
      if (response.message) {
        toast.success(response.message, {
          duration: 3000,
          style: {
            background: "#dcfce7",
            color: "#166534",
            border: "1px solid #bbf7d0",
            maxWidth: "300px",
          },
        });
        await fetchWallets(walletPagination.page);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update wallet status",
        {
          duration: 4000,
          style: {
            background: "#fef2f2",
            color: "#dc2626",
            border: "1px solid #fecaca",
            maxWidth: "300px",
          },
        }
      );
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
      const response = await walletService.adminDepositRequestOTP({
        restaurantId: selectedRestaurantId,
        amount: parseFloat(depositData.amount),
        description:
          depositData.description || "Admin deposit for promotional credit",
      });

      if (response.requiresOTP && response.sessionId) {
        setSessionId(response.sessionId);
        setShowDepositModal(false);
        setShowOTPModal(true);
        toast.success(response.message || "OTP sent for verification");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to request OTP");
    } finally {
      setIsDepositLoading(false);
    }
  };

  const handleOTPVerification = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsOTPLoading(true);
    try {
      const response = await walletService.adminDepositVerifyOTP({
        otp: otpCode,
        sessionId: sessionId,
      });

      if (response.data?.success) {
        toast.success("Deposit successful!");
        setShowOTPModal(false);
        setOtpCode("");
        setSessionId("");
        setDepositData({ amount: "", description: "" });
        setSelectedRestaurantId("");
        await fetchWallets(1);
        await fetchTransactions(pagination.page);
        await fetchTransactionStats();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to verify OTP");
    } finally {
      setIsOTPLoading(false);
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
      <div className="h-screen flex items-center justify-center">
        <Spinner variant="ring" className="w-10 h-10" />
      </div>
    );
  }

  const totalBalance = wallets.reduce(
    (sum, wallet) => sum + (wallet.balance || 0),
    0
  );
  const activeWallets = wallets.filter((wallet) => wallet.isActive).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-lg font-semibold">Deposit Management</h1>
          <p className="text-xs text-gray-600 mt-1">
            Manage restaurant cash deposits and monitor transactions
          </p>
        </div>
        <Button
          onClick={() => setShowDepositModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          New Deposit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-lg border bg-green-50 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <div className="flex items-center gap-1 text-xs text-green-600">
              <div className="w-3 h-3">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14l5-5 5 5z" />
                </svg>
              </div>
              +12.5%
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600 font-medium">Total Balance</p>
            <p className="text-sm font-bold text-green-600">
              {totalBalance.toLocaleString()} RWF
            </p>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-blue-50 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <div className="w-3 h-3">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14l5-5 5 5z" />
                </svg>
              </div>
              +8.2%
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600 font-medium">Active Cash</p>
            <p className="text-sm font-bold text-blue-600">{activeWallets}</p>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-purple-50 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-purple-600" />
            <div className="flex items-center gap-1 text-xs text-purple-600">
              <div className="w-3 h-3">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14l5-5 5 5z" />
                </svg>
              </div>
              +5.1%
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600 font-medium">Total Cash</p>
            <p className="text-sm font-bold text-purple-600">
              {walletPagination.total}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-green-50 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <ArrowUpRight className="w-5 h-5 text-green-600" />
            <div className="flex items-center gap-1 text-xs text-green-600">
              <div className="w-3 h-3">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 14l5-5 5 5z" />
                </svg>
              </div>
              +15.3%
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600 font-medium">Top-ups</p>
            <p className="text-sm font-bold text-green-600">
              {transactionStats.topUp}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-red-50 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <ArrowDownRight className="w-5 h-5 text-red-600" />
            <div className="flex items-center gap-1 text-xs text-red-600">
              <div className="w-3 h-3">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 10l-5 5-5-5z" />
                </svg>
              </div>
              -3.7%
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-600 font-medium">Payments</p>
            <p className="text-sm font-bold text-red-600">
              {transactionStats.payment}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Wallets Table */}
        <Card className="border-none shadow-xl shadow-gray-100 rounded-2xl overflow-hidden">
          <CardHeader className="bg-white pb-0 ">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Restaurant Wallets
                </CardTitle>
                <CardDescription className="text-xs text-gray-600 mt-1">
                  Manage cash and monitor status per restaurant
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4">
            <DataTable
              columns={walletColumns}
              data={wallets as WalletData[]}
              customFilters={<TableFilters filters={walletFilters} />}
              showSearch={false}
              showExport={true}
              showColumnVisibility={true}
              showPagination={true}
              showRowSelection={false}
              showAddButton={true}
              addButtonLabel="New Deposit"
              onAddButton={() => setShowDepositModal(true)}
              pagination={walletPagination}
              onPaginationChange={(page, limit) => {
                setWalletPagination(prev => ({ ...prev, page, limit }));
                fetchWallets(page, searchQuery, walletStatusFilter, limit);
              }}
              onPageSizeChange={(newPageSize) => {
                setWalletPagination(prev => ({ ...prev, limit: newPageSize, page: 1 }));
                fetchWallets(1, searchQuery, walletStatusFilter, newPageSize);
              }}
            />
          </CardContent>
        </Card>

        {/* All Transactions Table */}
        <Card className="border-none shadow-xl shadow-gray-100 rounded-2xl overflow-hidden">
          <CardHeader className="bg-white  py-0">
            <CardTitle className="text-sm font-semibold">
              All Transactions
            </CardTitle>
            <CardDescription className="text-xs text-gray-600">
              Complete cash transaction history
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4">
            <DataTable
              columns={transactionColumns}
              data={transactions as TransactionData[]}
              customFilters={<TableFilters filters={transactionFilters} />}
              showSearch={false}
              showExport={true}
              showColumnVisibility={true}
              showPagination={true}
              showRowSelection={false}
              showAddButton={false}
              pagination={pagination}
              onPaginationChange={(page, limit) => {
                setPagination(prev => ({ ...prev, page, limit }));
                fetchTransactions(page, transactionSearchQuery, limit, transactionTypeFilter, transactionStatusFilter);
              }}
              onPageSizeChange={(newPageSize) => {
                setPagination(prev => ({ ...prev, limit: newPageSize, page: 1 }));
                fetchTransactions(1, transactionSearchQuery, newPageSize, transactionTypeFilter, transactionStatusFilter);
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Deposit Modal */}
      <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-green-600">Add New Deposit</DialogTitle>
            <DialogDescription>
              Add promotional credit or top up restaurant wallet manually
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleDeposit(); }} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="restaurant">Select Restaurant *</Label>
                <Select
                  value={selectedRestaurantId}
                  onValueChange={(value) => setSelectedRestaurantId(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Search and select restaurant..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-hidden">
                    <div className="sticky top-0 bg-white z-50 p-2 border-b border-gray-50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Type to search..."
                          className="h-10 pl-10 bg-gray-50 border-none rounded-lg text-sm"
                          value={depositSearchQuery}
                          onChange={(e) => handleDepositSearchChange(e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="max-h-[150px] overflow-y-auto">
                      {filteredRestaurants.map((res) => (
                        <SelectItem key={res.id} value={res.id} className="hover:text-green-600 hover:bg-green-50">
                          {res.name}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (RWF) *</Label>
                <Input
                  id="amount"
                  type="number"
                  required
                  placeholder="250000"
                  value={depositData.amount}
                  onChange={(e) => setDepositData(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Admin deposit for promotional credit"
                value={depositData.description}
                onChange={(e) => setDepositData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDepositModal(false);
                  setSelectedRestaurantId("");
                  setDepositData({ amount: "", description: "" });
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isDepositLoading || !selectedRestaurantId || !depositData.amount}
                className="bg-green-600 hover:bg-green-700"
              >
                {isDepositLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Request OTP
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* OTP Verification Modal */}
      <Dialog open={showOTPModal} onOpenChange={setShowOTPModal}>
        <DialogContent className="sm:max-w-md bg-white border-none rounded-3xl shadow-2xl overflow-hidden p-0">
          <div className="bg-green-700 p-8 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <DialogHeader className="text-left relative z-10">
              <DialogTitle className="text-2xl font-black tracking-tight">
                Verify OTP
              </DialogTitle>
              <DialogDescription className="text-green-50/80 font-medium">
                Enter the 6-digit OTP sent to verify the deposit
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="otp"
                className="text-xs font-bold tracking-wider text-gray-500 ml-1"
              >
                OTP Code
              </Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                maxLength={6}
                className="h-14 text-center text-2xl font-black rounded-xl border-gray-100 bg-gray-50/50 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-gray-300 tracking-widest"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>
          <DialogFooter className="p-8 pt-0 flex gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setShowOTPModal(false);
                setOtpCode("");
                setSessionId("");
              }}
              className="flex-1 h-12 rounded-xl font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleOTPVerification}
              disabled={isOTPLoading || otpCode.length !== 6}
              className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition-all active:scale-95 disabled:opacity-70"
            >
              {isOTPLoading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : null}
              Verify & Deposit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Details Modal */}
      <Dialog
        open={showTransactionModal}
        onOpenChange={setShowTransactionModal}
      >
        <DialogContent className="sm:max-w-lg bg-white border-none rounded-3xl shadow-2xl overflow-hidden p-0">
          <div className=" p-8 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <DialogHeader className="text-left relative z-10">
              <DialogTitle className="text-lg font-semibold text-green-600">
                Transaction Details
              </DialogTitle>
              <DialogDescription className="text-xs text-black/50">
                Complete transaction information
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6">
            {transactionDetails ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold tracking-wider text-gray-500">
                      Amount
                    </p>
                    <p
                      className={`text-xs font-black ${
                        transactionDetails.amount > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transactionDetails.amount > 0 ? "+" : ""}
                      {transactionDetails.amount?.toLocaleString()} RWF
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold tracking-wider text-gray-500">
                      Status
                    </p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(transactionDetails.status)}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold tracking-wider text-gray-500">
                    Restaurant
                  </p>
                  <p className="text-xs font-bold text-gray-900">
                    {transactionDetails.wallet?.restaurant?.name} 
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold tracking-wider text-gray-500">
                    Description
                  </p>
                  <p className="text-gray-700 text-xs">
                    {transactionDetails.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold tracking-wider text-gray-500">
                      Previous Balance
                    </p>
                    <p className="text-gray-900 text-xs font-bold">
                      {transactionDetails.previousBalance?.toLocaleString()} RWF
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold tracking-wider text-gray-500">
                      New Balance
                    </p>
                    <p className="text-gray-900 text-xs font-bold">
                      {transactionDetails.newBalance?.toLocaleString()} RWF
                    </p>
                  </div>
                </div>

                {transactionDetails.paymentMethod && (
                  <div className="space-y-1">
                    <p className="text-xs font-bold tracking-wider text-gray-500">
                      Payment Method
                    </p>
                    <p className="text-gray-700 lowercase text-xs">
                      {transactionDetails.paymentMethod}
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-xs font-bold tracking-wider text-gray-500">
                    Transaction Date
                  </p>
                  <p className="text-gray-700 text-xs">
                    {new Date(transactionDetails.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* {transactionDetails.metadata && (
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
                )} */}

                {/* Order Details Button */}
                {transactionDetails.metadata?.orderId && (
                  <div className="pt-4 border-t border-gray-100">
                    <Button
                      onClick={() => {
                        fetchOrderDetails(transactionDetails.metadata.orderId);
                      }}
                      className="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Package className="h-5 w-5 text-sm" />
                      View Order Details
                    </Button>
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

      {/* Order Details Modal */}
      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent className="sm:max-w-2xl bg-white border-none rounded-3xl shadow-2xl overflow-hidden p-0">
          <div className="bg-linear-to-r from-green-600 to-green-500 p-8 text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <DialogHeader className="text-left relative z-10">
              <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-6 w-6" />
                Order Details
              </DialogTitle>
              <DialogDescription className="text-xs text-white">
                Order information with products and totals
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {orderLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : orderDetails ? (
              <>
                {/* Customer Details */}
                <Card className="border-none shadow-xl shadow-gray-100 bg-linear-to-br from-white to-green-50/30">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold mb-3">
                      Customer Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">
                          {orderDetails.billingName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-600">
                          {orderDetails.billingEmail.replace("mailto:", "")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-600">
                          {orderDetails.billingPhone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-600">
                          {new Date(
                            orderDetails.requestedDelivery
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Items */}
                <Card className="border-none shadow-xl shadow-gray-100 rounded-2xl overflow-hidden">
                  <CardHeader className="bg-white border-b border-gray-50 pb-4">
                    <CardTitle className="text-sm font-semibold">
                      Order Items
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-600 mt-1">
                      Products in this order
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {orderDetails.orderItems.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl text-xs"
                        >
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 ">
                            {item.images[0] && (
                              <Image
                                src={item.images[0]}
                                width={40}
                                height={40}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900">
                              {item.productName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.category}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-xs font-bold text-gray-900">
                              {item.quantity} {item.unit}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.unitPrice.toLocaleString()}{" "}
                              {orderDetails.currency} each
                            </p>
                          </div>

                          <div className="text-right min-w-0">
                            <p className="text-xs font-black text-gray-900">
                              {item.subtotal.toLocaleString()}{" "}
                              {orderDetails.currency}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="border-t border-gray-100 pt-3 mt-4 text-xs">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">
                            {orderDetails.orderItems
                              .reduce(
                                (sum: number, item: any) => sum + item.subtotal,
                                0
                              )
                              .toLocaleString()}{" "}
                            {orderDetails.currency}
                          </span>
                        </div>
                        {orderDetails.deliveryFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Delivery Fee</span>
                            <span className="font-medium">
                              {orderDetails.deliveryFee.toLocaleString()}{" "}
                              {orderDetails.currency}
                            </span>
                          </div>
                        )}
                        {orderDetails.packagingFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Packaging Fee</span>
                            <span className="font-medium">
                              {orderDetails.packagingFee.toLocaleString()}{" "}
                              {orderDetails.currency}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-black border-t border-gray-100 pt-2">
                          <span className="text-gray-900 text-xs">Total</span>
                          <span className="text-gray-900">
                            {orderDetails.totalAmount.toLocaleString()}{" "}
                            {orderDetails.currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
          <DialogFooter className="p-8 pt-0">
            <Button
              onClick={() => {
                setShowOrderModal(false);
                setOrderDetails(null);
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
