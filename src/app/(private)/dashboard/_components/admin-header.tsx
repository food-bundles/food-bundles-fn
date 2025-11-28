"use client";

import { useState, useEffect } from "react";
import { Bell, Settings, MessageSquareDot } from "lucide-react";
import { MdMenuOpen, MdClose } from "react-icons/md";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { notificationService, Notification } from "@/app/services/notificationService";
import NotificationsDrawer from "@/app/(private)/restaurant/_components/notificationDrawer";

interface AdminHeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

export function AdminHeader({ onMenuClick, sidebarOpen }: AdminHeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const unreadMessages = 2;

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationService.getUnreadCount();
        setUnreadNotifications(response.data.unreadCount);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-green-700 border-b border-green-800">
      <div className="px-4 pt-2 pb-1 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 cursor-pointer text-white hover:bg-green-600 rounded transition-colors"
          >
            {sidebarOpen ? <MdClose className="h-6 w-6" /> : <MdMenuOpen className="h-6 w-6" />}
          </button>
          <div className="flex items-center gap-2 md:gap-4">
            <h1 className="text-sm md:text-md font-semibold text-white">Dashboard</h1>
            <p className="hidden sm:block text-[13px] text-green-100">
              Welcome back
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 md:space-x-3">
          <button 
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-1.5 md:p-2 hover:bg-green-600 cursor-pointer rounded-full text-white"
          >
            <Bell className="h-4 w-4 md:h-5 md:w-5" />
            {unreadNotifications > 0 && (
              <Badge className="absolute top-0 right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center bg-orange-400 text-white text-xs">
                {unreadNotifications}
              </Badge>
            )}
          </button>

          <div className="flex items-center space-x-2">
            <Avatar className="h-7 w-7 md:h-8 md:w-8 border-2 border-green-500 hover:border-green-300 cursor-pointer">
              <AvatarImage src="/imgs/profile.jpg?height=32&width=32" />
              <AvatarFallback className="text-green-700 bg-white text-xs md:text-sm">
                BS
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
      
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </header>
  );
}