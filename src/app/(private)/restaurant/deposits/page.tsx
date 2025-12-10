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
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, Loader2, CreditCard, Smartphone } from "lucide-react";
import { toast } from "sonner";

export default function DepositsPage() {
  const { wallet, transactions, getMyWallet, createWallet, topUpWallet, getTransactions } = useWallet();
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

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
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, []);



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
      // Create wallet if it doesn't exist
      if (!wallet) {
        await createWallet();
      }
      
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
          setShowDepositForm(false);
          setTopUpData({ amount: "", paymentMethod: "MOBILE_MONEY", phoneNumber: "", description: "" });
          // Silently refresh data without causing UI reload
          getMyWallet();
          getTransactions({ limit: 10 });
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

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-16 w-16 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Main Balance Card */}
        <Card className="bg-white border-yellow-200 shadow-[4px_4px_4px_rgba(0,0,0,0.1)]">
          <CardContent className="px-8">
            <div className="text-center mb-4">
              <Wallet className="h-12 w-12 mx-auto mb-3 text-green-600" />
              <h2 className="text-[18px] font-semibold mb-1 text-gray-800">
                Account Balance
              </h2>
              <p className="text-gray-600 text-[16px]">
                Your current prepaid balance
              </p>
            </div>

            <div className="text-center mb-4">
              <div
                className="text-3xl font-bold mb-2 text-gray-900"
                style={{ fontFamily: "Roboto Mono, monospace" }}
              >
                {wallet?.balance?.toLocaleString() || '0'} RWF
              </div>
              <p className="text-gray-600 text-[16px]">
                Account Status{" "}
                {wallet?.isActive ? (
                  <span className="text-green-600 font-medium">Active</span>
                ) : (
                  <span className="text-red-600 font-medium">Inactive</span>
                )}
              </p>
            </div>

            {!showDepositForm ? (
              <Button
                onClick={() => setShowDepositForm(true)}
                className="w-full bg-yellow-500 text-white hover:bg-yellow-600 font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Deposit Funds
              </Button>
            ) : (
              <div className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="amount" className="text-gray-800 text-[14px]">
                    Amount (RWF)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0000"
                    value={topUpData.amount}
                    onChange={(e) =>
                      setTopUpData((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    className=" focus:border-yellow-400 text-gray-800"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMethod" className="text-gray-800">
                    Payment Method
                  </Label>
                  <Select
                    value={topUpData.paymentMethod}
                    onValueChange={(value: "MOBILE_MONEY" | "CARD") =>
                      setTopUpData((prev) => ({
                        ...prev,
                        paymentMethod: value,
                      }))
                    }
                  >
                    <SelectTrigger className="  focus:border-yellow-400 text-gray-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MOBILE_MONEY">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-green-600" />
                          Mobile Money
                        </div>
                      </SelectItem>
                      <SelectItem value="CARD">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-green-600" />
                          Card Payment
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {topUpData.paymentMethod === "MOBILE_MONEY" && (
                  <div>
                    <Label htmlFor="phoneNumber" className="text-gray-800">
                      Phone Number
                    </Label>
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
                      className=" focus:border-yellow-400 text-gray-800"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="description" className="text-gray-800">
                    Description (Optional)
                  </Label>
                  <Input
                    id="description"
                    placeholder="Account top-up"
                    value={topUpData.description}
                    onChange={(e) =>
                      setTopUpData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="  focus:border-yellow-400 text-gray-800"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDepositForm(false)}
                    className="flex-1  text-gray-700 bg-green-100 hover:bg-green-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleTopUp}
                    disabled={isTopUpLoading}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 font-semibold"
                  >
                    {isTopUpLoading && (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )}
                    Deposit Now
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="bg-gray-100 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-gray-900">Recent Transactions</CardTitle>
            <CardDescription>Your latest account activity</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Wallet className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-600">
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}