/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export function MovingBorderCircle({
  children,
  duration = 2000,
  className,
  borderClassName,
  ...otherProps
}: {
  children: React.ReactNode;
  duration?: number;
  className?: string;
  borderClassName?: string;
  [key: string]: any;
}) {
  const pathRef = useRef<SVGPolygonElement>(null);
  const progress = useMotionValue<number>(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) {
      const pxPerMillisecond = length / duration;
      progress.set((time * pxPerMillisecond) % length);
    }
  });

  const x = useTransform(
    progress,
    (val) => pathRef.current?.getPointAtLength(val).x,
  );
  const y = useTransform(
    progress,
    (val) => pathRef.current?.getPointAtLength(val).y,
  );

  const angle = useTransform(progress, (val) => {
    if (pathRef.current) {
      const point1 = pathRef.current.getPointAtLength(val);
      const point2 = pathRef.current.getPointAtLength((val + 1) % pathRef.current.getTotalLength());
      return Math.atan2(point2.y - point1.y, point2.x - point1.x) * (180 / Math.PI);
    }
    return 0;
  });

  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%) rotate(${angle}deg)`;

  return (
    <div
      className={cn(
        "relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12",
        className
      )}
      {...otherProps}
    >
      {/* Gray circular path */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute h-full w-full"
        width="100%"
        height="100%"
      >
        <circle
          fill="none"
          stroke="#d1d5db"
          strokeWidth="1.5"
          cx="50%"
          cy="50%"
          r="45%"
        />
        <circle
          fill="none"
          cx="50%"
          cy="50%"
          r="45%"
          ref={pathRef as any}
          opacity="0"
        />
      </svg>

      {/* Moving green line */}
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "inline-block",
          transform,
        }}
      >
        <div
          className={cn(
            "h-1.5 w-1.5 md:h-0.5 md:w-6 bg-green-500 rounded-full",
            borderClassName
          )}
        />
      </motion.div>

      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}