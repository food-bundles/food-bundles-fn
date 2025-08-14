"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRef, useState } from "react"

interface Product {
  id: string
  unitPrice: number
  unit: string
  productName: string
  quantity: number
  images: string[]
  sku: string
  category: string
  status: string
}

interface FeaturedProductsData {
  title: string
  subtitle: string
  products: Product[]
}

interface FeaturedProductsProps {
  data: FeaturedProductsData
}

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
  const formattedQuantity = quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(1)
  return `${formattedQuantity} ${unit}${quantity !== 1 ? "s" : ""} available`
}

export default function FeaturedProducts({ data }: FeaturedProductsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Add error handling and fallbacks
  if (!data) {
    return (
      <section className="relative z-10 px-8 py-16 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500">Loading featured products...</p>
        </div>
      </section>
    )
  }

  if (!data.products || data.products.length === 0) {
    return (
      <section className="relative z-10 px-8 py-16 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{data.title || "Featured Products"}</h2>
          <p className="text-base text-gray-600">No products available at the moment.</p>
        </div>
      </section>
    )
  }

  const handleAddToCart = async (product: Product) => {
    try {
      console.log(`Adding ${product.productName} to cart`, {
        productId: product.id,
        sku: product.sku,
        unitPrice: product.unitPrice,
        category: product.category,
        quantity: 1,
      })
    } catch (error) {
      console.error("Failed to add product to cart:", error)
    }
  }

  // Filter active products only
  const activeProducts = data.products.filter((product) => product.status === "ACTIVE")

  // Handle mouse movement for scrolling
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const containerWidth = rect.width
    const scrollWidth = container.scrollWidth
    const maxScroll = scrollWidth - containerWidth

    // Calculate scroll position based on mouse position (0 to 1)
    const scrollRatio = mouseX / containerWidth
    const targetScroll = scrollRatio * maxScroll

    // Smooth scroll to target position
    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    })

    // Update current index for indicators
    const cardWidth = containerWidth / 2 // Since we show 2 cards at a time
    const newIndex = Math.floor(targetScroll / cardWidth)
    setCurrentIndex(Math.min(newIndex, activeProducts.length - 2))
  }

  // Reset scroll position when mouse leaves
  const handleMouseLeave = () => {
    const container = scrollContainerRef.current
    if (!container) return

    container.scrollTo({
      left: 0,
      behavior: "smooth",
    })
    setCurrentIndex(0)
  }

  return (
    <section className="relative z-10 px-8 py-16 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{data.title}</h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">{data.subtitle}</p>
        </div>

        {/* Two Products Display with Mouse Hover Scrolling */}
        <div className="relative">
          {/* Scrollable Products Container - Shows 2 products at a time */}
          <div
            ref={scrollContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="flex gap-8 overflow-x-auto scrollbar-hide px-8 py-4 cursor-pointer"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {activeProducts.map((product) => {
              const stockStatus = getStockStatus(product.quantity)

              return (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-[calc(50%-1rem)] min-w-[400px] relative bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100/50 overflow-hidden"
                >
                  {/* Stock Status Indicator */}
                  {stockStatus === "low-stock" && (
                    <div className="absolute top-4 right-4 z-10 bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full font-medium">
                      Low Stock
                    </div>
                  )}

                  {/* Full-size Product Image */}
                  <div className="relative h-80 w-full overflow-hidden">
                    <Image
                      src={product.images[0] || "/placeholder.svg?height=320&width=400&text=Product"}
                      alt={product.productName}
                      fill
                      className="object-cover transition-all duration-300 hover:scale-105"
                      priority={false}
                    />

                    {/* Gradient overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

                    {/* Category badge on image */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
                      {product.category}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight">
                        {product.productName}
                      </h3>
                      <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatPrice(product.unitPrice, product.unit)}
                        </p>
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
                        disabled={product.status !== "ACTIVE" || product.quantity === 0}
                        className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                          product.quantity === 0
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 text-white hover:shadow-md hover:scale-105"
                        }`}
                      >
                        {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

        </div>

        {/* Products Count Info with Active Indicators */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Showing {Math.min(2, activeProducts.length)} of {activeProducts.length} featured products
          </p>
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: Math.ceil(activeProducts.length / 2) }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  Math.floor(currentIndex / 2) === index ? "bg-green-500" : "bg-gray-300"
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
