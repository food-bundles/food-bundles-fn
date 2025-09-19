"use client";

import { useState } from "react";
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
        className={`absolute inset-0 z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:hidden`}
      >
        {/* Backdrop */}
        {/* <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        /> */}

        {/* Sidebar */}
        <div className="relative w-[280px] h-full bg-white border-r  border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b  border-gray-100">
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
                        ? "bg-green-50 text-green-700 border-l-4 border-green-500"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="font-medium">
                      {category.name.replace(/_/g, " ")}
                    </span>
                    {category.productCount !== undefined &&
                      category.productCount >= 0 && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full min-w-[24px] text-center ${
                            selectedCategory === category.name
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                          }`}
                        >
                          {category.productCount}
                        </span>
                      )}
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
      className={`hidden lg:block bg-white border-r  border-gray-200 h-full transition-all duration-300 ${
        isOpen ? "w-[200px] min-w-[200px]" : "w-0 min-w-0 overflow-hidden"
      }`}
    >
      {/* Header */}
      <div className="p-6 border-b  border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 whitespace-nowrap">
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
                className={`w-full ms:text-xs md:text-sm text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                  selectedCategory === category.name
                    ? "bg-green-50 text-green-700 border-l-4 border-green-500"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
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
}

function ProductCard({
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
        className="w-full bg-white"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Card className="border-0 shadow-none hover:rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg">
          {/* Product Image Container */}
          <div className="relative w-full h-[160px] sm:h-[180px] bg-gray-50 flex items-center justify-center group overflow-hidden">
            <Image
              src={image || "/placeholder.svg"}
              alt={name}
              width={200}
              height={200}
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
                className="absolute top-2 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center cursor-pointer"
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
              <div className="bg-orange-400 rounded-full p-2 sm:p-3 flex items-center justify-center space-x-4 sm:space-x-10 shadow-lg">
                {/* Quick View */}
                <button className="text-white hover:text-gray-200 transition-colors">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
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
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>

                {/* Add to Wishlist */}
                <button className="text-white hover:text-gray-200 transition-colors">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="px-3 sm:px-4 py-3 space-y-1">
            {/* Category */}
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
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
              <span className="font-bold text-base sm:text-lg text-gray-900">
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
        <DialogContent className="sm:max-w-md w-full mx-4">
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
  const [selectedCategory, setSelectedCategory] = useState("ALL CATEGORIES");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopCategoriesOpen, setIsDesktopCategoriesOpen] = useState(true);

  const getFilteredProducts = () => {
    if (selectedCategory === "ALL CATEGORIES") {
      return products;
    }
    return products.filter(
      (product) =>
        product.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  };

  const allCategoriesCount = products.length;

  const categoriesWithAll = [
    { name: "ALL CATEGORIES", image: "", productCount: allCategoriesCount },
    ...categories,
  ];

  const filteredProducts = getFilteredProducts();

  return (
    <section
      id="products"
      className="flex justify-center items-center py-4 sm:py-8 bg-gray-50 min-h-screen  border "
    >
      <div className="container">
        <div className="flex gap-0 min-h-[700px] relative">
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

          {/* Desktop Toggle Button */}
          <button
            onClick={() => setIsDesktopCategoriesOpen(!isDesktopCategoriesOpen)}
            className="hidden lg:flex absolute left-1 top-1/50 transform -translate-y-1/2 z-30 bg-white border  border-gray-200 rounded-r-lg p-2 hover:bg-gray-50 transition-colors shadow-sm"
            style={{
              left: isDesktopCategoriesOpen ? "200px" : "0px",
              transition: "left 0.3s ease-in-out",
            }}
          >
            {isDesktopCategoriesOpen ? (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            )}
          </button>

          {/* Products Area */}
          <div className="flex-1 bg-gray-50 ">
            {/* Header with Mobile Menu Toggle */}
            <div className="bg-transparent px-4 sm:px-8 py-4 sm:py-6 ">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Mobile Menu Toggle */}
                  <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Menu className="w-5 h-5" />
                  </button>

                  <h1 className="text-xl px-4 sm:text-xl font-semibold text-gray-900">
                    {selectedCategory === "ALL CATEGORIES"
                      ? "All Products"
                      : selectedCategory.replace(/_/g, " ")}
                  </h1>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="p-4 sm:p-8 overflow-y-auto">
              {filteredProducts.length > 0 && (
                <div className="mb-12">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6">
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
                </div>
              )}

              {/* No Products Found */}
              {filteredProducts.length === 0 && (
                <div className="text-center py-8 sm:py-16">
                  <div className="bg-white rounded-lg p-8 sm:p-12 shadow-sm border  border-gray-200 mx-4">
                    <p className="text-gray-500 text-lg sm:text-xl font-medium mb-2">
                      No products found in this category
                    </p>
                    <p className="text-gray-400 text-sm sm:text-base">
                      Try selecting a different category or check back later.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
