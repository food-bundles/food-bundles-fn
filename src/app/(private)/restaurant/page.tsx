/* eslint-disable @typescript-eslint/no-explicit-any */
import { Search } from "lucide-react";
import { ProductGrid } from "./_components/product-grid";
import { productService } from "@/app/services/productService";

export const dynamic = "force-dynamic";

type ProductCategory =
  | "VEGETABLES"
  | "FRUITS"
  | "GRAINS"
  | "TUBERS"
  | "LEGUMES"
  | "HERBS_SPICES"
  | "ANIMAL_PRODUCTS"
  | "OTHER";

type Product = {
  id: string;
  productName: string;
  unitPrice: number;
  unit: string;
  bonus: number;
  createdBy: string;
  expiryDate: Date | null;
  images: string[];
  quantity: number;
  sku: string;
  category: ProductCategory;
  rating?: number;
  soldCount?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

async function getProducts(): Promise<Product[]> {
  try {
    const response = await productService.getAllProducts();

    // Transform API response to match component expectations
    return response.data.map((product: any) => ({
      ...product,
      expiryDate: product.expiryDate ? new Date(product.expiryDate) : null,
      // Add default values for missing fields
      rating: product.rating || undefined,
      soldCount: product.soldCount || undefined,
    }));
  } catch (error) {
    console.error("Failed to fetch products:", error);
    // Return empty array on error
    return [];
  }
}

export default async function RestaurantShop() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold text-gray-900">
            Available Products
          </h1>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-80"
              />
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No products available at the moment.
            </p>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </main>
    </div>
  );
}