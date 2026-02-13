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
  Users,
  DollarSign,
  Search,
  Package,
  Calendar,
  Mail,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { walletService } from "@/app/services/walletService";
import { restaurantService } from "@/app/services/restaurantService";
import { traderService } from "@/app/services/traderService";
import { DataTable } from "@/components/data-table";
import { TableFilters } from "@/components/filters";
import { createWalletColumns, WalletData } from "./_components/wallet-columns";
import { createTransactionColumns, TransactionData } from "./_components/transaction-columns";
import { createWithdrawalColumns, WithdrawalData } from "./_components/withdrawal-columns";
import { createDelegationHistoryColumns, DelegationHistoryData } from "./_components/delegation-history-columns";
import { createCommonFilters } from "./_components/filter-helpers";
import { UpdateCommissionModal } from "../users/administration/_components/update-commission-modal";
import { DelegationApprovalModal } from "./_components/DelegationApprovalModal";
import Image from "next/image";

export default function DepositsManagementPage() {
  const { getMyWallet } = useWallet();
  const [restaurantTransactions, setRestaurantTransactions] = useState<any[]>([]);
  const [traderTransactions, setTraderTransactions] = useState<any[]>([]);
  const [restaurantWallets, setRestaurantWallets] = useState<any[]>([]);
  const [traderWallets, setTraderWallets] = useState<any[]>([]);
  const [restaurantPagination, setRestaurantPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  });
  const [traderPagination, setTraderPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  });
  const [restaurantTransactionPagination, setRestaurantTransactionPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  });
  const [traderTransactionPagination, setTraderTransactionPagination] = useState({
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
  const [restaurantSearchQuery, setRestaurantSearchQuery] = useState("");
  const [traderSearchQuery, setTraderSearchQuery] = useState("");
  const [depositSearchQuery, setDepositSearchQuery] = useState("");
  const [filteredRestaurants, setFilteredRestaurants] = useState<any[]>([]);
  const [restaurantTransactionSearchQuery, setRestaurantTransactionSearchQuery] = useState("");
  const [traderTransactionSearchQuery, setTraderTransactionSearchQuery] = useState("");
  const [restaurantStatusFilter, setRestaurantStatusFilter] = useState("all");
  const [traderStatusFilter, setTraderStatusFilter] = useState("all");
  const [restaurantTransactionTypeFilter, setRestaurantTransactionTypeFilter] = useState("all");
  const [traderTransactionTypeFilter, setTraderTransactionTypeFilter] = useState("all");
  const [restaurantTransactionStatusFilter, setRestaurantTransactionStatusFilter] = useState("all");
  const [traderTransactionStatusFilter, setTraderTransactionStatusFilter] = useState("all");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isOTPLoading, setIsOTPLoading] = useState(false);
  const [showOTPSection, setShowOTPSection] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [isDepositLoading, setIsDepositLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [restaurantWalletsLoading, setRestaurantWalletsLoading] = useState(false);
  const [traderWalletsLoading, setTraderWalletsLoading] = useState(false);
  const [restaurantTransactionsLoading, setRestaurantTransactionsLoading] = useState(false);
  const [traderTransactionsLoading, setTraderTransactionsLoading] = useState(false);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [activeWalletTab, setActiveWalletTab] = useState("restaurants");
  const [delegationCode, setDelegationCode] = useState("");
  const [isDelegationLoading, setIsDelegationLoading] = useState(false);
  const [pendingDepositData, setPendingDepositData] = useState<any>(null);
  const [selectedTraderId, setSelectedTraderId] = useState("");
  const [delegationCommission, setDelegationCommission] = useState("2");
  const [showDelegationApprovalModal, setShowDelegationApprovalModal] = useState(false);
  const [delegationTraderId, setDelegationTraderId] = useState("");
  const [delegationCurrentCommission, setDelegationCurrentCommission] = useState(5);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState<any>(null);
  const [showWithdrawRequestsModal, setShowWithdrawRequestsModal] = useState(false);
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
  const [withdrawalPagination, setWithdrawalPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 0 });
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [otpModal, setOtpModal] = useState<{ sessionId: string; withdrawId: string } | null>(null);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [withdrawalTransactions, setWithdrawalTransactions] = useState<any[]>([]);
  const [withdrawalTransactionPagination, setWithdrawalTransactionPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 0 });
  const [withdrawalTransactionsLoading, setWithdrawalTransactionsLoading] = useState(false);
  const [delegationHistory, setDelegationHistory] = useState<any[]>([]);
  const [delegationHistoryLoading, setDelegationHistoryLoading] = useState(false);
  const [delegationHistoryPagination, setDelegationHistoryPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  });
  const [selectedTraderForHistory, setSelectedTraderForHistory] = useState<string | null>(null);

  const restaurantFilters = useMemo(() => {
    return [
      createCommonFilters.search(restaurantSearchQuery, setRestaurantSearchQuery, "Search restaurants..."),
      createCommonFilters.status(restaurantStatusFilter, setRestaurantStatusFilter, [
        { label: "All Status", value: "all" },
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ]),
    ];
  }, [restaurantSearchQuery, restaurantStatusFilter]);

  const traderFilters = useMemo(() => {
    return [
      createCommonFilters.search(traderSearchQuery, setTraderSearchQuery, "Search traders..."),
      createCommonFilters.status(traderStatusFilter, setTraderStatusFilter, [
        { label: "All Status", value: "all" },
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ]),
    ];
  }, [traderSearchQuery, traderStatusFilter]);

  const restaurantTransactionFilters = useMemo(() => {
    return [
      createCommonFilters.search(restaurantTransactionSearchQuery, setRestaurantTransactionSearchQuery, "Search restaurants..."),
      createCommonFilters.type(restaurantTransactionTypeFilter, setRestaurantTransactionTypeFilter, [
        { label: "All Types", value: "all" },
        { label: "Top-up", value: "TOP_UP" },
        { label: "Payment", value: "PAYMENT" },
        { label: "Refund", value: "REFUND" },
      ]),
    ];
  }, [restaurantTransactionSearchQuery, restaurantTransactionTypeFilter]);

  const traderTransactionFilters = useMemo(() => {
    return [
      createCommonFilters.search(traderTransactionSearchQuery, setTraderTransactionSearchQuery, "Search traders..."),
      createCommonFilters.type(traderTransactionTypeFilter, setTraderTransactionTypeFilter, [
        { label: "All Types", value: "all" },
        { label: "Top-up", value: "TOP_UP" },
        { label: "Payment", value: "PAYMENT" },
        { label: "Refund", value: "REFUND" },
      ]),
    ];
  }, [traderTransactionSearchQuery, traderTransactionTypeFilter]);

  const restaurantColumns = useMemo(() => {
    return createWalletColumns({
      onToggleStatus: (walletId: string, currentStatus: boolean) => {
        handleWalletToggle(walletId, currentStatus);
      },
      onDeposit: (restaurantId: string) => {
        setSelectedRestaurantId(restaurantId);
        setShowDepositModal(true);
      },
      currentPage: restaurantPagination.page,
      pageSize: 20,
      walletType: "restaurant",
    });
  }, [restaurantPagination.page]);

  const traderColumns = useMemo(() => {
    return createWalletColumns({
      onToggleStatus: (walletId: string, currentStatus: boolean) => {
        handleWalletToggle(walletId, currentStatus);
      },
      onDeposit: (restaurantId: string) => {
        setSelectedRestaurantId(restaurantId);
        setShowDepositModal(true);
      },
      onApproveDelegation: (traderId: string, currentCommission: number) => {
        setDelegationTraderId(traderId);
        setDelegationCurrentCommission(currentCommission);
        setShowDelegationApprovalModal(true);
      },
      onRevokeDelegation: async (traderId: string) => {
        try {
          await traderService.revokeDelegation(traderId);
          toast.success("Delegation revoked successfully");
          await fetchTraderWallets(traderPagination.page);
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Failed to revoke delegation");
        }
      },
      onUpdateCommission: (traderId: string) => {
        const trader = traderWallets.find(w => w.traderId === traderId)?.trader;
        if (trader) {
          setSelectedTrader({ id: traderId, username: trader.username, role: "TRADER" });
          setShowCommissionModal(true);
        }
      },
      onViewHistory: (traderId: string) => {
        setSelectedTraderForHistory(traderId);
        fetchDelegationHistory(1, delegationHistoryPagination.limit, traderId);
      },
      currentPage: traderPagination.page,
      pageSize: 20,
      walletType: "trader",
    });
  }, [traderPagination.page, traderWallets]);

  const restaurantTransactionColumns = useMemo(() => {
    return createTransactionColumns({
      onViewDetails: (transaction: any) => {
        handleTransactionClick(transaction);
      },
      currentPage: restaurantTransactionPagination.page,
      pageSize: restaurantTransactionPagination.limit,
      walletType: "restaurant",
    });
  }, [restaurantTransactionPagination.page, restaurantTransactionPagination.limit]);

  const traderTransactionColumns = useMemo(() => {
    return createTransactionColumns({
      onViewDetails: (transaction: any) => {
        handleTransactionClick(transaction);
      },
      currentPage: traderTransactionPagination.page,
      pageSize: traderTransactionPagination.limit,
      walletType: "trader",
    });
  }, [traderTransactionPagination.page, traderTransactionPagination.limit]);

  const withdrawalColumns = useMemo(() => {
    return createWithdrawalColumns({
      onApprove: (withdrawId: string) => {
        setActionLoading(withdrawId);
        traderService.approveWithdrawal(withdrawId)
          .then((response) => {
            toast.success(response.message || "OTP sent to trader");
            setOtpModal({ sessionId: response.sessionId, withdrawId });
          })
          .catch((error: any) => {
            toast.error(error.response?.data?.message || "Failed to approve withdrawal");
          })
          .finally(() => {
            setActionLoading(null);
          });
      },
      onCancel: (withdrawId: string) => {
        setActionLoading(withdrawId);
        traderService.cancelWithdrawal(withdrawId)
          .then((response) => {
            toast.success(response.message || "Withdrawal cancelled");
            fetchWithdrawalRequests(withdrawalPagination.page);
          })
          .catch((error: any) => {
            toast.error(error.response?.data?.message || "Failed to cancel withdrawal");
          })
          .finally(() => {
            setActionLoading(null);
          });
      },
      onViewTrader: (withdrawal: any) => {
        setSelectedWithdrawal(withdrawal);
        fetchWithdrawalTransactions(1, withdrawal.wallet?.trader?.username || "");
      },
      actionLoading,
    });
  }, [actionLoading, withdrawalPagination.page]);

  const withdrawalTransactionColumns = useMemo(() => {
    return createTransactionColumns({
      onViewDetails: (transaction: any) => {
        handleTransactionClick(transaction);
      },
      currentPage: withdrawalTransactionPagination.page,
      pageSize: withdrawalTransactionPagination.limit,
      walletType: "trader",
    });
  }, [withdrawalTransactionPagination.page, withdrawalTransactionPagination.limit]);

  const delegationHistoryColumns = useMemo(() => {
    return createDelegationHistoryColumns();
  }, []);

  const [depositData, setDepositData] = useState({
    amount: "",
    description: "",
  });

  const handleApproveWithdrawal = async (withdrawId: string) => {
    setActionLoading(withdrawId);
    try {
      const response = await traderService.approveWithdrawal(withdrawId);
      toast.success(response.message || "OTP sent to trader");
      setOtpModal({ sessionId: response.sessionId, withdrawId });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve withdrawal");
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || !otpModal) return;
    setVerifying(true);
    try {
      const response = await traderService.verifyWithdrawalOTP({ sessionId: otpModal.sessionId, otp });
      toast.success(response.message || "Withdrawal completed successfully");
      setOtpModal(null);
      setOtp("");
      fetchWithdrawalRequests(withdrawalPagination.page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifying(false);
    }
  };

  const handleCancelWithdrawal = async (withdrawId: string) => {
    setActionLoading(withdrawId);
    try {
      const response = await traderService.cancelWithdrawal(withdrawId);
      toast.success(response.message || "Withdrawal cancelled");
      fetchWithdrawalRequests(withdrawalPagination.page);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel withdrawal");
    } finally {
      setActionLoading(null);
    }
  };

  const fetchDelegationHistory = async (page = 1, limit = 5, traderId?: string) => {
    setDelegationHistoryLoading(true);
    try {
      const filters: any = { page, limit };
      if (traderId) {
        filters.traderId = traderId;
      }
      const response = await traderService.getAllDelegationHistory(filters);
      if (response && response.data) {
        setDelegationHistory(response.data);
        if (response.pagination) {
          setDelegationHistoryPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error("Failed to fetch delegation history:", error);
    } finally {
      setDelegationHistoryLoading(false);
    }
  };

  const fetchRestaurantWallets = async (page = 1, search = restaurantSearchQuery, statusFilter = restaurantStatusFilter, limit = restaurantPagination.limit) => {
    try {
      const filters: any = {
        page,
        limit,
      };
      
      if (search) {
        filters.search = search;
      }
      
      if (statusFilter !== "all") {
        filters.isActive = statusFilter === "true";
      }

      const response = await walletService.getRestaurantWallets(filters);
      if (response && response.data) {
        setRestaurantWallets(response.data);
        if (response.pagination) {
          setRestaurantPagination({
            page: response.pagination.page,
            limit: limit,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch restaurant wallets:", error);
    } finally {
      setRestaurantWalletsLoading(false);
    }
  };

  const fetchTraderWallets = async (page = 1, search = traderSearchQuery, statusFilter = traderStatusFilter, limit = traderPagination.limit) => {
    setTraderWalletsLoading(true);
    try {
      const filters: any = {
        page,
        limit,
      };
      
      if (search) {
        filters.search = search;
      }
      
      if (statusFilter !== "all") {
        filters.isActive = statusFilter === "true";
      }

      const response = await walletService.getTraderWallets(filters);
      if (response && response.data) {
        setTraderWallets(response.data);
        if (response.pagination) {
          setTraderPagination({
            page: response.pagination.page,
            limit: limit,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch trader wallets:", error);
    } finally {
      setTraderWalletsLoading(false);
    }
  };

  const fetchRestaurantTransactions = async (
    page = 1,
    search = restaurantTransactionSearchQuery,
    limit = restaurantTransactionPagination.limit,
    typeFilter = restaurantTransactionTypeFilter,
    statusFilter = restaurantTransactionStatusFilter
  ) => {
    setRestaurantTransactionsLoading(true);
    try {
      const filters: any = { page, limit };
      
      if (typeFilter !== "all") {
        filters.type = typeFilter;
      }
      
      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }
      
      if (search) {
        filters.search = search;
      }

      const response = await walletService.getRestaurantTransactions(filters);
      
      if (response && response.data) {
        setRestaurantTransactions(response.data);
        setRestaurantTransactionPagination({
          page: response.pagination?.page || page,
          limit: limit,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch restaurant transactions:", error);
    } finally {
      setRestaurantTransactionsLoading(false);
    }
  };

  const fetchTraderTransactions = async (
    page = 1,
    search = traderTransactionSearchQuery,
    limit = traderTransactionPagination.limit,
    typeFilter = traderTransactionTypeFilter,
    statusFilter = traderTransactionStatusFilter
  ) => {
    setTraderTransactionsLoading(true);
    try {
      const filters: any = { page, limit };
      
      if (typeFilter !== "all") {
        filters.type = typeFilter;
      }
      
      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }
      
      if (search) {
        filters.search = search;
      }

      const response = await walletService.getTraderTransactions(filters);
      
      if (response && response.data) {
        setTraderTransactions(response.data);
        setTraderTransactionPagination({
          page: response.pagination?.page || page,
          limit: limit,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch trader transactions:", error);
    } finally {
      setTraderTransactionsLoading(false);
    }
  };

  const fetchWithdrawalRequests = async (page = 1, limit = withdrawalPagination.limit) => {
    setWithdrawalLoading(true);
    try {
      const response = await traderService.getAllWithdrawRequests({ page, limit });
      setWithdrawalRequests(response.data);
      setWithdrawalPagination(response.pagination);
    } catch (error) {
      console.error("Failed to fetch withdrawal requests:", error);
    } finally {
      setWithdrawalLoading(false);
    }
  };

  const fetchWithdrawalTransactions = async (page = 1, search = "", limit = withdrawalTransactionPagination.limit) => {
    setWithdrawalTransactionsLoading(true);
    try {
      const filters: any = { page, limit, type: "WITHDRAWAL" };
      if (search) filters.search = search;
      const response = await walletService.getTraderTransactions(filters);
      if (response && response.data) {
        setWithdrawalTransactions(response.data);
        setWithdrawalTransactionPagination({
          page: response.pagination?.page || page,
          limit: limit,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch withdrawal transactions:", error);
    } finally {
      setWithdrawalTransactionsLoading(false);
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
        await Promise.allSettled([
          fetchRestaurantWallets(1),
          fetchTraderWallets(1),
          fetchRestaurantTransactions(1),
          fetchTraderTransactions(1),
          fetchTransactionStats(),
          fetchRestaurants(),
          fetchDelegationHistory(1),
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
    if (activeWalletTab === "withdrawals") {
      fetchWithdrawalRequests(1);
      fetchWithdrawalTransactions(1);
    }
  }, [activeWalletTab]);

  // Refetch restaurant wallets when search query changes
  useEffect(() => {
    if (!initialLoading) {
      const timeoutId = setTimeout(() => {
        fetchRestaurantWallets(1, restaurantSearchQuery, restaurantStatusFilter, restaurantPagination.limit);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [restaurantSearchQuery]);

  // Refetch restaurant wallets when filters change
  useEffect(() => {
    if (!initialLoading) {
      fetchRestaurantWallets(1, restaurantSearchQuery, restaurantStatusFilter, restaurantPagination.limit);
    }
  }, [restaurantStatusFilter]);

  // Refetch trader wallets when search query changes
  useEffect(() => {
    if (!initialLoading) {
      const timeoutId = setTimeout(() => {
        fetchTraderWallets(1, traderSearchQuery, traderStatusFilter, traderPagination.limit);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [traderSearchQuery]);

  // Refetch trader wallets when filters change
  useEffect(() => {
    if (!initialLoading) {
      fetchTraderWallets(1, traderSearchQuery, traderStatusFilter, traderPagination.limit);
    }
  }, [traderStatusFilter]);

  // Refetch restaurant transactions when search query changes
  useEffect(() => {
    if (!initialLoading) {
      const timeoutId = setTimeout(() => {
        fetchRestaurantTransactions(1, restaurantTransactionSearchQuery, restaurantTransactionPagination.limit, restaurantTransactionTypeFilter, restaurantTransactionStatusFilter);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [restaurantTransactionSearchQuery]);

  // Refetch restaurant transactions when filters change
  useEffect(() => {
    if (!initialLoading) {
      fetchRestaurantTransactions(1, restaurantTransactionSearchQuery, restaurantTransactionPagination.limit, restaurantTransactionTypeFilter, restaurantTransactionStatusFilter);
    }
  }, [restaurantTransactionTypeFilter, restaurantTransactionStatusFilter]);

  // Refetch trader transactions when search query changes
  useEffect(() => {
    if (!initialLoading) {
      const timeoutId = setTimeout(() => {
        fetchTraderTransactions(1, traderTransactionSearchQuery, traderTransactionPagination.limit, traderTransactionTypeFilter, traderTransactionStatusFilter);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [traderTransactionSearchQuery]);

  // Refetch trader transactions when filters change
  useEffect(() => {
    if (!initialLoading) {
      fetchTraderTransactions(1, traderTransactionSearchQuery, traderTransactionPagination.limit, traderTransactionTypeFilter, traderTransactionStatusFilter);
    }
  }, [traderTransactionTypeFilter, traderTransactionStatusFilter]);



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
        await fetchRestaurantWallets(restaurantPagination.page);
        await fetchTraderWallets(traderPagination.page);
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
        description: depositData.description || "Admin deposit for promotional credit",
      });

      if (response.requiresOTP && response.sessionId) {
        setSessionId(response.sessionId);
        setShowOTPSection(true);
        toast.success(response.message || "OTP sent for verification");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to request OTP");
    } finally {
      setIsDepositLoading(false);
    }
  };

  const handleDelegationApproval = async () => {
    if (!selectedTraderId) {
      toast.error("Trader ID is required");
      return;
    }

    if (!delegationCommission || parseFloat(delegationCommission) <= 0) {
      toast.error("Please enter a valid commission rate");
      return;
    }

    setIsDelegationLoading(true);
    try {
      await traderService.approveDelegation(selectedTraderId, parseFloat(delegationCommission));
      toast.success("Delegation approved successfully");
      // setShowDelegationModal(false);
      setDelegationCode("");
      setSelectedTraderId("");
      setDelegationCommission("2");
      await proceedWithDeposit();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve delegation");
    } finally {
      setIsDelegationLoading(false);
    }
  };

  const proceedWithDeposit = async () => {
    if (!pendingDepositData) return;

    setIsDepositLoading(true);
    try {
      const response = await walletService.adminDepositRequestOTP(pendingDepositData);

      if (response.requiresOTP && response.sessionId) {
        setSessionId(response.sessionId);
        toast.success(response.message || "OTP sent for verification");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to request OTP");
    } finally {
      setIsDepositLoading(false);
      setPendingDepositData(null);
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
        setShowDepositModal(false);
        setShowOTPSection(false);
        setOtpCode("");
        setSessionId("");
        setDepositData({ amount: "", description: "" });
        setSelectedRestaurantId("");
        await fetchRestaurantWallets(1);
        await fetchTraderWallets(1);
        await fetchRestaurantTransactions(restaurantTransactionPagination.page);
        await fetchTraderTransactions(traderTransactionPagination.page);
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

  const totalBalance = [...restaurantWallets, ...traderWallets].reduce(
    (sum, wallet) => sum + (wallet.balance || 0),
    0
  );
  const activeWallets = [...restaurantWallets, ...traderWallets].filter((wallet) => wallet.isActive).length;

  return (
    <div className="p-6 space-y-6">
      {initialLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg border bg-gray-50">
              <div className="h-5 bg-gray-200 rounded w-16 animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse mb-1"></div>
              <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : (
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
                {restaurantPagination.total + traderPagination.total}
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
      )}

      {/* Data tables with flex layout */}
      <Card className="border-none shadow-xl shadow-gray-100 rounded-md space-y-0 overflow-hidden h-[600px]">
        <CardHeader className="bg-white pb-0 shrink-0">
          <CardTitle className="text-sm font-semibold">
            <div className="mx-4 shrink-0">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => {
                    setActiveWalletTab("restaurants");
                    setSelectedTraderForHistory(null);
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeWalletTab === "restaurants"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Restaurant Wallets
                </button>
                <button
                  onClick={() => {
                    setActiveWalletTab("traders");
                    setSelectedTraderForHistory(null);
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeWalletTab === "traders"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Trader Wallets
                </button>
                <button
                  onClick={() => setActiveWalletTab("withdrawals")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeWalletTab === "withdrawals"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Withdrawals
                </button>
              </nav>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-full flex flex-col">
          <div className="flex flex-col lg:flex-row h-full">
            {/* Left side - Wallets with tabs */}
            <div className="w-full lg:w-1/2 lg:border-r border-gray-200 flex flex-col">
              <div className="p-4 border-gray-200 flex-shrink-0">
                <p className="text-sm text-gray-600">
                  {activeWalletTab === "restaurants" ? "Restaurant" : "Trader"} Wallets
                </p>
              </div>

              {activeWalletTab === "restaurants" && (
                <div className="flex-1 overflow-hidden px-4">
                  <div className="h-full pb-10 overflow-x-auto overflow-y-auto">
                    <DataTable
                      columns={restaurantColumns}
                      data={restaurantWallets as WalletData[]}
                      customFilters={
                        <TableFilters filters={restaurantFilters} />
                      }
                      showSearch={false}
                      showExport={true}
                      showColumnVisibility={false}
                      showPagination={true}
                      showRowSelection={false}
                      showAddButton={true}
                      addButtonLabel="New Deposit"
                      onAddButton={() => setShowDepositModal(true)}
                      pagination={restaurantPagination}
                      isLoading={restaurantWalletsLoading}
                      onPaginationChange={(page, limit) => {
                        setRestaurantPagination((prev) => ({
                          ...prev,
                          page,
                          limit,
                        }));
                        fetchRestaurantWallets(
                          page,
                          restaurantSearchQuery,
                          restaurantStatusFilter,
                          limit,
                        );
                      }}
                      onPageSizeChange={(newPageSize) => {
                        setRestaurantPagination((prev) => ({
                          ...prev,
                          limit: newPageSize,
                          page: 1,
                        }));
                        fetchRestaurantWallets(
                          1,
                          restaurantSearchQuery,
                          restaurantStatusFilter,
                          newPageSize,
                        );
                      }}
                    />
                  </div>
                </div>
              )}

              {activeWalletTab === "traders" && (
                <div className="flex-1 overflow-hidden px-4">
                  <div className="h-full pb-10 overflow-x-auto overflow-y-auto">
                    <DataTable
                      columns={traderColumns}
                      data={traderWallets as WalletData[]}
                      customFilters={<TableFilters filters={traderFilters} />}
                      showSearch={false}
                      showExport={true}
                      showColumnVisibility={false}
                      showPagination={true}
                      showRowSelection={false}
                      showAddButton={false}
                      pagination={traderPagination}
                      isLoading={traderWalletsLoading}
                      onPaginationChange={(page, limit) => {
                        setTraderPagination((prev) => ({
                          ...prev,
                          page,
                          limit,
                        }));
                        fetchTraderWallets(
                          page,
                          traderSearchQuery,
                          traderStatusFilter,
                          limit,
                        );
                      }}
                      onPageSizeChange={(newPageSize) => {
                        setTraderPagination((prev) => ({
                          ...prev,
                          limit: newPageSize,
                          page: 1,
                        }));
                        fetchTraderWallets(
                          1,
                          traderSearchQuery,
                          traderStatusFilter,
                          newPageSize,
                        );
                      }}
                    />
                  </div>
                </div>
              )}

              {activeWalletTab === "withdrawals" && (
                <div className="flex-1 overflow-hidden px-4">
                  <div className="h-full pb-10 overflow-x-auto overflow-y-auto">
                    <DataTable
                      columns={withdrawalColumns}
                      data={withdrawalRequests as WithdrawalData[]}
                      showSearch={false}
                      showExport={true}
                      showColumnVisibility={false}
                      showPagination={true}
                      showRowSelection={false}
                      showAddButton={false}
                      pagination={withdrawalPagination}
                      isLoading={withdrawalLoading}
                      onPaginationChange={(page, limit) => {
                        setWithdrawalPagination((prev) => ({ ...prev, page, limit }));
                        fetchWithdrawalRequests(page, limit);
                      }}
                      onPageSizeChange={(newPageSize) => {
                        setWithdrawalPagination((prev) => ({ ...prev, limit: newPageSize, page: 1 }));
                        fetchWithdrawalRequests(1, newPageSize);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right side - Transactions or Delegation History */}
            <div className="w-full lg:w-1/2 flex flex-col">
              <div className="p-4 border-gray-200 flex-shrink-0">
                <p className="text-sm text-gray-600">
                  {selectedTraderForHistory 
                    ? "Delegation History" 
                    : activeWalletTab === "withdrawals" 
                    ? "Trader Transactions" 
                    : activeWalletTab === "restaurants" 
                    ? "Restaurant Transactions" 
                    : "Trader Transactions"}
                </p>
                {selectedTraderForHistory && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTraderForHistory(null)}
                    className="text-xs mt-2"
                  >
                    ← Back to Transactions
                  </Button>
                )}
              </div>

              {selectedTraderForHistory && activeWalletTab === "traders" && (
                <div className="flex-1 overflow-hidden px-4">
                  <div className="h-full pb-10 overflow-x-auto overflow-y-auto">
                    <DataTable
                      columns={delegationHistoryColumns}
                      data={delegationHistory as DelegationHistoryData[]}
                      showSearch={false}
                      showExport={false}
                      showColumnVisibility={false}
                      showPagination={true}
                      showRowSelection={false}
                      showAddButton={false}
                      pagination={delegationHistoryPagination}
                      isLoading={delegationHistoryLoading}
                      onPaginationChange={(page, limit) => {
                        setDelegationHistoryPagination((prev) => ({ ...prev, page, limit }));
                        fetchDelegationHistory(page, limit, selectedTraderForHistory || undefined);
                      }}
                      onPageSizeChange={(newPageSize) => {
                        setDelegationHistoryPagination((prev) => ({
                          ...prev,
                          limit: newPageSize,
                          page: 1,
                        }));
                        fetchDelegationHistory(1, newPageSize, selectedTraderForHistory || undefined);
                      }}
                    />
                  </div>
                </div>
              )}

              {activeWalletTab === "restaurants" && (
                <div className="flex-1 overflow-hidden px-4">
                  <div className="h-full pb-10 overflow-x-auto overflow-y-auto">
                    <DataTable
                      columns={restaurantTransactionColumns}
                      data={restaurantTransactions as TransactionData[]}
                      customFilters={
                        <TableFilters filters={restaurantTransactionFilters} />
                      }
                      showSearch={false}
                      showExport={true}
                      showColumnVisibility={false}
                      showPagination={true}
                      showRowSelection={false}
                      showAddButton={false}
                      pagination={restaurantTransactionPagination}
                      isLoading={restaurantTransactionsLoading}
                      onPaginationChange={(page, limit) => {
                        setRestaurantTransactionPagination((prev) => ({ ...prev, page, limit }));
                        fetchRestaurantTransactions(
                          page,
                          restaurantTransactionSearchQuery,
                          limit,
                          restaurantTransactionTypeFilter,
                          restaurantTransactionStatusFilter,
                        );
                      }}
                      onPageSizeChange={(newPageSize) => {
                        setRestaurantTransactionPagination((prev) => ({
                          ...prev,
                          limit: newPageSize,
                          page: 1,
                        }));
                        fetchRestaurantTransactions(
                          1,
                          restaurantTransactionSearchQuery,
                          newPageSize,
                          restaurantTransactionTypeFilter,
                          restaurantTransactionStatusFilter,
                        );
                      }}
                    />
                  </div>
                </div>
              )}

              {activeWalletTab === "traders" && !selectedTraderForHistory && (
                <div className="flex-1 overflow-hidden px-4">
                  <div className="h-full pb-10 overflow-x-auto overflow-y-auto">
                    <DataTable
                      columns={traderTransactionColumns}
                      data={traderTransactions as TransactionData[]}
                      customFilters={
                        <TableFilters filters={traderTransactionFilters} />
                      }
                      showSearch={false}
                      showExport={true}
                      showColumnVisibility={false}
                      showPagination={true}
                      showRowSelection={false}
                      showAddButton={false}
                      pagination={traderTransactionPagination}
                      isLoading={traderTransactionsLoading}
                      onPaginationChange={(page, limit) => {
                        setTraderTransactionPagination((prev) => ({ ...prev, page, limit }));
                        fetchTraderTransactions(
                          page,
                          traderTransactionSearchQuery,
                          limit,
                          traderTransactionTypeFilter,
                          traderTransactionStatusFilter,
                        );
                      }}
                      onPageSizeChange={(newPageSize) => {
                        setTraderTransactionPagination((prev) => ({
                          ...prev,
                          limit: newPageSize,
                          page: 1,
                        }));
                        fetchTraderTransactions(
                          1,
                          traderTransactionSearchQuery,
                          newPageSize,
                          traderTransactionTypeFilter,
                          traderTransactionStatusFilter,
                        );
                      }}
                    />
                  </div>
                </div>
              )}

              {activeWalletTab === "withdrawals" && (
                <div className="flex-1 overflow-hidden px-4">
                  <div className="h-full pb-10 overflow-x-auto overflow-y-auto">
                    <DataTable
                      columns={withdrawalTransactionColumns}
                      data={withdrawalTransactions as TransactionData[]}
                      showSearch={false}
                      showExport={true}
                      showColumnVisibility={false}
                      showPagination={true}
                      showRowSelection={false}
                      showAddButton={false}
                      pagination={withdrawalTransactionPagination}
                      isLoading={withdrawalTransactionsLoading}
                      onPaginationChange={(page, limit) => {
                        setWithdrawalTransactionPagination((prev) => ({ ...prev, page, limit }));
                        fetchWithdrawalTransactions(page, selectedWithdrawal?.wallet?.trader?.username || "", limit);
                      }}
                      onPageSizeChange={(newPageSize) => {
                        setWithdrawalTransactionPagination((prev) => ({ ...prev, limit: newPageSize, page: 1 }));
                        fetchWithdrawalTransactions(1, selectedWithdrawal?.wallet?.trader?.username || "", newPageSize);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deposit Modal */}
      <Dialog open={showDepositModal} onOpenChange={(open) => {
        setShowDepositModal(open);
        if (!open) {
          setShowOTPSection(false);
          setOtpCode("");
          setSessionId("");
          setSelectedRestaurantId("");
          setDepositData({ amount: "", description: "" });
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-green-700">
              {showOTPSection ? "Verify OTP" : "Add New Deposit"}
            </DialogTitle>
            <DialogDescription>
              {showOTPSection 
                ? "Enter the 6-digit OTP sent to complete the deposit"
                : "Add promotional credit or top up restaurant wallet manually"}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (showOTPSection) {
                handleOTPVerification();
              } else {
                handleDeposit();
              }
            }}
            className="space-y-6"
          >
            {!showOTPSection && (
              <>
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
                              onChange={(e) =>
                                handleDepositSearchChange(e.target.value)
                              }
                              onKeyDown={(e) => e.stopPropagation()}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <div className="max-h-[150px] overflow-y-auto">
                          {filteredRestaurants.map((res) => (
                            <SelectItem
                              key={res.id}
                              value={res.id}
                              className="hover:text-green-600 hover:bg-green-50"
                            >
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
                      onChange={(e) =>
                        setDepositData((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Admin deposit for promotional credit"
                    value={depositData.description}
                    onChange={(e) =>
                      setDepositData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            )}

            {showOTPSection && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-medium">
                    OTP Code *
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    className="h-14 text-center text-xl font-bold tracking-widest"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDepositModal(false);
                  setShowOTPSection(false);
                  setOtpCode("");
                  setSessionId("");
                  setSelectedRestaurantId("");
                  setDepositData({ amount: "", description: "" });
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  showOTPSection
                    ? isOTPLoading || otpCode.length !== 6
                    : isDepositLoading || !selectedRestaurantId || !depositData.amount
                }
                className="bg-green-600 hover:bg-green-700"
              >
                {(isDepositLoading || isOTPLoading) ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {showOTPSection ? "Complete Top-up" : "Request OTP"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delegation Approval Modal */}
      <DelegationApprovalModal
        isOpen={showDelegationApprovalModal}
        onClose={() => setShowDelegationApprovalModal(false)}
        traderId={delegationTraderId}
        currentCommission={delegationCurrentCommission}
        onSuccess={async () => {
          await fetchTraderWallets(traderPagination.page);
        }}
      />



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
                    {activeWalletTab === "restaurants"
                      ? "Restaurant"
                      : "Trader"}
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-900">
                      {activeWalletTab === "restaurants"
                        ? transactionDetails.wallet?.restaurant?.name
                        : transactionDetails.wallet?.trader?.email}
                    </p>
                    {activeWalletTab === "traders" &&
                      transactionDetails.wallet?.trader?.phone && (
                        <p className="text-xs text-gray-500">
                          {transactionDetails.wallet.trader.phone}
                        </p>
                      )}
                  </div>
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
                            orderDetails.requestedDelivery,
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
                                0,
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

      {/* Update Commission Modal */}
      <UpdateCommissionModal
        admin={selectedTrader}
        open={showCommissionModal}
        onOpenChange={setShowCommissionModal}
        onUpdate={() => {
          fetchTraderWallets(traderPagination.page);
        }}
      />

      {/* OTP Verification Modal for Withdrawals */}
      <Dialog open={!!otpModal} onOpenChange={() => { setOtpModal(null); setOtp(""); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify OTP</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Enter the OTP sent to the trader</p>
            <div>
              <Label htmlFor="otp">OTP Code</Label>
              <Input
                id="otp"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setOtpModal(null); setOtp(""); }} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleVerifyOTP} disabled={verifying || otp.length !== 6} className="flex-1 bg-green-600 hover:bg-green-700">
                {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
