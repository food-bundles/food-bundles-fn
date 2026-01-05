"use client";

import { DashboardProvider } from "@/app/contexts/DashboardContext";
import { DashboardContent } from "./_components/DashboardContent";

export default function AdminDashboard() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}