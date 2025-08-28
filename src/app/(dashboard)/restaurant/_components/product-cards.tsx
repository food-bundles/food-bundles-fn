"use client"

import type React from "react"

import { useState, useRef} from "react"
import Image from "next/image"
import { Star} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cartService } from "@/app/services/cartService"

type Product = {
  id: string
  productName: string
  unitPrice: number
  unit: string
  bonus: number
  createdBy: string
  expiryDate: Date | null
  images: string[]
  quantity: number
  sku: string
  category: string
  rating?: number
  soldCount?: number
  status: string
}

type Props = {
  product: Product
}

export function ProductCard({ product }: Props) {
  const [showQuantityInput, setShowQuantityInput] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAddToCart = async () => {
    // console.log("testing =================== ")
    if (!showQuantityInput) {
      setShowQuantityInput(true)
    } else {
      setIsAddingToCart(true)

      try {
        const result = await cartService.addToCart(product.id, quantity)

        if (result.success) {
          console.log(`Successfully added ${quantity} ${product.unit} of ${product.productName} to cart`)
          setShowQuantityInput(false)
          setQuantity(1)
        } else {
          console.error(`Failed to add to cart: ${result.message}`)
        }
      } catch (error) {
        console.error(`Error adding to cart:`, error)
      } finally {
        setIsAddingToCart(false)
      }
    }
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 1
    setQuantity(Math.max(1, Math.min(value, product.quantity)))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault()
      setQuantity((prev) => Math.min(prev + 1, product.quantity))
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      setQuantity((prev) => Math.max(1, prev - 1))
    } else if (e.key === "Enter") {
      handleAddToCart()
    }
  }

  const getCategoryBadge = (category: string) => {
    const badges = {
      VEGETABLES: { label: "Organic", color: "bg-green-100 text-green-600" },
      FRUITS: { label: "Fresh", color: "bg-orange-100 text-orange-600" },
      GRAINS: { label: "Artisan", color: "bg-amber-100 text-amber-600" },
      TUBERS: { label: "Farm Fresh", color: "bg-yellow-100 text-yellow-600" },
      LEGUMES: { label: "Organic", color: "bg-green-100 text-green-600" },
      HERBS_SPICES: {
        label: "Premium",
        color: "bg-purple-100 text-purple-600",
      },
      ANIMAL_PRODUCTS: {
        label: "Fresh",
        color: "bg-red-100 text-red-600",
      },
      OTHER: { label: "Quality", color: "bg-gray-100 text-gray-600" },
    }
    return (
      badges[category as keyof typeof badges] || {
        label: "Fresh",
        color: "bg-blue-100 text-blue-600",
      }
    )
  }

  const categoryBadge = getCategoryBadge(product.category)

  return (
    <Card className="w-full max-w-sm bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden py-0">
      <CardContent className="p-0">
        <div className="relative">
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.productName}
            width={300}
            height={200}
            className="w-full h-48 object-cover"
          />
          {product.bonus > 0 && (
            <div className="absolute top-3 right-3 bg-red-500 text-white text-sm font-semibold px-2 py-1 rounded">
              -{product.bonus}%
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Badge className={`text-xs font-medium ${categoryBadge.color} border-0`}>
              <span className="w-2 h-2 bg-current rounded-full mr-1"></span>
              {categoryBadge.label}
            </Badge>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 leading-tight">{product.productName}</h3>

          {(product.rating || product.soldCount) && (
            <div className="flex items-center justify-between">
              {product.rating && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating!) ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">({product.rating})</span>
                </div>
              )}

              {product.soldCount && product.soldCount > 0 && (
                <Badge className="bg-orange-100 text-orange-600 text-xs font-medium border-0">
                  {product.soldCount.toLocaleString()} sold
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Stock: {product.quantity.toLocaleString()} {product.unit}
            </span>
            <Badge
              className={`text-xs font-medium border-0 ${
                product.status === "ACTIVE" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
              }`}
            >
              {product.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xl font-bold text-gray-900">
              {product.unitPrice.toLocaleString()} RWF/{product.unit}
            </div>
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="number"
                  min="1"
                  max={product.quantity}
                  value={quantity}
                  onChange={handleQuantityChange}
                  onKeyDown={handleKeyDown}
                  onBlur={() => {
                    setShowQuantityInput(false)
                  }}
                  disabled={isAddingToCart}
                  className="w-16 h-8 text-center text-lg font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              />
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {isAddingToCart ? "Adding..." : "Buy Now"}
                </Button>
              </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
