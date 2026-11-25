import { useEffect, useRef } from "react";
import { getToken } from "@/app/hooks/axiosClient";

const MAX_RETRY_MS = 30_000;

/**
 * Live cart: the backend sends CART_UPDATE to the customer's sessions whenever
 * their cart changes (mobile app, another tab, checkout). The cart is then
 * re-read quietly, without a page refresh. Signed-in customers only.
 */
export function useCartLiveUpdates(accountId: string | null | undefined, onCartChanged: () => void) {
  const callback = useRef(onCartChanged);
  callback.current = onCartChanged;

  useEffect(() => {
    if (!accountId || typeof window === "undefined") return;
    let socket: WebSocket | null = null;
    let stopped = false;
    let retryMs = 1_000;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let pingTimer: ReturnType<typeof setInterval> | null = null;

    const connect = () => {
      const token = getToken();
      if (!token || stopped) return;
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const ws = new WebSocket(`${backendUrl.replace(/^http/, "ws")}/api/ws`);
      socket = ws;
      ws.onopen = () => {
        retryMs = 1_000;
        // The token is what tells the server whose cart events this session gets
        ws.send(JSON.stringify({ type: "AUTHENTICATE", token }));
        pingTimer = setInterval(() => ws.readyState === WebSocket.OPEN && ws.send(JSON.stringify({ type: "PING" })), 25_000);
      };
      ws.onmessage = (event) => {
        try {
          if (JSON.parse(event.data)?.type === "CART_UPDATE") callback.current();
        } catch {
          // not a JSON message: ignore
        }
      };
      ws.onerror = () => ws.close();
      ws.onclose = () => {
        if (pingTimer) clearInterval(pingTimer);
        if (stopped) return;
        retryTimer = setTimeout(connect, retryMs);
        retryMs = Math.min(retryMs * 2, MAX_RETRY_MS);
      };
    };

    // Back on the tab after a while: catch up at once
    const onVisible = () => document.visibilityState === "visible" && callback.current();
    document.addEventListener("visibilitychange", onVisible);
    connect();

    return () => {
      stopped = true;
      document.removeEventListener("visibilitychange", onVisible);
      if (retryTimer) clearTimeout(retryTimer);
      if (pingTimer) clearInterval(pingTimer);
      socket?.close();
    };
  }, [accountId]);
}
