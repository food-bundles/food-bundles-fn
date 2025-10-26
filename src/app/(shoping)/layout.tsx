import React from "react";
// import { Header } from "@/components/header";
import { Header } from "@/components/header";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function RestaurantLayout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* <Header /> */}
      <Header />
      <main className="flex-grow container mx-auto">{children}</main>
    </div>
  );
}
