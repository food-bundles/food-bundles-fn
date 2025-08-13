"use client";

import { useState } from "react";
import { Utensils, Bell, ChevronDown, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import NotificationsDrawer from "./notificationDrawer";

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
  const unreadCount = sampleNotifications.filter((n) => !n.isRead).length;
  const pathname = usePathname();

  const navLinks = [
    { href: "/restaurant", label: "Shop" },
    { href: "/restaurant/orders", label: "Orders" },
    { href: "/restaurant/help", label: "Help & Support" },
    { href: "/restaurant/settings", label: "Settings" },
    { href: "/restaurant/dashboard", label: "Dashboard" },
  ];

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                <Utensils className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Food bundles
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 font-medium transition-colors ${
                      isActive
                        ? "text-green-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-sm ${
                        isActive ? "bg-green-600" : "bg-gray-400"
                      }`}
                    ></div>
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Cart + Notifications + Profile */}
            <div className="flex items-center gap-4">
              <Link href="/restaurant/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-green-500 text-white text-xs">
                    3
                  </Badge>
                </Button>
              </Link>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsNotificationsOpen(true)}
              >
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  {unreadCount}
                </Badge>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">U</span>
                    </div>
                    <span className="font-medium">Umucyo</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    Sign out
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
