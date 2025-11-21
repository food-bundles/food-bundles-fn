"use client";

import { Bell, Settings, MessageSquareDot } from "lucide-react";
import { MdMenuOpen, MdClose } from "react-icons/md";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface AdminHeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

export function AdminHeader({ onMenuClick, sidebarOpen }: AdminHeaderProps) {
  const unreadNotifications = 4;
  const unreadMessages = 2;

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
          <button className="relative p-1.5 md:p-2 hover:bg-green-600 cursor-pointer rounded-full text-white">
            <Bell className="h-4 w-4 md:h-5 md:w-5" />
            {unreadNotifications > 0 && (
              <Badge className="absolute top-0 right-0 h-4 w-4 rounded-full p-0 flex items-center justify-center bg-orange-400 text-white text-xs">
                {unreadNotifications}
              </Badge>
            )}
          </button>

          <button className="hidden sm:flex relative p-1.5 md:p-2 hover:bg-green-600 cursor-pointer rounded-full text-white">
            <MessageSquareDot className="h-4 w-4 md:h-5 md:w-5" />
            {unreadMessages > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center bg-green-500 text-white text-xs">
                {unreadMessages}
              </Badge>
            )}
          </button>

          <Link href="/#" className="hidden sm:block">
            <button className="p-1.5 md:p-2 hover:bg-green-600 cursor-pointer rounded-full text-white">
              <Settings className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </Link>

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
    </header>
  );
}
