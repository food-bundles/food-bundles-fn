/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import type React from "react";
import { useState, useCallback, useMemo, useEffect, useRef, memo } from "react";
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
  Gift,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/app/contexts/auth-context";
import { useCart } from "@/app/contexts/cart-context";
import { useProductSection } from "@/hooks/useProductSection";
import { productService } from "@/app/services/productService";
import { wishlistService } from "@/app/services/wishlistService";
import { toast } from "sonner";
import RestaurantAvailablePromos from "@/app/(private)/restaurant/_components/RestaurantAvailablePromos";
// import { ChristmasAnimation } from "@/components/ChristmasAnimation";
import RestaurantCardsShowcase from "@/components/restaurant-cards-showcase";
import { motion, useReducedMotion } from "motion/react";

// Helper function to get role-based price from customerTypePrices
const getRoleBasedPrice = (product: any, userRole: string, customerTypeId?: string | null) => {
  const customerTypePrices = product.customerTypePrices || [];
  // An explicitly assigned customer type wins over the role-based default
  if (customerTypeId) {
    const assigned = customerTypePrices.find(
      (ctp: any) => ctp.customerType?.id === customerTypeId
    );
    return assigned ? assigned.price : product.unitPrice || 0;
  }
  if (customerTypePrices.length > 0) {
    const roleToCustomerType: Record<string, string> = {
      HOTEL: "Hotel",
      RESTAURANT: "Restaurant",
      AFFILIATOR: "Restaurant",
    };
    const targetName = roleToCustomerType[userRole];
    if (targetName) {
      const match = customerTypePrices.find(
        (ctp: any) => ctp.customerType?.name?.toLowerCase() === targetName.toLowerCase()
      );
      if (match) return match.price;
    }
  }
  return product.unitPrice || 0;
};

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
  userRole?: string;
  customerTypeId?: string | null;
  // Wishlist (saved products) — state lives in ProductsSection
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

const ProductCard = memo(function ProductCard({
  id,
  name,
  price,
  image,
  rating,
  discountPercent,
  unit,
  productData,
  userRole,
  customerTypeId,
  isWishlisted = false,
  onToggleWishlist,
}: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [inputValue, setInputValue] = useState("1");

  const { addToCart, cartItems, updateCartItem, removeCartItem } = useCart();
  const [isRemoving, setIsRemoving] = useState(false);
  const cartItem = cartItems.find((item) => item.productId === id);
  const isInCart = !!cartItem;
  const cartQuantity = cartItem?.quantity || 0;
  const isUpdateDisabled = isInCart && quantity === cartQuantity;

  // Get role-based price with fallback
  const displayPrice = productData ? getRoleBasedPrice(productData, userRole || 'RESTAURANT', customerTypeId) : (price || 0);
  const safeDisplayPrice = typeof displayPrice === 'number' && displayPrice > 0 ? displayPrice : (price || 0);

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

  // Auto-sync cart when quantity changes:
  // - if item is already in cart, update its quantity automatically
  // - if item is not in cart yet, auto-add it once quantity is increased past 1
  //   (default qty 1 still waits for the cart icon click)
  const autoUpdateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUpdatingRef = useRef(false);

  // Reconcile local quantity from the cart on every change, unless an update is
  // in flight. This prevents the card and the drawer from pushing stale values
  // back and forth (the "shaking" total), and survives page refreshes.
  const prevCartQuantityRef = useRef(cartQuantity);
  useEffect(() => {
    const wasInCart = prevCartQuantityRef.current > 0;
    prevCartQuantityRef.current = cartQuantity;
    if (isUpdatingRef.current || isAddingToCart) return;
    if (cartQuantity > 0) {
      setQuantity(cartQuantity);
      setInputValue(cartQuantity.toString());
    } else if (wasInCart) {
      // The item left the cart (removed / cart cleared): reset to 1. Keeping the
      // old quantity (> 1) made the auto-add below put it straight back.
      if (autoUpdateTimerRef.current) clearTimeout(autoUpdateTimerRef.current);
      setQuantity(1);
      setInputValue("1");
    }
  }, [cartQuantity]);

  useEffect(() => {
    if (isAddingToCart || isUpdatingRef.current) return;

    if (isInCart && cartItem) {
      if (quantity === cartQuantity) return;

      if (autoUpdateTimerRef.current) clearTimeout(autoUpdateTimerRef.current);

      autoUpdateTimerRef.current = setTimeout(() => {
        isUpdatingRef.current = true;
        updateCartItem(cartItem.id, quantity).finally(() => {
          isUpdatingRef.current = false;
        });
      }, 400);
    } else {
      if (quantity <= 1) return;

      if (autoUpdateTimerRef.current) clearTimeout(autoUpdateTimerRef.current);

      autoUpdateTimerRef.current = setTimeout(() => {
        isUpdatingRef.current = true;
        addToCart(id, quantity).finally(() => {
          isUpdatingRef.current = false;
        });
      }, 400);
    }

    return () => {
      if (autoUpdateTimerRef.current) clearTimeout(autoUpdateTimerRef.current);
    };
  }, [quantity, isInCart, cartItem, cartQuantity, updateCartItem, addToCart, isAddingToCart, id]);

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

  const handleWishlist = () => onToggleWishlist?.(id);

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
    >
      <Card className="border border-gray-200 shadow hover:shadow-lg rounded-md hover:rounded hover:border-green-500 overflow-hidden transition-all duration-300 p-0 pb-2 h-full">
        <div className="relative w-full flex items-center justify-center group overflow-hidden h-40 sm:h-[180px]">
          <OptimizedImage
            src={image || "/placeholder.svg"}
            alt={name}
            width={200}
            height={200}
            className="object-contain w-full max-h-full transition-transform duration-300 group-hover:scale-105"
            transformation={[
              { width: 400, height: 400, crop: "pad", quality: "80" },
            ]}
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

        </div>

        <div className="px-3 sm:px-4 pt-2">
          <h3 className="font-semibold text-gray-800 leading-tight line-clamp-2 min-h-6 text-sm">
            {name}
          </h3>
          <div className="flex items-center gap-2 my-1">
            <div className="flex">{renderStars(rating || 0)}</div>
            <span className="text-gray-500 text-xs">
              ({(rating || 0).toFixed(1)})
            </span>
          </div>
          <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-base">
                {safeDisplayPrice.toLocaleString()} Rwf
                {unit && (
                  <span className="text-sm font-normal text-gray-600">
                    /{unit}
                  </span>
                )}
              </span>
          </div>
        </div>

        {/* Actions always visible (no hover needed) on every screen size */}
        <div className="flex items-center gap-1.5 px-2.5 sm:px-3 pt-2">
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
            className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full border transition-colors active:scale-95 ${
              isWishlisted
                ? "border-rose-200 bg-rose-50 text-rose-500"
                : "border-gray-200 bg-white text-gray-500"
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-500" : ""}`} />
          </button>

          <div className="flex items-center flex-1 min-w-0 h-8 border border-gray-200 rounded-full overflow-hidden bg-white">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => {
                const newValue = Math.max(1, (Number.parseFloat(inputValue) || 1) - 1);
                setInputValue(newValue.toString());
                setQuantity(newValue);
              }}
              disabled={isAddingToCart}
              className="w-7 h-full shrink-0 text-gray-700 bg-gray-50 active:bg-gray-200 disabled:opacity-50"
            >
              −
            </button>
            <input
              type="number"
              inputMode="decimal"
              aria-label="Quantity"
              value={inputValue}
              onChange={handleQuantityChange}
              onBlur={handleQuantityBlur}
              step="0.01"
              min="0.1"
              disabled={isAddingToCart}
              className="w-full min-w-0 text-center text-sm font-semibold focus:outline-none disabled:bg-gray-100 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => {
                const newValue = (Number.parseFloat(inputValue) || 0) + 1;
                setInputValue(newValue.toString());
                setQuantity(newValue);
              }}
              disabled={isAddingToCart}
              className="w-7 h-full shrink-0 text-gray-700 bg-gray-50 active:bg-gray-200 disabled:opacity-50"
            >
              +
            </button>
          </div>

          {isInCart && isUpdateDisabled ? (
            // Already in the cart with this quantity: offer to take it out
            <button
              type="button"
              onClick={async () => {
                if (!cartItem) return;
                setIsRemoving(true);
                await removeCartItem(cartItem.id);
                setIsRemoving(false);
              }}
              disabled={isRemoving}
              aria-label="Remove from cart"
              title="Remove from cart"
              className={`shrink-0 flex items-center justify-center w-10 h-8 rounded-lg border border-red-200 bg-red-50 text-red-600 transition-colors active:scale-95 ${
                isRemoving ? "opacity-50" : ""
              }`}
            >
              {isRemoving ? (
                <div className="border-2 border-red-500 border-t-transparent rounded-full animate-spin w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </button>
          ) : (
          <button
            type="button"
            onClick={handleCartAction}
            disabled={isAddingToCart || isUpdateDisabled}
            aria-label={isInCart ? "Update quantity in cart" : "Add to cart"}
            className={`shrink-0 flex items-center justify-center w-10 h-8 rounded-lg text-white transition-colors active:scale-95 ${
              isInCart ? "bg-green-700" : "bg-green-600"
            } ${isAddingToCart || isUpdateDisabled ? "opacity-50" : ""}`}
          >
            {isAddingToCart ? (
              <div className="border-2 border-white border-t-transparent rounded-full animate-spin w-4 h-4" />
            ) : (
              <span>Buy</span>
            )}
          </button>
          )}
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
  restaurantPrice?: number;
  hotelPrice?: number;
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
  itemsPerPage?: number;
  onItemsPerPageChange?: (limit: number) => void;
}

interface SearchProps {
  query: string;
  onSearch: (query: string) => void;
  isSearching?: boolean;
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
  const [isPromoSheetOpen, setIsPromoSheetOpen] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showDiscounted, setShowDiscounted] = useState(false);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [hasPromoCodes, setHasPromoCodes] = useState(false);
  const { totalItems, totalQuantity, totalAmount, isLoading } = useCartSummary();

  // ── Wishlist (saved products) ───────────────────────────────────────────
  // Only buyers have a wishlist; guests are asked to log in.
  const isBuyer =
    isAuthenticated && ["RESTAURANT", "HOTEL", "AFFILIATOR"].includes(user?.role || "");
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [wishlistRaw, setWishlistRaw] = useState<any[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  const loadWishlist = useCallback(async () => {
    try {
      const data = await wishlistService.getWishlist();
      setWishlistIds(new Set(data.productIds));
      setWishlistRaw(data.products);
    } catch (error) {
      console.error("Failed to load wishlist:", error);
    }
  }, []);

  useEffect(() => {
    if (isBuyer) loadWishlist();
    else {
      setWishlistIds(new Set());
      setWishlistRaw([]);
      setShowSaved(false);
    }
  }, [isBuyer, loadWishlist]);

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!isBuyer) {
        toast.info("Log in with your restaurant account to save products");
        return;
      }
      const wasSaved = wishlistIds.has(productId);
      // Update the heart right away; undo if the server says no
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(productId);
        else next.add(productId);
        return next;
      });
      try {
        if (wasSaved) await wishlistService.remove(productId);
        else await wishlistService.add(productId);
        toast.success(wasSaved ? "Removed from your wishlist" : "Saved to your wishlist");
        loadWishlist(); // keep the saved-products view in sync
      } catch (error: any) {
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(productId);
          else next.delete(productId);
          return next;
        });
        toast.error(error?.response?.data?.message || "Could not update your wishlist");
      }
    },
    [isBuyer, wishlistIds, loadWishlist]
  );

  // Saved products in the same shape the parent page gives the grid
  const savedProducts = useMemo<Product[]>(
    () =>
      wishlistRaw.map((product: any) => {
        const price = getRoleBasedPrice(product, user?.role || "RESTAURANT", user?.customerTypeId);
        return {
          id: product.id,
          name: product.productName,
          price,
          image: product.images?.[0] || "/placeholder.svg",
          category: {
            id: product.category?.id || "",
            name: product.category?.name || "OTHER",
            description: product.category?.description,
          },
          inStock: product.quantity > 0,
          rating: 4.5,
          createdAt: product.createdAt,
          unit: product.unit,
          discountedPrice: null,
          bonus: product.bonus ?? 0,
        } as Product;
      }),
    [wishlistRaw, user?.role, user?.customerTypeId]
  );

  // Check for promo codes availability on mount
  useEffect(() => {
    const checkPromoCodes = async () => {
      try {
        const { promoService } = await import('@/app/services/promoService');
        const response = await promoService.getActivePromos();
        if (response.success) {
          setHasPromoCodes(response.data.length > 0);
        }
      } catch (error) {
        console.error('Failed to check promo codes:', error);
        setHasPromoCodes(false);
      }
    };
    checkPromoCodes();
  }, []);


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
  const productsToSort = showSaved
    ? savedProducts
    : showDiscounted && discountedProducts.length > 0
      ? discountedProducts
      : products;
  
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
}, [products, discountedProducts, showDiscounted, showSaved, savedProducts, sorting?.sortBy]);


  // Show all categories (backend handles filtering)
  const categoriesWithAll = [
    {
      name: "All Categories",
      image: "",
    },
    ...categories,
  ];
  const userName = user?.name;
  const reduceMotion = useReducedMotion();

  // Computed after mount so server and client markup match
  const [greeting, setGreeting] = useState("");
  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");
  }, []);

  return (
    <section
      id="products"
      className="flex justify-center items-start  py-0 relative"
    >
      {/* <ChristmasAnimation /> */}
      <div className="container">
        <div className="flex gap-0 relative">
          <div className="  w-full">
            {isAuthenticated && user && (
              <div className="relative overflow-hidden bg-linear-to-br from-green-50 via-white to-amber-50 py-5 sm:py-6 px-4 sm:px-10 border-b border-gray-100">
                {/* Decorative background */}
                <div className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 rounded-full bg-green-200/40 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -right-16 w-72 h-72 rounded-full bg-amber-200/40 blur-3xl" />

                <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6 w-full">
                  {/* Left: Greeting */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex items-center gap-4 text-center lg:text-left"
                  >
                 

                    <div className="flex flex-col gap-1">
                      {greeting && (
                        <p className="text-[12px] font-medium uppercase tracking-wider text-green-700/80">
                          {greeting}
                        </p>
                      )}
                      <h1 className="text-[20px] sm:text-[22px] font-bold text-gray-900 leading-tight">
                        Hello,{" "}
                        <span className="bg-linear-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                          {userName}
                        </span>
                        <motion.span
                          className="inline-block ml-1 origin-[70%_70%]"
                          animate={reduceMotion ? undefined : { rotate: [0, 18, -8, 18, 0] }}
                          transition={{ duration: 1.4, delay: 0.5, repeat: Infinity, repeatDelay: 4 }}
                        >
                        </motion.span>
                      </h1>
                      <p className="text-gray-500 text-sm">
                        Fresh from our farm, straight to your kitchen.
                      </p>

                      {hasPromoCodes && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Sheet open={isPromoSheetOpen} onOpenChange={setIsPromoSheetOpen}>
                                <SheetTrigger asChild>
                                  <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="relative mt-1 self-center lg:self-start inline-flex items-center gap-2 rounded-full bg-white border border-green-200 pl-1.5 pr-3 py-1 text-[12px] font-semibold text-green-700 shadow-sm hover:border-green-400 transition-colors"
                                    onClick={() => {
                                      setShowSparkles(true);
                                      setTimeout(() => setShowSparkles(false), 1000);
                                    }}
                                  >
                                    <motion.span
                                      className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100"
                                      animate={reduceMotion ? undefined : { rotate: [0, -12, 12, -6, 0] }}
                                      transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 3 }}
                                    >
                                      <Gift className="h-3.5 w-3.5 text-green-600" />
                                    </motion.span>
                                    You have promo gifts
                                    <span className="relative flex h-2 w-2">
                                      <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
                                      <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                                    </span>
                                    {showSparkles && (
                                      <div className="absolute inset-0 pointer-events-none">
                                        {[...Array(8)].map((_, i) => (
                                          <div
                                            key={i}
                                            className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping"
                                            style={{
                                              top: `${15 + Math.random() * 70}%`,
                                              left: `${15 + Math.random() * 70}%`,
                                              animationDelay: `${i * 120}ms`,
                                              animationDuration: '1000ms'
                                            }}
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </motion.button>
                                </SheetTrigger>
                                <SheetContent className="w-[400px] sm:w-[540px] bg-gradient-to-br from-white to-yellow-50">
                                  <SheetHeader className="space-y-4 pb-6 border-b border-yellow-100">
                                    <SheetTitle className="flex items-center gap-3 text-xl font-bold">
                                      <div className="p-2 bg-green-100 rounded-full">
                                        <Gift className="h-6 w-6 text-green-600" />
                                      </div>
                                      Available Promo Codes
                                    </SheetTitle>
                                    <div className="bg-gradient-to-r from-green-50 p-4 rounded-lg border border-green-200">
                                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                        <span className="text-green-600">💡</span>
                                        How to use promo codes?
                                      </h3>
                                      <p className="text-sm text-gray-600 leading-relaxed">
                                        Select a promo code from the dropdown menu during checkout, review the discount details, and click "Apply" to automatically reduce your order total.
                                      </p>
                                    </div>
                                  </SheetHeader>
                                  <div className="mt-6">
                                    <RestaurantAvailablePromos onPromoCodesLoad={setHasPromoCodes} />
                                  </div>
                                </SheetContent>
                              </Sheet>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View your gift</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </motion.div>

                  {/* Middle: Animated voucher / wallet / subscription cards */}
                  <RestaurantCardsShowcase />

                  {/* Right: Cart Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                    className="w-full sm:w-72 rounded-2xl bg-white/80 backdrop-blur border border-gray-200 shadow-lg shadow-gray-200/60 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setIsCartOpen(true)}
                        className="flex items-center gap-2.5 text-left"
                      >
                        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-green-50">
                          <ShoppingCart className="h-5 w-5 text-green-600" />
                          {isLoading ? (
                            <Skeleton className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-green-600/60" />
                          ) : (
                            totalQuantity >= 0 && (
                              <motion.span
                                key={totalItems}
                                initial={{ scale: 0.4 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                className="absolute -top-1.5 -right-1.5 bg-green-600 text-white text-[10px] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center ring-2 ring-white"
                              >
                                {totalItems > 99 ? "99+" : totalItems}
                              </motion.span>
                            )
                          )}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-gray-900 leading-tight">My Cart</p>
                          <p className="text-[11px] text-gray-500">
                            {totalItems} {totalItems === 1 ? "item" : "items"}
                          </p>
                        </div>
                      </button>

                      {/* Wishlist */}
                      <button
                        type="button"
                        aria-label={showSaved ? "Show all products" : "Show saved products"}
                        title={showSaved ? "Show all products" : "Show saved products"}
                        aria-pressed={showSaved}
                        onClick={() => setShowSaved((value) => !value)}
                        className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-colors group ${
                          showSaved ? "bg-rose-50" : "hover:bg-rose-50"
                        }`}
                      >
                        <Heart
                          className={`w-5 h-5 transition-colors ${
                            showSaved || wishlistIds.size > 0
                              ? "fill-rose-500 text-rose-500"
                              : "text-gray-500 group-hover:text-rose-500"
                          }`}
                        />
                        <span
                          className={`absolute -top-0.5 -right-0.5 text-[10px] font-semibold rounded-full min-w-4 h-4 px-0.5 flex items-center justify-center ${
                            wishlistIds.size > 0 ? "bg-rose-500 text-white" : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {wishlistIds.size > 99 ? "99+" : wishlistIds.size}
                        </span>
                      </button>
                    </div>

                    {/* Cart Total */}
                    <div className="mt-3 flex items-end justify-between gap-3 rounded-xl bg-linear-to-r from-gray-50 to-green-50/60 px-3 py-2.5">
                      <div className="text-left">
                        <p className="text-[11px] uppercase tracking-wider text-gray-500">Cart Total</p>
                        <motion.p
                          key={String(totalAmount)}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[20px] font-bold text-gray-900 leading-tight"
                        >
                          {totalAmount} <span className="text-[12px] font-medium text-gray-500">Rwf</span>
                        </motion.p>
                      </div>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsCartOpen(true)}
                        className="shrink-0 rounded-full bg-green-600 hover:bg-green-700 text-white text-[12px] font-semibold px-4 py-2 shadow-md shadow-green-600/30 transition-colors"
                      >
                        View cart
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* Kept outside the transformed/blurred cart card so `position: fixed` stays relative to the viewport */}
            <CartDrawer
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
            />

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
                            const transformedProducts = data.data.map((product: any) => {
                              const roleBasedPrice = getRoleBasedPrice(product, user?.role || 'RESTAURANT', user?.customerTypeId);
                              return {
                                id: product.id,
                                name: product.productName,
                                price: product.discountedPrice || roleBasedPrice,
                                originalPrice: roleBasedPrice,
                                image: product.images[0] || '/placeholder.svg',
                                category: product.category,
                                inStock: product.quantity > 0,
                                rating: 4.5,
                                discountPercent: product.bonus,
                                createdAt: new Date().toISOString(),
                                unit: product.unit,
                                discountedPrice: product.discountedPrice,
                                bonus: product.bonus
                              };
                            });
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
                      {search.isSearching && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
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
                {showSaved && (
                  <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-rose-100 bg-rose-50 px-4 py-2 text-[13px] text-rose-800">
                    <span className="flex items-center gap-2">
                      <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                      Your saved products ({wishlistIds.size})
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSaved(false)}
                      className="font-medium text-rose-700 underline underline-offset-2 hover:text-rose-900 cursor-pointer"
                    >
                      Show all products
                    </button>
                  </div>
                )}
                {search?.isSearching ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600">Searching products...</span>
                    </div>
                  </div>
                ) : sortedProducts.length > 0 ? (
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
                        userRole={user?.role}
                        customerTypeId={user?.customerTypeId}
                        isWishlisted={wishlistIds.has(product.id)}
                        onToggleWishlist={toggleWishlist}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <h3 className="text-[14px] font-medium text-gray-900 mb-2">
                      {showSaved ? "No saved products yet" : "No products found"}
                    </h3>
                    <p className="text-gray-800 text-[13px] text-center max-w-md mb-4">
                      {showSaved
                        ? "Tap the heart on a product to save it here."
                        : searchQuery
                        ? `No products found matching.`
                        : selectedCategory === "All Categories"
                          ? "There are no products available at the moment."
                          : `No products found in the ${selectedCategory} category.`}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      {pagination && pagination.currentPage < pagination.totalPages && (
                        <Button
                          onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                          variant="outline"
                          className="text-sm"
                        >
                          Try Next Page
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                    {/* Items per page selector */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Show:</span>
                      <Select
                        value={(pagination.itemsPerPage || 30).toString()}
                        onValueChange={(value) => {
                          if (pagination.onItemsPerPageChange) {
                            pagination.onItemsPerPageChange(parseInt(value));
                          }
                        }}
                      >
                        <SelectTrigger className="w-20 h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="100">500</SelectItem>
                          <SelectItem value="100">1000000000</SelectItem>
                        </SelectContent>
                      </Select>
                      <span>per page</span>
                    </div>
                    
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
