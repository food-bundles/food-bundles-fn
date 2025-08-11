"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRef } from "react"

// Product Types - Based on Prisma Schema
enum ProductCategory {
  VEGETABLES = "VEGETABLES",
  FRUITS = "FRUITS",
  GRAINS = "GRAINS",
  TUBERS = "TUBERS",
  LEGUMES = "LEGUMES",
  HERBS_SPICES = "HERBS_SPICES",
}

enum ProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

interface Product {
  id: string // UUID
  unitPrice: number // Float
  unit: string // String
  createdAt: Date // DateTime
  bonus: number // Int
  createdBy: string // String (Admin ID)
  expiryDate?: Date // DateTime? (optional)
  images: string[] // String[]
  quantity: number // Float
  sku: string // String (unique)
  updatedAt: Date // DateTime
  category: ProductCategory // ProductCategory enum
  productName: string // String
  status: ProductStatus // ProductStatus enum (default ACTIVE)
}

// Sample products for design purposes - Using new schema structure
const featuredProducts: Product[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    productName: "Organic Tomatoes",
    unitPrice: 4.99,
    unit: "lb",
    category: ProductCategory.VEGETABLES,
    bonus: 0,
    sku: "TOM-ORG-001",
    quantity: 50.0,
    images: ["/images/FRAME.svg"],
    expiryDate: new Date("2025-08-15"),
    status: ProductStatus.ACTIVE,
    createdBy: "admin-001",
    createdAt: new Date("2025-08-01"),
    updatedAt: new Date("2025-08-07"),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    productName: "Fresh Asparagus",
    unitPrice: 6.49,
    unit: "bunch",
    category: ProductCategory.VEGETABLES,
    bonus: 5,
    sku: "ASP-FRS-002",
    quantity: 25.0,
    images: ["/images/FRAME1.svg"],
    expiryDate: new Date("2025-08-12"),
    status: ProductStatus.ACTIVE,
    createdBy: "admin-002",
    createdAt: new Date("2025-08-02"),
    updatedAt: new Date("2025-08-07"),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    productName: "Rainbow Carrots",
    unitPrice: 3.7,
    unit: "lb",
    category: ProductCategory.VEGETABLES,
    bonus: 10,
    sku: "CAR-RBW-003",
    quantity: 75.0,
    images: ["/images/FRAME2.svg"],
    expiryDate: new Date("2025-08-20"),
    status: ProductStatus.ACTIVE,
    createdBy: "admin-003",
    createdAt: new Date("2025-08-03"),
    updatedAt: new Date("2025-08-07"),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    productName: "Organic Spinach",
    unitPrice: 5.2,
    unit: "bag",
    category: ProductCategory.HERBS_SPICES,
    bonus: 0,
    sku: "SPN-ORG-004",
    quantity: 30.0,
    images: ["/images/FRAME3.svg"],
    expiryDate: new Date("2025-08-10"),
    status: ProductStatus.ACTIVE,
    createdBy: "admin-004",
    createdAt: new Date("2025-08-04"),
    updatedAt: new Date("2025-08-07"),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    productName: "Sweet Potatoes",
    unitPrice: 2.99,
    unit: "lb",
    category: ProductCategory.TUBERS,
    bonus: 8,
    sku: "SWT-POT-005",
    quantity: 40.0,
    images: ["/images/Tomatoes.svg"],
    expiryDate: new Date("2025-09-14"),
    status: ProductStatus.ACTIVE,
    createdBy: "admin-005",
    createdAt: new Date("2025-08-05"),
    updatedAt: new Date("2025-08-07"),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    productName: "Organic Quinoa",
    unitPrice: 8.99,
    unit: "lb",
    category: ProductCategory.GRAINS,
    bonus: 12,
    sku: "QUI-ORG-006",
    quantity: 20.0,
    images: ["/images/Salmon.svg"],
    expiryDate: new Date("2026-02-18"),
    status: ProductStatus.ACTIVE,
    createdBy: "admin-006",
    createdAt: new Date("2025-08-06"),
    updatedAt: new Date("2025-08-07"),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    productName: "Black Beans",
    unitPrice: 4.49,
    unit: "lb",
    category: ProductCategory.LEGUMES,
    bonus: 0,
    sku: "BLK-BEN-007",
    quantity: 60.0,
    images: ["/images/Ground_Beef.svg"],
    expiryDate: new Date("2026-01-15"),
    status: ProductStatus.ACTIVE,
    createdBy: "admin-007",
    createdAt: new Date("2025-08-07"),
    updatedAt: new Date("2025-08-07"),
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440008",
    productName: "Fresh Strawberries",
    unitPrice: 6.99,
    unit: "pint",
    category: ProductCategory.FRUITS,
    bonus: 15,
    sku: "STR-FRS-008",
    quantity: 35.0,
    images: ["/images/egges.svg"],
    expiryDate: new Date("2025-08-12"),
    status: ProductStatus.ACTIVE,
    createdBy: "admin-008",
    createdAt: new Date("2025-08-08"),
    updatedAt: new Date("2025-08-08"),
  },
]

// Helper Functions
const formatPrice = (price: number, unit: string): string => {
  return `$${price.toFixed(2)}/${unit}`
}

const getStockStatus = (quantity: number): "in-stock" | "low-stock" | "out-of-stock" => {
  if (quantity === 0) return "out-of-stock"
  if (quantity <= 10) return "low-stock"
  return "in-stock"
}

const formatQuantity = (quantity: number, unit: string): string => {
  // Handle decimal quantities properly
  const formattedQuantity = quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(1)
  return `${formattedQuantity} ${unit}${quantity !== 1 ? "s" : ""} available`
}

export default function FeaturedProducts() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleAddToCart = async (product: Product) => {
    try {
      // Advanced cart handling - would integrate with your backend
      console.log(`Adding ${product.productName} to cart`, {
        productId: product.id,
        sku: product.sku,
        unitPrice: product.unitPrice,
        category: product.category,
        quantity: 1,
      })

      // Future: API call to add to cart
      // await fetch('/api/cart/add', {
      //   method: 'POST',
      //   body: JSON.stringify({ productId: product.id, quantity: 1 })
      // })
    } catch (error) {
      console.error("Failed to add product to cart:", error)
    }
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -320, // Adjusted for better scrolling with card width + gap
        behavior: "smooth",
      })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 320, // Adjusted for better scrolling with card width + gap
        behavior: "smooth",
      })
    }
  }

  // Filter active products only
  const activeProducts = featuredProducts.filter((product) => product.status === ProductStatus.ACTIVE)

  return (
    <section className="relative z-10 px-8 py-16 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Featured Fresh Products</h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Explore our curated selection of seasonal produce from local farms
          </p>
        </div>

        {/* Horizontal Scrolling Products */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200 hover:scale-105"
            aria-label="Scroll products left"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200 hover:scale-105"
            aria-label="Scroll products right"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>

          {/* Scrollable Products Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide px-14 py-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {activeProducts.map((product) => {
              const stockStatus = getStockStatus(product.quantity)

              return (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-72 text-center relative bg-gray-50/50 p-6 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100/50"
                >
                  {/* Stock Status Indicator */}
                  {stockStatus === "low-stock" && (
                    <div className="absolute top-3 right-3 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">
                      Low Stock
                    </div>
                  )}

                  {/* Product Image */}
                  <div className="mb-6 mt-2">
                    <Image
                      src={product.images[0] || "/placeholder.svg?height=120&width=120&text=Product"}
                      alt={product.productName}
                      width={120}
                      height={120}
                      className="w-28 h-28 mx-auto object-cover rounded-xl shadow-sm"
                      priority={false}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 min-h-[3rem] leading-tight">
                      {product.productName}
                    </h3>

                    <div className="space-y-1">
                      <p className="text-xl font-bold text-gray-900">{formatPrice(product.unitPrice, product.unit)}</p>
                      <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                      <p
                        className={`text-sm font-medium ${
                          stockStatus === "in-stock"
                            ? "text-green-600"
                            : stockStatus === "low-stock"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {formatQuantity(product.quantity, product.unit)}
                      </p>
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.status !== ProductStatus.ACTIVE || product.quantity === 0}
                      className={`w-full px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        product.quantity === 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-orange-500 hover:bg-orange-600 text-white hover:shadow-md hover:scale-105"
                      }`}
                    >
                      {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Products Count Info */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">Showing {activeProducts.length} Resent product</p>
        </div>
      </div>
    </section>
  )
}
