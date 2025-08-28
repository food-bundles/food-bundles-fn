/* eslint-disable @typescript-eslint/no-unused-vars */
import type React from "react";
import { AdminSidebar } from "./_components/admin-sidebar";
import { AdminHeader } from "./_components/admin-header";
import { roleGuard } from "@/lib/role-guard";
import { UserRole } from "@/lib/types";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
  }) {
  const user = await roleGuard([UserRole.ADMIN]);
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <AdminSidebar /> 
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="bg-green-500 w-full flex-shrink-0">
          <AdminHeader /> 
        </div> 
        <main className="flex-grow overflow-auto min-h-0">
          <div className="container mx-auto max-w-full px-4">
            {children}
          </div> 
        </main> 
      </div> 
    </div>
  );
}
