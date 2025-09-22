/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Check,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/auth-context";
import { useCart } from "@/app/contexts/cart-context";
import { useProductSection } from "@/hooks/useProductSection";
import CartDrawer from "./cartDrawer";

// Category List Component
interface CategoryListProps {
  categories: Array<{
    name: string;
    image: string;
    productCount?: number;
  }>;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

function CategoryList({
  categories,
  selectedCategory,
  onCategorySelect,
  isOpen = true,
  onClose,
  isMobile = false,
}: CategoryListProps) {
  const handleCategorySelect = (category: string) => {
    onCategorySelect(category);
    if (isMobile && onClose) {
      onClose();
    }
  };

  if (isMobile) {
    return (
      <div
        className={`fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:hidden`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Sidebar */}
        <div className="relative w-[220px] lg:w-[280px] h-full bg-white border-r border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category List */}
          <div className="p-4 overflow-y-auto h-full pb-20">
            <ul className="space-y-2">
              {categories.map((category, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleCategorySelect(category.name)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                      selectedCategory === category.name
                        ? " text-green-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="font-medium">
                      {category.name.replace(/_/g, " ")}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <div
      className={`hidden lg:block bg-white border-r border-gray-200 h-full transition-all duration-300 ${
        isOpen ? "w-[150px] min-w-[180px]" : "w-0 min-w-0 overflow-hidden"
      }`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-2sm font-bold text-gray-900 whitespace-nowrap">
          Categories
        </h2>
      </div>

      {/* Category List */}
      <div className="p-4 overflow-y-auto h-full">
        <ul className="space-y-2">
          {categories.map((category, index) => (
            <li key={index}>
              <button
                onClick={() => onCategorySelect(category.name)}
                className={`w-full text-xs text-left px-4 py-3  transition-all duration-200 flex items-center justify-between group ${
                  selectedCategory === category.name
                    ? " text-green-700 "
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 "
                }`}
              >
                <span className="font-medium whitespace-nowrap">
                  {category.name.replace(/_/g, " ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Product Card Component
interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  category?: string;
  discountPercent?: number;
  isExpanded?: boolean;
}

// ProductCard component with original sizing maintained
function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  category,
  discountPercent,
  isExpanded = false,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { addToCart, cartItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Check if product is already in cart
  const isInCart = cartItems.some((item) => item.productId === id);

  const handleCartClick = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setIsModalOpen(true);
      return;
    }

    if (isInCart) {
      router.push("/cart");
      return;
    }

    setIsAddingToCart(true);
    try {
      const success = await addToCart(id, 1);
      if (success) {
        console.log("Product added to cart successfully");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  }, [isAuthenticated, user, isInCart, addToCart, id, router]);

  // Handle pending cart products after login - but only once per session
  useEffect(() => {
    let hasHandledPending = false;

    const handleLoginSuccess = () => {
      if (hasHandledPending) return;

      // Wait a bit for auth state to update, then check for pending products
      setTimeout(() => {
        if (isAuthenticated && user) {
          const pendingProduct = localStorage.getItem("pendingCartProduct");
          if (pendingProduct) {
            try {
              const productData = JSON.parse(pendingProduct);
              if (productData.id === id) {
                localStorage.removeItem("pendingCartProduct");
                hasHandledPending = true;
                // Add a small delay to ensure all state is updated
                setTimeout(() => {
                  handleCartClick();
                }, 200);
              }
            } catch (error) {
              console.error("Error parsing pending product:", error);
              localStorage.removeItem("pendingCartProduct");
            }
          }
        }
      }, 300);
    };

    // Only add listener if we haven't handled pending product yet
    if (!hasHandledPending) {
      window.addEventListener("loginSuccess", handleLoginSuccess);
    }

    return () => {
      window.removeEventListener("loginSuccess", handleLoginSuccess);
    };
  }, [isAuthenticated, user, id, handleCartClick]);

  // Clean up URL params after login redirect - but only once
  useEffect(() => {
    let hasCleanedUrl = false;

    if (isAuthenticated && user && !hasCleanedUrl) {
      const urlParams = new URLSearchParams(window.location.search);
      if (
        urlParams.get("showLogin") === "true" &&
        urlParams.get("reason") === "add_to_cart"
      ) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("showLogin");
        newUrl.searchParams.delete("reason");
        window.history.replaceState({}, "", newUrl.toString());
        hasCleanedUrl = true;
      }
    }
  }, [isAuthenticated, user]);

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

  const handleCustomerLogin = () => {
    setIsModalOpen(false);
    localStorage.setItem(
      "pendingCartProduct",
      JSON.stringify({
        id,
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
        className={`w-full bg-white transition-all duration-300 ${
          isExpanded
            ? "max-w-[280px] sm:max-w-[320px]"
            : "max-w-[200px] sm:max-w-[220px]"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card className="border border-green-700 shadow-md hover:rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg p-0 pb-2 h-full">
          {/* Product Image Container */}
          <div
            className={`relative w-full bg-gray-50 flex items-center justify-center group overflow-hidden ${
              isExpanded ? "h-[220px] sm:h-[260px]" : "h-[160px] sm:h-[180px]"
            }`}
          >
            <Image
              src={image || "/placeholder.svg"}
              alt={name}
              width={isExpanded ? 280 : 200}
              height={isExpanded ? 280 : 200}
              className="object-contain w-full max-h-full transition-transform duration-300 group-hover:scale-105"
            />

            {/* Discount Badge */}
            {discountPercent && (
              <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                {discountPercent}% OFF
              </div>
            )}

            {/* In Cart Badge */}
            <CartDrawer
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
            />
            {isInCart && (
              <div
                className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center cursor-pointer"
                onClick={() => setIsCartOpen(true)}
              >
                <Check className="w-3 h-3 mr-1" /> View Cart
              </div>
            )}

            {/* Action Buttons */}
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <div
                className={"bg-green-500 rounded-full flex items-center justify-center shadow-lg p-1 sm:p-2 space-x-6 sm:space-x-8 "}
              >
                {/* Quick View */}
                <button className="text-white hover:text-gray-200 transition-colors font-bold">
                  <Eye
                    className={`${
                      isExpanded
                        ? "w-5 h-5"
                        : "w-5 h-5 sm:w-6 sm:h-6 cursor-pointer"
                    }`}
                  />
                </button>

                {/* Add to Cart */}
                <button
                  onClick={handleCartClick}
                  disabled={isAddingToCart || isInCart}
                  className={`text-white hover:text-gray-200 transition-colors font-bold ${
                    isAddingToCart ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isAddingToCart ? (
                    <div
                      className={`border-2 border-white border-t-transparent rounded-full animate-spin ${
                        isExpanded
                          ? "w-5 h-5"
                          : "w-5 h-5 sm:w-6 sm:h-6 cursor-pointer"
                      }`}
                    />
                  ) : (
                    <ShoppingCart
                      className={`${
                        isExpanded
                          ? "w-5 h-5"
                          : "w-5 h-5 sm:w-6 sm:h-6 cursor-pointer"
                      }`}
                    />
                  )}
                </button>

                {/* Add to Wishlist */}
                <button className="text-white hover:text-gray-200 transition-colors font-bold">
                  <Heart
                    className={`${
                      isExpanded
                        ? "w-5 h-5"
                        : "w-5 h-5 sm:w-6 sm:h-6 cursor-pointer"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div
            className={`${isExpanded ? "px-4 sm:px-6 py-2" : "px-3 sm:px-4"}`}
          >
            {/* Product Name */}
            <h3
              className={`font-semibold text-gray-800 leading-tight line-clamp-2 min-h-[1.5rem] ${
                isExpanded ? "text-base sm:text-lg" : "text-sm"
              }`}
            >
              {name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2 my-1">
              <div className="flex">{renderStars(rating)}</div>
              <span
                className={`text-gray-500 ${
                  isExpanded ? "text-sm" : "text-xs"
                }`}
              >
                ({rating.toFixed(2)})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span
                className={`font-bold text-gray-900 ${
                  isExpanded ? "text-lg sm:text-xl" : "text-base sm:text-lg"
                }`}
              >
                {price.toFixed(2)} Rwf
              </span>
              {originalPrice && (
                <span
                  className={`text-gray-400 line-through ${
                    isExpanded ? "text-base" : "text-sm"
                  }`}
                >
                  {originalPrice.toFixed(2)}Rwf
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Login Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md w-[95vw] max-w-[95vw] mx-auto">
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
  const {
    selectedCategory,
    setSelectedCategory,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isDesktopCategoriesOpen,
    isCardExpanded,
    handleDesktopToggle,
  } = useProductSection();
  const { user, isAuthenticated } = useAuth();

  const getFilteredProducts = () => {
    if (
      selectedCategory === "All Categories" ||
      selectedCategory === "ALL CATEGORIES"
    ) {
      return products;
    }
    return products.filter(
      (product) =>
        product.category.toLowerCase() === selectedCategory.toLowerCase()
    );
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

  if (products.length === 0) {
    return null;
  }
  React.useEffect(() => {
    if (filteredProducts.length === 0 && categoriesWithAll.length > 0) {
      setSelectedCategory("All Categories");
    }
  }, [filteredProducts.length, categoriesWithAll.length, setSelectedCategory]);

  return (
    <section
      id="products"
      className="flex justify-center items-start bg-gray-50 border py-0"
    >
      <div className="container">
        <div className="flex gap-0 relative">
          {/* Desktop Category List */}
          <CategoryList
            categories={categoriesWithAll}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            isOpen={isDesktopCategoriesOpen}
          />

          {/* Mobile Category Menu */}
          <CategoryList
            categories={categoriesWithAll}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            isMobile={true}
          />

          {/* Products Area */}
          <div className="flex-1 bg-gray-50">
            {/* Header with Mobile Menu Toggle */}
            <div className="bg-transparent px-4 sm:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center gap-3">
                  {/* Mobile Menu Toggle */}
                  <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  {/* Desktop Toggle Button */}
                  <button
                    onClick={handleDesktopToggle}
                    className="hidden lg:flex pt-1 hover:bg-gray-100"
                    style={{
                      left: isDesktopCategoriesOpen ? "200px" : "0px",
                      transition: "left 0.3s ease-in-out",
                    }}
                  >
                    {isDesktopCategoriesOpen ? (
                      <ChevronLeft className="w-8 h-8 text-gray-900" />
                    ) : (
                      <ChevronRight className="w-8 h-8 text-gray-900" />
                    )}
                  </button>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <h1 className="text-2sm px-0 py-4 font-semibold text-gray-900">
                      {selectedCategory === "All Categories"
                        ? "All Products"
                        : selectedCategory.replace(/_/g, " ")}
                    </h1>
                    {isAuthenticated && user && (
                      <h2 className="text-xs text-center">
                        Hello{" "}
                        <span className="font-bold text-green-500">
                          {userName}
                        </span>
                        , Welcome to Our Farm!
                      </h2>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="px-4 sm:px-6 overflow-y-auto">
              <div className="mb-12">
                <div
                  className={`grid gap-4 justify-items-center ${
                    isCardExpanded
                      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                  }`}
                >
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
                      isExpanded={isCardExpanded}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
