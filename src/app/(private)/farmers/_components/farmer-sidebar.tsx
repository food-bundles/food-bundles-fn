"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wallet,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { authService } from "@/app/services/authService";
import { OptimizedImage } from "@/components/OptimizedImage";

/** A single sidebar navigation entry. */
interface MenuItem {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/farmers" },
  { icon: Wallet, label: "Sales", href: "/farmers/sales" },
  { icon: User, label: "Profile", href: "/farmers/profile" },
  { icon: Settings, label: "Settings", href: "/farmers/setting/authenticator" },
];

interface FarmerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CurrentUser {
  name?: string;
  username?: string;
  email?: string;
}

/**
 * Farmer-facing sidebar navigation, shown on md+ screens and as a
 * slide-over on mobile. Mirrors the trader/restaurant sidebar pattern
 * for visual and behavioral consistency across role areas.
 */
export function FarmerSidebar({ isOpen, onClose }: FarmerSidebarProps) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userData, setUserData] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (isMounted) {
          setUserData(response?.user ?? null);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, []);

  const isItemActive = (item: MenuItem) => pathname === item.href;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      await new Promise((resolve) => setTimeout(resolve, 500));
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
  };

  return (
    <div className="relative w-60 min-w-60 h-screen overflow-hidden bg-green-800">
      <div
        className={cn(
          "fixed md:relative",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "z-50 md:z-auto w-60 min-w-60 h-screen border-r border-gray-200 flex flex-col shrink-0 transition-transform duration-300 ease-in-out",
        )}
        style={{ backgroundColor: "transparent" }}
      >
        {/* Logo */}
        <div className="p-3 md:p-4 flex items-center justify-between shrink-0 relative z-10 bg-green-900 backdrop-blur-sm">
          <Link href="/">
            <div className="flex items-center gap-2">
              <OptimizedImage
                src="/imgs/Food_bundle_logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover"
              />
              <h1 className="text-sm font-bold text-green-100">
                Food Bundles Ltd
              </h1>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 py-2 md:py-4 mb-10 overflow-auto scrollbar-hide relative z-10"
          aria-label="Farmer navigation"
        >
          <ul className="space-y-1 px-2 md:px-3 pb-4">
            {menuItems.map((item) => {
              const isActive = isItemActive(item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => onClose()}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center px-2 md:px-3 py-2 text-xs transition-colors whitespace-nowrap rounded-md",
                      isActive
                        ? "bg-green-700 hover:bg-green-700 text-white"
                        : "text-green-200 hover:bg-green-700 hover:text-white",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5",
                        isActive ? "text-white" : "text-green-500",
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}

            {/* My Account */}
            <li className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                aria-expanded={userDropdownOpen}
                className="w-full flex items-center px-3 py-2 rounded-md text-xs transition-colors whitespace-nowrap text-green-200 hover:bg-green-700 hover:text-white"
              >
                <User className="mr-3 h-5 w-5 text-green-500" />
                <div className="flex-1 text-left mr-2">
                  <div className="text-xs">My Account</div>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    userDropdownOpen && "rotate-180",
                  )}
                />
              </button>

              {userDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-green-800 border border-green-600 rounded-md shadow-lg z-50">
                  <div className="p-3 border-b border-green-600">
                    <div className="text-xs text-green-200 font-medium truncate">
                      {userData?.name || userData?.username || "Farmer"}
                    </div>
                    {userData?.email && (
                      <div className="flex items-center mt-2 text-[10px] text-green-300">
                        <Mail className="mr-1 h-3 w-3" />
                        <span className="truncate">{userData.email}</span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={cn(
                      "w-full flex items-center px-3 py-2 text-xs transition-colors",
                      "text-red-300 hover:text-red-400 hover:bg-green-700",
                      isLoggingOut && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
