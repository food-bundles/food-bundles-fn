import Home from "@/components/home";
import FeaturedProducts from "@/components/featured_products";
import HowItWorks from "@/components/how_it_work";
import WhyChoose from "@/components/why_choose";
import Promotions from "@/components/promotion";
import ContactUs from "@/components/contact_us";
import Header from "@/components/header";
import { Footer } from "@/components/footer";

// Mock data fetching functions (replace with actual API calls)
async function getHomeData() {
  // Simulate API call
  return {
    title: "Fresh From Farm\nto Table",
    subtitle: "Farm to Table Excellence",
    description:
      "Connecting local farmers with restaurants for sustainable food systems. Build direct relationships and create a more efficient supply chain.",
    primaryButton: {
      text: "Submit Your Product →",
      href: "/submit-product",
    },
    secondaryButton: {
      text: "Shop Now →",
      href: "/shop",
    },
    heroImage: {
      src: "/imgs/FRAME.png",
      alt: "Fresh produce arranged in a circle with wooden cutting board center",
    },
    decorativeElements: {
      stars: {
        large: {
          src: "/imgs/Vector 1.png",
          alt: "Decorative star",
        },
        small: {
          src: "/imgs/Vector 1.png",
          alt: "Decorative star",
        },
      },
    },
  };
}

async function getFeaturedProductsData() {
  // Simulate API call
  return {
    title: "Featured Fresh Products",
    subtitle:
      "Explore our curated selection of seasonal produce from local farms",
    products: [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        productName: "Organic Tomatoes",
        unitPrice: 4.99,
        unit: "lb",
        category: "VEGETABLES",
        sku: "TOM-ORG-001",
        quantity: 50.0,
        images: ["/imgs/tomatoes.svg"],
        status: "ACTIVE",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        productName: "Fresh Asparagus",
        unitPrice: 6.49,
        unit: "bunch",
        category: "VEGETABLES",
        sku: "ASP-FRS-002",
        quantity: 25.0,
        images: ["/imgs/asparagus.svg"],
        status: "ACTIVE",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440003",
        productName: "Rainbow Carrots",
        unitPrice: 3.7,
        unit: "lb",
        category: "VEGETABLES",
        sku: "CAR-RBW-003",
        quantity: 75.0,
        images: ["/imgs/eggs.svg"],
        status: "ACTIVE",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440004",
        productName: "Organic Spinach",
        unitPrice: 5.2,
        unit: "bag",
        category: "HERBS_SPICES",
        sku: "SPN-ORG-004",
        quantity: 30.0,
        images: ["/imgs/eggs.svg"],
        status: "ACTIVE",
      },
    ],
  };
}

async function getPromotionsData() {
  // Simulate API call
  return {
    title: "Weekly Special Offers",
    products: [
      {
        id: "promo-001",
        productName: "Organic Heirloom Tomatoes",
        description:
          "Premium vine-ripened tomatoes, hand-picked at peak freshness. Perfect for gourmet restaurants.",
        unitPrice: 6.99,
        originalPrice: 9.99,
        discountPercentage: 30,
        unit: "lb",
        quantity: 50.0,
        images: ["/imgs/tomatoes.svg"],
        farmName: "Sunset Valley Farm",
        category: "VEGETABLES",
        sku: "TOM-PROMO-001",
      },
      {
        id: "promo-002",
        productName: "Premium Organic Spinach",
        description:
          "Fresh baby spinach leaves, grown without pesticides. Rich in nutrients and perfect for salads.",
        unitPrice: 4.49,
        originalPrice: 6.99,
        discountPercentage: 35,
        unit: "bag",
        quantity: 30.0,
        images: ["/imgs/eggs.svg"],
        farmName: "Green Leaf Gardens",
        category: "HERBS_SPICES",
        sku: "SPN-PROMO-002",
      },
    ],
  };
}

export default async function LandingPage() {
  // Fetch all data in parallel
  const [homeData, featuredProductsData, promotionsData] = await Promise.all([
    getHomeData(),
    getFeaturedProductsData(),
    getPromotionsData(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 to-orange-50/30 relative overflow-hidden">
      {/* Background decorative circles */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-100/20 rounded-full -translate-y-32 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-100/30 rounded-full translate-y-32 -translate-x-16"></div>

      {/* Header Component - Sticky */}
      {/* <Header /> */}

      {/* Page Sections */}
      <Header />
      <Home data={homeData} />
      <HowItWorks />
      <FeaturedProducts data={featuredProductsData} />
      <Promotions data={promotionsData} />
      <WhyChoose />
      <ContactUs />
      <Footer />
    </div>
  );
}
