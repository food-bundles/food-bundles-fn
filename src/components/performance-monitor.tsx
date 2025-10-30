/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";

export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry:any) => {
          if (entry.entryType === "largest-contentful-paint") {
            console.log("LCP:", entry.startTime);
          }
          if (entry.entryType === "first-input") {
            console.log("FID:", entry.processingStart - entry.startTime);
          }
          if (entry.entryType === "layout-shift") {
            console.log("CLS:", entry.value);
          }
        });
      });

      observer.observe({ entryTypes: ["largest-contentful-paint", "first-input", "layout-shift"] });

      return () => observer.disconnect();
    }
  }, []);

  return null;
}