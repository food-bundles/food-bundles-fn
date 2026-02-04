/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ProductsSection } from "@/components/products-section";
import { Suspense, useState, useEffect, useCallback } from "react";
import { categoryService } from "@/app/services/categoryService";
import { productService } from "@/app/services/productService";
import { useProductSection } from "@/hooks/useProductSection";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { useAuth } from "@/app/contexts/auth-context";

// Helper function to get role-based price
const getRoleBasedPrice = (product: any, userRole: string) => {
  if (userRole === "HOTEL" && product.hotelPrice) {
    return product.hotelPrice;
  }
  if ((userRole === "RESTAURANT" || userRole === "AFFILIATOR") && product.restaurantPrice) {
    return product.restaurantPrice;
  }
  return product.unitPrice;
};

function SearchLoading() {
  return (
    <div className="h-screen flex items-center justify-center p-4">
      <Spinner variant="ring"/>
    </div>
  );
}

export default function RestaurantPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState<{id: string; name: string; image: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("random");
  const [isSearching, setIsSearching] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const { selectedCategory, setSelectedCategory } = useProductSection();
  const { user } = useAuth();
  

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryService.getActiveCategories();
      const activeCategories = response.data || [];
      
      const transformedCategories = activeCategories.map((category: any) => ({
        id: category.id,
        name: category.name,
        image: "/products/fresh-organic-roma-tomatoes.png",
      }));
      
      setCategories(transformedCategories);
      return transformedCategories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }, []);

  const fetchProducts = useCallback(async (
    page = 1, 
    category = "All Categories", 
    search = "",
    showSearching = false
  ) => {
    try {
      if (showSearching) {
        setIsSearching(true);
      } else {
        setLoading(true);
      }
      
      const params: any = {
        page,
        limit: itemsPerPage,
      };
      
      if (category !== "All Categories") {
        const selectedCat = categories.find((cat: any) => cat.name === category);
        if (selectedCat?.id) {
          params.categoryId = selectedCat.id;
        }
      }
      
      if (search.trim()) {
        params.search = search.trim();
      }
      
      const response = await productService.getAllProducts(params);
      const productsData = response.data || [];
      const pagination = response.pagination || {};

      const transformedProducts = productsData.map((product: any) => {
        const roleBasedPrice = getRoleBasedPrice(product, user?.role || 'RESTAURANT');
        return {
          id: product.id,
          name: product.productName,
          price: roleBasedPrice,
          originalPrice: product.discountedPrice || undefined,
          image: product.images?.[0] || "/placeholder.svg",
          category: {
            id: product.category?.id || "",
            name: product.category?.name || "OTHER",
            description: product.category?.description
          },
          inStock: product.quantity > 0,
          rating: Math.random() * 2 + 3,
          isNew: Math.random() > 0.5,
          isFeatured: Math.random() > 0.7,
          createdAt: product.createdAt,
          unit: product.unit,
          discountPercent:
            product.discountedPrice && roleBasedPrice
              ? Math.round(
                  ((roleBasedPrice - product.discountedPrice) /
                    roleBasedPrice) *
                    100
                )
              : undefined,
        };
      });

      setProducts(transformedProducts);
      setTotalPages(pagination.totalPages || 1);
      setTotalProducts(pagination.total || transformedProducts.length);

      return { 
        products: transformedProducts, 
        totalPages: pagination.totalPages || 1,
        totalProducts: pagination.total || transformedProducts.length
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setTotalPages(1);
      setTotalProducts(0);
      return { products: [], totalPages: 1, totalProducts: 0 };
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [categories, itemsPerPage]);

  useEffect(() => {
    const initializeData = async () => {
      await fetchCategories();
    };
    initializeData();
  }, [fetchCategories]);

  useEffect(() => {
    if (categories.length > 0) {
      fetchProducts(currentPage, selectedCategory, searchQuery);
    }
  }, [selectedCategory, currentPage, fetchProducts, categories]);

  // Separate effect for search to avoid unnecessary reloads
  useEffect(() => {
    if (categories.length > 0) {
      const timer = setTimeout(() => {
        fetchProducts(1, selectedCategory, searchQuery, searchQuery !== "");
        setCurrentPage(1);
      }, searchQuery === "" ? 0 : 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, selectedCategory, fetchProducts, categories]);

  const handleCategorySelect = useCallback((categoryName: string) => {
    setSelectedCategory(categoryName);
    setCurrentPage(1); 
    fetchProducts(1, categoryName, searchQuery);
  }, [fetchProducts, searchQuery, setSelectedCategory]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [selectedCategory]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Don't fetch immediately, let the useEffect handle it with debouncing
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    fetchProducts(1, selectedCategory, searchQuery);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    // Note: Sorting will be handled on frontend for now
    // Backend sorting can be implemented later if needed
  };

  if (loading && products.length === 0) {
    return <SearchLoading />;
  }

  return (
    <Suspense fallback={<SearchLoading />}>
      <div className="min-h-screen bg-background">
        <div id="products">
          <ProductsSection 
            products={products} 
            categories={categories}
            onCategorySelect={handleCategorySelect}
            pagination={{
              currentPage,
              totalPages,
              totalProducts,
              onPageChange: handlePageChange,
              isLoading: loading,
              itemsPerPage,
              onItemsPerPageChange: handleItemsPerPageChange
            }}
            search={{
              query: searchQuery,
              onSearch: handleSearch,
              isSearching
            }}
            sorting={{
              sortBy,
              onSortChange: handleSortChange
            }}
          />
        </div>
      </div>
    </Suspense>
  );
}