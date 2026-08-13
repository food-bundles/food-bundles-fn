import React from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface LayoutProps {
  children: React.ReactNode;
}

export default function LegalLayout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="grow">{children}</main>
      <Footer />
    </div>
  );
}
