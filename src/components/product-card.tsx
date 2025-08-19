"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"

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

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  isLoading?: boolean
  compact?: boolean
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

export default function ProductCard({ product, onAddToCart, isLoading = false, compact = false }: ProductCardProps) {
  const stockStatus = getStockStatus(product.quantity)

  return (
    <div
      className={`
      flex-shrink-0 text-center relative bg-gray-50/50 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100/50
      ${compact ? "w-64 p-4" : "w-72 p-6"}
    `}
    >
      {/* Stock Status Indicator */}
      {stockStatus === "low-stock" && (
        <div className="absolute top-3 right-3 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">
          Low Stock
        </div>
      )}

      {/* Product Image */}
      <div className={`mb-6 mt-2`}>
        <Image
          src={product.images[0] || "/placeholder.svg?height=120&width=120&text=Product"}
          alt={product.productName}
          width={compact ? 96 : 120}
          height={compact ? 96 : 120}
          className={`mx-auto object-cover rounded-xl shadow-sm ${compact ? "w-24 h-24" : "w-28 h-28"}`}
          priority={false}
        />
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <h3
          className={`font-bold text-gray-900 line-clamp-2 leading-tight ${compact ? "text-base min-h-[2.5rem]" : "text-lg min-h-[3rem]"}`}
        >
          {product.productName}
        </h3>

        <div className="space-y-1">
          <p className={`font-bold text-gray-900 ${compact ? "text-lg" : "text-xl"}`}>
            {formatPrice(product.unitPrice, product.unit)}
          </p>
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
          onClick={() => onAddToCart(product)}
          disabled={isLoading || product.status !== ProductStatus.ACTIVE || product.quantity === 0}
          className={`w-full rounded-xl font-semibold text-sm transition-all duration-200 ${
            compact ? "px-4 py-2" : "px-6 py-3"
          } ${
            product.quantity === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600 text-white hover:shadow-md hover:scale-105"
          }`}
        >
          {isLoading ? "Adding..." : product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </div>
  )
}
