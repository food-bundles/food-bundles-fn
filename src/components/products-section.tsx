"use client";

import { useState } from "react";
import { Heart, HeartPulse as HeartPlus } from "lucide-react";
import { ProductCard } from "./product-card";
import { CategoryCard } from "./cotegory-card";

interface Product {
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  inStock: boolean;
  rating: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

interface Category {
  name: string;
  image: string;
  productCount?: number;
}

interface ProductsSectionProps {
  products: Product[];
  categories: Category[];
  isGuest: boolean;
}

export function ProductsSection({
  products,
  categories,
}: ProductsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState("ALL CATEGORIES");

  const getFilteredProducts = () => {
    if (selectedCategory === "ALL CATEGORIES") {
      return products;
    }
    return products.filter(
      (product) =>
        product.category.toLowerCase() ===
        selectedCategory.toLowerCase().replace("s", "")
    );
  };

  const getCategoryProducts = () => {
    return categories.map((category) => {
      const categoryProduct = products.find(
        (product) => product.category === category.name
      );
      return {
        ...category,
        representativeProduct: categoryProduct,
      };
    });
  };

  const filteredProducts = getFilteredProducts();
  const newArrivals = filteredProducts
    .filter((product) => product.isNew)
    .slice(0, 10);
  const featuredProducts = filteredProducts
    .filter((product) => product.isFeatured)
    .slice(0, 10);

  return (
    <section id="products" className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex gap-8 h-[600px]">
          {/* Categories Sidebar */}
          <div className="w-[320px] min-w-[320px] max-w-[320px] min-h-[650px] py-4 flex flex-col border-r border-gray-200 overflow-hidden">
            <div className="items-start mb-6">
              <h2
                className={
                  "text-sm md:text-xl lg:text-4xl font-semibold text-orange-400 leading-tight transition-all duration-800 "
                }
              >
                Shop{" "}
              </h2>
            </div>

            <div className="space-y-4 py-4 overflow-y-scroll overflow-x-hidden scrollbar-hide">
              {getCategoryProducts().map((category, index) => (
                <div
                  key={index}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedCategory === category.name
                      ? "transform scale-105"
                      : "hover:transform hover:scale-102"
                  }`}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <CategoryCard
                    name={category.name}
                    image={
                      category.representativeProduct?.image || category.image
                    }
                    productCount={category.productCount}
                    onClick={() => {}}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Products Panel */}
          <div className="flex-1 bg-white flex flex-col">
            {/* Products Content */}
            <div className="flex-1 p-6 overflow-y-scroll scrollbar-hide">
              {/* New Arrivals Section */}
              {newArrivals.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center mb-6 gap-2">
                    <h3 className="text-2xl font-semibold">New Arrival</h3>
                    <HeartPlus className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {newArrivals.map((product, index) => (
                      <ProductCard
                        key={`new-${index}`}
                        name={product.name}
                        price={product.price}
                        originalPrice={product.originalPrice}
                        image={product.image}
                        rating={product.rating}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Featured Products Section */}
              {featuredProducts.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center mb-6 gap-2">
                    <h3 className="text-2xl font-semibold">
                      Featured Products
                    </h3>
                    <Heart className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {featuredProducts.map((product, index) => (
                      <ProductCard
                        key={`featured-${index}`}
                        name={product.name}
                        price={product.price}
                        originalPrice={product.originalPrice}
                        image={product.image}
                        rating={product.rating}
                      />
                    ))}
                  </div>
                </div>
              )}

              {newArrivals.length === 0 && featuredProducts.length === 0 && (
                <div className="mb-8">
                  <div className="flex items-center mb-6 gap-2">
                    <h3 className="text-2xl font-semibold">
                      {selectedCategory === "ALL CATEGORIES"
                        ? "All Categories"
                        : selectedCategory}
                    </h3>
                    <Heart className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product, index) => (
                      <ProductCard
                        key={`all-${index}`}
                        name={product.name}
                        price={product.price}
                        originalPrice={product.originalPrice}
                        image={product.image}
                        rating={product.rating}
                      />
                    ))}
                  </div>
                </div>
              )}

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No products found in this category.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none; /* Internet Explorer 10+ */
          scrollbar-width: none; /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
      `}</style>
    </section>
  );
}
