"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, Smartphone } from "lucide-react";

export function PaymentMethods() {
  const [selectedMethod, setSelectedMethod] = useState("cash");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const paymentMethods = [
    {
      id: "cash",
      name: "Cash",
      description: "Pay with cash upon delivery",
      icon: DollarSign,
    },
    {
      id: "card",
      name: "Card",
      description: "Pay with credit or debit card",
      icon: CreditCard,
    },
    {
      id: "momo",
      name: "MoMo",
      description: "Pay with mobile money",
      icon: Smartphone,
    },
  ];

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    // Add spaces every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    return formatted.slice(0, 19); // Limit to 16 digits + 3 spaces
  };

  const formatExpiryDate = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    // Add slash after 2 digits
    if (digits.length >= 2) {
      return digits.slice(0, 2) + "/" + digits.slice(2, 4);
    }
    return digits;
  };

  const formatPhoneNumber = (value: string) => {
    // Ensure it starts with +250 for Rwanda
    if (!value.startsWith("+250")) {
      return "+250" + value.replace(/\D/g, "").slice(0, 9);
    }
    // Remove all non-digits except the + at the start
    const digits = value.slice(1).replace(/\D/g, "");
    return "+" + digits.slice(0, 12); // +250 + 9 digits
  };

  const handleCardNumberChange = (e: { target: { value: string } }) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: { target: { value: string } }) => {
    const formatted = formatExpiryDate(e.target.value);
    setExpiryDate(formatted);
  };

  const handleCvvChange = (e: { target: { value: string } }) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCvv(digits);
  };

  const handlePhoneChange = (e: { target: { value: string } }) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedMethod === method.id
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <method.icon
                  className={`h-8 w-8 ${
                    selectedMethod === method.id
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{method.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {method.description}
                  </p>
                </div>
                {selectedMethod === method.id && (
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Payment Details Section */}
        {selectedMethod === "card" && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-4">Card Details</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={handleCvvChange}
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedMethod === "momo" && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-4">
              Mobile Money Details
            </h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="+250788734867"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter your mobile money number (e.g., +250788734867)
              </p>
            </div>
          </div>
        )}

        {selectedMethod === "cash" && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Cash Payment</h4>
            <p className="text-gray-600 text-sm">
              You will pay with cash when your order is delivered to you.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
