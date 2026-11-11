import React from "react";
import { SiteShell } from "@/components/home/site-shell";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function RestaurantLayout({ children }: LayoutProps) {
  return <SiteShell>{children}</SiteShell>;
}
