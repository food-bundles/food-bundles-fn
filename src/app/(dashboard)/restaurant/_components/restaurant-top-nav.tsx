"use client";

import { Utensils, Bell, ChevronDown, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function TopNavigation() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
              <Utensils className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Food bundles
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/restaurant/shop"
              className="flex items-center gap-2 text-green-600 font-medium"
            >
              <div className="w-4 h-4 bg-green-600 rounded-sm"></div>
              Shop
            </Link>
            <Link
              href="/restaurant/orders"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
              Orders
            </Link>
            <Link
              href="/restaurant/analytics"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
              Analytics
            </Link>
            <Link
              href="/restaurant/settings"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
              Settings
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* restaurant cart using shoping cart icon*/}
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-green-500  text-white text-xs">
                3
              </Badge>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                1
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">U</span>
                  </div>
                  <span className="font-medium">Umucyo</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Help</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
