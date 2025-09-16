"use client";

import { useState } from "react";
import { CategoryList } from "./cotegory-card";
import { ProductCard } from "./product-card";

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
    <section id="products" className="py-8 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex gap-0 min-h-[700px]">
          <CategoryList
            categories={categoriesWithAll}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />

          <div className="flex-1 bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-8 py-6">
              <h1 className="text-xl font-semibold text-gray-900">
                {selectedCategory === "ALL CATEGORIES"
                  ? "All Products"
                  : selectedCategory}
              </h1>
            </div>

            <div className="p-8 overflow-y-auto">
              {filteredProducts.length > 0 && (
                <div className="mb-12">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                <div className="text-center py-16">
                  <div className="bg-white rounded-lg p-12 shadow-sm border border-gray-200">
                    <p className="text-gray-500 text-xl font-medium mb-2">
                      No products found in this category
                    </p>
                    <p className="text-gray-400">
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
