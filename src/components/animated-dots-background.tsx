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
      {/* Small moving dots */}
      <div
        className="absolute inset-0 opacity-30" // increased from 20 → 30
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(75, 85, 99, 0.7) 1.5px, transparent 1.5px)", // stronger green + slightly bigger
          backgroundSize: "35px 35px", // smaller spacing so dots are more frequent
          animation: "moveDotsSmall 14s ease-in-out infinite",
        }}
      />

      {/* Large moving dots */}
      <div
        className="absolute inset-0 opacity-20" // increased from 10 → 20
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(5, 150, 105, 0.8)  3px, transparent 3px)", // gray dots instead of second green
          backgroundSize: "120px 120px", // slightly tighter
          backgroundPosition: "20px 20px",
          animation: "moveDotsBig 20s linear infinite reverse",
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>

      <style jsx>{`
        @keyframes moveDotsSmall {
          0%,
          100% {
            background-position: 0 0;
          }
          25% {
            background-position: 15px 0;
          }
          50% {
            background-position: 15px 15px;
          }
          75% {
            background-position: 0 15px;
          }
        }

        @keyframes moveDotsBig {
          0% {
            background-position: 20px 20px;
          }
          25% {
            background-position: 50px 20px;
          }
          50% {
            background-position: 50px 50px;
          }
          75% {
            background-position: 20px 50px;
          }
          100% {
            background-position: 20px 20px;
          }
        }
      `}</style>
    </div>
  );
}
