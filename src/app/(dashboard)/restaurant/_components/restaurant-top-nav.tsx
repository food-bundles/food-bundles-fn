"use client";

import { useState } from "react";
import { Utensils, Bell, ChevronDown, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import NotificationsDrawer from "./notificationDrawer";

// Sample notifications data - replace with your actual data source
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
              <Link
                href="/restaurant"
                className="flex items-center gap-2 text-green-600 font-medium"
              >
                <div className="w-4 h-4 bg-green-600 rounded-sm"></div>
                Shop
              </Link>
              <Link
                href="/restaurant/orders"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                Orders
              </Link>
              <Link
                href="/restaurant/help"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                Help & Support
              </Link>
              <Link
                href="/restaurant/settings"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                Settings
              </Link>
              <Link
                href="/restaurant/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                Dashboard
              </Link>
            </nav>

            {/* cart */}
            <div className="flex items-center gap-4">
              <Link href="/restaurant/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-green-500  text-white text-xs">
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

              {/* User Profile */}

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
                <Link href="/restaurant/settings">
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </Link>
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
