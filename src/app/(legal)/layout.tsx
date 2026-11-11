import React from "react";
import { SiteShell } from "@/components/home/site-shell";

interface LayoutProps {
  children: React.ReactNode;
}

export default function LegalLayout({ children }: LayoutProps) {
  return <SiteShell>{children}</SiteShell>;
}
