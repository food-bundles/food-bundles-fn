"use client";

import React from "react";
import { AuthProvider } from "./auth-context";
import { ProductProvider } from "./product-context";
import { CartProvider } from "./cart-context";
import { CategoryProvider } from "./category-context";
import { PerformanceMonitor } from "@/components/performance-monitor";
import { VoucherProvider } from "./VoucherContext";
import { WalletProvider } from "./WalletContext";

interface CombinedProviderProps {
  children: React.ReactNode;
}

export function CombinedProvider({ children }: CombinedProviderProps) {
  return (
    <>
      <PerformanceMonitor />
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <CategoryProvider>
              <VoucherProvider>
                <WalletProvider>{children}</WalletProvider>
              </VoucherProvider>
            </CategoryProvider>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </>
  );
}