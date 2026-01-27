/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProductsSection } from "@/components/products-section";
import { categoryService } from "@/app/services/categoryService";
import { productService } from "@/app/services/productService";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

// Guest Requirements Notice Component
function GuestRequirementsNotice() {
  return (
    <div className="bg-gray-100 ">
      <div className="py-8 px-4 mx-4 sm:mx-6 mb-0 ">
        <div className="flex justify-between items-end  border-b border-gray-200">
          <div className="py-2 pb-4">
            <h3 className="text-ms font-semibold text-black">
              Shopping as Guest
            </h3>
            <p className="text-xs font-medium text-gray-900">
              <span>
                Minimum order should be{" "}
                <span className="font-bold text-red-500">100,000 </span> Rwf
              </span>
              <br />
              Orders below this amount will have additional{" "}
              <span className="text-red-500 font-bold">delivery fees 2</span>{" "}
              applied.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fetch data helpers
async function getActiveCategories() {
  try {
    const response = await categoryService.getActiveCategories();
    return response.data || [];
  } catch (error) {
    console.error("Error fetching active categories:", error);
    return [];
  }
}

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
  // Fetch data
  const [activeCategories, productsData] = await Promise.all([
    getActiveCategories(),
    getProducts(1, 20),
  ]);

  // Transform categories
  const categories = activeCategories.map((category: any) => ({
    name: category.name,
    image: "/products/fresh-organic-roma-tomatoes.png",
    productCount: productsData.products.filter(
      (product: any) => product.category?.id === category.id
    ).length,
  }));

  // Transform products
  const products = productsData.products.map((product: any) => ({
    id: product.id,
    name: product.productName,
    price: product.unitPrice,
    originalPrice: product.discountedPrice || undefined,
    image: product.images?.[0] || "/placeholder.svg",
    category: product.category?.name || "OTHER",
    inStock: product.quantity > 0,
    rating: Math.random() * 2 + 3,
    isNew: Math.random() > 0.5,
    isFeatured: Math.random() > 0.7,
    discountPercent:
      product.discountedPrice && product.unitPrice
        ? Math.round(
            ((product.unitPrice - product.discountedPrice) /
              product.unitPrice) *
              100
          )
        : undefined,
  }));

  const isLoading = !productsData || products.length === 0;

  return (
    <div className="">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Spinner variant="ring" className="w-10 h-10" />
        </div>
      ) : (
        <>
          <div className="pt-13">
            <GuestRequirementsNotice />
          </div>

          <div id="products" className="">
            <ProductsSection products={products} categories={categories} />
          </div>
        </>
      )}
    </div>
  );
}
