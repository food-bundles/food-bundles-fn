"use client";

import type React from "react";
import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import CartDrawer from "@/components/cartDrawer";
import { useCartSummary } from "@/app/contexts/cart-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Star,
  Heart,
  ShoppingCart,
  Eye,
  Check,
} from "lucide-react";
import { useAuth } from "@/app/contexts/auth-context";
import { useCart } from "@/app/contexts/cart-context";
import { useProductSection } from "@/hooks/useProductSection";
import Link from "next/link";

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

function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  discountPercent,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [inputValue, setInputValue] = useState("1");
  const { addToCart, cartItems, updateCartItem } = useCart();



  const cartItem = cartItems.find((item) => item.productId === id);
  const isInCart = !!cartItem;
  const cartQuantity = cartItem?.quantity || 0;

  const isUpdateDisabled = isInCart && quantity === cartQuantity;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setInputValue(value);
      const numValue = Number.parseInt(value) || 1;
      if (numValue > 0) {
        setQuantity(numValue);
      }
    }
  };

  const handleQuantityBlur = () => {
    const numValue = Number.parseInt(inputValue) || 1;
    const finalValue = Math.max(1, numValue);
    setQuantity(finalValue);
    setInputValue(finalValue.toString());
  };

  const handleCartAction = useCallback(async () => {
    setIsAddingToCart(true);
    try {
      if (isInCart && cartItem) {
        // Update existing cart item
        const success = await updateCartItem(cartItem.id, quantity);
        if (success) {
          console.log("Cart updated successfully");
        }
      } else {
        // Add new item to cart
        const success = await addToCart(id, quantity);
        if (success) {
          console.log("Product added to cart successfully");
        }
      }
    } catch (error) {
      console.error("Error with cart action:", error);
    } finally {
      setIsAddingToCart(false);
    }
  }, [isInCart, cartItem, quantity, addToCart, updateCartItem, id]);

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

  return (
    <>
      <div
        className={
          "w-full bg-white transition-all duration-300 max-w-[200px] sm:max-w-[220px]"
        }
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card className="border border-gray-200 shadow hover:shadow-lg rounded-md hover:rounded hover:border-green-500 overflow-hidden transition-all duration-300 p-0 pb-2 h-full">
          <div className="relative w-full  flex items-center justify-center group overflow-hidden h-[160px] sm:h-[180px] ">
            <Image
              src={image || "/placeholder.svg"}
              alt={name}
              width={200}
              height={200}
              className="object-contain w-full max-h-full transition-transform duration-300 group-hover:scale-105"
            />
            {discountPercent && (
              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                {discountPercent}% OFF
              </div>
            )}
            {isInCart && isHovered && (
              <Link href="/restaurant/checkout" className="absolute inset-0">
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center cursor-pointer hover:bg-green-600 transition-colors">
                  <Check className="w-3 h-3 mr-1" /> Buy Now
                </div>
              </Link>
            )}

            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <div className="bg-green-500 flex items-center justify-center shadow-lg px-1 p-1 space-x-6 sm:space-x-8">
                <button className="text-white hover:text-gray-200 transition-colors font-bold">
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer" />
                </button>

                <div className="relative">
                  <button
                    onClick={handleCartAction}
                    disabled={isAddingToCart || isUpdateDisabled}
                    className={`text-white hover:text-gray-200 transition-colors font-bold ${
                      isAddingToCart || isUpdateDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isAddingToCart ? (
                      <div className="border-2 border-white border-t-transparent rounded-full animate-spin w-5 h-5 sm:w-6 sm:h-6 " />
                    ) : (
                      <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer" />
                    )}
                  </button>
                </div>

                <button className="text-white hover:text-gray-200 transition-colors font-bold">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <div className="flex items-center border bg-white border-gray-300 rounded-full overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      const newValue = Math.max(
                        1,
                        (Number.parseInt(inputValue) || 1) - 1
                      );
                      setInputValue(newValue.toString());
                      setQuantity(newValue);
                    }}
                    disabled={isAddingToCart}
                    className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    -
                  </button>

                  <input
                    type="number"
                    value={inputValue}
                    onChange={handleQuantityChange}
                    onBlur={handleQuantityBlur}
                    min={1}
                    disabled={isAddingToCart}
                    className="w-12 text-center text-sm font-semibold focus:outline-non disabled:bg-gray-100
        [&::-webkit-outer-spin-button]:appearance-none 
        [&::-webkit-inner-spin-button]:appearance-none 
        [-moz-appearance:textfield]"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const newValue = (Number.parseInt(inputValue) || 0) + 1;
                      setInputValue(newValue.toString());
                      setQuantity(newValue);
                    }}
                    disabled={isAddingToCart}
                    className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-3 sm:px-4">
            <h3 className="font-semibold text-gray-800 leading-tight line-clamp-2 min-h-[1.5rem] text-sm ">
              {name}
            </h3>

            <div className="flex items-center gap-2 my-1">
              <div className="flex">{renderStars(rating)}</div>
              <span className="text-gray-500 text-xs ">
                ({rating.toFixed(2)})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-base text-[16px] ">
                {price.toFixed(2)} Rwf
              </span>
              {originalPrice && (
                <span className="text-gray-400 line-through text-[12px] ">
                  {originalPrice.toFixed(2)}Rwf
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

// Main Products Section Component
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  inStock: boolean;
  rating: number;
  isNew?: boolean;
  isFeatured?: boolean;
  discountPercent?: number;
}

interface Category {
  name: string;
  image: string;
  productCount?: number;
}

interface ProductsSectionProps {
  products: Product[];
  categories: Category[];
}

export function ProductsSection({
  products,
  categories,
}: ProductsSectionProps) {
  const { selectedCategory, setSelectedCategory } = useProductSection();
  const { user, isAuthenticated } = useAuth();
    const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems, totalQuantity, totalAmount, isLoading } = useCartSummary();
  

  const [searchQuery, setSearchQuery] = useState("");

  const getFilteredProducts = () => {
    let filtered = products;

    // Filter by category
    if (
      selectedCategory !== "All Categories" &&
      selectedCategory !== "ALL CATEGORIES"
    ) {
      filtered = filtered.filter(
        (product) =>
          product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  // Filter out categories with no products
  const categoriesWithProducts = categories.filter((category) => {
    const categoryProducts = products.filter(
      (product) =>
        product.category.toLowerCase() === category.name.toLowerCase()
    );
    return categoryProducts.length > 0;
  });

  const allCategoriesCount = products.length;

  // Only show categories that have products, plus "All Categories" if there are any products
  const categoriesWithAll =
    allCategoriesCount > 0
      ? [
          {
            name: "All Categories",
            image: "",
            productCount: allCategoriesCount,
          },
          ...categoriesWithProducts,
        ]
      : [];

  const filteredProducts = getFilteredProducts();
  const userName = user?.name;

  useEffect(() => {
    if (filteredProducts.length === 0 && categoriesWithAll.length > 0) {
      setSelectedCategory("All Categories");
    }
  }, [filteredProducts.length, categoriesWithAll.length, setSelectedCategory]);

  if (products.length === 0) {
    return null;
  }

  return (
    <section
      id="products"
      className="flex justify-center items-start  border py-0"
    >
      <div className="container">
        <div className="flex gap-0 relative">
          <div className="  w-full">
            {isAuthenticated && user && (
              <div className="flex items-center justify-center bg-gray-100 py-4 sm:py-6 border-b border-gray-100">
                <div className=" flex items-center justify-between gap-4">
                  <div className=" flex flex-col justify-center px-6">
                    <div className=" flex flex-col justify-center">
                      <h1 className="text-[16px] font-semibold text-gray-800 mb-1">
                        Hello <span className="text-green-600">{userName}</span>
                        !
                      </h1>
                      <p className="text-gray-500 text-[13px]">
                        Welcome to Our Farm
                      </p>
                    </div>
                    {/* <div className="relative w-full max-w-md">
                    <input
                      type="text"
                      placeholder="Search for fresh products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 pr-12 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    />
                    <button className="absolute right-0 top-0 h-full px-4 bg-green-600 text-white  hover:bg-green-700 transition-colors duration-200">
                      <Search className="w-5 h-5" />
                    </button>
                  </div> */}
                  </div>
                  {/* Benefits & Subscribe Card - Dark Style */}
                  <div className="bg-gray-200 rounded-full px-6 py-3 shadow-lg min-w-[400px] flex items-center justify-between">
                    {/* Left: Profile Images */}
                    <div className="flex items-center -space-x-6">
                      <div className="w-10 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
                        <Image
                          src="/imgs/restaurant1.jpg"
                          width={20}
                          height={20}
                          alt="avatar"
                          className="rounded-full w-8 h-10 "
                        />
                      </div>
                      <div className="w-10 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
                        <Image
                          src="/imgs/restaurant1.jpg"
                          width={20}
                          height={20}
                          alt="avatar"
                          className="rounded-full w-8 h-10 "
                        />
                      </div>
                      <div className="w-10 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-full border-2 border-gray-800 flex items-center justify-center">
                        <Image
                          src="/imgs/restaurant1.jpg"
                          width={20}
                          height={20}
                          alt="avatar"
                          className="rounded-full w-8 h-10 "
                        />
                      </div>
                    </div>

                    {/* Center: Advantages Text */}
                    <div className=" px-4">
                      <span className="text-gray-900 text-[13px]">
                        🗸 IBM Orders 🗸 Stable Pricing 🗸 Adversiment
                      </span>
                    </div>

                    {/* Right: Subscribe Button */}
                    <Link href="/restaurant/subscribe">
                      <button className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-6 py-2 rounded-full text-sm font-bold hover:from-yellow-300 hover:to-orange-300 transition-all duration-200 shadow-md transform hover:scale-105">
                        Subscribe
                      </button>
                    </Link>
                  </div>

                  {/* Cart Section */}
                  <div className="flex items-center gap-3 bg-white rounded p-3 border border-gray-200 shadow">
                    <div className="flex items-center gap-3">
                      <div className="relative cursor-pointer">
                        <Heart className="w-6 h-6 text-gray-900 hover:text-green-600  transition-colors" />
                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ">
                          0
                        </span>
                      </div>
                      <div className="relative">
                        <div
                          onClick={() => setIsCartOpen(true)}
                          className="cursor-pointer"
                        >
                          <ShoppingCart className="h-6 w-6 text-gray-900 hover:text-green-600 cursor-pointer transition-colors " />
                          {isLoading ? (
                            <Skeleton className="absolute -top-2 -right-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-green-600/60" />
                          ) : (
                            totalQuantity > 0 && (
                              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ">
                                {totalItems > 99 ? "99+" : totalItems}
                              </span>
                            )
                          )}
                        </div>

                        <CartDrawer
                          isOpen={isCartOpen}
                          onClose={() => setIsCartOpen(false)}
                        />
                      </div>
                    </div>
                    <div className="border-l border-gray-200 pl-3">
                      <div className="text-[13px] font-medium text-gray-900">
                        Cart Total
                      </div>
                      <div className="text-[15px] font-bold text-gray-900">
                        {totalAmount}{" "}
                        <span className="text-[13px] font-normal">Rwf</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Header with Category Information */}
            <div className="bg-transparent px-4 sm:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <h1 className="text-[18px] px-0 py-4 font-semibold text-gray-900">
                      {selectedCategory === "All Categories"
                        ? "All Products"
                        : selectedCategory.replace(/_/g, " ")}
                    </h1>
                  </div>
                </div>
              </div>
            </div>
            {/* Products Grid */}
            <div className="px-4 sm:px-6 overflow-y-auto">
              <div className="mb-12">
                {filteredProducts.length > 0 ? (
                  <div className="grid gap-4 justify-items-center grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        originalPrice={product.originalPrice}
                        image={product.image}
                        rating={product.rating}
                        category={product.category}
                        discountPercent={product.discountPercent}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="text-gray-400 mb-4">
                      <svg
                        className="w-16 h-16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8h.01M6 4h.01"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No products found
                    </h3>
                    <p className="text-gray-500 text-center max-w-md">
                      {searchQuery
                        ? `No products found matching "${searchQuery}".`
                        : selectedCategory === "All Categories"
                        ? "There are no products available at the moment."
                        : `No products found in the "${selectedCategory.replace(
                            /_/g,
                            " "
                          )}" category.`}
                    </p>
                    {searchQuery && (
                      <Button
                        onClick={() => setSearchQuery("")}
                        variant="outline"
                        className="mt-4"
                      >
                        Clear Search
                      </Button>
                    )}
                    {selectedCategory !== "All Categories" && !searchQuery && (
                      <button
                        onClick={() => setSelectedCategory("All Categories")}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        View All Products
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
