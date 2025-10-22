/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  UserPlus,
  Home,
  ChevronDown,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NotificationsDrawer from "./notificationDrawer";
import Image from "next/image";
import { authService } from "@/app/services/authService";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/contexts/auth-context";
import { useCategory } from "@/app/contexts/category-context";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const sampleNotifications = [
  {
    id: "1",
    title: "Order Initiated",
    message: "Your order with id #123-4568 has been initiated successfully",
    orderId: "#123-4568",
    timestamp: "12/12/2024 08:30 PM",
    isRead: false,
    type: "order_initiated" as const,
  },
  {
    id: "2",
    title: "Order Completed",
    message: "Your order with id #123-4568 has been completed successfully",
    orderId: "#123-4568",
    timestamp: "12/12/2024 08:30 PM",
    isRead: true,
    type: "order_completed" as const,
  },
  {
    id: "3",
    title: "Payment Received",
    message: "Payment for order #123-4568 has been received",
    orderId: "#123-4568",
    timestamp: "12/12/2024 08:30 PM",
    isRead: true,
    type: "payment_received" as const,
  },
  {
    id: "4",
    title: "Order Cancelled",
    message: "Your order with id #123-4569 has been cancelled",
    orderId: "#123-4569",
    timestamp: "12/12/2024 08:30 PM",
    isRead: false,
    type: "order_cancelled" as const,
  },
  {
    id: "5",
    title: "Order Initiated",
    message: "Your order with id #123-4570 has been initiated successfully",
    orderId: "#123-4570",
    timestamp: "12/12/2024 08:30 PM",
    isRead: false,
    type: "order_initiated" as const,
  },
];

export function TopResNav() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const { user, getUserProfileImage } = useAuth();
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);

  const { activeCategories, isLoading: categoriesLoading } = useCategory();

  const categoryDropdownTimeout = useRef<NodeJS.Timeout | null>(null);

  const unreadCount = sampleNotifications.filter((n) => !n.isRead).length;
  const pathname = usePathname();


  const handleCategorySelect = (categoryName: string) => {
    // Navigate to restaurant page with category
    const url = new URL('/restaurant', window.location.origin);
    if (categoryName !== 'All Categories') {
      url.searchParams.set('category', categoryName);
    }
    
    // Dispatch event for same-page updates
    const event = new CustomEvent("categorySelected", {
      detail: categoryName,
    });
    window.dispatchEvent(event);
    
    setIsCategoryDropdownOpen(false);
    setIsMobileMenuOpen(false);
    
    // Navigate if not already on restaurant page
    if (window.location.pathname !== '/restaurant') {
      window.location.href = url.toString();
    }
  };

  const handleShopMouseEnter = () => {
    if (categoryDropdownTimeout.current) {
      clearTimeout(categoryDropdownTimeout.current);
    }
    setIsCategoryDropdownOpen(true);
  };

  const handleShopMouseLeave = () => {
    categoryDropdownTimeout.current = setTimeout(() => {
      setIsCategoryDropdownOpen(false);
    }, 150);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      await new Promise((resolve) => setTimeout(resolve, 500));
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Something went wrong!");
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const profileImage = getUserProfileImage();
  const userName = user?.name || user?.name || "";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".shop-dropdown")) {
        setIsCategoryDropdownOpen(false);
      }
      if (!target.closest(".profile-dropdown")) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (categoryDropdownTimeout.current) {
        clearTimeout(categoryDropdownTimeout.current);
      }
    };
  }, []);

  return (
    <>
      <header className="bg-green-700 border-b border-green-600 sticky top-0 z-50 ">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-13">
            <Link href="/">
              <div className="flex items-center gap-2 bg-green-50 px-2 sm:px-3 py-1 rounded-full border-2 border-primary flex-shrink-0">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202025-08-26%20at%2017.19.27_37ef906c.jpg-5w6VIINuFETMhj8U6ktDEnUViMPQod.jpeg"
                  alt="FoodBundle Logo"
                  width={32}
                  height={32}
                  className="rounded-full object-cover w-5 h-5"
                />
                <span className="text-2sm font-bold text-black whitespace-nowrap">
                  FoodBundles
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-green-600 cursor-pointer text-primary-foreground hover:text-primary-foreground h-8 w-8 sm:h-10 sm:w-10"
                onClick={() => setIsNotificationsOpen(true)}
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  {unreadCount}
                </Badge>
              </Button>
              {/* Desktop User Menu - Custom Dropdown */}
              <div className="hidden sm:block relative profile-dropdown">
                <button
                  onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                  }
                  className="flex items-center gap-2 hover:bg-transparent py-3 sm:py-5 cursor-pointer text-primary-foreground hover:text-primary-foreground"
                >
                  {user ? (
                    <>
                      <span className="font-medium text-[13px] hidden md:inline">
                        {userName}
                      </span>
                      <div className="rounded-full flex items-center justify-center">
                        {user?.profileImage ? (
                          <Image
                            src={profileImage || "/placeholder.svg"}
                            alt={`${userName}'s profile`}
                            width={32}
                            height={32}
                            className="rounded-full object-cover w-6 h-6 sm:w-8 sm:h-8"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder.svg";
                            }}
                          />
                        ) : (
                          <div className="rounded-full bg-green-600 text-white flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 font-medium">
                            {userName.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <Skeleton className="h-5 w-20 md:h-6 md:w-24 hidden md:inline bg-green-600/60" />
                      <Skeleton className="rounded-full h-8 w-8 sm:h-10 sm:w-10 bg-green-600/60" />
                    </>
                  )}
                </button>

                {/* Custom Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-17 w-32 bg-white shadow-lg border border-gray-200 py-1 z-50">
                    <Link href="#" className="block">
                      <div className="flex items-center gap-1 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors">
                        <UserPlus className="w-4 h-4" />
                        Profile
                      </div>
                    </Link>
                    <Link href="/" className="block">
                      <div className="flex items-center gap-1 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors">
                        <Home className="w-4 h-4" />
                        Home
                      </div>
                    </Link>
                    <div className="border-t border-gray-100 mt-1"></div>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className={cn(
                        "w-full text-left px-4 py-2 text-[13px] transition-colors whitespace-nowrap",
                        "text-red-600 hover:bg-gray-100",
                        isLoggingOut && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isLoggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </header>

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={sampleNotifications}
      />
    </>
  );
}
