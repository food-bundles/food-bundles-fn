"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface DashboardHeaderProps {
  onNotificationClick: () => void
}

export default function DashboardHeader({ onNotificationClick }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-8 items-center pl-28 pr-18 justify-between ">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Farmer Dashboard</h1>
          <p className="text-gray-600">Welcome back, Sarah! Here what happening with your products.</p>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative" onClick={onNotificationClick}>
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
          </Button>

          <Avatar className="w-8 h-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback>BS</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
