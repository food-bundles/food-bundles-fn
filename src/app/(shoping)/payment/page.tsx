/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  ExternalLink,
  Info,
  X,
  Check,
  Phone,
  User,
  Loader2,
} from "lucide-react";
import { checkoutService, type Checkout } from "@/app/services/checkoutService";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

function formatTimeAgo(dateString: string): string {
  const submissionDate = new Date(dateString);
  const now = new Date();
  const timeDiff = now.getTime() - submissionDate.getTime();

  const minutes = Math.floor(timeDiff / (1000 * 60));
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

export default function PaymentPage() {
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [selectedCheckout, setSelectedCheckout] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "MOBILE_MONEY" | "CARD"
  >("MOBILE_MONEY");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [showFlutterwaveInfo, setShowFlutterwaveInfo] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string>("");

  // Payment form data
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  useEffect(() => {
    const fetchCheckouts = async () => {
      try {
        const response = await checkoutService.getMyCheckouts();
        if (response.success && response.data) {
          const pendingCheckouts = response.data.filter(
            (checkout) => checkout.paymentStatus === "PENDING"
          );
          setCheckouts(pendingCheckouts);

          if (pendingCheckouts.length > 0) {
            setSelectedCheckout(pendingCheckouts[0].id);

            const firstCheckout = pendingCheckouts[0];
            if (firstCheckout.paymentMethod) {
              setPaymentMethod(
                firstCheckout.paymentMethod as "CASH" | "MOBILE_MONEY" | "CARD"
              );
            }
          }
        } else {
          setError(response.message || "Failed to load checkouts");
        }
      } catch (err) {
        setError("An error occurred while loading your orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheckouts();
  }, []);

  useEffect(() => {
    const storedPaymentMethod = localStorage.getItem("selectedPaymentMethod");
    if (
      storedPaymentMethod &&
      ["CASH", "MOBILE_MONEY", "CARD"].includes(storedPaymentMethod)
    ) {
      setPaymentMethod(storedPaymentMethod as "CASH" | "MOBILE_MONEY" | "CARD");
      localStorage.removeItem("selectedPaymentMethod");
    }
  }, []);

  const selectedCheckoutData = checkouts.find((c) => c.id === selectedCheckout);

  const validatePaymentForm = (): boolean => {
    if (!selectedCheckout) {
      setError("Please select an order to pay for");
      return false;
    }

    if (paymentMethod === "MOBILE_MONEY" && !phoneNumber.trim()) {
      setError("Please enter your phone number for mobile money payment");
      return false;
    }

    if (paymentMethod === "CARD") {
      if (
        !cardData.cardNumber.trim() ||
        !cardData.expiryDate.trim() ||
        !cardData.cvv.trim() ||
        !cardData.cardholderName.trim()
      ) {
        setError("Please fill in all card details");
        return false;
      }
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validatePaymentForm()) return;

    setIsProcessing(true);
    setError("");

    try {
      let paymentData: any = {
        paymentMethod,
        checkoutId: selectedCheckout,
      };

      if (paymentMethod === "MOBILE_MONEY") {
        paymentData.phoneNumber = phoneNumber;
      } else if (paymentMethod === "CARD") {
        paymentData = { ...paymentData, ...cardData };
      }

      const response = await checkoutService.processPayment(
        selectedCheckout,
        paymentData
      );

      if (response.success) {
        const paymentProvider = response.data?.checkout?.paymentProvider;
        const requiresRedirect = response.data?.requiresRedirect;
        const redirectUrl = response.data?.redirectUrl;

        if (paymentMethod === "MOBILE_MONEY") {
          if (paymentProvider === "PAYPACK") {
            window.location.href = "/restaurant/orders";
          } else if (
            paymentProvider === "FLUTTERWAVE" &&
            requiresRedirect &&
            redirectUrl
          ) {
            setRedirectUrl(redirectUrl);
            setShowFlutterwaveInfo(true);
          } else {
            window.location.href = "/restaurant/orders";
          }
        } else {
          window.location.href = "/restaurant/orders";
        }
      } else {
        setError(response.message || "Payment processing failed");
      }
    } catch (err) {
      setError("An error occurred while processing your payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFlutterwaveRedirect = () => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (checkouts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-md shadow-sm p-8 text-center">
          <p className="text-gray-700 text-[14px] mb-4">
            No pending orders found
          </p>
          <button
            onClick={() => (window.location.href = "/restaurant")}
            className="h-10 px-4 border border-gray-300 hover:border-green-500 text-gray-900 hover:text-green-600 text-[14px] font-medium transition-colors cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row items-stretch w-full max-w-4xl bg-white rounded-md shadow-sm">
        {/* Left side: Checkouts */}
        <div className="w-full lg:w-1/2 p-6 lg:p-8 flex flex-col justify-center ">
          {/* Order Summary for Selected Checkout */}
          {selectedCheckoutData && (
            <div className="pt-2">
              <h3 className="text-[14px] font-medium text-gray-900 mb-3">
                Order Details
              </h3>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between text-gray-900">
                  <span>Customer:</span>
                  <span>{selectedCheckoutData.billingName}</span>
                </div>
                <div className="flex justify-between text-gray-900">
                  <span>Phone:</span>
                  <span>{selectedCheckoutData.billingPhone}</span>
                </div>
                <div className="flex justify-between text-gray-900">
                  <span>Amount:</span>
                  <span>
                    {selectedCheckoutData.totalAmount.toLocaleString()} Rwf
                  </span>
                </div>
                <div className="flex justify-between text-gray-900">
                  <span>Payment Method:</span>
                  <span>{selectedCheckoutData.paymentMethod}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6  space-y-4">
            {checkouts.slice(0, 3).map((checkout) => (
              <button
                key={checkout.id}
                onClick={() => setSelectedCheckout(checkout.id)}
                className={`w-full p-4 border transition-all relative rounded text-[14px] cursor-pointer text-left ${
                  selectedCheckout === checkout.id
                    ? "border-green-500 bg-white"
                    : "border-gray-200 hover:border-green-500"
                }`}
                disabled={isProcessing}
              >
                <div className="font-medium text-gray-900">
                  Order :{" "}
                  <span className="font-normal">
                    {formatTimeAgo(checkout.createdAt)} {/* ✅ updated */}
                  </span>
                </div>
                <div className="text-[13px] font-medium text-gray-900">
                  Amount to Pay:{" "}
                  <span className="font-normal">
                    {checkout.totalAmount.toLocaleString()} RWF
                  </span>
                </div>
                {selectedCheckout === checkout.id && (
                  <Check className="absolute top-4 right-4 h-4 w-4 text-green-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Vertical divider */}
        <div className="hidden lg:block w-[.5px] bg-gray-300" />

        {/* Right side: Payment Completion */}
        <div className="w-full lg:w-1/2 p-6 lg:p-8">
          {/* Error Messages */}
          {error && (
            <div className="border border-red-200 text-red-700 text-[12px] px-4 py-3 rounded text-sm mb-4">
              {error}
            </div>
          )}

          <div>
            <h2 className="text-[18px] font-bold text-gray-900 mb-4">
              Payment Completion
            </h2>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {/* Payment Method Selection */}
              <div className="space-y-3">
                <h3 className="text-[14px] font-medium text-gray-900">
                  Payment Method
                </h3>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CASH")}
                    className={`rounded flex-1 sm:flex-initial h-7 text-[13px] font-normal px-4 border transition-colors cursor-pointer ${
                      paymentMethod === "CASH"
                        ? "bg-green-700 text-white border-green-700"
                        : "bg-white text-gray-900 border-gray-300 hover:border-green-500"
                    }`}
                    disabled={isProcessing}
                  >
                    Wallet
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("MOBILE_MONEY")}
                    className={`rounded flex-1 sm:flex-initial h-7 text-[13px] font-normal px-4 border transition-colors cursor-pointer ${
                      paymentMethod === "MOBILE_MONEY"
                        ? "bg-green-700 text-white border-green-700"
                        : "bg-white text-gray-900 border-gray-300 hover:border-green-500"
                    }`}
                    disabled={isProcessing}
                  >
                    MoMo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CARD")}
                    className={`rounded flex-1 sm:flex-initial h-7 text-[13px] font-normal px-4 border transition-colors cursor-pointer ${
                      paymentMethod === "CARD"
                        ? "bg-green-700 text-white border-green-700"
                        : "bg-white text-gray-900 border-gray-300 hover:border-green-500"
                    }`}
                    disabled={isProcessing}
                  >
                    Card
                  </button>
                </div>
              </div>

              {/* Payment Inputs Section */}
              <div className="space-y-4 pt-4">
                {paymentMethod === "CASH" && (
                  <div className="text-center py-0 bg-gray-50 rounded"></div>
                )}

                {paymentMethod === "MOBILE_MONEY" && (
                  <div className="space-y-4">
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
                      <input
                        type="tel"
                        placeholder="078XXXXXXX"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-10 h-10 border border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 focus:ring-1 focus:outline-none rounded-none text-[14px]"
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === "CARD" && (
                  <div className="space-y-4">
                    {/* Card Number */}
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardData.cardNumber}
                        onChange={(e) =>
                          setCardData((prev) => ({
                            ...prev,
                            cardNumber: e.target.value,
                          }))
                        }
                        className="w-full pl-10 h-10 border border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 focus:ring-1 focus:outline-none rounded-none text-[14px]"
                        disabled={isProcessing}
                      />
                    </div>

                    {/* Expiry and CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardData.expiryDate}
                        onChange={(e) =>
                          setCardData((prev) => ({
                            ...prev,
                            expiryDate: e.target.value,
                          }))
                        }
                        className="w-full h-10 px-3 border border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 focus:ring-1 focus:outline-none rounded-none text-[14px]"
                        disabled={isProcessing}
                      />
                      <input
                        type="text"
                        placeholder="123"
                        value={cardData.cvv}
                        onChange={(e) =>
                          setCardData((prev) => ({
                            ...prev,
                            cvv: e.target.value,
                          }))
                        }
                        className="w-full h-10 px-3 border border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 focus:ring-1 focus:outline-none rounded-none text-[14px]"
                        disabled={isProcessing}
                      />
                    </div>

                    {/* Cardholder Name */}
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-900" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={cardData.cardholderName}
                        onChange={(e) =>
                          setCardData((prev) => ({
                            ...prev,
                            cardholderName: e.target.value,
                          }))
                        }
                        className="w-full pl-10 h-10 border border-gray-300 text-gray-900 focus:border-green-500 focus:ring-green-500 focus:ring-1 focus:outline-none rounded-none text-[14px]"
                        disabled={isProcessing}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Button */}
              <button
                type="button"
                onClick={handlePayment}
                disabled={isProcessing || !selectedCheckout}
                className="w-full h-10 bg-green-700 hover:bg-green-800 text-white text-[14px] font-medium cursor-pointer disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Please wait...
                  </span>
                ) : (
                  `Pay ${
                    selectedCheckoutData?.totalAmount.toLocaleString() || 0
                  } RWF`
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[13px] text-gray-900">
                Secure payment powered by{" "}
                <span className="text-green-600 font-medium">FoodBundles</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Flutterwave Redirect Modal */}
      {showFlutterwaveInfo && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md w-full max-w-md flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-[16px] font-medium text-gray-900 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Complete Payment
              </h3>
              <button
                onClick={() => setShowFlutterwaveInfo(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              <div className="p-4">
                <ul className="text-[13px] text-gray-900 space-y-1 list-decimal">
                  <li>Click Continue</li>
                  <li>Enter the OTP sent to your WhatsApp</li>
                  <li>Press *182*7*1# then Trach your Order</li>
                </ul>
              </div>

              <button
                onClick={handleFlutterwaveRedirect}
                className="w-full h-10 bg-green-600 hover:bg-green-700 text-white text-[14px] font-medium cursor-pointer flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Continue to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
