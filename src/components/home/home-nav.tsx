"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronDown, LayoutGrid, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/app/contexts/auth-context";
import { getRedirectPath } from "@/lib/navigations";
import { UserRole } from "@/lib/types";
import { RoleSwitchMenuItems } from "@/components/role-switcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SECTIONS = [
  { label: "Engine", href: "/#flow" },
  { label: "Values", href: "/#values" },
  { label: "Card", href: "/#card" },
  { label: "Food courts", href: "/#foodcourts" },
  { label: "Prices", href: "/price-comparison" },
  { label: "Shop", href: "/shop" },
];

// Site-wide header. "overlay" sits transparent on the home hero and turns
// solid on scroll; "solid" is for pages without a hero, and takes up space.
export function HomeNav({ variant = "overlay" }: { variant?: "overlay" | "solid" }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const overlay = variant === "overlay";

  useEffect(() => {
    setMounted(true);
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  const signedIn = mounted && isAuthenticated && !!user?.role;
  const dashboardHref = signedIn ? getRedirectPath(user!.role as UserRole) : "/login";
  const userName = user?.name || user?.username || "My account";
  const solid = !overlay || scrolled || open;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      // Full reload clears the router cache and every context holding the user's data
      window.location.href = "/";
    }
  };

  return (
    <header
      className={`${overlay ? "fixed" : "sticky"} inset-x-0 top-0 z-50 print:hidden transition-colors duration-300 ${
        solid ? "bg-[#0B2E1F] shadow-[0_10px_30px_-20px_#000]" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 rounded-full bg-white/95 py-1 pl-1.5 pr-3.5" aria-label="Food Bundles home">
          <Image src="/home/food-bundles-logo.png" alt="" width={28} height={28} className="h-7 w-auto" priority />
          <span className="fb-display text-[15px] font-bold tracking-tight text-[#0B2E1F]">Food Bundles</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href} className="rounded-full px-3 py-2.5 text-base font-bold text-white hover:bg-white/10">
              {s.label}
            </Link>
          ))}
          {signedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-2 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white px-4 text-base font-bold text-[#0B2E1F] outline-none">
                <span className="max-w-[140px] truncate">{userName}</span>
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate font-normal text-gray-500">{user?.email || user?.phone}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={dashboardHref} className="cursor-pointer">
                    <LayoutGrid className="mr-2 h-4 w-4" /> My account
                  </Link>
                </DropdownMenuItem>
                <RoleSwitchMenuItems />
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-3 py-2.5 text-base font-bold text-white hover:bg-white/10">
                Log in
              </Link>
              <Link href="/signup" className="fb-arrow ml-1 inline-flex min-h-10 items-center gap-1 rounded-full bg-white/20 px-4 text-base font-bold text-white hover:bg-white/30">
                Sign up <span className="fb-chev">›</span>
              </Link>
            </>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="fb-mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/10 lg:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav id="fb-mobile-nav" aria-label="Main" className="border-t border-white/10 px-4 pb-5 pt-2 lg:hidden">
          <div className="flex flex-col">
            {SECTIONS.map((s) => (
              <Link key={s.href} href={s.href} onClick={() => setOpen(false)} className="py-3 text-lg font-bold text-white">
                {s.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex gap-3">
            {signedIn ? (
              <>
                <Link href={dashboardHref} className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-white font-bold text-[#0B2E1F]">
                  My account
                </Link>
                <button type="button" onClick={handleLogout} className="flex min-h-12 flex-1 items-center justify-center rounded-full border border-white/40 font-bold text-white">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="flex min-h-12 flex-1 items-center justify-center rounded-full border border-white/40 font-bold text-white">
                  Log in
                </Link>
                <Link href="/signup" className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-white font-bold text-[#0B2E1F]">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
