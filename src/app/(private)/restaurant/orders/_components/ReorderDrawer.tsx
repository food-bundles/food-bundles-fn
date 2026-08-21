/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { X, ShoppingCart, Loader2, ExternalLink, CreditCard, Smartphone, Banknote, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { orderService } from "@/app/services/orderService";
import { paymentMethodService } from "@/app/services/paymentMethodService";
import { toast } from "sonner";

interface ReorderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

interface PaymentMethodOption {
  id: string;
  name: string;
  description?: string;
}

const paymentMethodIcons: Record<string, React.ReactNode> = {
  MOBILE_MONEY: <Smartphone className="w-4 h-4" />,
  CARD: <CreditCard className="w-4 h-4" />,
  BANK_TRANSFER: <Banknote className="w-4 h-4" />,
  CASH: <Wallet className="w-4 h-4" />,
  VOUCHER: <Wallet className="w-4 h-4" />,
};

const paymentMethodLabels: Record<string, string> = {
  MOBILE_MONEY: "Mobile Money (MoMo)",
  CARD: "Card Payment",
  BANK_TRANSFER: "Bank Transfer",
  CASH: "Prepaid (Wallet)",
  VOUCHER: "Voucher",
};

const paymentMethodDescriptions: Record<string, string> = {
  MOBILE_MONEY: "Pay via MTN or Airtel Money",
  CARD: "Pay with credit or debit card",
  BANK_TRANSFER: "Transfer directly from your bank",
  CASH: "Deduct from your prepaid wallet balance",
  VOUCHER: "Use a voucher code to pay",
};

export function ReorderDrawer({ isOpen, onClose, order }: ReorderDrawerProps) {
  const [isReordering, setIsReordering] = useState(false);
  const [showFlutterwaveInfo, setShowFlutterwaveInfo] = useState(false);
  const [flutterwaveRedirectUrl, setFlutterwaveRedirectUrl] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("");
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods();
    }
  }, [isOpen]);

  const fetchPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);
      const response = await paymentMethodService.getActivePaymentMethods();
      if (response.data) {
        // Filter out VOUCHER - it requires OTP verification and a fresh voucher code
        const availableMethods = response.data.filter(
          (m: PaymentMethodOption) => m.name.toUpperCase() !== "VOUCHER"
        );
        setPaymentMethods(availableMethods);
        // Default selection: prefer the original order's payment method
        const originalMethod = order?.originalData?.paymentMethod;
        if (originalMethod && originalMethod.toUpperCase() !== "VOUCHER") {
          const match = availableMethods.find(
            (m: PaymentMethodOption) => m.name.toUpperCase() === originalMethod.toUpperCase()
          );
          if (match) {
            setSelectedPaymentMethodId(match.id);
            return;
          }
        }
        // Fallback to first option
        if (availableMethods.length > 0) {
          setSelectedPaymentMethodId(availableMethods[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
      toast.error("Failed to load payment methods");
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const handleReorder = async () => {
    if (!selectedPaymentMethodId) {
      toast.error("Please select a payment method");
      return;
    }

    try {
      setIsReordering(true);

      const response = await orderService.reorderOrder(order.id, selectedPaymentMethodId);

      if (response.success) {
        const responseData = response.data as any;
        const requiresRedirect = responseData?.requiresRedirect;
        const redirectUrl = responseData?.redirectUrl;
        const paymentProvider = responseData?.paymentProvider;

        if (requiresRedirect && redirectUrl && paymentProvider === "FLUTTERWAVE") {
          setFlutterwaveRedirectUrl(redirectUrl);
          setShowFlutterwaveInfo(true);
        } else if (paymentProvider === "PAYPACK") {
          toast.success("USSD code sent to your phone. Please complete the payment.");
          onClose();
        } else {
          toast.success("Reorder completed successfully!");
          onClose();
        }
      } else {
        toast.error(
          (response as any)?.error || response.message || "Reorder failed. Please try again."
        );
      }
    } catch (error: any) {
      console.error("Reorder error:", error);
      toast.error(error?.response?.data?.message || "Failed to reorder");
    } finally {
      setIsReordering(false);
    }
  };

  const handleFlutterwaveRedirect = () => {
    if (flutterwaveRedirectUrl) {
      window.location.href = flutterwaveRedirectUrl;
    }
  };

  if (!order) return null;

  const orderItems = order.originalData?.orderItems || [];
  const totalAmount = order.originalData?.totalAmount || order.totalAmount;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full bg-white text-gray-900 z-50 transform transition-all duration-300 ease-in-out overflow-y-auto shadow-2xl border-l border-gray-200 scrollbar-hide
          w-[90vw] sm:w-[400px] md:w-[500px]
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-green-700 border-b border-gray-200 flex justify-between items-center px-6 py-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-white" />
            <span className="text-[15px] text-white font-bold">
              Reorder Items
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors hover:rotate-90 transform duration-200"
          >
            <X className="w-5 h-5 text-white cursor-pointer" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-gray-100 space-y-6">
          {/* Order Info */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Order Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{order.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Original Date:</span>
                <span className="font-medium">{order.orderedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">{order.customerName}</span>
              </div>
            </div>
          </div>

          {/* Items to Reorder */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Items to Reorder
            </h3>
            <div className="space-y-3">
              {orderItems.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.productName}</p>
                    <p className="text-xs text-gray-600">
                      {item.quantity} {item.unit} × {item.unitPrice.toLocaleString()} RWF
                    </p>
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    {item.subtotal.toLocaleString()} RWF
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Select Payment Method
            </h3>
            {loadingPaymentMethods ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-green-600 mr-2" />
                <span className="text-sm text-gray-500">Loading payment methods...</span>
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="text-sm text-gray-500 py-4 text-center">
                No payment methods available
              </div>
            ) : (
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedPaymentMethodId === method.id
                        ? "border-green-500 bg-green-50 ring-1 ring-green-200"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPaymentMethodId === method.id}
                      onChange={() => setSelectedPaymentMethodId(method.id)}
                      className="mt-0.5 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                    />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`p-1.5 rounded ${
                        selectedPaymentMethodId === method.id
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {paymentMethodIcons[method.name.toUpperCase()] || <CreditCard className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {paymentMethodLabels[method.name.toUpperCase()] || method.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {paymentMethodDescriptions[method.name.toUpperCase()] || method.description || ""}
                        </p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                      selectedPaymentMethodId === method.id
                        ? "border-green-600"
                        : "border-gray-300"
                    }`}>
                      {selectedPaymentMethodId === method.id && (
                        <div className="w-2 h-2 rounded-full bg-green-600" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Total */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
              <span className="text-lg font-bold text-green-600">
                {totalAmount.toLocaleString()} RWF
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 hover:bg-gray-50"
              disabled={isReordering}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReorder}
              disabled={isReordering || !selectedPaymentMethodId || loadingPaymentMethods}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isReordering && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isReordering ? "Processing..." : "Confirm Reorder"}
            </Button>
          </div>
        </div>
      </div>

      {/* Flutterwave Redirect Modal */}
      {showFlutterwaveInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-md w-full max-w-md flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-[16px] font-medium text-gray-900 flex items-center gap-2">
                Complete Payment
              </h3>
              <button
                onClick={() => setShowFlutterwaveInfo(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-700">
                You will be redirected to complete your payment. Choose your
                preferred payment method:
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowFlutterwaveInfo(false)}
                  className="flex-1 h-10 border border-gray-300 hover:border-gray-400 text-gray-900 text-[14px] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFlutterwaveRedirect}
                  className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-white text-[14px] font-medium cursor-pointer flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
