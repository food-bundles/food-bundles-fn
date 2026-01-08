"use client";

import { cn } from "@/lib/utils";
import { Bell, HelpCircle, Crown, Ticket, Home, ShoppingCart, Wallet} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { OptimizedImage } from "@/components/OptimizedImage";

const menuItems = [
  { icon: Home, label: "Shop", href: "/restaurant" },
  { icon: Bell, label: "Updates", href: "/restaurant/updates" },
  { icon: ShoppingCart, label: "orders", href: "/restaurant/orders" },
  { icon: Wallet, label: "Deposits", href: "/restaurant/deposits" },
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


  const isItemActive = (href: string) => {
    return pathname === href;
  };

  return (
    <div
      className={cn(
        "fixed md:relative",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        "z-50 md:z-auto",
        "w-58 min-w-58 h-screen flex flex-col shrink-0",
        "transition-transform duration-300 ease-in-out",
        "relative overflow-hidden"
      )}
    >
      <div className="absolute inset-0 z-0">
        <OptimizedImage
          src="/imgs/sidebarImg.jpg"
          alt="Sidebar Background"
          fill
          className="object-cover"
          priority
          transformation={[{ quality: "85", format: "webp" }]}
        />
        <div className="absolute inset-0 bg-green-900/90" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Logo Header */}
        <div className="p-6 border-b border-white/10">
          <Link href="/">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                <OptimizedImage
                  src="/imgs/Food_bundle_logo.png"
                  alt="FoodBundle Logo"
                  width={24}
                  height={24}
                  className="rounded object-cover"
                  transformation={[
                    { width: 48, height: 48, crop: "fill", quality: "85" },
                  ]}
                />
              </div>
              <h1 className="text-white text-sm font-semibold tracking-wide">
                Food Bundles Ltd
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
                      "flex items-center gap-3 px-4 py-2 rounded text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-green-600 text-white shadow-lg shadow-green-600/30"
                        : "text-white"
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
