/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from "react";

interface WalletUpdate {
  walletId: string;
  restaurantId: string;
  action: "TOP_UP" | "DEBIT" | "REFUND" | "BALANCE_UPDATE";
  timestamp: string;
  data?: {
    transactionId?: string;
    amount?: number;
    newBalance?: number;
    previousBalance?: number;
    description?: string;
    status?: string;
  };
}

export const useWalletWebSocket = (userId: string, restaurantId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletUpdates, setWalletUpdates] = useState<WalletUpdate[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const connectWebSocket = useCallback(() => {
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const wsProtocol = backendUrl.startsWith("https") ? "wss" : "ws";
      const wsUrl = backendUrl.replace(/^http(s?)/, wsProtocol);

      const ws = new WebSocket(`${wsUrl}/api/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);

        // Authenticate
        ws.send(
          JSON.stringify({
            type: "AUTHENTICATE",
            userId,
            role: "RESTAURANT",
          })
        );

        // Subscribe to wallet updates
        if (restaurantId || userId) {
          ws.send(
            JSON.stringify({
              type: "SUBSCRIBE_WALLET",
              restaurantId: restaurantId || userId,
            })
          );
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case "WALLET_UPDATE":
              setWalletUpdates((prev) => [...prev, message.data]);
              break;

            case "CONNECTION_ESTABLISHED":
              break;

            case "AUTHENTICATED":
              break;

            case "SUBSCRIPTION_CONFIRMED":
              break;

            case "PONG":
              // Handle pong response if needed
              break;
          }
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        setIsConnected(false);

        // Attempt reconnection after 5 seconds
        setTimeout(() => {
          connectWebSocket();
        }, 5000);
      };
    } catch {
      // Ignore connection failures; reconnection is handled in onclose
    }
  }, [userId, restaurantId]);

  useEffect(() => {
    if (userId) {
      connectWebSocket();
    }

    // Cleanup on unmount
    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [userId, restaurantId, connectWebSocket]);

  // Send heartbeat ping every 30 seconds
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "PING",
          })
        );
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected]);

  return {
    isConnected,
    walletUpdates,
    reconnect: connectWebSocket,
  };
};