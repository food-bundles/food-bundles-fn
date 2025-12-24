/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/app/contexts/WalletContext";
import { useWalletWebSocket } from "@/hooks/useWalletWebSocket";
import { useAuth } from "@/app/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";

export default function DepositsPage() {
  const { user } = useAuth();
  const { wallet, getMyWallet, createWallet, topUpWallet } = useWallet();
  const { walletUpdates } = useWalletWebSocket(user?.id || "", user?.id);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 0 });
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardRedirectUrl, setCardRedirectUrl] = useState("");

  const [topUpData, setTopUpData] = useState({
    amount: "",
    paymentMethod: "MOBILE_MONEY" as "MOBILE_MONEY" | "CARD",
    phoneNumber: "",
    description: "Top Up",
  });

  const fetchTransactions = async (page = 1) => {
    try {
      const { walletService } = await import("@/app/services/walletService");
      const response = await walletService.getWalletTransactions({ page, limit: 5 });
      if (response.data) {
        setTransactions(response.data);
        setPagination({
          page: response.pagination?.page || 1,
          limit: response.pagination?.limit || 5,
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
        await fetchTransactions(1);
      } catch (error) {
        console.log("Error fetching wallet data");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, []);

   useEffect(() => {
    if (walletUpdates.length > 0) {
      const latestUpdate = walletUpdates[walletUpdates.length - 1];
      console.log("Wallet update received:", latestUpdate);
      
      if (latestUpdate.action === "TOP_UP" && latestUpdate.data?.status === "COMPLETED") {
        // Payment completed - refresh wallet and transactions
        toast.success(`Payment completed! ${latestUpdate.data.amount} RWF added to your wallet`);
        getMyWallet();
        fetchTransactions(pagination.page);
        
        // Close modal if it's open
        if (showCardModal) {
          setShowCardModal(false);
          setCardRedirectUrl("");
          setShowDepositForm(false);
          setTopUpData({ amount: "", paymentMethod: "MOBILE_MONEY", phoneNumber: "", description: "" });
        }
      }
    }
  }, [walletUpdates, pagination.page, showCardModal]);

  // Listen for custom wallet transaction updates
  useEffect(() => {
    const handleTransactionUpdate = () => {
      fetchTransactions(pagination.page);
    };

    window.addEventListener('walletTransactionUpdate', handleTransactionUpdate);
    return () => {
      window.removeEventListener('walletTransactionUpdate', handleTransactionUpdate);
    };
  }, [pagination.page]);



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
        description: "Top Up",
      });

      if (response.success) {
        
        if (topUpData.paymentMethod === "CARD" && response.data?.requiresRedirect && response.data?.redirectUrl) {
          // For CARD payments, show confirmation modal
          setCardRedirectUrl(response.data.redirectUrl);
          setShowCardModal(true);
        } else {
          // For MOBILE_MONEY, clear form and refresh data
          toast.success("Top-up initiated successfully!");
          setShowDepositForm(false);
          setTopUpData({ amount: "", paymentMethod: "MOBILE_MONEY", phoneNumber: "", description: "" });
          getMyWallet();
          fetchTransactions(pagination.page);
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
        return <ArrowDownRight className="h-4 w-4 text-red-800" />;
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

  const handleContinuePayment = () => {
    window.location.href = cardRedirectUrl;
  };

  const handleCancelPayment = () => {
    setShowCardModal(false);
    setCardRedirectUrl("");
    toast.info("Payment cancelled");
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
                {wallet?.balance?.toLocaleString() || "0"} RWF
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
              <>
                <Button
                  onClick={() => setShowDepositForm(true)}
                  className="w-full bg-yellow-500 text-white hover:bg-yellow-600 font-semibold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Deposit Funds
                </Button>
              </>
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
                      {/* <SelectItem value="CARD">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-green-600" />
                          Card Payment sd
                        </div>
                      </SelectItem> */}
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
              <>
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          {transaction.type === "TOP_UP" ? (
                            <p className=" text-gray-900 text-sm">
                              You have deposited{" "}
                              <span
                                className={`font-bold text-sm ${
                                  transaction.amount > 0
                                    ? "text-green-600"
                                    : "text-red-800"
                                }`}
                              >
                                {transaction.amount > 0 ? "+" : ""}
                                {transaction.amount.toLocaleString()} RWF
                              </span>
                            </p>
                          ) : (
                            <p className=" text-gray-900 text-sm">
                              You have made a payment of{" "}
                              <span
                                className={`font-bold text-sm ${
                                  transaction.amount > 0
                                    ? "text-green-600"
                                    : "text-red-800"
                                }`}
                              >
                                {transaction.amount > 0 ? "+" : ""}
                                {transaction.amount.toLocaleString()}
                              </span>{" "}
                              RWF for {" "}
                              <span className="text-gray-800 font-medium">
                                {transaction.description}
                              </span>
                            </p>
                          )}
                          <p className="text-xs text-gray-700">
                            {new Date(
                              transaction.createdAt
                            ).toLocaleDateString()}
                          </p>
                          <div className="text-xs text-gray-700 mt-1">
                            <span>
                              Prev:{" "}
                              {transaction.previousBalance?.toLocaleString() ||
                                "0"}{" "}
                              RWF
                            </span>
                            <span className="mx-2">→</span>
                            <span>
                              New:{" "}
                              {transaction.newBalance?.toLocaleString() || "0"}{" "}
                              RWF
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(transaction.status.toLowerCase())}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-4 pt-4 border-t border-gray-300">
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
                          className={`text-xs w-8 h-8 p-0 font-semibold bg-transparent hover:bg-transparent border-none hover:border-none ${
                            pageNum === pagination.page
                              ? " text-green-600 hover:text-green-700 cursor-pointer "
                              : "text-gray-800 cursor-pointer"
                          }`}
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
      </div>
    </div>
  );
}