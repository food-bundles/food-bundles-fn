/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";


import { Header } from "@/components/header";
import { HeroWithRestaurants } from "@/components/hero-section";
import { ProductsSection } from "@/components/products-section";
import { QuickTalkWrapper } from "@/components/quck-talk-section";
import { useState } from "react";
import { Footer } from "react-day-picker";

export default function HomePage() {
  const [isGuest, setIsGuest] = useState(true);

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

  const categories = [
    {
      name: "ALL ",
      image: "/products/fresh-organic-roma-tomatoes.png",
      productCount: 450,
    },
    {
      name: "VEGETABLES",
      image: "/products/fresh-organic-roma-tomatoes.png",
      productCount: 15,
    },
    {
      name: "FRUITS",
      image: "/products/fresh-organic-roma-tomatoes.png",
      productCount: 10,
    },
    {
      name: "ANIMAL PRODUCTS",
      image: "/products/fresh-organic-roma-tomatoes.png",
      productCount: 8,
    },
  ];

  const products = [
    {
      name: "Organic Roma Tomatoes",
      price: 4.99,
      originalPrice: 6.99,
      image: "/products/fresh-organic-roma-tomatoes.png",
      category: "Vegetables",
      inStock: true,
      rating: 4.5,
      isNew: true,
      isFeatured: true,
    },
    {
      name: "Fresh Atlantic Salmon",
      price: 24.99,
      image: "/products/fresh-atlantic-salmon-fillet.png",
      category: "Seafood",
      inStock: true,
      rating: 4.8,
      isNew: false,
      isFeatured: true,
    },
    {
      name: "Free-Range Chicken Breast",
      price: 12.99,
      originalPrice: 15.99,
      image: "/products/free-range-chicken-breast.png",
      category: "Meat",
      inStock: true,
      rating: 4.6,
      isNew: true,
      isFeatured: false,
    },
    {
      name: "Organic Mixed Greens",
      price: 3.49,
      image: "/products/organic-mixed-salad-greens.png",
      category: "Vegetables",
      inStock: false,
      rating: 4.2,
      isNew: false,
      isFeatured: true,
    },
    {
      name: "Artisan Cheese Selection",
      price: 18.99,
      image: "/products/artisan-cheese-selection-platter.png",
      category: "Dairy",
      inStock: true,
      rating: 4.9,
      isNew: true,
      isFeatured: true,
    },
    {
      name: "Fresh Herbs Bundle",
      price: 7.99,
      image: "/products/fresh-herbs-basil-parsley-cilantro.png",
      category: "Herbs",
      inStock: true,
      rating: 4.3,
      isNew: false,
      isFeatured: false,
    },
    {
      name: "Premium Basil Leaves",
      price: 5.99,
      image: "/products/fresh-herbs-basil-parsley-cilantro.png",
      category: "Herbs",
      inStock: true,
      rating: 4.7,
      isNew: true,
      isFeatured: false,
    },
    {
      name: "Organic Cilantro",
      price: 4.99,
      image: "/products/fresh-herbs-basil-parsley-cilantro.png",
      category: "Herbs",
      inStock: true,
      rating: 4.4,
      isNew: false,
      isFeatured: true,
    },
    {
      name: "Fresh Parsley Bundle",
      price: 6.99,
      image: "/products/fresh-herbs-basil-parsley-cilantro.png",
      category: "Herbs",
      inStock: true,
      rating: 4.1,
      isNew: true,
      isFeatured: false,
    },
    {
      name: "Wild Caught Tuna",
      price: 28.99,
      originalPrice: 32.99,
      image: "/products/fresh-atlantic-salmon-fillet.png",
      category: "Seafood",
      inStock: true,
      rating: 4.8,
      isNew: true,
      isFeatured: true,
    },
    {
      name: "Grass-Fed Beef Steaks",
      price: 35.99,
      image: "/products/free-range-chicken-breast.png",
      category: "Meat",
      inStock: true,
      rating: 4.9,
      isNew: false,
      isFeatured: true,
    },
    {
      name: "Organic Baby Spinach",
      price: 4.49,
      image: "/products/organic-mixed-salad-greens.png",
      category: "Vegetables",
      inStock: true,
      rating: 4.3,
      isNew: true,
      isFeatured: false,
    },
    {
      name: "Aged Cheddar Cheese",
      price: 12.99,
      originalPrice: 15.99,
      image: "/products/artisan-cheese-selection-platter.png",
      category: "Dairy",
      inStock: true,
      rating: 4.6,
      isNew: false,
      isFeatured: true,
    },
    {
      name: "Fresh Thyme Sprigs",
      price: 8.99,
      image: "/products/fresh-herbs-basil-parsley-cilantro.png",
      category: "Herbs",
      inStock: true,
      rating: 4.2,
      isNew: true,
      isFeatured: false,
    },
    {
      name: "Organic Cherry Tomatoes",
      price: 6.99,
      image: "/products/fresh-organic-roma-tomatoes.png",
      category: "Vegetables",
      inStock: true,
      rating: 4.7,
      isNew: false,
      isFeatured: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-16 bg-green-700"></div>
      <div>
        <HeroWithRestaurants restaurants={restaurants} />
        <ProductsSection
          products={products}
          categories={categories}
          isGuest={isGuest}
        />
        <QuickTalkWrapper />
        <Footer />
      </div>
    </div>
  );
}