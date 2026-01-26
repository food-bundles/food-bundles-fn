/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/app/contexts/WalletContext";
import { useWalletWebSocket } from "@/hooks/useWalletWebSocket";
import { useAuth } from "@/app/contexts/auth-context";
import { toast } from "sonner";
import { WalletCard } from "./_components/WalletCard";
import { DepositForm } from "./_components/DepositForm";
import { TransactionsList } from "./_components/TransactionsList";
import { PaymentModal } from "./_components/PaymentModal";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

export default function DepositsPage() {
  const { user } = useAuth();
  const { wallet, getMyWallet, createWallet, topUpWallet, paymentMethods, getActivePaymentMethods } = useWallet();
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
    paymentMethodId: "",
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
        await getActivePaymentMethods();
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
        toast.success(`Payment completed! ${latestUpdate.data.amount} RWF added to your wallet`);
        getMyWallet();
        fetchTransactions(pagination.page);
        
        if (showCardModal) {
          setShowCardModal(false);
          setCardRedirectUrl("");
          setShowDepositForm(false);
          setTopUpData({ amount: "", paymentMethodId: "", phoneNumber: "", description: "" });
        }
      }
    }
  }, [walletUpdates, pagination.page, showCardModal]);

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

    if (!topUpData.paymentMethodId) {
      toast.error("Please select a payment method");
      return;
    }

    const selectedMethod = paymentMethods.find(method => method.id === topUpData.paymentMethodId);
    if (selectedMethod?.name === "MOBILE_MONEY" && !topUpData.phoneNumber) {
      toast.error("Phone number is required for mobile money");
      return;
    }

    setIsTopUpLoading(true);
    try {
      if (!wallet) {
        await createWallet();
      }
      
      const response = await topUpWallet({
        amount: parseFloat(topUpData.amount),
        paymentMethodId: topUpData.paymentMethodId,
        phoneNumber: selectedMethod?.name === "MOBILE_MONEY" ? topUpData.phoneNumber : undefined,
        description: "Wallet top-up",
      });

      // Show modal only for CARD payments
      if (response.success || response.data) {
        if (selectedMethod?.name === "CARD") {
          const redirectUrl = response.data?.redirectUrl || "https://checkout.flutterwave.com/demo";
          setCardRedirectUrl(redirectUrl);
          setShowCardModal(true);
        } else {
          toast.success("Top-up initiated successfully!");
          setShowDepositForm(false);
          setTopUpData({ amount: "", paymentMethodId: "", phoneNumber: "", description: "" });
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
      <div className="flex items-center justify-center h-screen">
        <Spinner variant="ring" className="w-10 h-10"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <WalletCard
          balance={wallet?.balance || 0}
          isActive={wallet?.isActive || false}
          showDepositForm={showDepositForm}
          onShowDepositForm={() => setShowDepositForm(true)}
        >
          <DepositForm
            amount={topUpData.amount}
            paymentMethodId={topUpData.paymentMethodId}
            phoneNumber={topUpData.phoneNumber}
            isLoading={isTopUpLoading}
            paymentMethods={paymentMethods}
            onAmountChange={(amount) => setTopUpData(prev => ({ ...prev, amount }))}
            onPaymentMethodChange={(paymentMethodId) => setTopUpData(prev => ({ ...prev, paymentMethodId }))}
            onPhoneNumberChange={(phoneNumber) => setTopUpData(prev => ({ ...prev, phoneNumber }))}
            onCancel={() => setShowDepositForm(false)}
            onSubmit={handleTopUp}
          />
        </WalletCard>

        <TransactionsList transactions={transactions} />

        <PaymentModal
          isOpen={showCardModal}
          onContinue={handleContinuePayment}
          onCancel={handleCancelPayment}
        />
      </div>
    </div>
  );
}