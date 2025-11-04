/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from "react";

interface OrderUpdate {
  orderId: string;
  status: string;
  paymentStatus?: string;
  timestamp: string;
  restaurantId: string;
}

interface ProductUpdate {
  productId: string;
  productName: string;
  action: "CREATED" | "UPDATED" | "DELETED";
  timestamp: string;
  data?: any;
}

export const useWebSocket = (userId: string, restaurantId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState<OrderUpdate[]>([]);
  const [productUpdates, setProductUpdates] = useState<ProductUpdate[]>([]);
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
        console.log("WebSocket connected");
        setIsConnected(true);

        // Authenticate
        ws.send(
          JSON.stringify({
            type: "AUTHENTICATE",
            userId,
            role: "RESTAURANT",
          })
        );

        // Subscribe to orders if restaurantId provided
        if (restaurantId) {
          ws.send(
            JSON.stringify({
              type: "SUBSCRIBE_ORDERS",
              restaurantId,
            })
          );
        }

        // Also subscribe using userId for restaurant orders
        if (userId) {
          ws.send(
            JSON.stringify({
              type: "SUBSCRIBE_ORDERS",
              restaurantId: userId,
            })
          );
        }

        // Subscribe to products (for admins)
        ws.send(
          JSON.stringify({
            type: "SUBSCRIBE_PRODUCTS",
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

            console.log("WebSocket message received:", message);
            
          switch (message.type) {
            case "ORDER_UPDATE":
              setOrderUpdates((prev) => [...prev, message.data]);
              console.log("Order update received:", message.data);
              break;

            case "PRODUCT_UPDATE":
              setProductUpdates((prev) => [...prev, message.data]);
              console.log("Product update received:", message.data);
              break;

            case "CONNECTION_ESTABLISHED":
              console.log("Connection established:", message);
              break;

            case "AUTHENTICATED":
              console.log("Authenticated:", message);
              break;

            case "SUBSCRIPTION_CONFIRMED":
              console.log("Subscription confirmed:", message.subscription);
              break;

            case "PONG":
              // Handle pong response if needed
              break;
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);

        // Attempt reconnection after 5 seconds
        setTimeout(() => {
          console.log("Attempting to reconnect WebSocket...");
          connectWebSocket();
        }, 5000);
      };
    } catch (error) {
      console.error("WebSocket connection failed:", error);
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
    orderUpdates,
    productUpdates,
    // Function to manually reconnect if needed
    reconnect: connectWebSocket,
  };
};
