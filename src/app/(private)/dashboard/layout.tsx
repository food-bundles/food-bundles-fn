"use client";
import type React from "react";
import { AdminSidebar } from "./_components/admin-sidebar";
import { AdminHeader } from "./_components/admin-header";
import { SubmissionProvider } from "@/app/contexts/submission-context";
import { CategoryProvider } from "@/app/contexts/category-context";
import { ProductProvider } from "@/app/contexts/product-context";
import { useState, useEffect } from "react";
import { RestaurantProvider } from "@/app/contexts/RestaurantContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <SubmissionProvider>
      <RestaurantProvider>
        <CategoryProvider>
          <ProductProvider>
            <div className="flex h-screen bg-white">
              {/* Sidebar */}
              <div
                className={`${
                  sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } md:translate-x-0 fixed md:relative z-50 md:z-auto transition-transform duration-300 ease-in-out`}
              >
                <AdminSidebar
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

              <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <div className="bg-green-500 w-full shrink-0">
                  <AdminHeader
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                    sidebarOpen={sidebarOpen}
                  />
                </div>

                <main className="flex-1 bg-gray-100 overflow-y-auto">
                  <div className="min-h-full py-0">{children}</div>
                </main>
              </div>
            </div>
          </ProductProvider>
        </CategoryProvider>
      </RestaurantProvider>
    </SubmissionProvider>
  );
}