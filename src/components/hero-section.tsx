"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ShoppingCart, Truck, Star } from "lucide-react";

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
function RestaurantStoriesInfinite({
  restaurants,
}: {
  restaurants: Array<{
    name: string;
    image: string;
    seen: boolean;
  }>;
}) {
  return (
    <div className="bg-black py-8">
      <div className="container mx-auto px-[10rem]">
        {/* Scrollable container */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 justify-center min-w-max px-6">
            {restaurants.map((restaurant, index) => (
              <div
                key={`${restaurant.name}-${index}`}
                className="flex-shrink-0 text-center cursor-pointer  transition-transform duration-200"
              >
                <div className="relative mb-3">
                  <div
                    className={`w-[8rem] h-[8rem] rounded-full p-0.5 ${
                      restaurant.seen
                        ? "bg-green-700"
                        : "bg-gray-800"
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
  return (
    <section className="relative flex flex-col">
      {/* Full Width Background Image */}
      <div className="relative h-[60vh] max-h-[500px] min-h-[450px] overflow-hidden">
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
          <div className="container mx-auto px-4 h-full flex items-start pt-4">
            <div className="grid lg:grid-cols-12 gap-4 items-start w-full h-full">
              {/* Left Content - Overlay */}
              <div className="lg:col-span-4 space-y-4 z-10">
                <div className="space-y-4 bg-transparent ">
                  <h1 className="text-3xl lg:text-5xl font-semibold text-balance leading-tight text-gray-100">
                    Fresh Ingredients,
                    <span className="text-green-500"> Delivered Daily</span>
                  </h1>
                  <p className="text-2xs text-gray-300 text-pretty leading-relaxed">
                    Get fresh, quality, and reliable ingredients for your
                    restaurant directly from farm to shop.
                  </p>
                </div>

                <div className="font-bold flex items-center gap-2 text-orange-400 animate-slide-x">
                  <p className="text-2xs">Fast Delivery</p>
                  <Truck className="w-5 h-5 mr-1" />
                </div>
              </div>

              {/* Center - Background Image Space */}
              <div className="lg:col-span-6 relative h-full flex items-center justify-center">
                {/* Centered Shop Now badge */}
                <div className=" p-2 flex flex-col items-center space-y-4">
                  <ShoppingCart className="w-10 h-10 text-orange-400 animate-bounce z-20" />
                  <Button className="p-0 bg-transparent hover:bg-transparent font-semibold text-2xs text-orange-400">
                    Shop Now
                  </Button>
                </div>
              </div>

              {/* Right Stats - Overlay */}
              <div className="lg:col-span-2 space-y-2 z-10">
                <div className="space-y-2  p-4 ">
                  <div className="text-end p-2 border-b border-gray-500">
                    <div className="flex items-center justify-end gap-1">
                      <div className="flex -space-x-[2rem]">
                        <Image
                          src="/restaurants/farm-to-table-restaurant-chef.png"
                          alt="restaurant Logo"
                          width={64}
                          height={64}
                          className="object-contain rounded-full border-3 border-green-500"
                        />
                        <Image
                          src="/restaurants/indian-restaurant-chef.png"
                          alt="restaurant Logo"
                          width={64}
                          height={64}
                          className="object-contain rounded-full border-3 border-green-500"
                        />
                        <Image
                          src="/restaurants/italian-restaurant-chef.png"
                          alt="restaurant Logo"
                          width={64}
                          height={64}
                          className="object-contain rounded-full border-3 border-green-500"
                        />
                        <Image
                          src="/restaurants/vegetarian-restaurant-chef.png"
                          alt="restaurant Logo"
                          width={64}
                          height={64}
                          className="object-contain rounded-full border-3 border-green-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <div className="text-2xl font-bold text-green-500 mb-0">
                        99+
                      </div>
                      <div className="text-2xs text-gray-400">Restaurants</div>
                    </div>
                  </div>

                  <div className="text-end p-2 border-b border-gray-500">
                    <div className="flex items-center justify-end gap-1">
                      <div className="flex -space-x-[2rem]">
                        <Image
                          src="/products/fresh-organic-roma-tomatoes.png"
                          alt="restaurant Logo"
                          width={64}
                          height={64}
                          className="object-contain rounded-full border-3 border-green-500"
                        />
                        <Image
                          src="/products/fresh-atlantic-salmon-fillet.png"
                          alt="restaurant Logo"
                          width={64}
                          height={64}
                          className="object-contain rounded-full border-3 border-green-500"
                        />
                        <Image
                          src="/products/artisan-cheese-selection-platter.png"
                          alt="restaurant Logo"
                          width={64}
                          height={64}
                          className="object-contain rounded-full border-3 border-green-500"
                        />
                        <Image
                          src="/products/organic-mixed-salad-greens.png"
                          alt="restaurant Logo"
                          width={64}
                          height={64}
                          className="object-contain rounded-full border-3 border-green-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <div className="text-2xl font-bold text-green-500 mb-0">
                        99+
                      </div>
                      <div className="text-2xs text-gray-400">Products</div>
                    </div>
                  </div>

                  <div className="text-end p-2 border-b border-gray-500">
                    <div className="flex items-center justify-end gap-1">
                      <div className="text-xl font-bold text-green-500 mb-0">
                        24/7
                      </div>
                      <div className="text-xs text-gray-400">Support</div>
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-2 h-2 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 ml-1">(4.7)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant Stories */}
      <div className="flex-shrink-0">
        <RestaurantStoriesInfinite restaurants={restaurants} />
      </div>
    </section>
  );
}
