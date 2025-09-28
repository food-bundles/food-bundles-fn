import React from "react";
// import { Header } from "@/components/header";
import { TopResNav } from "../(private)/restaurant/_components/restaurant-top-nav";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function RestaurantLayout({ children }: LayoutProps) {
  return (
      <div className="flex flex-col min-h-screen">
          {/* <Header /> */}
          <TopResNav />
      <main className="flex-grow container mx-auto">{children}</main>
    </div>
  );
}
