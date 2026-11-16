"use client";

import { Bell, Home, ShoppingCart, Settings, LogOut, ChevronDown } from "lucide-react";
import { MdMenuOpen, MdClose } from "react-icons/md";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/auth-context";
import Image from "next/image";
import { authService } from "@/app/services/authService";
import { toast } from "sonner";
import NotificationsDrawer from "./notificationDrawer";
import CartDrawer from "@/components/cartDrawer";
import { useCartSummary } from "@/app/contexts/cart-context";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/app/contexts/NotificationContext";
import { menuGroups, isMenuItemActive } from "./restaurant-sidebar";
import { RoleSwitchMenuItems } from "@/components/role-switcher";

interface RestaurantHeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

const EXTRA_TITLES: Record<string, string> = {
  "/restaurant/checkout": "Checkout",
  "/restaurant/wallet": "Wallet",
  "/restaurant/promos": "Promos",
  "/restaurant/menu": "Menu",
  "/restaurant/recipe-costing": "Recipe costing",
};

function pageTitle(pathname: string) {
  for (const g of menuGroups) {
    const hit = g.items.find((i) => isMenuItemActive(i.href, pathname));
    if (hit) return hit.label;
  }
  const extra = Object.keys(EXTRA_TITLES).find((p) => pathname.startsWith(p));
  return extra ? EXTRA_TITLES[extra] : "Dashboard";
}

function CountBadge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#00A43A] px-1 text-[11px] font-bold text-white ring-2 ring-white">
      {n > 99 ? "99+" : n}
    </span>
  );
}

const ICON_BUTTON =
  "relative flex h-10 w-10 items-center justify-center rounded-full border border-[#DCE6DF] bg-white text-[#0B2E1F] transition-colors hover:border-[#00A43A] hover:bg-[#F6F9F7] cursor-pointer";

export function RestaurantHeader({ onMenuClick, sidebarOpen }: RestaurantHeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { unreadCount } = useNotifications();
  const { user, getUserProfileImage } = useAuth();
  const { totalItems, isLoading } = useCartSummary();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();

  // The shop page has its own cart summary
  const showCartIcon = pathname !== "/restaurant";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      await new Promise((resolve) => setTimeout(resolve, 500));
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Something went wrong!");
      setIsLoggingOut(false);
    }
  };

  const profileImage = getUserProfileImage();
  const userName = user?.name || user?.username || "";
  const initials = userName ? userName.substring(0, 2).toUpperCase() : "U";

  return (
    <>
      <header className="border-b border-[#DCE6DF] bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={onMenuClick}
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              aria-expanded={sidebarOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#0B2E1F] hover:bg-[#F6F9F7] md:hidden cursor-pointer"
            >
              {sidebarOpen ? <MdClose className="h-6 w-6" /> : <MdMenuOpen className="h-6 w-6" />}
            </button>
            <div className="min-w-0">
              <p className="m-0 hidden text-[12px] font-bold uppercase tracking-[1.2px] text-[#00A43A] sm:block">
                Customer dashboard
              </p>
              <h1 className="m-0 truncate text-[20px] font-bold leading-tight tracking-[-0.4px] text-[#0B2E1F] [font-family:var(--font-inter-tight),sans-serif]">
                {pageTitle(pathname)}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {showCartIcon && (
              <button
                type="button"
                className={ICON_BUTTON}
                onClick={() => setIsCartOpen(true)}
                aria-label={`Cart, ${totalItems} items`}
              >
                <ShoppingCart className="h-[18px] w-[18px]" />
                {!isLoading && <CountBadge n={totalItems} />}
              </button>
            )}
            <button
              type="button"
              className={ICON_BUTTON}
              onClick={() => setIsNotificationsOpen(true)}
              aria-label={`Notifications, ${unreadCount} unread`}
            >
              <Bell className="h-[18px] w-[18px]" />
              <CountBadge n={unreadCount} />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-10 items-center gap-2 rounded-full border border-[#DCE6DF] bg-white py-1 pl-1 pr-2.5 text-[#0B2E1F] transition-colors hover:border-[#00A43A] cursor-pointer"
                >
                  {user?.profileImage && isMounted ? (
                    <Image
                      src={profileImage || "/placeholder.svg"}
                      alt=""
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B2E1F] text-[12px] font-bold text-[#00D048]">
                      {isMounted ? initials : "U"}
                    </span>
                  )}
                  <span className="hidden max-w-[140px] truncate text-[14px] font-bold md:inline">
                    {isMounted ? userName || "My account" : "…"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-[#4A6358]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60 rounded-xl" align="end">
                <div className="px-2 py-1.5">
                  <p className="truncate text-[14px] font-bold text-[#0B2E1F]">{isMounted ? userName : "…"}</p>
                  <p className="truncate text-[12px] text-[#4A6358]">{isMounted ? user?.email || user?.phone : "…"}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/restaurant/settings/authenticator" className="flex cursor-pointer items-center gap-2 text-[14px]">
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/" className="flex cursor-pointer items-center gap-2 text-[14px]">
                    <Home className="h-4 w-4" /> Food Bundles website
                  </Link>
                </DropdownMenuItem>
                <RoleSwitchMenuItems />
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="cursor-pointer text-[14px] text-red-600 focus:text-red-600"
                >
                  <LogOut className="h-4 w-4" /> {isLoggingOut ? "Logging out…" : "Log out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <NotificationsDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
