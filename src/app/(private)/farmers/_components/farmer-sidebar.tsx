"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  Wallet,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Mail,
  ShoppingBasket,
  TrendingUp,
  LifeBuoy,
  Plus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authService } from "@/app/services/authService";
import { RoleSwitchButtons } from "@/components/role-switcher";

/** A single sidebar navigation entry. */
interface MenuItem {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/farmers" },
  // What buyers want for the farmer's crops, and Food Bundles prices
  { icon: TrendingUp, label: "Wanted & Prices", href: "/farmers/demand-signals" },
  // Buying offers from aggregators' supply requests (schools, hotels…)
  { icon: ShoppingBasket, label: "Buying Offers", href: "/farmers/offers" },
  { icon: ClipboardList, label: "Submissions", href: "/farmers/submissions" },
  // Money received, money coming and the statement (was two pages: Sales and Report)
  { icon: Wallet, label: "Sales report", href: "/farmers/report" },
  { icon: User, label: "Profile", href: "/farmers/profile" },
  { icon: Settings, label: "Settings", href: "/farmers/setting/authenticator" },
  { icon: LifeBuoy, label: "Help & support", href: "/farmers/help" },
];

interface FarmerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CurrentUser {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
}

/**
 * Farmer navigation, same look as the other food.rw dashboards: dark green,
 * soft glows, pill links. "Submit produce" sits on top: it's what farmers do most.
 */
export function FarmerSidebar({ isOpen, onClose }: FarmerSidebarProps) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [userData, setUserData] = useState<CurrentUser | null>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    authService
      .getCurrentUser()
      .then((response) => setUserData(response?.user ?? null))
      .catch(() => setUserData(null));
  }, []);

  // Close the account menu on an outside click or Escape
  useEffect(() => {
    if (!accountOpen) return;
    const onClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAccountOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [accountOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } finally {
      // Full reload clears every context holding the farmer's data
      window.location.href = "/";
    }
  };

  const userName = userData?.name || userData?.username || userData?.phone || "";

  return (
    <div className="relative h-screen supports-[height:100dvh]:h-dvh w-60 min-w-60 overflow-hidden bg-[#0B2E1F] text-white">
      {/* Soft glows from the food.rw hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 0% 0%, #00D04833 0, transparent 45%), radial-gradient(circle at 100% 100%, #18A0A033 0, transparent 45%)",
        }}
      />
      <div
        className={cn(
          "relative z-10 flex h-screen supports-[height:100dvh]:h-dvh w-60 min-w-60 shrink-0 flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="shrink-0 px-4 pb-3 pt-4">
          <Link href="/" className="inline-flex items-center gap-2.5 rounded-full bg-white py-1 pl-1.5 pr-3.5" aria-label="Food Bundles home">
            <Image src="/home/food-bundles-logo.png" alt="" width={33} height={28} className="h-7 w-auto" />
            <span className="text-[15px] font-bold tracking-tight text-[#0B2E1F] [font-family:var(--font-inter-tight),sans-serif]">
              Food Bundles
            </span>
          </Link>
          <p className="m-0 mt-2 px-1 text-[11px] font-bold uppercase tracking-[1.4px] text-[#7CF2A6]/80">Farmer account</p>
        </div>

        {/* What farmers do most: submit produce */}
        <div className="shrink-0 px-3 pt-1">
          <Link
            href="/farmers?submit=1"
            onClick={onClose}
            className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#00D048] px-4 text-[15px] font-bold text-[#0B2E1F] shadow-[0_10px_24px_-12px_#00D048] transition-colors hover:bg-[#7CF2A6]"
          >
            <Plus className="h-4 w-4" /> Submit produce
          </Link>
        </div>

        {/* Navigation */}
        <nav aria-label="Farmer" className="scrollbar-hide flex-1 overflow-auto py-3">
          <ul className="space-y-0.5 px-3 pb-4">
            {menuItems.map((item) => {
              const isActive = item.href === "/farmers" ? pathname === "/farmers" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex min-h-10 items-center whitespace-nowrap rounded-xl px-3 text-[14px] font-semibold transition-colors",
                      isActive ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <item.icon className={cn("mr-3 h-[18px] w-[18px] shrink-0", isActive && "text-[#00D048]")} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Account */}
        <div ref={accountRef} className="relative shrink-0 border-t border-white/10 p-3">
          {accountOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-xl bg-white text-[#0B2E1F] shadow-[0_20px_40px_-12px_#000]">
              <div className="border-b border-[#DCE6DF] px-3 py-2.5">
                <p className="m-0 truncate text-[14px] font-bold">{userName || "—"}</p>
                {(userData?.email || userData?.phone) && (
                  <p className="m-0 mt-0.5 flex items-center truncate text-[12px] text-[#4A6358]">
                    <Mail className="mr-1.5 h-3 w-3 shrink-0" />
                    <span className="truncate">{userData?.email || userData?.phone}</span>
                  </p>
                )}
              </div>
              <RoleSwitchButtons className="border-b border-[#DCE6DF]" />
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex min-h-10 w-full items-center gap-2 px-3 text-[14px] text-red-600 hover:bg-red-50 disabled:opacity-60 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Logging out…" : "Log out"}
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setAccountOpen((o) => !o)}
            aria-expanded={accountOpen}
            className="flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-white/10 cursor-pointer"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00D048] text-[13px] font-bold text-[#0B2E1F]">
              {userName ? userName.substring(0, 2).toUpperCase() : <User className="h-4 w-4" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-bold">{userName || "…"}</span>
              <span className="block truncate text-[11px] text-white/60">Farmer</span>
            </span>
            <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", accountOpen && "rotate-180")} />
          </button>
        </div>
      </div>
    </div>
  );
}
