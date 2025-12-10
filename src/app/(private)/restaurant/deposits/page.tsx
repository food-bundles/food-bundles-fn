"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/app/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, Loader2, CreditCard, Smartphone } from "lucide-react";
import { toast } from "sonner";

export default function DepositsPage() {
  const { wallet, transactions, loading, getMyWallet, createWallet, topUpWallet, getTransactions } = useWallet();
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);

  const [topUpData, setTopUpData] = useState({
    amount: "",
    paymentMethod: "MOBILE_MONEY" as "MOBILE_MONEY" | "CARD",
    phoneNumber: "",
    description: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getMyWallet();
        await getTransactions({ limit: 10 });
      } catch (error) {
        console.log("Error fetching wallet data");
      }
    };
    fetchData();
  }, [getMyWallet, getTransactions]);

  const handleCreateWallet = async () => {
    setIsCreatingWallet(true);
    try {
      await createWallet();
      toast.success("Prepaid account created successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create prepaid account");
    } finally {
      setIsCreatingWallet(false);
    }
  };

  const handleTopUp = async () => {
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
        amount: parseFloat(topUpData.amount),
        paymentMethod: topUpData.paymentMethod,
        phoneNumber: topUpData.paymentMethod === "MOBILE_MONEY" ? topUpData.phoneNumber : undefined,
        description: topUpData.description || "Prepaid account top-up",
      });

      if (response.success) {
        if (response.data?.requiresRedirect && response.data?.redirectUrl) {
          toast.success("Redirecting to payment page...");
          window.location.href = response.data.redirectUrl;
        } else {
          toast.success("Top-up initiated successfully!");
          setShowTopUpModal(false);
          setTopUpData({ amount: "", paymentMethod: "MOBILE_MONEY", phoneNumber: "", description: "" });
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
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "FAILED":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Prepaid Account</h2>
          <p className="text-gray-600 mb-6">
            Create a prepaid account to make faster payments and manage your balance.
          </p>
          <Button onClick={handleCreateWallet} disabled={isCreatingWallet} className="bg-green-600 hover:bg-green-700">
            {isCreatingWallet && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Create Prepaid Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prepaid Account</h1>
          <p className="text-gray-600">Manage your prepaid balance and transactions</p>
        </div>
        <Button onClick={() => setShowTopUpModal(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Funds
        </Button>
      </div>

      {/* Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Account Balance
          </CardTitle>
          <CardDescription>Your current prepaid balance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            {wallet.balance.toLocaleString()} RWF
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Account Status: {wallet.isActive ? "Active" : "Inactive"}
          </p>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest prepaid account activity</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} RWF
                    </p>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top-up Modal */}
      <Dialog open={showTopUpModal} onOpenChange={setShowTopUpModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Funds to Prepaid Account</DialogTitle>
            <DialogDescription>
              Choose your payment method and amount to add funds
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount (RWF)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="10000"
                value={topUpData.amount}
                onChange={(e) => setTopUpData(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={topUpData.paymentMethod}
                onValueChange={(value: "MOBILE_MONEY" | "CARD") => 
                  setTopUpData(prev => ({ ...prev, paymentMethod: value }))
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
                  onChange={(e) => setTopUpData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                />
              </div>
            )}
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Account top-up"
                value={topUpData.description}
                onChange={(e) => setTopUpData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTopUpModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleTopUp} disabled={isTopUpLoading} className="bg-green-600 hover:bg-green-700">
              {isTopUpLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Add Funds
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}