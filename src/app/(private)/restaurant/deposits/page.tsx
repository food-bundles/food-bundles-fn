/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useWallet } from "@/app/contexts/WalletContext";
import { useWalletWebSocket } from "@/hooks/useWalletWebSocket";
import { useAuth } from "@/app/contexts/auth-context";
import { toast } from "sonner";
import { walletService } from "@/app/services/walletService";
import { WalletCard } from "./_components/WalletCard";
import { DepositForm } from "./_components/DepositForm";
import { TransactionsList } from "./_components/TransactionsList";
import { VoucherTransfersList } from "./_components/VoucherTransfersList";
import { PaymentModal } from "./_components/PaymentModal";
import { CardPaymentModal } from "./_components/CardPaymentModal";
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
  const [paymentStage, setPaymentStage] = useState<"redirect" | "pending" | null>(null);
  const [topUpTxId, setTopUpTxId] = useState("");
  const [paymentNotice, setPaymentNotice] = useState("");
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const checkInFlight = useRef(false);

  const [topUpData, setTopUpData] = useState({
    amount: "",
    paymentMethodId: "",
    paymentMethodName: "",
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

  const resetTopUpForm = () => {
    setTopUpData({ amount: "", paymentMethodId: "", paymentMethodName: "", phoneNumber: "", description: "" });
  };

  const completeTopUp = useCallback(
    (message: string) => {
      toast.success(message);
      setShowCardModal(false);
      setCardRedirectUrl("");
      setPaymentStage(null);
      setTopUpTxId("");
      setPaymentNotice("");
      setIsCheckingPayment(false);
      setShowDepositForm(false);
      resetTopUpForm();
      getMyWallet();
      fetchTransactions(pagination.page);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pagination.page, getMyWallet, fetchTransactions]
  );

  const performPaymentCheck = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!topUpTxId) return;
      if (checkInFlight.current) return;
      checkInFlight.current = true;
      const { silent = false } = options || {};
      if (!silent) setIsCheckingPayment(true);
      try {
        const res: any = await walletService.verifyTopUp(topUpTxId);
        const data = res?.data || {};
        if (data.verified) {
          setPaymentStage(null);
          setTopUpTxId("");
          setPaymentNotice("");
          completeTopUp("Top-up confirmed! Your wallet has been funded.");
        } else if (!silent) {
          setPaymentNotice(
            data.message ||
              "Payment not confirmed yet. Please complete it on your phone or in the payment tab."
          );
        }
      } catch (err: any) {
        if (!silent) {
          const msg =
            err?.response?.data?.message ||
            "Could not check payment status. Please try again.";
          setPaymentNotice(msg);
          toast.error(msg);
        }
      } finally {
        checkInFlight.current = false;
        if (!silent) setIsCheckingPayment(false);
      }
    },
    [topUpTxId, completeTopUp]
  );

  useEffect(() => {
    if (walletUpdates.length > 0) {
      const latestUpdate = walletUpdates[walletUpdates.length - 1];
      console.log("Wallet update received:", latestUpdate);
      
      if (latestUpdate.action === "TOP_UP" && latestUpdate.data?.status === "COMPLETED") {
        completeTopUp(
          `Payment completed! ${latestUpdate.data.amount} RWF added to your wallet`
        );
      }
    }
  }, [walletUpdates, completeTopUp]);

  // Auto-poll the payment status while the user completes the payment.
  useEffect(() => {
    if (!showCardModal || paymentStage !== "pending" || !topUpTxId) return;

    let attempts = 0;
    const intervalId = setInterval(() => {
      attempts += 1;
      if (attempts > 36) {
        clearInterval(intervalId);
        return;
      }
      performPaymentCheck({ silent: true });
    }, 5000);

    return () => clearInterval(intervalId);
  }, [showCardModal, paymentStage, topUpTxId, performPaymentCheck]);

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
    if (topUpData.paymentMethodName === "MOBILE_MONEY" && !topUpData.phoneNumber) {
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
        phoneNumber: topUpData.paymentMethodName === "MOBILE_MONEY" ? topUpData.phoneNumber : undefined,
        description: "Wallet top-up",
      });

      // Show the payment modal and track until it is confirmed.
      if (response.success || response.data) {
        const data = response.data || {};
        const txId = data?.transaction?.id || "";
        const isCard =
          data?.transaction?.paymentMethod === "CARD" ||
          selectedMethod?.name === "CARD";
        if (isCard) {
          const redirectUrl =
            data?.redirectUrl ||
            data?.transaction?.metadata?.paymentResponse?.redirectUrl;
          if (redirectUrl) {
            setTopUpTxId(txId);
            setCardRedirectUrl(redirectUrl);
            setPaymentNotice("");
            setPaymentStage("redirect");
            setShowCardModal(true);
          } else {
            if (txId) {
              setTopUpTxId(txId);
              setPaymentNotice(
                "Payment was initiated. Your wallet is funded automatically once the payment is confirmed."
              );
              setPaymentStage("pending");
              setShowCardModal(true);
            } else {
              setShowDepositForm(false);
              resetTopUpForm();
              getMyWallet();
              fetchTransactions(pagination.page);
            }
          }
        } else {
          if (txId) {
            setTopUpTxId(txId);
            setPaymentNotice(
              `Payment initiated to ${topUpData.phoneNumber}. Please approve it on your phone. Your wallet is funded automatically once confirmed.`
            );
            setPaymentStage("pending");
            setShowCardModal(true);
          } else {
            toast.success("Top-up initiated successfully!");
            setShowDepositForm(false);
            resetTopUpForm();
            getMyWallet();
            fetchTransactions(pagination.page);
          }
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process top-up");
    } finally {
      setIsTopUpLoading(false);
    }
  };

  const handleCardContinue = () => {
    if (!cardRedirectUrl) return;
    // Open the secure Flutterwave page in a new tab and keep tracking here so
    // the modal closes automatically once the payment is confirmed.
    window.open(cardRedirectUrl, "_blank", "noopener,noreferrer");
    setPaymentStage("pending");
    setPaymentNotice(
      "Complete the payment in the new tab. Your wallet is topped up automatically once confirmed."
    );
  };

  const handleCancelPayment = () => {
    setShowCardModal(false);
    setCardRedirectUrl("");
    setPaymentStage(null);
    setTopUpTxId("");
    setPaymentNotice("");
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
          holderName={user?.name}
        >
          <DepositForm
            amount={topUpData.amount}
            paymentMethodId={topUpData.paymentMethodId}
            phoneNumber={topUpData.phoneNumber}
            isLoading={isTopUpLoading}
            onAmountChange={(amount) => setTopUpData(prev => ({ ...prev, amount }))}
            onPaymentMethodChange={(paymentMethodId, paymentMethodName) => setTopUpData(prev => ({ ...prev, paymentMethodId, paymentMethodName }))}
            onPhoneNumberChange={(phoneNumber) => setTopUpData(prev => ({ ...prev, phoneNumber }))}
            onCancel={() => setShowDepositForm(false)}
            onSubmit={handleTopUp}
          />
        </WalletCard>

        <TransactionsList transactions={transactions} />

        <VoucherTransfersList />

        <CardPaymentModal
          isOpen={showCardModal && !!cardRedirectUrl}
          redirectUrl={cardRedirectUrl}
          mode={paymentStage === "pending" ? "pending" : "redirect"}
          notice={paymentNotice}
          verifying={isCheckingPayment}
          onContinue={handleCardContinue}
          onReturnToPayment={() => {}}
          onCheckStatus={() => performPaymentCheck({ silent: false })}
          onCancel={handleCancelPayment}
        />

        <PaymentModal
          isOpen={showCardModal && !cardRedirectUrl}
          mode={paymentStage === "pending" ? "pending" : "redirect"}
          notice={paymentNotice}
          verifying={isCheckingPayment}
          onCheckStatus={() => performPaymentCheck({ silent: false })}
          onContinue={handleCardContinue}
          onCancel={handleCancelPayment}
        />
      </div>
    </div>
  );
}