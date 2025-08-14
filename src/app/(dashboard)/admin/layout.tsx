import type React from "react";
import { AdminSidebar } from "./_components/admin-sidebar";
import { AdminHeader } from "./_components/admin-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-green-500 w-full">
          <AdminHeader />
        </div>
        <main className="flex-grow container mx-auto">{children}</main>
      </div>
    </div>
  );
}
