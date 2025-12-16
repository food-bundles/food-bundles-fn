"use client";

import { useState, useEffect } from "react";

export function SantaClaus() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <>
      {isVisible && (
        <div className="fixed bottom-4 right-4 z-50 animate-bounce">
          <div className="relative">
            {/* Santa */}
            <div className="text-4xl md:text-6xl cursor-pointer hover:scale-110 transition-transform" 
                 onClick={() => setIsVisible(false)}>
              🎅
            </div>
            
            {/* Gifts */}
            <div className="absolute -top-2 -left-2 text-lg md:text-2xl animate-pulse">
              🎁
            </div>
            <div className="absolute -bottom-1 -right-1 text-base md:text-xl animate-pulse delay-300">
              🎁
            </div>
            
            {/* Close button */}
            <button
              onClick={() => setIsVisible(false)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}