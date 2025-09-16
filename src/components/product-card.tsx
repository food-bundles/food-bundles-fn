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
import { Star, Heart, ShoppingCart, Eye, Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/auth-context";
import { useCart } from "@/app/contexts/cart-context"; // Import cart context
import CartDrawer from "./cartDrawer";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  category?: string;
  discountPercent?: number;
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  category,
  discountPercent,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { addToCart, cartItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Check if product is already in cart
  const isInCart = cartItems.some((item) => item.productId === id);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        );
      } else {
        stars.push(<Star key={i} className="w-3 h-3 text-gray-300" />);
      }
    }
    return stars;
  };

  const handleCartClick = async () => {
    if (!isAuthenticated) {
      setIsModalOpen(true);
      return;
    }

    if (isInCart) {
      // Product is already in cart, maybe show a message or navigate to cart
      router.push("/cart");
      return;
    }

    setIsAddingToCart(true);
    try {
      const success = await addToCart(id, 1);
      if (success) {
        // Show success feedback (you could use a toast notification)
        console.log("Product added to cart successfully");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleCustomerLogin = () => {
    setIsModalOpen(false);
    localStorage.setItem(
      "pendingCartProduct",
      JSON.stringify({
        id, // Make sure to include the product ID
        name,
        price,
        originalPrice,
        image,
        rating,
        category,
      })
    );
    localStorage.setItem("returnUrl", window.location.href);

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("showLogin", "true");
    currentUrl.searchParams.set("reason", "add_to_cart");
    router.push(currentUrl.toString());
  };

  return (
    <>
      <div
        className="w-full max-w-[280px] bg-white"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card
          className={`border-0 shadow-none hover:rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg`}
        >
          {/* Product Image Container */}
          <div className="relative w-full h-[180px] bg-gray-50 flex items-center justify-center group overflow-hidden">
            <Image
              src={image || "/placeholder.svg"}
              alt={name}
              width={200}
              height={200}
              className="object-contain w-full max-h-[180px] transition-transform duration-300 group-hover:scale-105"
            />

            {/* Discount Badge */}
            {discountPercent && (
              <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                {discountPercent}% OFF
              </div>
            )}

            {/* In Cart Badge */}
          <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
           {isInCart && (
             <div
               className="absolute top-3 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center cursor-pointer"
               onClick={() => setIsCartOpen(true)}
             >
               <Check className="w-3 h-3 mr-1" /> View Cart
             </div>
           )}
     
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <div className="bg-orange-400 rounded-full p-3 flex items-center justify-center space-x-10 shadow-lg">
                {/* Quick View */}
                <button className="text-white hover:text-gray-200 transition-colors">
                  <Eye className="w-5 h-5" />
                </button>

                {/* Add to Cart */}
                <button
                  onClick={handleCartClick}
                  disabled={isAddingToCart || isInCart}
                  className={`text-white hover:text-gray-200 transition-colors ${
                    isAddingToCart ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isAddingToCart ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShoppingCart className="w-5 h-5" />
                  )}
                </button>

                {/* Add to Wishlist */}
                <button className="text-white hover:text-gray-200 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="px-4 space-y-1">
            {/* Category */}
            <div className="text-2xs text-gray-500 font-medium uppercase tracking-wide">
              {category || "PRODUCTS"}
            </div>

            {/* Product Name */}
            <h3 className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
              {name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars(rating)}</div>
              <span className="text-xs text-gray-500">
                ({rating.toFixed(2)})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-gray-900">
                {price.toFixed(2)} Rwf
              </span>
              {originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {originalPrice.toFixed(2)}Rwf
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Login Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-orange-500" />
              Login to Add to Cart
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="border border-green-200 rounded-lg p-4 space-y-3 bg-green-50">
              <Button
                onClick={handleCustomerLogin}
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
              >
                Login & Add to Cart
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
