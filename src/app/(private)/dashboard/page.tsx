"use client";

import { DashboardProvider } from "@/app/contexts/DashboardContext";
import { DashboardContent } from "./_components/DashboardContent";
import { useAdminAccess } from "@/app/hooks/useAdminAccess";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { user, loading, can } = useAdminAccess();

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  // Every dashboard user lands here; statistics need the "Dashboard" permission
  if (!can("dashboard")) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">
            Welcome{user?.username ? `, ${user.username}` : ""}
          </h1>
          {user?.adminRole?.name && (
            <p className="mt-1 text-xs font-medium text-green-700">{user.adminRole.name}</p>
          )}
          <p className="mt-4 text-sm text-gray-600">
            Use the menu on the left to open the pages you have access to.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
