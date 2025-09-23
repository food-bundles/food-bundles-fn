/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProductsSection } from "@/components/products-section";
import { Suspense } from "react";
import { categoryService } from "@/app/services/categoryService";
import { productService } from "@/app/services/productService";
import { UserPlus, User } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/header";

function SearchLoading() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-pulse">Loading...</div>
    </div>
  );
}

// Guest Requirements Notice Component
function GuestRequirementsNotice() {
  return (
    <div className="px-4 mx-4 sm:mx-6 mb-0">
      <div className="flex justify-between items-end  border-b border-gray-200">
        <div className="pb-2">
          <h3 className="text-ms font-semibold text-black">
            Shopping as Guest
          </h3>
          <p className="text-xs -medium text-gray-900">
            <span className="">
              Minimum order should be{" "}
              <span className="font-bold text-red-500">100,000 </span> Rwf
            </span>
            <br />
            Orders below this amount will have additional{" "}
            <span className="text-red-500 font-bold">delivery fees</span> applied.
          </p>
        </div>
        <div className="flex items-end gap-2">
          {/* <Link
            href="/auth/register"
            className="border-b-2 border-orange-500 px-2 py-2 text-green-600 transition-colors text-sm font-medium hover:bg-orange-50 flex items-center gap-1"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Register
          </Link> */}
          {/* <div className="border-l border-gray-300 h-6 mx-1"></div> */}
          {/* <Link
            href="/auth/login"
            className="px-2 py-2 hover:bg-orange-50 transition-colors text-sm border-b-2 border-transparent hover:border-orange-200 flex items-center gap-1"
          >
            <User className="w-4 h-4 mr-1" />
            Sign in
          </Link> */}
        </div>
      </div>
    </div>
  );
}

// Fetch data on the server (same as restaurant page)
async function getActiveCategories() {
  try {
    const response = await categoryService.getActiveCategories();
    return response.data || [];
  } catch (error) {
    console.error("Error fetching active categories:", error);
    return [];
  }
}

// Fetch products with pagination (same as restaurant page)
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

export default async function GuestPage() {
  // Fetch data on the server (same as restaurant page)
  const [activeCategories, productsData] = await Promise.all([
    getActiveCategories(),
    getProducts(1, 20), // Increase limit to get more products
  ]);

  // Transform categories for the UI (same as restaurant page)
  const categories = activeCategories.map((category: any) => ({
    name: category.name,
    image: "/products/fresh-organic-roma-tomatoes.png",
    productCount: productsData.products.filter(
      (product: any) => product.category?.id === category.id
    ).length,
  }));

  // Transform products for the UI (same as restaurant page)
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
        {/* Guest Requirements Notice */}
        <Header />
        <div className="pt-15">
          <GuestRequirementsNotice />
        </div>

        {/* Reuse the existing ProductsSection component */}
        <div id="products">
          <ProductsSection products={products} categories={categories} />
        </div>
      </div>
    </Suspense>
  );
}
