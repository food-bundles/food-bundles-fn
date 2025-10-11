"use client";

import type React from "react";
import { useRef } from "react";

interface AnimatedDotsBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedDotsBackground({
  children,
  className = "",
}: AnimatedDotsBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Reusable global background */}
      <div className="dots-bg" />

      {/* Foreground content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
