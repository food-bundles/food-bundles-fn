"use client";

import type React from "react";
import { createContext, useContext, useState } from "react";

export interface DeliveryData {
  fullName: string;
  phoneNumber: string;
  deliveryAddress: string;
  deliveryInstructions: string;
  location: { lat: number; lng: number };
}

export interface PaymentData {
  method: "CASH" | "MOBILE_MONEY" | "BANK_TRANSFER" | "CARD";
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  phoneNumber?: string;
}

interface CheckoutContextType {
  deliveryData: DeliveryData;
  paymentData: PaymentData;
  updateDeliveryData: (data: Partial<DeliveryData>) => void;
  updatePaymentData: (data: Partial<PaymentData>) => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined
);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [deliveryData, setDeliveryData] = useState<DeliveryData>({
    fullName: "John Doe",
    phoneNumber: "(123) 456-7890",
    deliveryAddress: "123 Main St, Apt 4B",
    deliveryInstructions: "",
    location: { lat: -1.9577, lng: 30.0619 },
  });

  const [paymentData, setPaymentData] = useState<PaymentData>({
    method: "CASH",
  });

  const updateDeliveryData = (data: Partial<DeliveryData>) => {
    setDeliveryData((prev) => ({ ...prev, ...data }));
  };

  const updatePaymentData = (data: Partial<PaymentData>) => {
    setPaymentData((prev) => ({ ...prev, ...data }));
  };

  return (
    <CheckoutContext.Provider
      value={{
        deliveryData,
        paymentData,
        updateDeliveryData,
        updatePaymentData,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within CheckoutProvider");
  }
  return context;
}
