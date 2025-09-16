/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard, Smartphone, Banknote } from "lucide-react";
import { checkoutService, type Checkout } from "@/app/services/checkoutService";
import { JSX } from "react/jsx-dev-runtime";

export default function PaymentPage() {
  const router = useRouter();
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [selectedCheckout, setSelectedCheckout] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "MOBILE_MONEY" | "CARD"
  >("CASH");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");

  // Payment form data
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const paymentMethods = [
    {
      id: "CASH" as const,
      name: "Cash on Delivery",
    },
    {
      id: "MOBILE_MONEY" as const,
      name: "Mobile Money",
    },
    {
      id: "CARD" as const,
      name: "Credit/Debit Card",
    },
  ];

  // Fetch user's checkouts on component mount
  useEffect(() => {
    const fetchCheckouts = async () => {
      try {
        const response = await checkoutService.getMyCheckouts();
        if (response.success && response.data) {
          // Filter for pending checkouts only
          const pendingCheckouts = response.data.filter(
            (checkout) => checkout.paymentStatus === "PENDING"
          );
          setCheckouts(pendingCheckouts);

          // Auto-select first checkout if available
          if (pendingCheckouts.length > 0) {
            setSelectedCheckout(pendingCheckouts[0].id);
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

      // Add method-specific data
      if (paymentMethod === "MOBILE_MONEY") {
        paymentData.phoneNumber = phoneNumber;
      } else if (paymentMethod === "CARD") {
        paymentData = { ...paymentData, ...cardData };
      }

      // Process the payment
      const response = await checkoutService.processPayment(
        selectedCheckout,
        paymentData
      );

      if (response.success) {
        // Redirect to confirmation page
        router.push("/restaurant/confirmation");
      } else {
        setError(response.message || "Payment processing failed");
      }
    } catch (err) {
      setError("An error occurred while processing your payment");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (checkouts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="text-center py-8 px-6">
            <p className="text-gray-600 mb-4">No pending orders found</p>
            <button
              onClick={() => router.push("/restaurant")}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Selection */}

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Complete Your Payment
                </h1>
                <p className="text-gray-600">
                  Select your order and choose a payment method
                </p>
              </div>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Select Order
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {checkouts.map((checkout) => (
                    <div
                      key={checkout.id}
                      className="flex items-center space-x-3 p-4 border rounded-lg"
                    >
                      <input
                        type="radio"
                        id={checkout.id}
                        name="checkout"
                        value={checkout.id}
                        checked={selectedCheckout === checkout.id}
                        onChange={(e) => setSelectedCheckout(e.target.value)}
                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <label htmlFor={checkout.id} className="cursor-pointer">
                          <div className="font-medium">
                            {/* Order #{checkout.txOrderId} */}
                          </div>
                          <div className="text-sm text-gray-600">
                            {checkout.billingName} •{" "}
                            {checkout.totalAmount.toLocaleString()} RWF
                          </div>
                          <div className="text-xs text-gray-500">
                            Payment Method: {checkout.paymentMethod}
                          </div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Payment Method
                </h3>
                <p className="text-sm text-gray-500">
                  Confirm the method of payment you will use
                </p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  {paymentMethods.map((method) => {
                    const icons: Record<string, JSX.Element> = {
                      CASH: <Banknote className="h-8 w-8" />,
                      MOBILE_MONEY: <Smartphone className="h-8 w-8" />,
                      CARD: <CreditCard className="h-8 w-8" />,
                    };

                    const isActive = paymentMethod === method.id;

                    return (
                      <div
                        key={method.id}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all ${
                          isActive
                            ? "border-green-600 bg-green-50 text-green-700 shadow-md"
                            : "border-gray-200 hover:border-green-400 hover:bg-gray-50"
                        }`}
                        onClick={() => setPaymentMethod(method.id)}
                      >
                        <div className="mb-2">{icons[method.id]}</div>
                        <span className="text-sm font-medium text-center">
                          {method.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Details Form */}
              <div className="px-6 py-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Payment Details
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {paymentMethod === "CASH" && (
                  <div className="text-center py-8">
                    <Banknote className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600">
                      You will pay with cash when your order is delivered.
                    </p>
                  </div>
                )}

                {paymentMethod === "MOBILE_MONEY" && (
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="078XXXXXXX"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      You will receive a payment prompt on your phone to
                      complete the transaction.
                    </div>
                  </div>
                )}

                {paymentMethod === "CARD" && (
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="cardNumber"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Card Number
                      </label>
                      <input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardData.cardNumber}
                        onChange={(e) =>
                          setCardData((prev) => ({
                            ...prev,
                            cardNumber: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="expiry"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Expiry Date
                        </label>
                        <input
                          id="expiry"
                          placeholder="MM/YY"
                          value={cardData.expiryDate}
                          onChange={(e) =>
                            setCardData((prev) => ({
                              ...prev,
                              expiryDate: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="cvv"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          CVV
                        </label>
                        <input
                          id="cvv"
                          placeholder="123"
                          value={cardData.cvv}
                          onChange={(e) =>
                            setCardData((prev) => ({
                              ...prev,
                              cvv: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="cardholderName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Cardholder Name
                      </label>
                      <input
                        id="cardholderName"
                        placeholder="John Doe"
                        value={cardData.cardholderName}
                        onChange={(e) =>
                          setCardData((prev) => ({
                            ...prev,
                            cardholderName: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
