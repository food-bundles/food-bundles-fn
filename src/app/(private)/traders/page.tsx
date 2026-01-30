/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  CreditCard,
  Ticket,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  traderService,
  type TraderDashboard,
  type TraderWallet,
  type TraderTransaction,
} from "@/app/services/traderService";
import { Skeleton } from "@/components/ui/skeleton";
import { TopUpModal } from "./_components/TopUpModal";
import toast from "react-hot-toast";

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-RW", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

export default function TraderDashboardPage() {
  const [dashboardData, setDashboardData] = useState<TraderDashboard | null>(
    null,
  );
  const [wallet, setWallet] = useState<TraderWallet | null>(null);
  const [transactions, setTransactions] = useState<TraderTransaction[]>([]);
  const [transactionsPagination, setTransactionsPagination] = useState({
    page: 1,
    limit: 30,
    total: 0,
    totalPages: 0
  });
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchWallet = async () => {
    try {
      const response = await traderService.getWallet();
      setWallet(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setWallet(null);
      } else {
        console.error("Failed to fetch wallet:", error);
      }
    }
  };

  const fetchTransactions = async (page = 1) => {
    setTransactionsLoading(true);
    try {
      const response = await traderService.getTransactions({ 
        limit: transactionsPagination.limit, 
        page 
      });
      setTransactions(response.data);
      setTransactionsPagination({
        ...transactionsPagination,
        page: response.pagination.page,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      });
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const createWallet = async () => {
    setCreating(true);
    try {
      await traderService.createWallet();
      toast.success("Wallet created successfully");
      await fetchWallet();
    } catch (error) {
      console.error("Failed to create wallet:", error);
      toast.error("Failed to create wallet");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardResponse] = await Promise.all([
          traderService.getDashboardStats(),
          fetchWallet(),
          fetchTransactions(1),
        ]);
        setDashboardData(dashboardResponse.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

    const getReadableTransactionText = (tx: TraderTransaction) => {
      const amount = Math.abs(tx.amount).toLocaleString();
      const currency = "RWF";
      const desc = tx.description.toLowerCase();

      if (desc.includes("commission")) {
        const voucherCode = tx.description.split(" ").pop();
        return (
          <div>
            <p className="text-sm  font-normal">
              You earned a commission of{" "}
              <span className="text-green-500">
                {amount} {currency}
              </span>{" "}
              from voucher {" "}
              <span className="font-semibold text-sm ">{voucherCode}</span>
            </p>
          </div>
        );
      }

      if (desc.includes("loan")) {
        return (
          <div>
            <p className="text-sm font-normal ">
              A loan of{" "}
              <span className="text-blue-500 font-medium">
                {amount} {currency}
              </span>{" "}
              was approved and deducted from your wallet
            </p>
          </div>
        );
      }

      if (tx.amount > 0) {
        return `You received ${amount} ${currency}`;
      }

      return `You spent ${amount} ${currency}`;
    };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[...Array(6)].map((_, i) => {
            const cardColors = [
              "bg-green-50",
              "bg-blue-50",
              "bg-purple-50",
              "bg-orange-50",
              "bg-emerald-50",
              "bg-yellow-50",
            ];
            return (
              <div
                key={i}
                className={`p-4 rounded-lg border ${cardColors[i]} transition-all duration-200`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3 rounded" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <div className="bg-linear-to-r rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-32 " />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-6 w-20 " />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      title: "Wallet Balance",
      value: `${(dashboardData?.walletBalance || 0).toLocaleString()} RWF`,
      icon: Wallet,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Vouchers Approved",
      value: dashboardData?.totalVouchersApproved || 0,
      icon: Ticket,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Vouchers",
      value: dashboardData?.activeVouchers || 0,
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          Digital Food Store Dashboard
        </h1>
        <p className="text-gray-600 text-sm">
          Overview of your Digital Food Store activities and performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => {
          const cardColors = [
            {
              bg: "bg-green-50",
              text: "text-green-600",
              percent: "text-green-600",
            },
            {
              bg: "bg-blue-50",
              text: "text-blue-600",
              percent: "text-blue-600",
            },
            {
              bg: "bg-purple-50",
              text: "text-purple-600",
              percent: "text-purple-600",
            },
            {
              bg: "bg-orange-50",
              text: "text-orange-600",
              percent: "text-orange-600",
            },
            {
              bg: "bg-emerald-50",
              text: "text-emerald-600",
              percent: "text-emerald-600",
            },
            {
              bg: "bg-yellow-50",
              text: "text-yellow-600",
              percent: "text-yellow-600",
            },
          ];
          const colors = cardColors[index % cardColors.length];

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${colors.bg} transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 ${colors.text}`} />
                <div
                  className={`flex items-center gap-1 text-xs ${colors.percent}`}
                >
                  <div className="w-3 h-3">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 14l5-5 5 5z" />
                    </svg>
                  </div>
                  +{(Math.random() * 20).toFixed(1)}%
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-600 font-medium">
                  {stat.title}
                </p>
                <p className={`text-sm font-bold ${colors.text}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Wallet Management Section */}
      {!wallet ? (
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Wallet className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Create Your Wallet</CardTitle>
            <p className="text-gray-600">
              You need to create a wallet to start managing your funds
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={createWallet}
              disabled={creating}
              className="bg-green-600 hover:bg-green-700"
            >
              {creating ? "Creating..." : "Create Wallet"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Wallet Balance Card */}
          <Card className="lg:col-span-2">
            <CardContent>
              <div className="space-y-4">
                <div className="bg-linear-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm">
                        Available Balance
                      </p>
                      <p className="text-3xl font-bold">
                        {wallet.balance.toLocaleString()} {wallet.currency}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-100 text-sm">Status</p>
                      <p className="text-lg font-semibold">
                        {wallet.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-yellow-400">
                    <div className="flex justify-between text-sm text-yellow-100">
                      <span>Wallet Type: Food Store</span>
                      <span>
                        Transactions: {wallet._count?.transactions || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => setShowTopUpModal(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Top Up Wallet
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <ArrowDownRight className="h-4 w-4 mr-2" />
                    Withdraw
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commission Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Commission Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="flex gap-4">
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">Commission Rate</span>
                  </div>
                  <span className="font-semibold text-green-600">5%</span>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs">Orders Processed</span>
                  </div>
                  <span className="font-semibold text-orange-600">
                    {dashboardData?.totalOrdersProcessed || 0}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xs">Total Commission</span>
                </div>
                <span className="font-semibold text-sm text-emerald-600">
                  {(dashboardData?.totalCommissionEarned || 0).toLocaleString()}{" "}
                  Rwf
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xs">Pending Commission</span>
                </div>
                <span className="font-semibold text-sm text-yellow-600">
                  {(dashboardData?.pendingCommission || 0).toLocaleString()} Rwf
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="h-96">
        <CardHeader className="py-3">
          <CardTitle>Account Transactions</CardTitle>
        </CardHeader>
        <CardContent className="h-full flex flex-col pt-0">
          <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: '280px' }}>
            {transactionsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border-b animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 border-b hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          tx.amount > 0 ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        {tx.amount > 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {getReadableTransactionText(tx)}
                        </p>
                        <div className="flex mt-1 gap-4">
                          <p className="text-xs text-gray-500">
                            {formatDateTime(tx.createdAt)}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {tx.status.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No transactions yet</p>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {transactionsPagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <div className="text-sm text-gray-500">
                Showing {((transactionsPagination.page - 1) * transactionsPagination.limit) + 1} to {Math.min(transactionsPagination.page * transactionsPagination.limit, transactionsPagination.total)} of {transactionsPagination.total} transactions
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchTransactions(transactionsPagination.page - 1)}
                  disabled={transactionsPagination.page <= 1 || transactionsLoading}
                >
                  Previous
                </Button>
                <span className="text-sm px-3 py-1 bg-gray-100 rounded">
                  {transactionsPagination.page} of {transactionsPagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchTransactions(transactionsPagination.page + 1)}
                  disabled={transactionsPagination.page >= transactionsPagination.totalPages || transactionsLoading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <TopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onSuccess={() => {
          setShowTopUpModal(false);
          fetchWallet();
          fetchTransactions();
        }}
      />
    </div>
  );
}
