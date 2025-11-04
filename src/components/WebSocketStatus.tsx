"use client";

import { useWebSocket } from "@/hooks/useOrderWebSocket";
import { useAuth } from "@/app/contexts/auth-context";
import { Wifi, WifiOff } from "lucide-react";

export function WebSocketStatus() {
  const { user } = useAuth();
  const { isConnected, orderUpdates } = useWebSocket(
    user?.id || "",
    user?.id || ""
  );

  return (
    <div className="flex items-center gap-2 text-sm">
      {isConnected ? (
        <div className="flex items-center gap-1 text-green-600">
          <Wifi className="h-4 w-4" />
          <span>Connected</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-red-600">
          <WifiOff className="h-4 w-4" />
          <span>Disconnected</span>
        </div>
      )}
      {orderUpdates.length > 0 && (
        <span className="text-xs text-gray-500">
          ({orderUpdates.length} updates)
        </span>
      )}
    </div>
  );
}