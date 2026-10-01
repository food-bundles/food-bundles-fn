"use client";

import { useEffect, useState } from "react";
import { FarmerSidebar } from "./_components/farmer-sidebar";
import DashboardHeader from "./_components/farmerheader";
import { SubmissionProvider } from "@/app/contexts/submission-context";

interface FarmerLayoutProps {
  children: React.ReactNode;
}

/**
 * Shared chrome for all farmer routes: a persistent sidebar on md+ screens
 * that collapses to a slide-over on mobile, plus the sticky top header.
 */
export default function FarmerLayout({ children }: FarmerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <SubmissionProvider>
      <div className="flex h-screen bg-white">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 fixed md:relative z-50 md:z-auto transition-transform duration-300 ease-in-out`}
        >
          <FarmerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <DashboardHeader
            onMenuClick={() => setSidebarOpen((prev) => !prev)}
            sidebarOpen={sidebarOpen}
          />
          <main className="flex-1 bg-gray-50 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SubmissionProvider>
  );
}
