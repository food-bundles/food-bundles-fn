"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, Smartphone } from "lucide-react";

export function PaymentMethods() {
  const [selectedMethod, setSelectedMethod] = useState("cash");

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
                  ? "border-teal-500 bg-teal-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <method.icon
                  className={`h-8 w-8 ${
                    selectedMethod === method.id
                      ? "text-teal-600"
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
                  <div className="w-4 h-4 bg-teal-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
