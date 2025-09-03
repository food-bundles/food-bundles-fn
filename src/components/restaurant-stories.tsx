"use client";

import Image from "next/image";

interface RestaurantStoriesProps {
  restaurants: Array<{
    name: string;
    image: string;
    isActive: boolean;
  }>;
}

export function RestaurantStoriesInfinite({
  restaurants,
}: RestaurantStoriesProps) {
  return (
    <div className="bg-black py-8">
      <div className="container mx-auto px-4">
        {/* Scrollable container */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 justify-center min-w-max px-6">
            {restaurants.map((restaurant, index) => (
              <div
                key={`${restaurant.name}-${index}`}
                className="flex-shrink-0 text-center cursor-pointer hover:scale-105 transition-transform duration-200"
              >
                <div className="relative mb-3">
                  <div
                    className={`w-[8rem] h-[8rem] rounded-full p-0.5 ${
                      restaurant.isActive
                        ? "bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"
                        : "bg-gradient-to-r from-purple-500 via-blue-500 to-green-500"
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
