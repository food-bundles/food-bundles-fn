"use client";
import type React from "react";
import { TraderSidebar } from "./_components/trader-sidebar";
import { TraderHeader } from "./_components/trader-header";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function TraderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isAgreementPage = pathname === "/traders/agreement";

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

  // Show agreement page without sidebar/header
  if (isAgreementPage) {
    return <div>{children}</div>;
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative z-50 md:z-auto transition-transform duration-300 ease-in-out`}
      >
        <TraderSidebar
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
          <TraderHeader
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
          />
        </div>

        <main className="flex-1 bg-gray-100 overflow-y-auto">
          <div className="min-h-full px-4 py-4">{children}</div>
        </main>
      </div>
    </div>
  );
}