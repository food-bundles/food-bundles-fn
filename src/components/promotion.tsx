"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState } from "react"
import { ArrowRight } from "lucide-react"

interface PromotionProduct {
  id: string
  productName: string
  description: string
  unitPrice: number
  originalPrice: number
  discountPercentage: number
  unit: string
  quantity: number
  images: string[]
  farmName: string
  category: string
  sku: string
}

interface PromotionsData {
  title: string
  products: PromotionProduct[]
}

interface PromotionsProps {
  data: PromotionsData
}

export default function Promotions({ data }: PromotionsProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Use the first two products from the data
  const promotionProducts = data.products.slice(0, 2)
  const currentProduct = isHovered ? promotionProducts[1] : promotionProducts[0]

  const handleAddToCart = () => {
    console.log(`Adding ${currentProduct.productName} (promotion) to cart`)
    // Implement actual add to cart logic here
  }

  if (!currentProduct) {
    return null
  }

  return (
    <section className="relative z-10 px-8 py-16 bg-gray-60">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
            {data.title}
            <span className="block w-24 h-1 bg-orange-500 mx-auto mt-2 text-black rounded-full"></span>
          </h2>
        </div>

        {/* Promotion Banner */}
        <div
          className="relative bg-gradient-to-r from-gray-500 to-gray-600 rounded-[5px] p-8 lg:p-12 overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-500 to-transparent rounded-full transform translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-green-500 to-transparent rounded-full transform -translate-x-16 translate-y-16"></div>
          </div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-green-300 text-sm font-medium uppercase tracking-wide">For a limited time only</p>
                <h3 className="text-3xl lg:text-4xl font-bold text-white leading-tight transition-all duration-300">
                  {currentProduct.productName}
                </h3>
                <p className="text-gray-300 text-base leading-relaxed transition-all duration-300">
                  {currentProduct.description}
                </p>
                <p className="text-green-400 text-sm font-medium">From {currentProduct.farmName}</p>
              </div>

              {/* Price and Discount */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 line-through text-lg">${currentProduct.originalPrice.toFixed(2)}</span>
                  <span className="text-2xl font-bold text-white">
                    ${currentProduct.unitPrice.toFixed(2)}/{currentProduct.unit}
                  </span>
                </div>
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  -{currentProduct.discountPercentage}% OFF
                </div>
              </div>

              {/* Buy Now Button */}
              <Button
                onClick={handleAddToCart}
                className="bg-green-400 hover:bg-green-600 text-white px-8 py-3 rounded-full font-semibold text-base flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Buy Now
                <ArrowRight className="w-4 h-4" />
              </Button>

              {/* Additional Info */}
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>
                    {currentProduct.quantity} {currentProduct.unit}s available
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Expires soon</span>
                </div>
              </div>
            </div>

            {/* Right Content - Product Image */}
            <div className="relative flex justify-center lg:justify-end">
              {/* Price Badge */}
              <div className="absolute  right-3 z-15">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-orange-500">
                  <div className="text-center">
                    <div className="text-xs text-gray-600 font-medium">FROM</div>
                    <div className="text-lg font-bold text-gray-900">${currentProduct.unitPrice.toFixed(0)}</div>
                  </div>
                </div>
              </div>

              {/* Product Image Container */}
              <div className="relative">
                {/* Background Circle */}
                {/* <div className="absolute inset-0 w-80 h-80 bg-gradient-to-br from-white/10 to-white/5 rounded-full transform rotate-12 transition-all duration-500"></div> */}

                {/* Product Image */}
                <div className="relative z-10 w-72 h-72 flex items-center justify-center transition-all duration-500 transform hover:scale-105">
                  <Image
                    src={currentProduct.images[0] || "/placeholder.svg?height=200&width=200&text=Product"}
                    alt={currentProduct.productName}
                    width={200}
                    height={200}
                    className="w-108 h-70 object-cover rounded-2xl shadow-2xl transition-all duration-500 p-r-20"
                    priority={false}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Hover Indicator */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${!isHovered ? "bg-orange-500" : "bg-gray-500"}`}
              ></div>
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${isHovered ? "bg-orange-500" : "bg-gray-500"}`}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
