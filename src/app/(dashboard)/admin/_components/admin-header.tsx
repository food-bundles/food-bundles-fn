"use client";

import { Menu, Bell, Settings, MessageSquareDot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function AdminHeader() {
  const unreadNotifications = 4;
  const unreadMessages = 2; 

  return (
    <header className=" bg-gray-50 border-b border-gray-200">
      <div className=" px-6 py-4 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button className="p-1 cursor-pointer">
            <Menu className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <p className="text-sm text-gray-800">Welcome back, Admin Sostene</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3 ">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-green-100 cursor-pointer rounded-full">
            <Bell className="h-5 w-5 text-gray-600" />
            {unreadNotifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                {unreadNotifications}
              </Badge>
            )}
          </button>

          <button className="relative p-2 hover:bg-green-100 cursor-pointer rounded-full">
            <MessageSquareDot className="h-5 w-5 text-gray-600" />
            {unreadMessages > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-green-500 text-white text-xs">
                {unreadMessages}
              </Badge>
            )}
          </button>
          <Link href="/admin/settings">
            <button className="p-2 hover:bg-green-100 cursor-pointer rounded-full">
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
          </Link>

          <div className="flex items-center space-x-2">
            <Avatar className="h-12 w-12 border-4 hover:border-green-100 cursor-pointer ">
              <AvatarImage src="/imgs/profile.jpg?height=32&width=32" />
              <AvatarFallback>BS</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
