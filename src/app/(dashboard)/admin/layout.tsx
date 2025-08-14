import type React from "react";
import { AdminSidebar } from "./_components/admin-sidebar";
import { AdminHeader } from "./_components/admin-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="bg-green-500 w-full flex-shrink-0">
          <AdminHeader />
        </div>
        <main className="flex-grow overflow-auto min-h-0">
          <div className="container mx-auto max-w-full px-4">{children}</div>
        </main>
        {/* <main className="flex-grow container mx-auto">{children}</main> */}
      </div>
    </div>
  );
}
