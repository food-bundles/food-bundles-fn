/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { TopResNav } from "./_components/restaurant-top-nav";
import { roleGuard } from "@/lib/role-guard";
import { UserRole } from "@/lib/types";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function RestaurantLayout({ children }: LayoutProps) {
  const user = await roleGuard([UserRole.RESTAURANT]);
  return (
    <div className="flex flex-col min-h-screen">
      <TopResNav />
      <main className="flex-grow container mx-auto">{children}</main>
    </div>
  );
}
