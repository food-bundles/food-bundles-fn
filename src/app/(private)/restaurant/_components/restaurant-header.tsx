/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Bell,UserPlus, Home, ShoppingCart } from "lucide-react";
import { MdMenuOpen, MdClose } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/auth-context";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { authService } from "@/app/services/authService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import NotificationsDrawer from "./notificationDrawer";
import CartDrawer from "@/components/cartDrawer";
import { useCartSummary } from "@/app/contexts/cart-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notificationService } from "@/app/services/notificationService";


interface RestaurantHeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

export function RestaurantHeader({ onMenuClick, sidebarOpen }: RestaurantHeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, getUserProfileImage } = useAuth();
  const { totalItems } = useCartSummary();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationService.getUnreadCount();
        setUnreadCount(response.data.unreadCount);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };
    fetchUnreadCount();
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
            {/* Cart Icon */}
            <button
              className="relative cursor-pointer text-primary-foreground hover:text-primary-foreground h-8 w-8 sm:h-10 sm:w-10"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              {totalItems > 0 && (
                <Badge className="absolute top-0 right-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center bg-green-500 text-white text-xs">
                  {totalItems > 99 ? "99+" : totalItems}
                </Badge>
              )}
            </button>
            {/* Notifications Button */}
            <button
              className="relative cursor-pointer text-primary-foreground hover:text-primary-foreground h-8 w-8 sm:h-10 sm:w-10"
              onClick={() => setIsNotificationsOpen(true)}
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <Badge className="absolute top-0 right-3 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                {unreadCount}
              </Badge>
            </button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:bg-transparent cursor-pointer text-primary-foreground hover:text-primary-foreground">
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
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-52" align="end" alignOffset={-15}>
                <div className="px-2 py-1.5">
                  <p className="text-[13px] font-medium text-gray-900 truncate">{userName}</p>
                  <p className="text-[12px] text-gray-500 truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="#" className="flex items-center gap-2 text-[13px]">
                    <UserPlus className="w-4 h-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/" className="flex items-center gap-2 text-[13px]">
                    <Home className="w-4 h-4" />
                    Home
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-red-600 focus:text-red-600 text-[13px]"
                >
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>


          </div>
        </div>
      </header>
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
}