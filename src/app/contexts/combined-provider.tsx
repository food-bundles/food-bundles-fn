"use client";

import React from "react";
import { AuthProvider } from "./auth-context";
import { ProductProvider } from "./product-context";
import { CartProvider } from "./cart-context";
import { CategoryProvider } from "./category-context";
import { PerformanceMonitor } from "@/components/performance-monitor";
import { VoucherProvider } from "./VoucherContext";

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
              <VoucherProvider>{children}</VoucherProvider>
            </CategoryProvider>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </>
  );
}