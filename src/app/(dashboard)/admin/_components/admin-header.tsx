"use client";

import { Menu, Bell, Settings, MessageSquareDot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AdminHeader() {
  return (
    <header className=" bg-gray-50 border-b border-gray-200">
      <div className=" px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="p-1 hover:bg-green-700 rounded">
            <Menu className="h-10 w-10" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <p className="text-sm text-gray-800">Welcome back, John Doe</p>
          </div>
        </div>

        <div className="flex items-center ">
          <button className="p-2 hover:bg-green-100  cursor-pointer  rounded-full">
            <Bell className="h-5 w-5  text-green-600" />
          </button>
          <button className="p-2 hover:bg-green-100 cursor-pointer rounded-full">
            <MessageSquareDot className="h-5 w-5 text-green-600" />
          </button>
          <button className="p-2 hover:bg-green-100 cursor-pointer rounded-full">
            <Settings className="h-5 w-5 text-green-600" />
          </button>
          <div className="flex items-center space-x-2">
            <Avatar className="h-10 w-10 border-2 hover:border-green-600 cursor-pointer ">
              <AvatarImage src="/imgs/profile.jpg?height=32&width=32" />
              <AvatarFallback>BS</AvatarFallback>
            </Avatar>
            {/* <div className="text-sm">
              <p className="font-medium">B. Sostene</p>
              <p className="text-gray-800 text-xs">soso@food.rw</p>
            </div> */}
          </div>
        </div>
      </div>
    </header>
  );
}
