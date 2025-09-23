/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProductsSection } from "@/components/products-section";
import { Suspense } from "react";
import { categoryService } from "@/app/services/categoryService";
import { productService } from "@/app/services/productService";
import { QuickTalkWrapper } from "@/components/quck-talk-section";
import { Footer } from "@/components/footer";

function SearchLoading() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-pulse">Loading...</div>
    </div>
  );
}

// Fetch data on the server
async function getActiveCategories() {
  try {
    const response = await categoryService.getActiveCategories();
    return response.data || [];
  } catch (error) {
    console.error("Error fetching active categories:", error);
    return [];
  }
}

// Fetch products with pagination
async function getProducts(page = 1, limit = 10) {
  try {
    const response = await productService.getAllProducts();
    return {
      products: response.data || [],
      pagination: response.pagination || {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      products: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    };
  }
}

export default async function RestaurnatPage() {
  // Fetch data on the server
  const [activeCategories, productsData] = await Promise.all([
    getActiveCategories(),
    getProducts(1, 20), // Increase limit to get more products
  ]);

  // Transform categories for the UI
 const categories = activeCategories.map((category: any) => ({
   name: category.name,
   image: "/products/fresh-organic-roma-tomatoes.png",
   productCount: productsData.products.filter(
     (product: any) => product.category?.id === category.id
   ).length,
 }));

  // Transform products for the UI
  const products = productsData.products.map((product: any) => ({
    id: product.id,
    name: product.productName,
    price: product.unitPrice,
    originalPrice: product.discountedPrice || undefined,
    image: product.images?.[0] || "/placeholder.svg",
    category: product.category?.name || "OTHER",
    inStock: product.quantity > 0,
    rating: Math.random() * 2 + 3, // Random rating between 3-5
    isNew: Math.random() > 0.5, // Randomly mark as new
    isFeatured: Math.random() > 0.7, // Randomly mark as featured
    discountPercent:
      product.discountedPrice && product.unitPrice
        ? Math.round(
            ((product.unitPrice - product.discountedPrice) /
              product.unitPrice) *
              100
          )
        : undefined,
  }));

  return (
    <Suspense fallback={<SearchLoading />}>
      <div className="min-h-screen bg-background">
        <div id="products">
          <ProductsSection products={products} categories={categories} />
        </div>
        <QuickTalkWrapper />
        <Footer />
      </div>
    </Suspense>
  );
}
