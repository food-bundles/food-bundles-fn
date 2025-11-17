"use client";

import { useState, useMemo, useId, useEffect } from "react"
import { Bell, User, ChevronDown, Settings, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import NotificationsDrawer from "./notification"
import ProfileDrawer from "./ProfileDrawer"
import { authService } from "@/app/services/authService"
import { toast } from "sonner"
import SettingsDrawer from "./farmerSettings"
import { useAuth } from "@/app/contexts/auth-context"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { OptimizedImage } from "@/components/OptimizedImage";

const testNotifications: {
  id: string;
  title: string;
  message: string;
  orderId: string;
  timestamp: string;
  isRead: boolean;
  type:
    | "order_initiated"
    | "order_completed"
    | "order_cancelled"
    | "payment_received";
}[] = [];

export default function DashboardHeader() {
  const dropdownId = useId();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [, setIsProfileDropdownOpen] = useState(false)
  
  const unreadCount = testNotifications.filter((n) => !n.isRead).length

  const { user, getUserProfileImage } = useAuth();

  // Nice fallbacks if name is missing
  const displayName = useMemo(() => user?.name || user?.name ||user?.phone|| " Farmer", [user])
  const email = user?.email || ""
  const profileImage = getUserProfileImage()

  const handleProfileClick = () => {
    setIsProfileOpen(true)
    setIsMobileMenuOpen(false)
  }
  
  const handleSettingClick = () => {
    setIsSettingsOpen(true)
    setIsMobileMenuOpen(false)
  }
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authService.logout().catch(() => {});
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear();
      toast.success("Logged out successfully");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(".profile-dropdown")) {
        setIsProfileDropdownOpen(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  return (
    <>
      <header className="bg-green-700 border-b border-green-600 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-13">
            {/* Left: Brand */}
            <div className="flex items-center gap-2 bg-green-50 px-2 sm:px-3 py-1 rounded-full border-2 border-primary shrink-0">
              <OptimizedImage
                                 src="/imgs/Food_bundle_logo.png"
                                 alt="FoodBundle Logo"
                                 width={32}
                                 height={32}
                                 className="rounded-full object-cover w-5 h-5"
                                 transformation={[
                                   { width: 64, height: 64, crop: "fill", quality: "85" },
                                 ]}
                               />
              <div className="flex flex-col">
                <span className="text-2sm font-bold text-black whitespace-nowrap">Food bundles</span>
              </div>
            </div>

            {/* Desktop: Notifications + Profile */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-8">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-green-600 transition-colors duration-200 h-9 w-9 sm:h-10 sm:w-10"
                onClick={() => setIsNotificationsOpen(true)}
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-[10px] sm:text-xs border-2">
                    {unreadCount}
                  </Badge>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1.5 sm:gap-2 hover:bg-green-600 transition-colors duration-200 px-2 sm:px-3 py-2 h-auto"
                    disabled={isLoggingOut}
                    id={dropdownId}
                  >
                    {user ? (
                      <>
                        <div className="p-0.5 bg-green-600 rounded-full flex items-center justify-center">
                          {user?.profileImage ? (
                            <Image                      
                              src={profileImage || "/placeholder.svg"}
                              alt={`${displayName}'s profile`}
                              width={40}
                              height={40}
                              className="rounded-full object-cover w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg";
                              }}
                            />
                          ) : (
                            <div className="rounded-full bg-green-600 text-white flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 font-medium">
                              {displayName.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-white hidden sm:block text-sm md:text-base">{displayName}</span>
                        <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white transition-transform duration-200" />
                      </>
                    ) : (
                      <>
                        <Skeleton className="rounded-full h-8 w-8 sm:h-10 sm:w-10 bg-green-600/60" />
                        <Skeleton className="h-5 w-20 md:h-6 md:w-24 hidden sm:inline bg-green-600/60" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 sm:w-56"
                  align="end"
                  forceMount
                >
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">{email}</p>
                  </div>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={handleProfileClick}
                  >
                    <User className="mr-3 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={handleSettingClick}
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile: Notifications + Menu Button */}
            <div className="flex lg:hidden items-center gap-2 sm:gap-4">
              {/* Mobile Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-green-600 transition-colors duration-200 h-8 w-8 sm:h-10 sm:w-10"
                onClick={() => setIsNotificationsOpen(true)}
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-[10px] sm:text-xs border-2">
                    {unreadCount}
                  </Badge>
                )}
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-green-600 cursor-pointer text-primary-foreground hover:text-primary-foreground h-8 w-8 sm:h-10 sm:w-10"
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
            <div className="lg:hidden border-t border-green-600 bg-green-700">
              <div className="px-2 py-4 space-y-1">
                {/* Mobile Profile Section */}
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  <div className="p-0.5 bg-green-600 rounded-full flex items-center justify-center">
                    {user?.profileImage ? (
                      <Image                      
                        src={profileImage || "/placeholder.svg"}
                        alt={`${displayName}'s profile`}
                        width={32}
                        height={32}
                        className="rounded-full object-cover w-8 h-8"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
                      />
                    ) : (
                      <div className="rounded-full bg-green-600 text-white flex items-center justify-center w-8 h-8 font-medium">
                        {displayName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{displayName}</span>
                    <span className="text-xs text-green-200">{email}</span>
                  </div>
                </div>

                <div className="border-t border-green-600 my-2"></div>

                {/* Profile Link */}
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] text-primary-foreground hover:text-secondary hover:bg-green-600 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </button>

                {/* Settings Link */}
                <button
                  onClick={handleSettingClick}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] text-primary-foreground hover:text-secondary hover:bg-green-600 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>

                <div className="border-t border-green-600 my-2"></div>

                {/* Logout */}
                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  disabled={isLoggingOut}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] transition-colors",
                    "text-red-300 hover:text-red-200 hover:bg-green-600",
                    isLoggingOut && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={testNotifications}
      />

      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  )
}