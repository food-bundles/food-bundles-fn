"use client"

import { useState, useMemo, useId} from "react"
import { Bell, User, ChevronDown, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
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

const testNotifications: {
  id: string
  title: string
  message: string
  orderId: string
  timestamp: string
  isRead: boolean
  type: "order_initiated" | "order_completed" | "order_cancelled" | "payment_received"
}[] = []

export default function DashboardHeader() {
  const dropdownId = useId()

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const unreadCount = testNotifications.filter((n) => !n.isRead).length
  const router = useRouter()

  const { user, getUserProfileImage } = useAuth();

  // Nice fallbacks if name is missing
  const displayName = useMemo(() => user?.name || user?.name || user?.phone || "Farmer", [user])
  const email = user?.email || ""
  const profileImage = getUserProfileImage()

  console.log("TopResNav - Current user:", user);
  console.log("TopResNav - Profile image:", profileImage);
  console.log("TopResNav - User name:", displayName);

  const handleProfileClick = () => setIsProfileOpen(true)
  const handleSettingClick = () => setIsSettingsOpen(true)
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await authService.logout().catch(() => {})
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      sessionStorage.clear()
      toast.success("Logged out successfully")
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to logout. Please try again.")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      <header className="bg-green-700 border-b border-green-200 sticky top-0 z-50 h-16 md:h-20 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand */}
            <div className="flex items-center h-12 md:h-14 gap-2 md:gap-3 bg-white/70 px-1.5 sm:px-2 py-1 rounded-sm ">
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center shadow-md rounded-sm overflow-hidden">
                <Image width={40} height={40} src="/imgs/Food_bundle_logo.png" alt="FoodBundle Logo" />
              </div>
              <div className="flex flex-col ">
                <span className="text-xl font-bold text-black">Food bundles</span>
            
              </div>
            </div>

            {/* Right: Notifications + Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-green-400 transition-colors duration-200 h-9 w-9 sm:h-10 sm:w-10"
                onClick={() => setIsNotificationsOpen(true)}
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-[10px] sm:text-xs border-2">
                  {unreadCount}
                </Badge>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1.5 sm:gap-2 hover:bg-green-400 transition-colors duration-200 px-2 sm:px-3 py-2 h-auto"
                    disabled={isLoggingOut}
                    id={dropdownId}
                  >
                    <div className="p-[2px] bg-green-600 rounded-full flex items-center justify-center ">
                     <Image                      
                     src={profileImage || "/placeholder.svg"}
                     alt={`${displayName}'s profile`}
                      width={40}
                      height={40}
                      className="rounded-full object-cover w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10"
                      onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = "/imgs/elie.jpg";
                              }}
                                           />
                    </div>
                    <span className="font-medium text-white hidden sm:block text-sm md:text-base">{displayName}</span>
                    <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white transition-transform duration-200" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 sm:w-56" align="end" forceMount>
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">{email}</p>
                  </div>
                  <DropdownMenuItem className="cursor-pointer" onClick={handleProfileClick}>
                    <User className="mr-3 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={handleSettingClick}>
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
          </div>
        </div>
      </header>

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={testNotifications}
      />

      <ProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  )
}
