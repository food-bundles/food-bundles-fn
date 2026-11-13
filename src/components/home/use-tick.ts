"use client";

import { useEffect, useState } from "react";

// Counts up once per interval; drives the page's small "live" animations.
export function useTick(ms = 1000) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((n) => n + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
  return t;
}

// Kigali time as HH:MM. Empty until mounted so server and client markup match.
export function useKigaliClock() {
  const [clock, setClock] = useState("");
  useEffect(() => {
    const read = () => {
      try {
        setClock(new Date().toLocaleTimeString("en-GB", { timeZone: "Africa/Kigali", hour: "2-digit", minute: "2-digit" }));
      } catch {
        setClock(new Date().toTimeString().slice(0, 5));
      }
    };
    read();
    const id = setInterval(read, 15000);
    return () => clearInterval(id);
  }, []);
  return clock;
}
