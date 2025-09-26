import React from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { QuickTalkWrapper } from "@/components/quck-talk-section";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function RestaurantLayout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto">{children}</main>
      <div id="ask-help">
        <QuickTalkWrapper />
      </div>
      <Footer />
    </div>
  );
}
