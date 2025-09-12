"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import {
  Star,
  Heart,
  ShoppingCart,
  Eye,
  User,
  UserCheck,
  Dot,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
}

export function ProductCard({
  name,
  price,
  originalPrice,
  image,
  rating,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  const handleCartClick = () => {
    setIsModalOpen(true);
  };

  const handleGuestCheckout = () => {
    setIsModalOpen(false);
    // Add product to cart and proceed as guest
    console.log("Proceeding as guest with product:", name);
    // You can add your guest checkout logic here
  };

  const handleCustomerLogin = () => {
    setIsModalOpen(false);
    // Store the product info in localStorage or context for later retrieval
    localStorage.setItem(
      "pendingCartProduct",
      JSON.stringify({
        name,
        price,
        originalPrice,
        image,
        rating,
      })
    );
    // Redirect to login page
    router.push("/?showLogin=true");
  };

  return (
    <>
      <div
        className="w-full max-w-[220px] transition-transform duration-300 hover:scale-105"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Outer Card with Product Image */}
        <Card className="rounded-xl overflow-hidden py-0 px-5 bg-gray-100 relative group">
          <div className="relative w-full h-40 flex items-center justify-center bg-white">
            <Image
              src={image || "/placeholder.svg"}
              alt={name}
              width={180}
              height={180}
              className="object-contain transition-transform duration-300 group-hover:scale-110"
            />

            {/* Hover Icons Overlay */}
            <div
              className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
                isHovered
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-2"
              }`}
            >
              {/* Wish Icon */}
              <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-orange-50 transition-colors">
                <Heart className="w-4 h-4 text-gray-600 hover:text-orange-500 cursor-pointer" />
              </button>

              {/* Cart Icon */}
              <button
                onClick={handleCartClick}
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-orange-50 transition-colors"
              >
                <ShoppingCart className="w-4 h-4 text-gray-600 hover:text-orange-500 cursor-pointer" />
              </button>

              {/* View Icon */}
              <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-orange-50 transition-colors">
                <Eye className="w-4 h-4 text-gray-600 hover:text-orange-500 cursor-pointer" />
              </button>
            </div>
          </div>
        </Card>

        {/* Inner Card with Info (caption style) */}
        <Card className="rounded-xl bg-transparent p-0 border-0 shadow-none">
          <div className="p-3 space-y-2 text-center">
            <h3 className="font-semibold text-base line-clamp-1">{name}</h3>

            {/* Rating */}
            <div className="flex items-center justify-center gap-1">
              <div className="flex">{renderStars(rating)}</div>
              <span className="text-xs text-gray-500">{rating}</span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-center gap-2">
              <span className="font-bold text-sm text-black">
                Rwf {price.toLocaleString()}
              </span>
              {originalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Cart Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-orange-500" />
              Choose Your Shopping Option
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-4 py-4">
            {/* Guest Option */}
            <div className="flex-1 border border-gray-200 rounded-lg p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-black" />
                  <h3 className="font-semibold">Buy as Guest</h3>
                </div>
                <div className="space-y-2 text-sm text-black">
                  <div className="flex items-center gap-2">
                    <Dot className="w-4 h-4 text-red-500" />
                    <span>buy without FoodBundle account</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dot className="w-4 h-4 text-red-500" />
                    <span>Delivery fees may apply</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dot className="w-4 h-4 text-red-500" />
                    <span>Miss out on exclusive promotions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dot className="w-4 h-4 text-red-500" />
                    <span>bulk quantity required</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleGuestCheckout}
                variant="outline"
                className="w-full mt-4"
              >
                Buy as Guest
              </Button>
            </div>

            {/* Customer Option */}
            <div className="flex-1 border border-green-200 rounded-lg p-4 space-y-3 bg-green-50 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold">Login/Signup as Customer</h3>
                </div>
                <div className="space-y-2 text-sm text-green-700">
                  <div className="flex items-center gap-2">
                    <Dot className="w-4 h-4 text-green-600" />
                    <span>Free delivery on orders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dot className="w-4 h-4 text-green-600" />
                    <span>Access to exclusive promotions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dot className="w-4 h-4 text-green-600" />
                    <span>Stay connected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dot className="w-4 h-4 text-green-600" />
                    <span>Minimum quantity</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleCustomerLogin}
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
              >
                Buy as Restaurant
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
