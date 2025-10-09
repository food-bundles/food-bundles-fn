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

  const navLinks = [
    { href: "/restaurant/updates", label: "Updates" },
    { href: "/restaurant/orders", label: "Orders" },
    { href: "/restaurant/help", label: "Help & Support" },
  ];

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

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-8">
              {/* Shop with Categories Dropdown */}
              <div
                className="relative shop-dropdown"
                onMouseEnter={handleShopMouseEnter}
                onMouseLeave={handleShopMouseLeave}
              >
                <Link
                  href="/restaurant"
                  className={`flex items-center gap-2 transition-colors text-[13px] ${
                    pathname === "/restaurant"
                      ? "text-secondary"
                      : "text-primary-foreground hover:text-secondary"
                  }`}
                >
                  <div
                    className={`w-2 h-2 xl:w-3 xl:h-3 rounded-full ${
                      pathname === "/restaurant" ? "bg-orange-400" : ""
                    }`}
                  ></div>
                  Shop
                </Link>

                <div
                  className={`absolute top-4 left-0 mt-2 w-46 bg-white shadow-lg border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto transition-all duration-200 ${
                    isCategoryDropdownOpen
                      ? "opacity-100 visible transform translate-y-0"
                      : "opacity-0 invisible transform -translate-y-2"
                  }`}
                  onMouseEnter={handleShopMouseEnter}
                  onMouseLeave={handleShopMouseLeave}
                >
                  <button
                    onClick={() => handleCategorySelect("All Categories")}
                    className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                  >
                    All Categories
                  </button>

                  <div className="border-t border-gray-100 my-1"></div>

                  {categoriesLoading ? (
                    <div className="px-4 py-2">
                      {[...Array(5)].map((_, index) => (
                        <Skeleton key={index} className="h-8 w-full mb-2" />
                      ))}
                    </div>
                  ) : activeCategories.length > 0 ? (
                    activeCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.name)}
                        className="w-full text-left px-4 py-2 text-[13px] text-gray-900 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        {category.name.replace(/_/g, " ")}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-[12px] text-gray-500">
                      No categories available
                    </div>
                  )}
                </div>
              </div>

              {/* Other Navigation Links */}
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 transition-colors text-[13px] ${
                      isActive
                        ? "text-secondary"
                        : "text-primary-foreground hover:text-secondary"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 xl:w-3 xl:h-3 rounded-full ${
                        isActive ? "bg-orange-400" : ""
                      }`}
                    ></div>
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Notifications */}
              {/* <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-green-600 cursor-pointer text-primary-foreground hover:text-primary-foreground h-8 w-8 sm:h-10 sm:w-10"
                onClick={() => setIsNotificationsOpen(true)}
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  {unreadCount}
                </Badge>
              </Button> */}
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

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-green-600 cursor-pointer text-primary-foreground hover:text-primary-foreground h-8 w-8 sm:h-10 sm:w-10"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="flex justify-between lg:hidden border-t border-green-600 bg-green-700">
              <div className="px-2 py-4 space-y-1 flex-1">
                {/* Mobile Shop Link with Categories */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Link
                      href="/restaurant"
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-3 px-1 py-2.5 rounded-md text-[13px] transition-colors flex-1 ${
                        pathname === "/restaurant"
                          ? "text-secondary bg-green-600"
                          : "text-primary-foreground hover:text-secondary hover:bg-green-600"
                      }`}
                    >
                     
                      Shop
                    </Link>
                    <button
                      onClick={() =>
                        setIsMobileCategoriesOpen(!isMobileCategoriesOpen)
                      }
                      className="p-2 text-primary-foreground hover:text-secondary"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transform transition-transform duration-200 ${
                          isMobileCategoriesOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>
                  </div>

                  {isMobileCategoriesOpen && (
                    <>
                      <button
                        onClick={() => handleCategorySelect("All Categories")}
                        className="w-full text-left pl-9 pr-3 py-2 text-[13px] text-green-200 hover:text-secondary hover:bg-green-600 rounded-md transition-colors"
                      >
                        All Categories
                      </button>

                      {/* Category List */}
                      {categoriesLoading ? (
                        <div className="pl-9 pr-3">
                          {[...Array(3)].map((_, index) => (
                            <Skeleton
                              key={index}
                              className="h-6 w-full mb-2 bg-green-600/60"
                            />
                          ))}
                        </div>
                      ) : (
                        activeCategories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => handleCategorySelect(category.name)}
                            className="w-full text-left pl-9 pr-3 py-2 text-[13px] text-green-200 hover:text-secondary hover:bg-green-600 rounded-md transition-colors"
                          >
                            {category.name.replace(/_/g, " ")}
                          </button>
                        ))
                      )}
                    </>
                  )}
                </div>

                {/* Other Mobile Navigation Links */}
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-3 px-1  py-1 rounded-md text-[13px] transition-colors ${
                        isActive
                          ? "text-secondary bg-green-600"
                          : "text-primary-foreground hover:text-secondary hover:bg-green-600"
                      }`}
                    >
                     
                      {link.label}
                    </Link>
                  );
                })}

                {/* Mobile Profile Section */}
              </div>
              <div className="px-2 py-4">
                <div className="flex items-center gap-3 px-3 py-2">
                  <span className="text-[13px] text-primary-foreground">
                    {userName}
                  </span>
                </div>

                <Link
                  href="#"
                  onClick={closeMobileMenu}
                  className="flex items-center px-3 py-2.5 text-[13px] text-primary-foreground hover:text-secondary hover:bg-green-600 rounded-md transition-colors"
                >
                  Profile
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  disabled={isLoggingOut}
                  className={cn(
                    "w-full flex items-center px-3 py-2.5 text-left rounded-md text-[13px] transition-colors",
                    "text-red-300 hover:text-red-200 hover:bg-green-600",
                    isLoggingOut && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
          )}
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
