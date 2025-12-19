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
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, Loader2, CreditCard, Smartphone, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function DepositsManagementPage() {
  const { wallet, getMyWallet, createWallet, topUpWallet } = useWallet();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [allWallets, setAllWallets] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);

  const [topUpData, setTopUpData] = useState({
    amount: "",
    paymentMethod: "MOBILE_MONEY" as "MOBILE_MONEY" | "CARD",
    phoneNumber: "",
    description: "",
  });

  const fetchAllWallets = async () => {
    try {
      const { walletService } = await import("@/app/services/walletService");
      const response = await walletService.getAllWallets();
      if (response.data) {
        setAllWallets(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch wallets:", error);
    }
  };

  const fetchTransactions = async (page = 1) => {
    try {
      const { walletService } = await import("@/app/services/walletService");
      const response = await walletService.getAllTransactions({ page, limit: 10 });
      if (response.data) {
        setTransactions(response.data);
        setPagination({
          page: response.pagination?.page || 1,
          limit: response.pagination?.limit || 10,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getMyWallet();
        await fetchAllWallets();
        await fetchTransactions(1);
      } catch (error) {
        console.log("Error fetching data");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTopUp = async () => {
    if (!selectedWallet) {
      toast.error("Please select a wallet");
      return;
    }

    if (!topUpData.amount || parseFloat(topUpData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (topUpData.paymentMethod === "MOBILE_MONEY" && !topUpData.phoneNumber) {
      toast.error("Phone number is required for mobile money");
      return;
    }

    setIsTopUpLoading(true);
    try {
      const response = await topUpWallet({
        walletId: selectedWallet.id,
        amount: parseFloat(topUpData.amount),
        paymentMethod: topUpData.paymentMethod,
        phoneNumber: topUpData.paymentMethod === "MOBILE_MONEY" ? topUpData.phoneNumber : undefined,
        description: topUpData.description || "Admin wallet top-up",
      });

      if (response.success) {
        if (topUpData.paymentMethod === "CARD" && response.data?.requiresRedirect && response.data?.redirectUrl) {
          toast.success("Redirecting to payment page...");
          setTimeout(() => {
            window.location.href = response.data.redirectUrl;
          }, 1000);
        } else {
          toast.success("Top-up initiated successfully!");
          setShowDepositModal(false);
          setTopUpData({ amount: "", paymentMethod: "MOBILE_MONEY", phoneNumber: "", description: "" });
          setSelectedWallet(null);
          await fetchAllWallets();
          await fetchTransactions(pagination.page);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process top-up");
    } finally {
      setIsTopUpLoading(false);
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

  const totalBalance = allWallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);
  const activeWallets = allWallets.filter(wallet => wallet.isActive).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Deposit Management
          </h1>
          <p className="text-gray-600">
            Manage restaurant wallet deposits and transactions
          </p>
        </div>
        <Button
          onClick={() => setShowDepositModal(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Deposit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Balance
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalBalance.toLocaleString()} RWF
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Wallets
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeWallets}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Restaurants
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {allWallets.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Wallets</CardTitle>
          <CardDescription>
            Overview of all restaurant wallet balances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Restaurant</th>
                  <th className="text-left p-4 font-medium">Balance</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Last Updated</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allWallets.map((wallet) => (
                  <tr key={wallet.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">
                          {wallet.restaurant?.name || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {wallet.restaurant?.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 font-medium">
                      {wallet.balance?.toLocaleString() || "0"} RWF
                    </td>
                    <td className="p-4">
                      {wallet.isActive ? (
                        <Badge className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          Inactive
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(wallet.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedWallet(wallet);
                          setShowDepositModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Add Deposit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Latest deposit and payment activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Wallet className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No transactions yet</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium text-sm">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-600">
                          {transaction.wallet?.restaurant?.name ||
                            "Unknown Restaurant"}{" "}
                          •{" "}
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-medium text-sm ${
                          transaction.amount > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.amount > 0 ? "+" : ""}
                        {transaction.amount.toLocaleString()} RWF
                      </p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t">
                  <div className="flex gap-1">
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    ).map((pageNum) => (
                      <Button
                        key={pageNum}
                        variant={
                          pageNum === pagination.page ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => fetchTransactions(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Deposit Modal */}
      <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
        <DialogContent className="sm:max-w-md bg-white border-2 border-green-500 rounded">
          <DialogHeader className="text-center">
            <DialogTitle className="text-green-600 text-xl">
              Add Deposit
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Add funds to a restaurant wallet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="wallet">Select Restaurant</Label>
              <Select
                value={selectedWallet?.id || ""}
                onValueChange={(value) => {
                  const wallet = allWallets.find((w) => w.id === value);
                  setSelectedWallet(wallet);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose restaurant..." />
                </SelectTrigger>
                <SelectContent>
                  {allWallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.restaurant?.name || "Unknown"} -{" "}
                      {wallet.balance?.toLocaleString() || "0"} RWF
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount (RWF)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="10000"
                value={topUpData.amount}
                onChange={(e) =>
                  setTopUpData((prev) => ({ ...prev, amount: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={topUpData.paymentMethod}
                onValueChange={(value: "MOBILE_MONEY" | "CARD") =>
                  setTopUpData((prev) => ({ ...prev, paymentMethod: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MOBILE_MONEY">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Mobile Money
                    </div>
                  </SelectItem>
                  <SelectItem value="CARD">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Card Payment
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {topUpData.paymentMethod === "MOBILE_MONEY" && (
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="250788123456"
                  value={topUpData.phoneNumber}
                  onChange={(e) =>
                    setTopUpData((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                />
              </div>
            )}
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Admin deposit"
                value={topUpData.description}
                onChange={(e) =>
                  setTopUpData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDepositModal(false);
                setSelectedWallet(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTopUp}
              disabled={isTopUpLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isTopUpLoading && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Add Deposit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}