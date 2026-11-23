"use client";

import { cn } from "@/lib/utils";
import {
  Bell,
  HelpCircle,
  Crown,
  Ticket,
  Store,
  ShoppingCart,
  Wallet,
  Plus,
  Settings,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/contexts/auth-context";

type MenuItem = { icon: LucideIcon; label: string; href: string };

// Grouped like the food.rw site: what you buy, how you pay, your account
export const menuGroups: { title: string; items: MenuItem[] }[] = [
  {
    title: "Market",
    items: [
      { icon: Store, label: "Shop", href: "/restaurant" },
      { icon: ShoppingCart, label: "Orders", href: "/restaurant/orders" },
      { icon: Bell, label: "Updates", href: "/restaurant/updates" },
    ],
  },
  {
    title: "Money",
    items: [
      { icon: Wallet, label: "Wallet", href: "/restaurant/deposits" },
      { icon: Ticket, label: "Vouchers", href: "/restaurant/vouchers" },
      { icon: Crown, label: "Subscription", href: "/restaurant/subscribe" },
    ],
  },
  {
    title: "Account",
    items: [
      { icon: Plus, label: "Affiliators", href: "/restaurant/affiliators" },
      { icon: HelpCircle, label: "Help & Support", href: "/restaurant/help" },
      { icon: Settings, label: "Settings", href: "/restaurant/settings/authenticator" },
    ],
  },
];

// Shop only matches itself; other pages also match their sub-pages
export function isMenuItemActive(href: string, pathname: string) {
  if (href === "/restaurant") return pathname === href;
  const section = href.split("/").slice(0, 3).join("/");
  return pathname === href || pathname.startsWith(section + "/") || pathname === section;
}

interface RestaurantSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RestaurantSidebar({ isOpen, onClose }: RestaurantSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Affiliators don't manage affiliators
  const groups = menuGroups.map((g) => ({
    ...g,
    items: g.items.filter((item) => !(item.href === "/restaurant/affiliators" && user?.role === "AFFILIATOR")),
  }));

  return (
    <div
      className={cn(
        "fixed md:relative",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        "z-50 md:z-auto",
        "w-60 min-w-60 h-screen supports-[height:100dvh]:h-dvh flex flex-col shrink-0",
        "transition-transform duration-300 ease-in-out",
        "relative overflow-hidden bg-[#0B2E1F] text-white",
      )}
    >
      {/* Soft glows from the site's hero gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 0% 0%, #00D04833 0, transparent 45%), radial-gradient(circle at 100% 100%, #18A0A033 0, transparent 45%)",
        }}
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="px-5 pb-4 pt-5">
          <Link href="/" className="inline-flex items-center gap-2.5 rounded-full bg-white py-1 pl-1.5 pr-3.5" aria-label="Food Bundles home">
            <Image src="/home/food-bundles-logo.png" alt="" width={33} height={28} className="h-7 w-auto" />
            <span className="text-[15px] font-bold tracking-tight text-[#0B2E1F] [font-family:var(--font-inter-tight),sans-serif]">
              Food Bundles
            </span>
          </Link>
        </div>

        <nav aria-label="Dashboard" className="flex-1 overflow-auto px-3 pb-4 scrollbar-hide">
          {groups.map((group) => (
            <div key={group.title} className="mt-4 first:mt-2">
              <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-[1.4px] text-[#7CF2A6]/80">{group.title}</p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isMenuItemActive(item.href, pathname);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => onClose()}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-semibold transition-colors",
                          active ? "bg-[#00D048] text-[#0B2E1F]" : "text-white/85 hover:bg-white/10 hover:text-white",
                        )}
                      >
                        <item.icon className="h-[18px] w-[18px] shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            href="/"
            className="flex min-h-11 items-center justify-between rounded-xl px-3 text-[14px] font-semibold text-white/80 hover:bg-white/10 hover:text-white"
          >
            Visit food.rw
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
