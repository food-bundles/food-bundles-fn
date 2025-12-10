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
        console.log("Wallet WebSocket connected");
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
              console.log("Wallet update received:", message.data);
              break;

            case "CONNECTION_ESTABLISHED":
              console.log("Wallet WebSocket connection established:", message);
              break;

            case "AUTHENTICATED":
              console.log("Wallet WebSocket authenticated:", message);
              break;

            case "SUBSCRIPTION_CONFIRMED":
              console.log("Wallet subscription confirmed:", message.subscription);
              break;

            case "PONG":
              // Handle pong response if needed
              break;
          }
        } catch (error) {
          console.error("Error parsing wallet WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("Wallet WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("Wallet WebSocket disconnected");
        setIsConnected(false);

        // Attempt reconnection after 5 seconds
        setTimeout(() => {
          console.log("Attempting to reconnect wallet WebSocket...");
          connectWebSocket();
        }, 5000);
      };
    } catch (error) {
      console.error("Wallet WebSocket connection failed:", error);
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