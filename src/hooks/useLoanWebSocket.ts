/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from "react";

export interface LoanUpdate {
  loanId: string;
  restaurantId: string;
  action: string;
  timestamp: string;
  data?: {
    status?: string;
    unlockStatus?: string;
    [key: string]: any;
  };
}

export const useLoanWebSocket = (userId: string, restaurantId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [loanUpdates, setLoanUpdates] = useState<LoanUpdate[]>([]);
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

        ws.send(
          JSON.stringify({
            type: "AUTHENTICATE",
            userId,
            role: "RESTAURANT",
          })
        );

        if (restaurantId || userId) {
          ws.send(
            JSON.stringify({
              type: "SUBSCRIBE_LOANS",
              restaurantId: restaurantId || userId,
            })
          );
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case "LOAN_UPDATE":
              setLoanUpdates((prev) => [...prev, message.data].slice(-50));
              break;

            case "CONNECTION_ESTABLISHED":
            case "AUTHENTICATED":
            case "SUBSCRIPTION_CONFIRMED":
            case "PONG":
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
        wsRef.current.send(JSON.stringify({ type: "PING" }));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected]);

  return {
    isConnected,
    loanUpdates,
    reconnect: connectWebSocket,
  };
};