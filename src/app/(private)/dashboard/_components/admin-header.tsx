"use client";

import { Menu, Bell, Settings, MessageSquareDot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function AdminHeader() {
  const unreadNotifications = 4;
  const unreadMessages = 2;

  return (
    <header className="bg-green-700 border-b border-green-800">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button className="p-1 cursor-pointer text-white">
            <Menu className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-white">Dashboard</h1>
            <p className="text-sm text-green-100">
              Welcome back, Admin Sostene
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-green-600 cursor-pointer rounded-full text-white">
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                {unreadNotifications}
              </Badge>
            )}
          </button>

          <button className="relative p-2 hover:bg-green-600 cursor-pointer rounded-full text-white">
            <MessageSquareDot className="h-5 w-5" />
            {unreadMessages > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-green-500 text-white text-xs">
                {unreadMessages}
              </Badge>
            )}
          </button>

          <Link href="/dashboard/settings">
            <button className="p-2 hover:bg-green-600 cursor-pointer rounded-full text-white">
              <Settings className="h-5 w-5" />
            </button>
          </Link>

          <div className="flex items-center space-x-2">
            <Avatar className="h-12 w-12 border-4 border-white hover:border-green-300 cursor-pointer">
              <AvatarImage src="/imgs/profile.jpg?height=32&width=32" />
              <AvatarFallback className="text-green-700 bg-white">
                BS
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
