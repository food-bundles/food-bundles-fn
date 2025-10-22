"use client";

import { cn } from "@/lib/utils";
import { Bell, HelpCircle, Crown, Ticket, Home, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

const menuItems = [
  { icon: Home, label: "Shop", href: "/restaurant" },
  { icon: Bell, label: "Updates", href: "/restaurant/updates" },
  { icon: Crown, label: "Subscription", href: "/restaurant/subscribe" },
  { icon: Ticket, label: "Vouchers", href: "/restaurant/vouchers" },
  { icon: HelpCircle, label: "Help & Support", href: "/restaurant/help" },
];

interface RestaurantSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RestaurantSidebar({ isOpen, onClose }: RestaurantSidebarProps) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Add your logout logic here
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
  };

  const isItemActive = (href: string) => {
    return pathname === href;
  };

  return (
    <div
      className={cn(
        "fixed md:relative",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        "z-50 md:z-auto",
        "w-60 min-w-60 h-screen flex flex-col flex-shrink-0",
        "transition-transform duration-300 ease-in-out",
        "relative overflow-hidden"
      )}
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/imgs/sidebarImg.jpg"
          alt="Sidebar Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-green-900/90" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Logo Header */}
        <div className="p-6 border-b border-white/10">
          <Link href="/">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-26%20at%2017.19.27_37ef906c.jpg-5w6VIINuFETMhj8U6ktDEnUViMPQod.jpeg"
                  alt="FoodBundle Logo"
                  width={24}
                  height={24}
                  className="rounded object-cover"
                />
              </div>
              <h1 className="text-white text-lg font-semibold tracking-wide">
                FOODBUNDLES
              </h1>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 overflow-auto scrollbar-hide">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const isActive = isItemActive(item.href);
              return (
                <li key={index}>
                  <Link
                    href={item.href}
                    onClick={() => onClose()}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 rounded text-[15px] font-medium transition-all duration-200",
                      isActive
                        ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                        : "text-white hover:bg-[#212121]"
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}

            {/* Logout Button */}
            <li>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded text-[15px] font-medium transition-all duration-200",
                  "text-white hover:bg-[#212121]",
                  isLoggingOut && "opacity-50 cursor-not-allowed"
                )}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
