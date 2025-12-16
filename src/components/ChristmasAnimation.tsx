"use client";

import { useEffect, useState } from "react";

interface Snowflake {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export function ChristmasAnimation() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    const createSnowflake = (id: number): Snowflake => ({
      id,
      x: Math.random() * window.innerWidth,
      y: -10,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.6 + 0.4,
    });

    const initialSnowflakes = Array.from({ length: 50 }, (_, i) => createSnowflake(i));
    setSnowflakes(initialSnowflakes);

    const interval = setInterval(() => {
      setSnowflakes(prev => 
        prev.map(flake => ({
          ...flake,
          y: flake.y + flake.speed,
          x: flake.x + Math.sin(flake.y * 0.01) * 0.5,
        })).filter(flake => flake.y < window.innerHeight)
          .concat(
            prev.length < 50 && Math.random() < 0.3 
              ? [createSnowflake(Date.now())] 
              : []
          )
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Christmas Trees */}
      <div className="absolute bottom-0 left-4 text-4xl md:text-9xl animate-pulse">🎄</div>
      <div className="absolute bottom-0 right-0 text-4xl md:text-9xl animate-pulse" style={{ animationDelay: '1s' }}>🎄</div>
      <div className="absolute bottom-0 left-1/3 text-4xl md:text-9xl animate-pulse " style={{ animationDelay: '2s' }}>🎄</div>
      
      {/* Santa Hats */}
      {/* <div className="relative top-28 right-20 text-3xl animate-bounce">🎅</div> */}
      {/* <div className="absolute top-3 left-108 text-2xl animate-pulse" style={{ animationDelay: '1.5s' }}>🎅</div> */}
      
      {/* Snowflakes */}
      {snowflakes.map(flake => (
        <div
          key={flake.id}
          className="absolute text-white"
          style={{
            left: flake.x,
            top: flake.y,
            fontSize: flake.size,
            opacity: flake.opacity,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
}