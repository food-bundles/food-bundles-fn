"use client";

import React, { useState } from "react";
import { Bell, UserPlus, Home } from "lucide-react";
import { useAuth } from "@/app/contexts/auth-context";
import { authService } from "@/app/services/authService";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface TopBarProps {
  title: string;
}

export default function AggregatorTopBar({ title }: TopBarProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, getUserProfileImage } = useAuth();

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
  const userName = user?.name || user?.username || "";

  return (
    <div className="bg-green-700 border-b border-green-800 px-3 sm:px-6 py-0 sm:py-2">
      <div className="flex items-center justify-between">
        <h1 className="text-base sm:text-xl font-semibold text-white truncate pr-2">{title}</h1>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button className="p-1.5 sm:p-2 text-white hover:bg-green-600 transition-colors rounded">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 sm:gap-2 hover:bg-green-600 p-1 sm:p-2 rounded-lg transition-colors">
                {user ? (
                  <>
                    <span className="font-medium text-xs sm:text-sm hidden md:inline text-white max-w-24 truncate">
                      {userName}
                    </span>
                    <div className="rounded-full flex items-center justify-center">
                      {user?.profileImage ? (
                        <Image
                          src={profileImage || "/placeholder.svg"}
                          alt={`${userName}'s profile`}
                          width={28}
                          height={28}
                          className="rounded-full object-cover w-7 h-7 sm:w-8 sm:h-8"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                      ) : (
                        <div className="rounded-full bg-green-600 text-white flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 font-medium text-xs sm:text-sm">
                          {userName.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Skeleton className="h-4 w-16 sm:h-5 sm:w-20 hidden md:inline bg-green-600/60" />
                    <Skeleton className="rounded-full h-7 w-7 sm:h-8 sm:w-8 bg-green-600/60" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52" align="end" alignOffset={-15}>
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="#" className="flex items-center gap-2 text-sm">
                  <UserPlus className="w-4 h-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/" className="flex items-center gap-2 text-sm">
                  <Home className="w-4 h-4" />
                  Home
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-red-600 focus:text-red-600 text-sm"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
