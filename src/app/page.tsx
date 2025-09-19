/* eslint-disable @typescript-eslint/no-explicit-any */
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { HeroWithRestaurants } from "@/components/hero-section";
import { ProductsSection } from "@/components/products-section";
import { QuickTalkWrapper } from "@/components/quck-talk-section";
import { Suspense } from "react";
import { categoryService } from "@/app/services/categoryService";
import { productService } from "@/app/services/productService";

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

export default async function HomePage() {
  // Fetch data on the server
  const [activeCategories, productsData] = await Promise.all([
    getActiveCategories(),
    getProducts(1, 20), // Increase limit to get more products
  ]);

  const restaurants = [
    {
      name: "Bella Vista",
      image: "/restaurants/italian-restaurant-chef.png",
      featuredPost:
        "Just received fresh organic tomatoes for tonight's special pasta!",
      seen: true,
    },
    {
      name: "Green Garden",
      image: "/restaurants/vegetarian-restaurant-chef.png",
      featuredPost:
        "Our new vegan menu is launching next week with locally sourced ingredients.",
      seen: false,
    },
    {
      name: "Ocean Breeze",
      image: "/restaurants/seafood-restaurant-chef.png",
      featuredPost:
        "Fresh catch of the day: Atlantic salmon and sea bass available now!",
      seen: true,
    },
    {
      name: "Spice Route",
      image: "/restaurants/indian-restaurant-chef.png",
      featuredPost:
        "Authentic spices and herbs sourced directly from India for our curry dishes.",
      seen: false,
    },
    {
      name: "Farm Table",
      image: "/restaurants/farm-to-table-restaurant-chef.png",
      featuredPost:
        "Farm-to-table dining with ingredients harvested this morning!",
      seen: true,
    },
    {
      name: "Coastal Catch",
      image: "/restaurants/seafood-restaurant-chef.png",
      featuredPost: "Daily fresh seafood selection from local fishermen.",
      seen: true,
    },
    {
      name: "Mediterranean Delight",
      image: "/restaurants/italian-restaurant-chef.png",
      featuredPost:
        "Authentic Mediterranean cuisine with olive oil from Greece.",
      seen: false,
    },
    {
      name: "Tokyo Fusion",
      image: "/restaurants/indian-restaurant-chef.png",
      featuredPost: "Modern Japanese dishes with a contemporary twist.",
      seen: true,
    },
    {
      name: "Rustic Barn",
      image: "/restaurants/farm-to-table-restaurant-chef.png",
      featuredPost: "Country-style cooking with locally grown ingredients.",
      seen: false,
    },
    {
      name: "Seaside Grill",
      image: "/restaurants/seafood-restaurant-chef.png",
      featuredPost: "Grilled specialties with ocean-fresh seafood daily.",
      seen: true,
    },
    {
      name: "Garden Bistro",
      image: "/restaurants/vegetarian-restaurant-chef.png",
      featuredPost: "Plant-based cuisine featuring seasonal vegetables.",
      seen: true,
    },
    {
      name: "Pasta Corner",
      image: "/restaurants/italian-restaurant-chef.png",
      featuredPost: "Handmade pasta with imported Italian ingredients.",
      seen: false,
    },
    {
      name: "Curry House",
      image: "/restaurants/indian-restaurant-chef.png",
      featuredPost: "Traditional Indian flavors with organic spices.",
      seen: true,
    },
    {
      name: "Harbor View",
      image: "/restaurants/seafood-restaurant-chef.png",
      featuredPost: "Waterfront dining with the freshest catch of the day.",
      seen: false,
    },
    {
      name: "Harvest Kitchen",
      image: "/restaurants/farm-to-table-restaurant-chef.png",
      featuredPost: "Seasonal menu changes based on local farm harvest.",
      seen: true,
    },
    {
      name: "Verde Vita",
      image: "/restaurants/vegetarian-restaurant-chef.png",
      featuredPost: "Italian-inspired vegetarian dishes with fresh herbs.",
      seen: true,
    },
    {
      name: "Tuscan Table",
      image: "/restaurants/italian-restaurant-chef.png",
      featuredPost:
        "Traditional Tuscan recipes passed down through generations.",
      seen: false,
    },
    {
      name: "Bombay Express",
      image: "/restaurants/indian-restaurant-chef.png",
      featuredPost:
        "Fast-casual Indian cuisine with authentic street food flavors.",
      seen: true,
    },
    {
      name: "Neptune's Kitchen",
      image: "/restaurants/seafood-restaurant-chef.png",
      featuredPost:
        "Premium seafood restaurant with sustainable fishing practices.",
      seen: false,
    },
    {
      name: "Country Roots",
      image: "/restaurants/farm-to-table-restaurant-chef.png",
      featuredPost:
        "Family-owned restaurant supporting local farmers for 25 years.",
      seen: true,
    },
  ];

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
        <Header />
        <div className="h-12 bg-green-700"></div>
        <div>
          <div id="home">
            <HeroWithRestaurants restaurants={restaurants} />
          </div>
          <div id="products">
            <ProductsSection products={products} categories={categories} />
          </div>
          <div id="ask-help">
            <QuickTalkWrapper />
          </div>
          <Footer />
        </div>
      </div>
    </Suspense>
  );
}
