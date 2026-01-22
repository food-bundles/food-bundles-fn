"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  Star,
  Heart,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RestaurantPromos from "./_components/RestaurantPromos";

// Mock restaurant data
const mockRestaurantDetails = {
  "1": {
    id: "1",
    name: "Umucyo Restaurant",
    type: "Fine Dining",
    image: "/restaurants/farm-to-table-restaurant-chef.png",
    coverImage: "/imgs/hero.jpg",
    rating: 4.8,
    reviewCount: 124,
    description:
      "Experience farm-to-table dining at its finest. We source the freshest ingredients directly from local farms to create exceptional culinary experiences.",
    address: "123 Main St, Suite 4B, New York, NY 10001",
    phone: "(555) 123-4567",
    hours: "9:00 AM - 10:00 PM",
    specialties: [
      "Organic Ingredients",
      "Farm-to-Table",
      "Seasonal Menu",
      "Local Sourcing",
    ],
    recentPosts: [
      {
        id: "p1",
        image: "/products/fresh-organic-roma-tomatoes.png",
        caption: "Fresh organic tomatoes just arrived! 🍅",
        likes: 24,
        comments: 8,
        timestamp: "2h ago",
      },
      {
        id: "p2",
        image: "/products/fresh-atlantic-salmon-fillet.png",
        caption: "Premium Atlantic salmon for tonight's special",
        likes: 31,
        comments: 12,
        timestamp: "4h ago",
      },
      {
        id: "p3",
        image: "/products/artisan-cheese-selection-platter.png",
        caption: "Artisan cheese selection perfect for wine pairing",
        likes: 19,
        comments: 6,
        timestamp: "1d ago",
      },
    ],
    menu: [
      {
        name: "Grilled Salmon",
        price: "$28",
        description: "Fresh Atlantic salmon with seasonal vegetables",
      },
      {
        name: "Organic Salad",
        price: "$16",
        description: "Mixed greens with farm-fresh vegetables",
      },
      {
        name: "Tomato Basil Pasta",
        price: "$22",
        description: "House-made pasta with organic tomatoes and fresh basil",
      },
    ],
  },
};

export default function VisitedRestaurantPage({
  params,
}: {
  params: { id: string };
}) {
  const [activeTab, setActiveTab] = useState<"posts" | "menu" | "about">(
    "posts"
  );
  const restaurant =
    mockRestaurantDetails[params.id as keyof typeof mockRestaurantDetails];

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Restaurant Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            The restaurant you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with cover image */}
      <div className="relative h-64 bg-gray-900">
        <Image
          src={restaurant.coverImage || "/placeholder.svg"}
          alt={restaurant.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />

        {/* Navigation */}
        <div className="absolute top-4 left-4 z-10">
          <Link href="/stories">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Stories
            </Button>
          </Link>
        </div>

        {/* Restaurant info overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white">
              <Image
                src={restaurant.image || "/placeholder.svg"}
                alt={restaurant.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">
                {restaurant.name}
              </h1>
              <p className="text-white/80 text-sm mb-2">{restaurant.type}</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-white text-sm font-medium">
                    {restaurant.rating}
                  </span>
                </div>
                <span className="text-white/60 text-sm">
                  ({restaurant.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Promo Codes Section */}
        <RestaurantPromos restaurantId={params.id} />

        {/* Quick info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Address</p>
                <p className="text-xs text-gray-600">{restaurant.address}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Hours</p>
                <p className="text-xs text-gray-600">{restaurant.hours}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Phone</p>
                <p className="text-xs text-gray-600">{restaurant.phone}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {[
            { key: "posts", label: "Recent Posts" },
            { key: "menu", label: "Menu" },
            { key: "about", label: "About" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "posts" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restaurant.recentPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt="Post"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-900 mb-3">{post.caption}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                    <span>{post.timestamp}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "menu" && (
          <div className="space-y-4">
            {restaurant.menu.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <span className="text-green-600 font-bold">
                      {item.price}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "about" && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium text-gray-900 mb-3">
                  About {restaurant.name}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {restaurant.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium text-gray-900 mb-3">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {restaurant.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
