/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import type React from "react";
import { useState, useCallback, useMemo, useEffect, memo } from "react";
import { Card } from "@/components/ui/card";
import CartDrawer from "@/components/cartDrawer";
import { useCartSummary } from "@/app/contexts/cart-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/OptimizedImage";
import {
  Star,
  Heart,
  ShoppingCart,
  // Eye,
  Check,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/app/contexts/auth-context";
import { useCart } from "@/app/contexts/cart-context";
import { useProductSection } from "@/hooks/useProductSection";
import { productService } from "@/app/services/productService";
import { ChristmasAnimation } from "@/components/ChristmasAnimation";
import Link from "next/link";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;           // Final price to show (discounted or regular)
  originalPrice?: number;  // For strikethrough
  image: string;
  rating: number;
  discountPercent?: number;
  unit?: string;
  category?: string;
  productData?: Product;
}

const ProductCard = memo(function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  discountPercent,
  unit,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [inputValue, setInputValue] = useState("1");
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { addToCart, cartItems, updateCartItem } = useCart();
  const cartItem = cartItems.find((item) => item.productId === id);
  const isInCart = !!cartItem;
  const cartQuantity = cartItem?.quantity || 0;
  const isUpdateDisabled = isInCart && quantity === cartQuantity;

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setInputValue(value);
      const numValue = Number.parseFloat(value) || 1;
      if (numValue > 0) {
        setQuantity(numValue);
      }
    }
  };

  const handleQuantityBlur = () => {
    const numValue = Number.parseFloat(inputValue) || 1;
    const finalValue = Math.max(0.1, numValue);
    setQuantity(finalValue);
    setInputValue(finalValue.toString());
  };

  const handleCartAction = useCallback(async () => {
    setIsAddingToCart(true);
    try {
      if (isInCart && cartItem) {
        await updateCartItem(cartItem.id, quantity);
      } else {
        await addToCart(id, quantity);
      }
    } catch (error) {
      console.error("Cart error:", error);
    } finally {
      setIsAddingToCart(false);
    }
  }, [isInCart, cartItem, quantity, addToCart, updateCartItem, id]);

  const handleWishlist = () => {
    setIsWishlisted(true);
    setTimeout(() => setIsWishlisted(false), 2000);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <div
      className="w-full bg-white transition-all duration-300 max-w-[200px] sm:max-w-[220px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="border border-gray-200 shadow hover:shadow-lg rounded-md hover:rounded hover:border-green-500 overflow-hidden transition-all duration-300 p-0 pb-2 h-full">
        <div className="relative w-full flex items-center justify-center group overflow-hidden h-40 sm:h-[180px]">
          <OptimizedImage
            src={image || "/placeholder.svg"}
            alt={name}
            width={200}
            height={200}
            className="object-contain w-full max-h-full transition-transform duration-300 group-hover:scale-105"
            transformation={[{ width: 400, height: 400, crop: "pad", quality: "80" }]}
          />

          {discountPercent ? (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {discountPercent}% OFF
            </div>
          ) : null}

          {isInCart && (
            <a href="/restaurant/checkout" className="absolute inset-0">
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-lg flex items-center cursor-pointer hover:bg-green-600 transition-colors">
                <Check className="w-3 h-3 mr-1" /> Buy Now
              </div>
            </a>
          )}

          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
              isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div className="bg-green-500 flex items-center justify-center shadow-lg px-8 p-1 space-x-6 sm:space-x-8 rounded-full">
              <button
                onClick={handleCartAction}
                disabled={isAddingToCart || isUpdateDisabled}
                className={`text-white hover:text-gray-200 transition-colors font-bold ${
                  isAddingToCart || isUpdateDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isAddingToCart ? (
                  <div className="border-2 border-white border-t-transparent rounded-full animate-spin w-6 h-6" />
                ) : (
                  <ShoppingCart className="w-6 h-6" />
                )}
              </button>
              <button onClick={handleWishlist} className="text-white hover:text-gray-200">
                <Heart
                  className={`w-6 h-6 transition-all ${isWishlisted ? "fill-orange-500 text-orange-500 scale-110" : ""}`}
                />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 pt-3">
              <div className="flex items Benin border bg-white border-gray-300 rounded-full overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    const newValue = Math.max(
                      1,
                      (Number.parseFloat(inputValue) || 1) - 1
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
                  step="0.01"
                  min="0.1"
                  disabled={isAddingToCart}
                  className="w-12 text-center text-sm font-semibold focus:outline-none disabled:bg-gray-100 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newValue = (Number.parseFloat(inputValue) || 0) + 1;
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

        <div className="px-3 sm:px-4 pt-2">
          <h3 className="font-semibold text-gray-800 leading-tight line-clamp-2 min-h-6 text-sm">
            {name}
          </h3>
          <div className="flex items-center gap-2 my-1">
            <div className="flex">{renderStars(rating || 0)}</div>
            <span className="text-gray-500 text-xs">({(rating || 0).toFixed(1)})</span>
          </div>
          <div className="flex items-center gap-2">
            {originalPrice ? (
              <span className="font-bold text-green-500 text-base">
                {(price || 0).toLocaleString()}/
                <span className="text-gray-500 line-through text-base ml-2">
                {(originalPrice || 0).toLocaleString()}
                </span>
                {unit && <span className="text-sm font-md text-gray-900"> Rwf/{unit}</span>}
                
              </span>
            ) : (
              <span className="font-bold text-gray-900 text-base">
                {(price || 0).toLocaleString()} Rwf
                {unit && <span className="text-sm font-normal text-gray-600">/{unit}</span>}
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
});

// Main Products Section Component
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: {
    id: string;
    name: string;
    description?: string;
  }
  inStock: boolean;
  rating: number;
  isNew?: boolean;
  isFeatured?: boolean;
  discountPercent?: number;
  createdAt: string;
  unit?: string;
  discountedPrice: number | null;
  bonus: number;
}

interface Category {
  id?: string;
  name: string;
  image: string;
  productCount?: number;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalProducts?: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

interface SearchProps {
  query: string;
  onSearch: (query: string) => void;
}

interface SortingProps {
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

interface ProductsSectionProps {
  products: Product[];
  categories: Category[];
  onCategorySelect?: (categoryName: string, discountedProducts?: any[]) => void;
  pagination?: PaginationProps;
  search?: SearchProps;
  sorting?: SortingProps;
}

export function ProductsSection({
  products,
  categories,
  onCategorySelect,
  pagination,
  search,
  sorting,
}: ProductsSectionProps) {
  const { selectedCategory, setSelectedCategory } = useProductSection();
  const { user, isAuthenticated } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showDiscounted, setShowDiscounted] = useState(false);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const { totalItems, totalQuantity, totalAmount, isLoading } = useCartSummary();


  const searchQuery = search?.query || "";
  const setSearchQuery = search?.onSearch || (() => { });
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Debounce search to avoid API calls on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        setSearchQuery(localSearchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchQuery, searchQuery, setSearchQuery]);

  // Update local search when external search changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

 const sortedProducts = useMemo(() => {
  // Use discounted products if available, otherwise use regular products
  const productsToSort = showDiscounted && discountedProducts.length > 0 ? discountedProducts : products;
  
  // Sorting logic
  if (!sorting?.sortBy || sorting.sortBy === "random") return productsToSort;

  return [...productsToSort].sort((a, b) => {
    switch (sorting.sortBy) {
      case "price_asc":
        return a.price - b.price;
      case "price_desc":
        return b.price - a.price;
      case "name_asc":
        return a.name.localeCompare(b.name);
      case "name_desc":
        return b.name.localeCompare(a.name);
      case "newest":
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });
}, [products, discountedProducts, showDiscounted, sorting?.sortBy]);


  // Show all categories (backend handles filtering)
  const categoriesWithAll = [
    {
      name: "All Categories",
      image: "",
    },
    ...categories,
  ];
  const userName = user?.name;

  return (
    <section
      id="products"
      className="flex justify-center items-start  border py-0 relative"
    >
      <ChristmasAnimation />
      <div className="container">
        <div className="flex gap-0 relative">
          <div className="  w-full">
            {isAuthenticated && user && (
              <div className="flex items-center justify-center bg-gray-100 py-4 sm:py-6 px-10 border-b border-gray-100">
                <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-4 w-full px-4">
                  {/* Left: Greeting */}
                  <div className="flex flex-col justify-center text-center lg:text-left">
                    <h1 className="text-[20px] font-semibold text-gray-800 mb-1">
                      Hello <span className="text-green-600">{userName}</span>!
                    </h1>
                    <p className="text-gray-500 text-[16px]">
                      Welcome to Our Farm
                    </p>
                  </div>

                  {/* Middle: Benefits & Subscribe */}
                  <div className="bg-gray-200 md:rounded-full rounded-md px-4 sm:px-6 py-3 shadow-lg w-full lg:w-auto flex flex-col md:flex-row sm:flex-row items-center justify-between gap-3">
                    {/* Profile Images */}
                    <div className="flex items-center -space-x-6">
                      {[
                        "/imgs/restaurant1.jpg",
                        "/imgs/restaurant1.jpg",
                        "/imgs/restaurant1.jpg",
                        "/imgs/restaurant1.jpg",
                      ].map((src, i) => (
                        <div
                          key={i}
                          className="w-10 h-10 bg-linear-to-br from-orange-400 to-red-500 rounded-full border-2 border-gray-800 flex items-center justify-center overflow-hidden"
                        >
                          <OptimizedImage
                            src={src}
                            width={32}
                            height={32}
                            alt="avatar"
                            className="rounded-full w-full h-full object-cover"
                            transformation={[
                              { width: 64, height: 64, crop: "fill", quality: "80" }
                            ]}
                          />
                        </div>
                      ))}{" "}
                      <p className="ml-7 text-[18px] text-green-500 font-bold">
                        {" "}
                        + 20
                      </p>
                    </div>

                    {/* Advantages Text */}
                    <div className=" flex flex-col text-start sm:text-left text-gray-900 text-[13px]">
                      <span>🗸 Free Delivery</span>
                      <span>🗸 EBM Orders</span>
                      <span>🗸 Advertisement</span>
                      <span className="">🗸 ... more</span>
                    </div>

                    {/* Subscribe Button */}
                    <Link href="/restaurant/subscribe" className="shrink-0">
                      <button className="bg-linear-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 sm:px-6 py-2 rounded-full text-sm font-bold hover:from-yellow-300 hover:to-orange-300 transition-all duration-200 shadow-md transform hover:scale-105">
                        Subscribe
                      </button>
                    </Link>
                  </div>

                  {/* Right: Cart Section */}
                  <div className="flex items-center gap-3 bg-white rounded p-3 border border-gray-200 shadow w-full sm:w-auto">
                    <div className="flex items-center gap-3">
                      {/* Wishlist */}
                      <div className="relative cursor-pointer">
                        <Heart className="w-6 h-6 text-gray-900 hover:text-green-600 transition-colors" />
                        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          0
                        </span>
                      </div>

                      {/* Cart */}
                      <div className="relative">
                        <div
                          onClick={() => setIsCartOpen(true)}
                          className="cursor-pointer"
                        >
                          <ShoppingCart className="h-6 w-6 text-gray-900 hover:text-green-600 transition-colors" />
                          {isLoading ? (
                            <Skeleton className="absolute -top-2 -right-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-green-600/60" />
                          ) : (
                            totalQuantity >= 0 && (
                              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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

                    {/* Cart Total */}
                    <div className="border-l border-gray-200 pl-3 text-center sm:text-left">
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

            <div className="bg-transparent ">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
                {/* Category Filter Buttons */}
                <div className="px-4 sm:px-8 pb-4">
                  <div className="flex flex-wrap gap-2">
                    {categoriesWithAll.map((category) => {
                      const isSelected = selectedCategory === category.name && !showDiscounted;
                      return (
                        <button
                          key={category.name}
                          onClick={() => {
                            setSelectedCategory(category.name);
                            setShowDiscounted(false);
                            onCategorySelect?.(category.name);
                          }}
                          className={`px-4 py-[3px] rounded-full text-[13px] font-medium transition-all ${isSelected
                            ? "bg-green-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                            }`}
                        >
                          {category.name === "All Categories"
                            ? `All`
                            : `${category.name.replace(/_/g, " ")}`}
                        </button>
                      );
                    })}

                    <button 
                      onClick={async () => {
                        setShowDiscounted(!showDiscounted);
                        setSelectedCategory("All Categories");
                        if (!showDiscounted) {
                          try {
                            console.log('Fetching discounted products...');
                            const data = await productService.getDiscountedProducts();
                            console.log('Discounted products response:', data);
                            const transformedProducts = data.data.map((product: any) => ({
                              id: product.id,
                              name: product.productName,
                              price: product.discountedPrice,
                              originalPrice: product.unitPrice,
                              image: product.images[0] || '/placeholder.svg',
                              category: product.category,
                              inStock: product.quantity > 0,
                              rating: 4.5,
                              discountPercent: product.bonus,
                              createdAt: new Date().toISOString(),
                              unit: product.unit,
                              discountedPrice: product.discountedPrice,
                              bonus: product.bonus
                            }));
                            console.log('Transformed products:', transformedProducts);
                            setDiscountedProducts(transformedProducts);
                          } catch (error) {
                            console.error('Failed to fetch discounted products:', error);
                          }
                        } else {
                          setDiscountedProducts([]);
                        }
                      }}
                      className={`px-4 py-[3px] rounded-full text-[13px] font-medium transition-all ${showDiscounted
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                        }`}
                    >
                      Discounted
                    </button>

                  </div>

                </div>


                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {/* Search Input */}
                  {search && (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search by name or price"
                        value={localSearchQuery}
                        onChange={(e) => setLocalSearchQuery(e.target.value)}
                        className="w-40 px-4 py-2 placeholder:text-[12px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                      />
                    </div>
                  )}

                  {sorting && (
                    <div className="w-1/2 sm:w-auto">
                      <Select
                        value={sorting.sortBy}
                        onValueChange={(value) => sorting.onSortChange(value)}
                      >
                        <SelectTrigger
                          className="
                                w-40
                                border border-gray-300 
                                focus:ring-2 focus:ring-green-500 focus:border-green-500
                                rounded-lg text-[12px] sm:text-[13px]
                                bg-white
                              "
                        >
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="random">Random Order</SelectItem>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="price_asc">Low to High</SelectItem>
                          <SelectItem value="price_desc">
                            High to Low
                          </SelectItem>
                          <SelectItem value="name_asc">A to Z</SelectItem>
                          <SelectItem value="name_desc">Z to A</SelectItem>
                          <SelectItem value="rating">Top Rated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="px-4 sm:px-6 overflow-y-auto">
              <div className="mb-12">
                {sortedProducts.length > 0 ? (
                  <div className="grid gap-4 justify-items-center grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                    {sortedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        originalPrice={product.originalPrice}
                        image={product.image}
                        rating={product.rating}
                        category={product.category.name}
                        discountPercent={product.discountPercent}
                        unit={product.unit}
                        productData={product}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <h3 className="text-[14px] font-medium text-gray-900 mb-2">
                      No products found
                    </h3>
                    <p className="text-gray-800 text-[13px] text-center max-w-md">
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
                        onClick={() => {
                          setSearchQuery("");
                          setLocalSearchQuery("");
                        }}
                        variant="outline"
                        className="mt-4"
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-8 ">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          pagination.onPageChange(pagination.currentPage - 1)
                        }
                        disabled={
                          pagination.currentPage === 1 || pagination.isLoading
                        }
                        className={`p-1 rounded ${pagination.currentPage === 1 || pagination.isLoading
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-900 hover:bg-gray-100"
                          }`}
                        title="Previous Page"
                      >
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>

                      {/* Page Numbers */}
                      {Array.from(
                        { length: Math.min(pagination.totalPages, 5) },
                        (_, i) => {
                          let pageNumber;
                          if (pagination.totalPages <= 5) {
                            pageNumber = i + 1;
                          } else {
                            const current = pagination.currentPage;
                            const total = pagination.totalPages;

                            if (current <= 3) {
                              pageNumber = i + 1;
                            } else if (current >= total - 2) {
                              pageNumber = total - 4 + i;
                            } else {
                              pageNumber = current - 2 + i;
                            }
                          }

                          return (
                            <button
                              key={pageNumber}
                              onClick={() =>
                                pagination.onPageChange(pageNumber)
                              }
                              disabled={pagination.isLoading}
                              className={`px-3 py-1 rounded text-sm ${pageNumber === pagination.currentPage
                                ? "bg-green-700 hover:bg-green-800 text-white"
                                : "bg-white hover:bg-gray-100 text-gray-900 border border-gray-300"
                                }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        }
                      )}

                      {/* Next Page Button */}
                      <button
                        onClick={() =>
                          pagination.onPageChange(pagination.currentPage + 1)
                        }
                        disabled={
                          pagination.currentPage === pagination.totalPages ||
                          pagination.isLoading
                        }
                        className={`p-1 rounded ${pagination.currentPage === pagination.totalPages ||
                          pagination.isLoading
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-900 hover:bg-gray-100"
                          }`}
                        title="Next Page"
                      >
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
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
