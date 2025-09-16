"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  ShoppingCart,
  Truck,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Restaurant {
  name: string;
  image: string;
  featuredPost: string;
  seen: boolean;
}

interface HeroWithRestaurantsProps {
  restaurants: Restaurant[];
}

// Restaurant Stories Component (combined inline)
function RestaurantStories({
  restaurants,
}: {
  restaurants: Array<{
    name: string;
    image: string;
    seen: boolean;
  }>;
}) {
  const router = useRouter();

  const handleRestaurantClick = (restaurantName: string) => {
    router.push(`/stories?restaurant=${encodeURIComponent(restaurantName)}`);
  };

  return (
    <div className="bg-black py-8">
      <div className="container mx-auto px-[1rem] sm:px-[2rem] md:px-[4rem] lg:px-[6rem]">
        {/* Scrollable container */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 justify-center min-w-max px-6">
            {restaurants.map((restaurant, index) => (
              <div
                key={`${restaurant.name}-${index}`}
                className="flex-shrink-0 text-center cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => handleRestaurantClick(restaurant.name)}
              >
                <div className="relative mb-3">
                  <div
                    className={`w-[4rem] h-[4rem] sm:w-[6rem] sm:h-[6rem] md:w-[7rem] md:h-[7rem] rounded-full p-0.5 ${
                      restaurant.seen
                        ? "bg-gray-500"
                        : "bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500"
                    }`}
                  >
                    <div className="w-full h-full bg-black rounded-full p-0.5">
                      <div className="w-full h-full rounded-full overflow-hidden">
                        <Image
                          src={
                            restaurant.image ||
                            "/placeholder.svg?height=76&width=76&query=restaurant"
                          }
                          alt={restaurant.name}
                          width={76}
                          height={76}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-white text-sm font-medium truncate max-w-[180px]">
                  {restaurant.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroWithRestaurants({ restaurants }: HeroWithRestaurantsProps) {
    const handleShopNowClick = () => {
      const element = document.getElementById("products");
      if (element) {
        const headerHeight = 80;
        const elementPosition = element.offsetTop - headerHeight;

        window.scrollTo({
          top: elementPosition,
          behavior: "smooth",
        });
      }
    };

  return (
    <section className="relative flex flex-col">
      {/* Full Width Background Image */}
      <div className="relative h-[50vh] sm:h-[55vh] md:h-[60vh] max-h-[600px] min-h-[400px] sm:min-h-[450px] overflow-hidden">
        <Image
          src="imgs/hero.jpg"
          alt="Professional chef preparing fresh ingredients"
          fill
          className="object-cover"
          priority
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Content Overlay */}
        <div className="absolute inset-0">
          <div className="container mx-auto px-4 h-full flex items-center pt-4 pb-8 sm:pt-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-center w-full h-full">
              {/* Left Content - Overlay */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-4 z-10 text-center lg:text-left">
                <div className="space-y-4 bg-transparent max-w-lg mx-auto lg:mx-0">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-balance leading-tight text-gray-100">
                    Fresh Ingredients,
                    <span className="text-green-500 block sm:inline">
                      {" "}
                      Delivered Daily
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-gray-300 text-pretty leading-relaxed">
                    Get fresh, quality, and reliable ingredients for your
                    restaurant directly from farm to shop.
                  </p>
                </div>

                <div className="font-bold flex items-center justify-center lg:justify-start gap-2 text-orange-400 animate-slide-x">
                  <p className="text-xs sm:text-sm">Fast Delivery</p>
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>

              {/* Center - Shop Now Button (visible on medium screens and up) */}
              <div className="hidden md:flex lg:col-span-2 xl:col-span-4 relative h-full items-center justify-center">
                <div className="p-2 flex flex-col items-center space-y-4">
                  {/* Centered Shop Now badge */}
                  <div className="p-2 flex flex-col items-center space-y-4">
                    <ShoppingCart className="w-10 h-10 text-orange-400 animate-bounce z-20" />
                    <Button
                      className="p-0 bg-transparent hover:bg-transparent font-semibold text-2xs text-orange-400 cursor-pointer"
                      onClick={handleShopNowClick}
                    >
                      Shop Now
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Stats - Overlay */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-2 z-10">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 bg-black/40 p-3 md:p-4 rounded-lg max-w-xl mx-auto">
                  {/* Restaurants Stat */}
                  <div className="text-center p-2 border-b md:border-b-0 md:border-r border-gray-500">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <div className="flex -space-x-3 md:-space-x-4">
                        <Image
                          src="/restaurants/farm-to-table-restaurant-chef.png"
                          alt="Restaurant Logo"
                          width={40}
                          height={40}
                          className="w-8 h-8 md:w-10 md:h-10 object-contain rounded-full border-2 border-green-500"
                        />
                        <Image
                          src="/restaurants/indian-restaurant-chef.png"
                          alt="Restaurant Logo"
                          width={40}
                          height={40}
                          className="w-8 h-8 md:w-10 md:h-10 object-contain rounded-full border-2 border-green-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <div className="text-lg md:text-xl font-bold text-green-500">
                        99+
                      </div>
                      <div className="text-xs text-gray-400">Restaurants</div>
                    </div>
                  </div>

                  {/* Products Stat */}
                  <div className="text-center p-2 border-b border-gray-500 md:border-b-0 md:border-r">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <div className="flex -space-x-3 md:-space-x-4">
                        <Image
                          src="/products/fresh-organic-roma-tomatoes.png"
                          alt="Product"
                          width={40}
                          height={40}
                          className="w-8 h-8 md:w-10 md:h-10 object-contain rounded-full border-2 border-green-500"
                        />
                        <Image
                          src="/products/fresh-atlantic-salmon-fillet.png"
                          alt="Product"
                          width={40}
                          height={40}
                          className="w-8 h-8 md:w-10 md:h-10 object-contain rounded-full border-2 border-green-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <div className="text-lg md:text-xl font-bold text-green-500">
                        99+
                      </div>
                      <div className="text-xs text-gray-400">Products</div>
                    </div>
                  </div>

                  {/* Support Stat */}
                  <div className="text-center p-2 col-span-2 md:col-span-1">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <div className="text-lg md:text-xl font-bold text-green-500">
                        24/7
                      </div>
                      <div className="text-xs text-gray-400">Support</div>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 ml-1">(4.7)</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Shop Now Button */}
                <div className="md:hidden flex justify-center mt-4">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-full flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Shop Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Stories */}
      <div className="flex-shrink-0">
        <RestaurantStories restaurants={restaurants} />
      </div>
    </section>
  );
}
