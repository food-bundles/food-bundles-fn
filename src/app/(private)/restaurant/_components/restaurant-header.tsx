/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Bell,UserPlus, Home } from "lucide-react";
import { MdMenuOpen, MdClose } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/app/contexts/auth-context";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { authService } from "@/app/services/authService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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

interface RestaurantHeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

export function RestaurantHeader({ onMenuClick, sidebarOpen }: RestaurantHeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
   const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const unreadCount = sampleNotifications.filter((n) => !n.isRead).length;
  const { user, getUserProfileImage } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);


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

  const profileImage = getUserProfileImage();
  const userName = user?.name || user?.name || "";
  
  return (
    <>
      <header className="bg-green-700 border-b border-green-800">
        <div className="px-4 pt-2 pb-1 flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 cursor-pointer text-white hover:bg-green-600 rounded transition-colors"
            >
              {sidebarOpen ? (
                <MdClose className="h-6 w-6" />
              ) : (
                <MdMenuOpen className="h-6 w-6" />
              )}
            </button>
            <div className="flex items-center gap-2 md:gap-4">
              <h1 className="text-sm md:text-md font-semibold text-white">
                Restaurant Dashboard
              </h1>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* I will need this Notifications please don't remove this commented button */}
            {/* <button
              className="relative cursor-pointer text-primary-foreground hover:text-primary-foreground h-8 w-8 sm:h-10 sm:w-10"
              onClick={() => setIsNotificationsOpen(true)}
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <Badge className="absolute top-0 right-3 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                {unreadCount}
              </Badge>
            </button> */}
            {/* Desktop User Menu - Custom Dropdown */}
            <div className="hidden sm:block relative profile-dropdown">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 hover:bg-transparent  cursor-pointer text-primary-foreground hover:text-primary-foreground"
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
      </header>
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={sampleNotifications}
      />
    </>
  );
}