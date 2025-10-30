"use client";

import Image from "next/image";
import { Bike, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Restaurant {
  name: string;
  image: string;
  featuredPost: string;
  seen: boolean;
}

interface HeroWithRestaurantsProps {
  restaurants: Restaurant[];
}

// Enhanced Circular Restaurant Animation Component
function CircularRestaurantAnimation({
  restaurants,
}: {
  restaurants: Restaurant[];
}) {
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const accumulatedRotationRef = useRef<number>(0);
  const isHoveredRef = useRef<boolean>(false);

  const [radius, setRadius] = useState(0); // default radius for mobile

  useEffect(() => {
    // Update radius based on window size
    const updateRadius = () => {
      if (window.innerWidth < 640) {
        setRadius(240); // sm
      } else if (window.innerWidth < 768) {
        setRadius(260); // md
      } else if (window.innerWidth < 1024) {
        setRadius(280); // lg
      } else {
        setRadius(300); // xl
      }
    };

    updateRadius();
    window.addEventListener("resize", updateRadius);
    return () => window.removeEventListener("resize", updateRadius);
  }, []);

  useEffect(() => {
    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      if (!isHoveredRef.current) {
        const elapsed = currentTime - startTimeRef.current;
        const newRotation =
          accumulatedRotationRef.current + (elapsed / 40000) * 360;
        setRotation(newRotation);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
    accumulatedRotationRef.current = rotation;
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    startTimeRef.current = performance.now();
  };

  const handleRestaurantClick = (restaurantName: string) => {
    window.location.href = `/stories?restaurant=${encodeURIComponent(
      restaurantName
    )}`;
  };

  const displayRestaurants = restaurants.slice(0, 10);

  return (
    <div className="relative w-130 h-130 mx-auto">
      <div
        className="absolute inset-0 transition-transform duration-75 ease-linear"
        style={{
          transform: `rotate(${rotation}deg)`,
        }}
      >
        {displayRestaurants.map((restaurant, index) => {
          const angle = (index * 360) / displayRestaurants.length;
          const radian = (angle * Math.PI) / 180;
          const x = radius * Math.cos(radian);
          const y = radius * Math.sin(radian);

          return (
            <div
              key={`${restaurant.name}-${index}`}
              className="absolute cursor-pointer transition-all duration-200 hover:scale-110 group"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: `translate(-50%, -50%) rotate(-${rotation}deg)`,
                zIndex: 10,
              }}
              onClick={() => handleRestaurantClick(restaurant.name)}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-full p-0.5 bg-linear-to-br from-green-400 to-green-600 flex items-center justify-center  shadow-md shadow-green-400/50">
                  <div className="relative w-full h-full bg-gray-900 rounded-full overflow-hidden flex items-center justify-center">
                    <Image
                      src={restaurant.image || "/placeholder.svg"}
                      alt={restaurant.name}
                      width={60}
                      height={60}
                      className="w-full h-full object-cover absolute inset-0"
                    />
                  </div>
                </div>
                <div className="absolute top-24 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-green-400 font-medium text-xs px-2 py-1 rounded whitespace-nowrap">
                    {restaurant.name}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Hero Image Carousel Component
function HeroImageCarousel() {
  const images = ["imgs/hero.jpg", "imgs/hero2.jpg", "imgs/hero3.jpg"];

  const [currentImageIndex, setCurrentImageIndex] = useState(() =>
    Math.floor(Math.random() * images.length)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // 3 minutes = 180000ms

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={image}
            alt="Professional chef preparing fresh ingredients"
            fill
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  );
}

export function HeroWithRestaurants({ restaurants }: HeroWithRestaurantsProps) {
  return (
    <section className="relative">
      <div
        className="
      relative 
      h-[40vh]       /* mobile height */
      sm:h-[60vh]    /* small screens */
      md:h-[80vh]    /* medium screens */
      lg:h-[92vh]    /* large screens */
      max-h-[800px] 
      overflow-hidden
    "
      >
        <HeroImageCarousel />
        <div className="absolute inset-0 bg-linear-to-br from-black/50 via-black/30 to-black/50"></div>
        <div className="absolute inset-0">
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full h-full">
              <div className="lg:col-span-4 space-y-0 z-10 text-center lg:text-left flex flex-col justify-start pt-4 lg:pt-6 pl-3 lg:pl-5">
                <div className="space-y-4 max-w-lg mx-auto lg:mx-0">
                  <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold leading-tight text-white">
                    <span className="block">Connect Your</span>
                    <span className="block text-green-400 bg-clip-text">
                      Restaurant
                    </span>
                    <span className="block text-green-400">To Our Farm</span>
                  </h1>
                  <p className="hidden lg:block text-sm sm:text-base text-white leading-relaxed">
                    Get fresh, quality, and reliable ingredients for your
                    restaurant directly from farm to table with our premium
                    delivery service.
                  </p>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-3 text-orange-400">
                  <Bike className="w-6 h-6 animate-pulse" />
                  <p className="text-sm font-semibold">Fast Delivery</p>
                </div>
              </div>

              <div className="lg:col-span-4 relative h-full flex items-end justify-center pb-0">
                <div
                  className="
                    relative
                    translate-y-0   /* mobile */
                    sm:translate-y-3 /* sm screens */
                    md:translate-y-5 /* md screens */
                    lg:translate-y-60 /* large screens */
                  "
                >
                  <CircularRestaurantAnimation restaurants={restaurants} />
                </div>
                <div
                  className="
                   absolute
                   left-1/2
                   transform -translate-x-1/2
                   z-30
                   top-60 
                   sm:top-65
                   md:top-70
                   lg:top-75 
                   xl:top-85 
                 "
                >
                  <div className="w-24 h-24 rounded-full bg-linear-to-br from-gray-800 to-black border-2 border-orange-400/50 flex items-center justify-center shadow-xl">
                    <div className="text-center">
                      <div className="text-orange-400 text-lg font-bold">
                        50 +
                      </div>
                      <div className="text-gray-300 text-xs font-medium">
                        Restaurants
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6 z-10 pt-2 lg:pt-4 pr-3 lg:pr-5">
                <div className="flex flex-col items-end w-full">
                  <div className="rounded-xl p-4 text-center">
                    <div className="flex justify-center -space-x-2 mb-3">
                      <Image
                        src="/products/fresh-organic-roma-tomatoes.png"
                        alt="Product"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full border-2 border-orange-400 shadow-lg"
                      />
                      <Image
                        src="/products/fresh-atlantic-salmon-fillet.png"
                        alt="Product"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full border-2 border-orange-400 shadow-lg"
                      />
                    </div>
                    <div className="text-orange-400 font-bold text-2xl mb-1">
                      99+
                    </div>
                    <div className="text-sm text-gray-300">Products</div>
                  </div>
                  <div className="rounded-xl p-4 text-center">
                    <div className="text-green-400 font-bold text-2xl mb-2">
                      24/7
                    </div>
                    <div className="text-sm text-gray-300 mb-2">
                      Customer Support
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                      <span className="text-xs text-gray-400 ml-2">(4.9)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
