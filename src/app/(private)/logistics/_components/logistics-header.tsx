"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
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
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">Logistics Management</h1>
        <Button 
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}