"use client";

import type React from "react";
import { memo } from "react";

interface AnimatedDotsBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedDotsBackground = memo(function AnimatedDotsBackground({
  children,
  className = "",
}: AnimatedDotsBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Simplified static background */}
      <div className="absolute inset-0 opacity-10 bg-linear-to-br from-green-50 to-green-100" />

      {/* Foreground content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
});
