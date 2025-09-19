/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Bell, ShoppingCart, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import NotificationsDrawer from "./notificationDrawer";
import Image from "next/image";
import { authService } from "@/app/services/authService";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/contexts/auth-context";
import { useCartSummary } from "@/app/contexts/cart-context";
import { toast } from "sonner";
import CartDrawer from "@/components/cartDrawer";

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
  const router = useRouter();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, getUserProfileImage } = useAuth();

  const { totalItems, totalQuantity, isLoading } = useCartSummary();

  const unreadCount = sampleNotifications.filter((n) => !n.isRead).length;
  const pathname = usePathname();

  const navLinks = [
    { href: "/restaurant", label: "Shop" },
    { href: "/restaurant/orders", label: "Orders" },
    { href: "/restaurant/help", label: "Help & Support" },
    // { href: "/restaurant/settings", label: "Settings" },
    { href: "/restaurant/dashboard", label: "Dashboard" },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Something went wrong!");
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Get user profile image with fallback
  const profileImage = getUserProfileImage();
  const userName = user?.name || user?.name || "User";

  console.log("TopResNav - Current user:", user);
  console.log("TopResNav - Profile image:", profileImage);
  console.log("TopResNav - User name:", userName);
  console.log("TopResNav - Cart total items:", totalItems);
  console.log("TopResNav - Cart total quantity:", totalQuantity);

  return (
    <>
      <header className="bg-green-700 border-b border-green-600 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo section with green-50 background to match header */}
            <div className="flex items-center gap-2 bg-green-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded border-2 border-primary">
              <Image
                src="/imgs/Food_bundle_logo.png"
                alt="Food Bundles Logo"
                width={24}
                height={24}
                className="rounded object-cover sm:w-8 sm:h-8"
              />
              <span className="text-base sm:text-xl font-bold text-black">
                <span className="hidden sm:inline">Food bundles</span>
                <span className="sm:hidden">Food</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 font-medium transition-colors text-sm ${
                      isActive
                        ? "text-secondary"
                        : "text-primary-foreground hover:text-secondary"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 xl:w-4 xl:h-4 rounded-sm ${
                        isActive ? "bg-secondary" : ""
                      }`}
                    ></div>
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Cart */}
              <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCartOpen(true)}
                className="relative hover:bg-green-600 cursor-pointer text-primary-foreground hover:text-primary-foreground h-8 w-8 sm:h-10 sm:w-10"
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                {!isLoading && totalQuantity > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center bg-secondary text-black text-xs">
                    {totalItems > 99 ? "99+" : totalItems}
                  </Badge>
                )}
              </Button>

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
              {/* Desktop User Menu */}
              <div className="hidden sm:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 hover:bg-transparent py-3 sm:py-5 cursor-pointer text-primary-foreground hover:text-primary-foreground"
                    >
                      <span className="font-medium text-sm hidden md:inline">
                        {userName}
                      </span>

                      <div className="p-[1px] sm:p-[2px] bg-green-50 rounded-full flex items-center justify-center">
                        {user?.profileImage ? (
                          <Image
                            src={profileImage}
                            alt={`${userName}'s profile`}
                            width={32}
                            height={32}
                            className="rounded-full object-cover w-8 h-8 sm:w-10 sm:h-10"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder.svg";
                            }}
                          />
                        ) : (
                          // Fallback to initials
                          <div className="rounded-full bg-green-600 text-white flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 font-bold">
                            {userName.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <Link href="/restaurant/settings">
                      <DropdownMenuItem>Profile</DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem className="text-red-600">
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className={cn(
                          "w-full flex items-center rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                          "text-gray-800 hover:text-red-500",
                          isLoggingOut && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {isLoggingOut ? "Logging out..." : "Logout"}
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
              <div className="px-2 py-4 space-y-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition-colors ${
                        isActive
                          ? "text-secondary bg-green-600"
                          : "text-primary-foreground hover:text-secondary hover:bg-green-600"
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-sm ${
                          isActive ? "bg-secondary" : "bg-transparent"
                        }`}
                      ></div>
                      {link.label}
                    </Link>
                  );
                })}

                {/* Mobile Profile Section */}
              </div>
              <div className="px-2 py-4">
                <div className="flex items-center gap-3 px-3 py-2">
                  <span className="font-medium text-primary-foreground">
                    {userName}
                  </span>
                </div>

                {/* <Link
                  href="/restaurant/settings"
                  onClick={closeMobileMenu}
                  className="flex items-center px-3 py-2.5 text-primary-foreground hover:text-secondary hover:bg-green-600 rounded-md transition-colors"
                >
                  Profile
                </Link> */}

                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  disabled={isLoggingOut}
                  className={cn(
                    "w-full flex items-center px-3 py-2.5 text-left rounded-md font-medium transition-colors",
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
