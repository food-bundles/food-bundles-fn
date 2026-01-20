/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, CreditCard, Ticket, ShoppingCart, TrendingUp, Users, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { traderService, type TraderDashboard, type TraderWallet, type TraderTransaction } from "@/app/services/traderService";
import { Skeleton } from "@/components/ui/skeleton";
import { TopUpModal } from "./wallet/_components/TopUpModal";
import toast from "react-hot-toast";

export default function TraderDashboardPage() {
  const [dashboardData, setDashboardData] = useState<TraderDashboard | null>(null);
  const [wallet, setWallet] = useState<TraderWallet | null>(null);
  const [transactions, setTransactions] = useState<TraderTransaction[]>([]);
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

  const fetchTransactions = async () => {
    try {
      const response = await traderService.getTransactions({ limit: 5 });
      setTransactions(response.data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
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
          fetchTransactions(),
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
              "bg-green-50", "bg-blue-50", "bg-purple-50", 
              "bg-orange-50", "bg-emerald-50", "bg-yellow-50"
            ];
            return (
              <div key={i} className={`p-4 rounded-lg border ${cardColors[i]} transition-all duration-200`}>
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
              <div className="bg-linear-to-r from-yellow-500 to-yellow-600 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-24 mb-2 bg-yellow-400/30" />
                    <Skeleton className="h-8 w-32 bg-yellow-400/30" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-16 mb-2 bg-yellow-400/30" />
                    <Skeleton className="h-6 w-20 bg-yellow-400/30" />
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
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
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
    {
      title: "Orders Processed",
      value: dashboardData?.totalOrdersProcessed || 0,
      icon: ShoppingCart,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Total Commission Earned",
      value: `${(dashboardData?.totalCommissionEarned || 0).toLocaleString()} RWF`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "Pending Commission",
      value: `${(dashboardData?.pendingCommission || 0).toLocaleString()} RWF`,
      icon: Users,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Trader Dashboard</h1>
        <p className="text-gray-600 text-sm">Overview of your trading activities and performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => {
          const cardColors = [
            { bg: "bg-green-50", text: "text-green-600", percent: "text-green-600" },
            { bg: "bg-blue-50", text: "text-blue-600", percent: "text-blue-600" },
            { bg: "bg-purple-50", text: "text-purple-600", percent: "text-purple-600" },
            { bg: "bg-orange-50", text: "text-orange-600", percent: "text-orange-600" },
            { bg: "bg-emerald-50", text: "text-emerald-600", percent: "text-emerald-600" },
            { bg: "bg-yellow-50", text: "text-yellow-600", percent: "text-yellow-600" },
          ];
          const colors = cardColors[index % cardColors.length];
          
          return (
            <div key={index} className={`p-4 rounded-lg border ${colors.bg} transition-all duration-200 hover:shadow-md`}>
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 ${colors.text}`} />
                <div className={`flex items-center gap-1 text-xs ${colors.percent}`}>
                  <div className="w-3 h-3">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 14l5-5 5 5z" />
                    </svg>
                  </div>
                  +{(Math.random() * 20).toFixed(1)}%
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-600 font-medium">{stat.title}</p>
                <p className={`text-sm font-bold ${colors.text}`}>{stat.value}</p>
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
                      <p className="text-yellow-100 text-sm">Available Balance</p>
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
                      <span>Wallet ID: {wallet.id.slice(0, 8)}...</span>
                      <span>Transactions: {wallet._count?.transactions || 0}</span>
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

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Total Deposits</span>
                </div>
                <span className="font-semibold text-green-600">
                  {wallet.balance.toLocaleString()} RWF
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Total Spent</span>
                </div>
                <span className="font-semibold text-blue-600">0 RWF</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Transactions</span>
                </div>
                <span className="font-semibold text-gray-600">
                  {wallet._count?.transactions || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.amount > 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} RWF
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{transaction.status.toLowerCase()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No transactions yet</p>
              <p className="text-sm">Your transaction history will appear here</p>
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