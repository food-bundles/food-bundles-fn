"use client";
import React, { useState, useEffect } from "react";
import { CartProvider } from "@/app/contexts/cart-context";
import { CheckoutProvider } from "@/app/contexts/checkout-context";
import { OrderProvider } from "@/app/contexts/orderContext";
import { WalletProvider } from "@/app/contexts/WalletContext";
import { RestaurantSidebar } from "./_components/restaurant-sidebar";
import { RestaurantHeader } from "./_components/restaurant-header";

interface LayoutProps {
  children: React.ReactNode;
}

export default function RestaurantLayout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <CartProvider>
      <CheckoutProvider>
        <OrderProvider>
          <WalletProvider>
          <div className="flex h-screen bg-white">
            {/* Sidebar */}
            <div
              className={`${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              } md:translate-x-0 fixed md:relative z-50 md:z-auto transition-transform duration-300 ease-in-out`}
            >
              <RestaurantSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-40 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto scrollbar-thin">
              <div className="bg-green-500 w-full flex-shrink-0">
                <RestaurantHeader
                  onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                  sidebarOpen={sidebarOpen}
                />
              </div>

              <main className="flex-grow min-h-0">
                <div className="container mx-auto max-w-full ">{children}</div>
              </main>
            </div>
          </div>
          </WalletProvider>
        </OrderProvider>
      </CheckoutProvider>
    </CartProvider>
  );
}
