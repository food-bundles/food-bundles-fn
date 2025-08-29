/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, CreditCard, Smartphone, Banknote } from "lucide-react";
import { checkoutService, type Checkout } from "@/app/services/checkoutService";

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
      icon: Banknote,
    },
    {
      id: "MOBILE_MONEY" as const,
      name: "Mobile Money",
      icon: Smartphone,
    },
    {
      id: "CARD" as const,
      name: "Credit/Debit Card",
      icon: CreditCard,
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
        router.push("/restaurant/cart/confirmation");
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
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">No pending orders found</p>
            <Button
              onClick={() => router.push("/restaurant")}
              variant="outline"
            >
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Payment
          </h1>
          <p className="text-gray-600">
            Select your order and choose a payment method
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Order</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedCheckout}
                  onValueChange={setSelectedCheckout}
                >
                  {checkouts.map((checkout) => (
                    <div
                      key={checkout.id}
                      className="flex items-center space-x-3 p-4 border rounded-lg"
                    >
                      <RadioGroupItem value={checkout.id} id={checkout.id} />
                      <div className="flex-1">
                        <Label htmlFor={checkout.id} className="cursor-pointer">
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
                        </Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle>You May Change Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value: any) => setPaymentMethod(value)}
                >
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <div
                        key={method.id}
                        className="flex items-center space-x-3 p-4 border rounded-lg"
                      >
                        <RadioGroupItem value={method.id} id={method.id} />
                        <Icon className="h-6 w-6 text-gray-600" />
                        <div className="flex-1">
                          <Label htmlFor={method.id} className="cursor-pointer">
                            <div className="font-medium">{method.name}</div>
                          </Label>
                        </div>
                      </div>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Payment Details */}
          <div className="space-y-6">
            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="078XXXXXXX"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
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
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardData.cardNumber}
                        onChange={(e) =>
                          setCardData((prev) => ({
                            ...prev,
                            cardNumber: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={cardData.expiryDate}
                          onChange={(e) =>
                            setCardData((prev) => ({
                              ...prev,
                              expiryDate: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={cardData.cvv}
                          onChange={(e) =>
                            setCardData((prev) => ({
                              ...prev,
                              cvv: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cardholderName">Cardholder Name</Label>
                      <Input
                        id="cardholderName"
                        placeholder="John Doe"
                        value={cardData.cardholderName}
                        onChange={(e) =>
                          setCardData((prev) => ({
                            ...prev,
                            cardholderName: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handlePayment}
                  disabled={isProcessing || !selectedCheckout}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing Payment...
                    </>
                  ) : (
                    `Pay ${
                      selectedCheckoutData?.totalAmount.toLocaleString() || 0
                    } RWF`
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
