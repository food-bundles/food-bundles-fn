/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { traderService, type TraderWallet, type TraderTransaction } from "@/app/services/traderService";
import { Skeleton } from "@/components/ui/skeleton";
import { TopUpModal } from "./_components/TopUpModal";
import toast from "react-hot-toast";

export default function WalletPage() {
  const [wallet, setWallet] = useState<TraderWallet | null>(null);
  const [transactions, setTransactions] = useState<TraderTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchTransactions = async () => {
    setTransactionsLoading(true);
    try {
      const response = await traderService.getTransactions({ limit: 5 });
      setTransactions(response.data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

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

  const fetchWallet = async () => {
    try {
      const response = await traderService.getWallet();
      setWallet(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Wallet doesn't exist
        setWallet(null);
      } else {
        console.error("Failed to fetch wallet:", error);
        toast.error("Failed to load wallet");
      }
    } finally {
      setLoading(false);
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
    fetchWallet();
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Wallet className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Create Your Wallet</CardTitle>
              <p className="text-gray-600">
                You need to create a wallet to start managing your funds
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={createWallet} 
                disabled={creating}
                className="w-full"
              >
                {creating ? "Creating..." : "Create Wallet"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Wallet Management</h1>
        <p className="text-gray-600 text-sm">
          Manage your trading wallet and transactions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Balance Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-yellow-600" />
              Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-linear-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Available Balance</p>
                    <p className="text-3xl font-bold">
                      {wallet.balance.toLocaleString()} {wallet.currency}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-100 text-sm">Status</p>
                    <p className="text-lg font-semibold">
                      {wallet.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-yellow-400">
                  <div className="flex justify-between text-sm text-blue-100">
                    <span>Wallet ID: </span>
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

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <span className="text-sm ">Total Deposits</span>
              </div>
              <span className="font-semibold text-green-600">
                {wallet.balance.toLocaleString()} RWF
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="h-4 w-4 text-red-600" />
                <span className="text-sm ">Total Spent</span>
              </div>
              <span className="text-red-600 font-medium">0 RWF</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-gray-600" />
                <span className="text-sm">Transactions</span>
              </div>
              <span className="font-semibold text-gray-600">
                {wallet._count?.transactions || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        transaction.amount > 0 ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      {transaction.amount > 0 ? (
                        <ArrowUpRight
                          className={`h-4 w-4 ${
                            transaction.amount > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className=" text-sm">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm ${
                        transaction.amount > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {transaction.amount.toLocaleString()} RWF
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {transaction.status.toLowerCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No transactions yet</p>
              <p className="text-sm">
                Your transaction history will appear here
              </p>
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