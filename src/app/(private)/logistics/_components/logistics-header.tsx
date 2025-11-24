"use client";

import { Button } from "@/components/ui/button";
import { LogOut, Package } from "lucide-react";
import { authService } from "@/app/services/authService";
import { toast } from "sonner";

export function LogisticsHeader() {
  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.href = "/";
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-green-700 shadow-lg border-b-4 border-green-800">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
            <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white">Logistics Management</h1>
            <p className="text-xs text-white/80 hidden sm:block">Track and manage deliveries</p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white font-semibold shadow-md"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </div>
  );
}