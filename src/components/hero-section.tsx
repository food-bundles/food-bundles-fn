/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { OptimizedImage } from "@/components/OptimizedImage";
import { Bike, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Restaurant {
  name: string;
  image: string;
  images?: string[];
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
        setRadius(260); // sm
      } else if (window.innerWidth < 768) {
        setRadius(460); // md
      } else if (window.innerWidth < 1024) {
        setRadius(480); // lg
      } else {
        setRadius(500); // xl
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
    window.location.href ="#";
  };

  const displayRestaurants = restaurants.slice(0, 16);

  return (
    <div className="relative w-130 h-130 mx-auto mt-20">
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
                    <OptimizedImage
                      src={restaurant.image || "/placeholder.svg"}
                      alt={restaurant.name}
                      width={60}
                      height={60}
                      className="w-full h-full object-cover absolute inset-0"
                      transformation={[
                        { width: 120, height: 120, crop: "fill", quality: "80" }
                      ]}
                    />
                  </div>
                </div>
                <div className="absolute top-24 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-green-400 font-medium text-xs px-2 py-1 rounded whitespace-nowrap bg-[#000000]">
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
function HeroImageCarousel({ onImageChange }: { onImageChange: (index: number) => void }) {
  const images = ["imgs/hero.jpg", "imgs/hero2.jpg", "imgs/hero3.jpg"];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    onImageChange(currentImageIndex);
  }, [currentImageIndex, onImageChange]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 15000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {images.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
        >
          <OptimizedImage
            src={image}
            alt="Professional chef preparing fresh ingredients"
            fill
            className="object-cover"
            priority={index === 0}
            transformation={[
              { quality: "85", format: "webp" }
            ]}
          />
        </div>
      ))}
    </div>
  );
}

export function HeroWithRestaurants({ restaurants }: HeroWithRestaurantsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const textContent = [
    {
      title: ["Connect", "Your", "Restaurant", "To", "Our", "Farm"],
      description: {
        line1: "Get fresh, quality, and reliable ingredients for your restaurant",
        line2: "directly from farm to table with our premium delivery service."
      },
      delivery: "Fast Delivery"
    },
    {
      title: ["Fresh", "Quality", "Ingredients", "From", "Our", "Farm"],
      description: {
        line1: "Experience the difference with locally sourced, organic produce",
        line2: "delivered straight to your kitchen every day."
      },
      delivery: "Same Day Delivery"
    },
    {
      title: ["Farm", "To", "Table", "Excellence", "For", "Restaurants"],
      description: {
        line1: "Partner with us for sustainable, traceable ingredients that elevate",
        line2: "your culinary creations and delight your customers."
      },
      delivery: "Premium Service"
    }
  ];

  const currentText = textContent[currentImageIndex];

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
        <HeroImageCarousel onImageChange={setCurrentImageIndex} />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="inset-0">
          <div className="container mx-auto px-4 h-full flex items-center border border-amber-400">
            <div className=" w-full relative h-full flex items-center justify-center sm:mt-3">
              <div className="">
                <div className="animate-container-float sm:mt-10  ">
                  <div className="relative">
                    <h1 className="text-base sm:text-lg md:text-4xl lg:text-5xl font-bold leading-tight text-center mt-8 sm:mt-15 md:mt-15 ld:mt-20 animate-text-glow px-4 sm:px-6 max-w-full break-words">
                      <span className="text-orange-400" style={{animationDelay: '1s'}}>{currentText.title[0]}</span>{" "}
                      <span className="text-orange-400" style={{animationDelay: '2s'}}>{currentText.title[1]}</span>{" "}
                      <span className="text-green-700" style={{animationDelay: '3s'}}>{currentText.title[2]}</span>{" "}
                      <span className="text-orange-400" style={{animationDelay: '4s'}}>{currentText.title[3]}</span>{" "}
                      <span className="text-orange-400" style={{animationDelay: '5s'}}>{currentText.title[4]}</span>{" "}
                      <span className="text-green-700" style={{animationDelay: '6s'}}>{currentText.title[5]}</span>
                    </h1>
                    <div className="text-center text-sm sm:text-base lg:text-[20px] text-white leading-relaxed mt-6 lg:mt-10 max-w-xs sm:max-w-2xl mx-auto px-6 sm:px-4">
                      <p className="animate-text-breathe break-words" style={{animationDelay: '8s'}}>{currentText.description.line1}</p>
                      <p className="hidden lg:block animate-text-breathe break-words" style={{animationDelay: '12s'}}>{currentText.description.line2}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-orange-400 mt-6 animate-delivery-bounce">
                    <Bike className="w-6 h-6 animate-bike-move" />
                    <p className="text-[20px] font-bold animate-text-wave">{currentText.delivery}</p>
                  </div>
                </div>
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
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
