import { Search} from "lucide-react";
import { ProductGrid } from "./_components/product-grid";

type ProductCategory =
  | "VEGETABLES"
  | "FRUITS"
  | "GRAINS"
  | "TUBERS"
  | "LEGUMES"
  | "HERBS_SPICES";

async function getProducts() {
  await new Promise((resolve) => setTimeout(resolve, 100));

  return [
    {
      id: "1",
      productName: "Organic Tomatoes",
      unitPrice: 4.99,
      unit: "kg",
      bonus: 15,
      createdBy: "Green Valley Farms",
      expiryDate: new Date("2024-02-15"),
      images: ["/imgs/tomatoes.svg"],
      quantity: 50.0,
      sku: "ORG-TOM-001",
      category: "VEGETABLES" as ProductCategory,
      rating: 4.2,
      soldCount: 858,
    },
    {
      id: "2",
      productName: "Free-Range Eggs",
      unitPrice: 6.99,
      unit: "kg",
      bonus: 0,
      createdBy: "Happy Hen Farmstead",
      expiryDate: new Date("2024-01-20"),
      images: ["/imgs/eggs.svg"],
      quantity: 30.0,
      sku: "EGG-FR-002",
      category: "VEGETABLES" as ProductCategory,
      rating: 4.8,
      soldCount: 1245,
    },
    {
      id: "3",
      productName: "Grass-Fed Ground Beef",
      unitPrice: 9.99,
      unit: "kg",
      bonus: 30,
      createdBy: "Sunset Ranch",
      expiryDate: new Date("2024-01-18"),
      images: ["/imgs/ground-beef.svg"],
      quantity: 25.0,
      sku: "BEEF-GF-003",
      category: "VEGETABLES" as ProductCategory,
      rating: 4.1,
      soldCount: 3521,
    },
    {
      id: "4",
      productName: "Organic Spinach",
      unitPrice: 3.49,
      unit: "kg",
      bonus: 0,
      createdBy: "Green Valley Farms",
      expiryDate: new Date("2024-01-16"),
      images: ["/imgs/spanish.svg"],
      quantity: 40.0,
      sku: "ORG-SPN-004",
      category: "VEGETABLES" as ProductCategory,
      rating: 4.9,
      soldCount: 2150,
    },
    {
      id: "5",
      productName: "Artisan Sourdough Bread",
      unitPrice: 7.99,
      unit: "kg",
      bonus: 5,
      createdBy: "Hearth Bakery",
      expiryDate: new Date("2024-01-17"),
      images: ["/imgs/bread.svg"],
      quantity: 15.0,
      sku: "BRD-SD-005",
      category: "GRAINS" as ProductCategory,
      rating: 4.6,
      soldCount: 876,
    },
    {
      id: "6",
      productName: "Fresh Atlantic Salmon",
      unitPrice: 18.99,
      unit: "kg",
      bonus: 15,
      createdBy: "Ocean Harvest",
      expiryDate: new Date("2024-01-16"),
      images: ["/imgs/flesh.svg"],
      quantity: 12.0,
      sku: "SAL-ATL-006",
      category: "VEGETABLES" as ProductCategory,
      rating: 4.4,
      soldCount: 1892,
    },
  ];
}

export default async function RestaurantDashboard() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold text-gray-900">
            Your products to day
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

        <ProductGrid products={products} />
      </main>
    </div>
  );
}
