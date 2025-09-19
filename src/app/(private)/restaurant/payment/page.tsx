/* eslint-disable react/no-unescaped-entities */
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
import {
  Loader2,
  CreditCard,
  Smartphone,
  Banknote,
  ExternalLink,
  Info,
} from "lucide-react";
import { checkoutService, type Checkout } from "@/app/services/checkoutService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PaymentPage() {
  const router = useRouter();
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

        console.log("Payment provider:", paymentProvider);
        console.log("Requires redirect:", requiresRedirect);
        console.log("Redirect URL:", redirectUrl);

        if (paymentMethod === "MOBILE_MONEY") {
          if (paymentProvider === "PAYPACK") {
            console.log(
              "PayPack payment initiated - redirecting to confirmation"
            );
            router.push("/restaurant/orders");
          } else if (
            paymentProvider === "FLUTTERWAVE" &&
            requiresRedirect &&
            redirectUrl
          ) {
            console.log("Flutterwave payment - showing redirect dialog");
            setRedirectUrl(redirectUrl);
            setShowFlutterwaveInfo(true);
          } else {
            console.log(
              "Default mobile money flow - redirecting to confirmation"
            );
            router.push("/restaurant/orders");
          }
        } else {
          console.log("Cash/Card payment - redirecting to confirmation");
          router.push("/restaurant/orders");
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
      console.log("Redirecting to Flutterwave:", redirectUrl);
      window.location.href = redirectUrl;
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
                            Order #{checkout.id.slice(-8)}
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
                <CardTitle>You may change Payment Method</CardTitle>
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

        {/* Flutterwave Redirect Dialog */}
        <Dialog
          open={showFlutterwaveInfo}
          onOpenChange={setShowFlutterwaveInfo}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                Complete Payment
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <ul className="text-sm text-green-700 space-y-1">
                  <li>Click Continue</li>
                  <li>Enter the OTP sent to your mobile phone</li>
                  <li>Complete the payment verification process</li>
                  <li>
                    After successful payment, you'll be redirected back to
                    confirmation page
                  </li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleFlutterwaveRedirect}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Continue to Payment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
