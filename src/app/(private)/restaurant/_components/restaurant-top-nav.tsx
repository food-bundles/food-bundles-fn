"use client";

import { useState } from "react";
import { Bell, ChevronDown, ShoppingCart } from "lucide-react";
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
  const router = useRouter()
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, getUserProfileImage } = useAuth();

  const { totalItems, totalQuantity, isLoading } = useCartSummary();

  const unreadCount = sampleNotifications.filter((n) => !n.isRead).length;
  const pathname = usePathname();

  const navLinks = [
    { href: "/restaurant", label: "Shop" },
    { href: "/restaurant/orders", label: "Orders" },
    { href: "/restaurant/help", label: "Help & Support" },
    { href: "/restaurant/settings", label: "Settings" },
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
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo section with green-50 background to match header */}
            <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded border-2 border-primary">
              <Image
                src="/imgs/Food_bundle_logo.png"
                alt="Food Bundles Logo"
                width={32}
                height={32}
                className="rounded object-cover"
              />
              <span className="text-xl font-bold text-black">Food bundles</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 font-medium transition-colors text-2xs ${
                      isActive
                        ? "text-secondary"
                        : "text-primary-foreground hover:text-secondary"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-sm ${
                        isActive ? "bg-secondary" : ""
                      }`}
                    ></div>
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Cart + Notifications + Profile */}
            <div className="flex items-center gap-4">
              <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCartOpen(true)}
                className="relative hover:bg-green-600 cursor-pointer text-primary-foreground hover:text-primary-foreground"
              >
                <ShoppingCart className="h-5 w-5" />
                {!isLoading && totalQuantity > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-secondary text-black text-xs">
                    {totalItems > 99 ? "99+" : totalItems}
                  </Badge>
                )}
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-green-600 cursor-pointer text-primary-foreground hover:text-primary-foreground"
                onClick={() => setIsNotificationsOpen(true)}
              >
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs ">
                  {unreadCount}
                </Badge>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 hover:bg-green-600 py-5 cursor-pointer text-primary-foreground hover:text-primary-foreground"
                  >
                    <div className="p-[2px] bg-green-50 rounded-full flex items-center justify-center">
                      <Image
                        src={profileImage || "/placeholder.svg"}
                        alt={`${userName}'s profile`}
                        width={40}
                        height={40}
                        className="rounded-full object-cover w-10 h-10"
                        onError={(e) => {
                          // Fallback if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = "/imgs/profile.jpg";
                        }}
                      />
                    </div>
                    <span className="font-medium">{userName}</span>
                    <ChevronDown className="h-4 w-4" />
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
