"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface Product {
  id: string
  submissionId?: string // ID of the submission this product belongs to
  name: string
  category: string
  quantity: string 
  unit?: string // Optional unit of measurement
  submittedDate: string
  price: string
  status: string
  statusColor: string
  image: string
  location: string
  priceValue: number // For calculations
  paidDate?: string // When the product was paid for
}

interface ProductContextType {
  products: Product[]
  addProduct: (product: Product) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  getMonthlyStats: () => {
    totalProductsThisMonth: number
    approvedProductsThisMonth: number
    pendingProductsThisMonth: number
    paidProductsThisMonth: number
    revenueThisMonth: number
    paidRevenueThisMonth: number
  }
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([ ])

  const addProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev])
  }

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((product) => (product.id === id ? { ...product, ...updates } : product)))
  }

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id))
  }

  const getMonthlyStats = () => {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    // Filter products from current month
    const thisMonthProducts = products.filter((product) => {
      const productDate = new Date(product.submittedDate)
      return productDate.getMonth() === currentMonth && productDate.getFullYear() === currentYear
    })

    // Filter paid products from current month (by paid date)
    const thisMonthPaidProducts = products.filter((product) => {
      if (!product.paidDate) return false
      const paidDate = new Date(product.paidDate)
      return paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear
    })

    const totalProductsThisMonth = thisMonthProducts.length
    const approvedProductsThisMonth = thisMonthProducts.filter((p) => p.status === "Approved").length
    const pendingProductsThisMonth = thisMonthProducts.filter((p) => p.status === "Pending").length
    const paidProductsThisMonth = thisMonthPaidProducts.length

    // Revenue from approved products this month
    const revenueThisMonth = thisMonthProducts
      .filter((p) => p.status === "Approved")
      .reduce((total, product) => total + product.priceValue, 0)

    // Revenue from paid products this month
    const paidRevenueThisMonth = thisMonthPaidProducts.reduce((total, product) => total + product.priceValue, 0)

    return {
      totalProductsThisMonth,
      approvedProductsThisMonth,
      pendingProductsThisMonth,
      paidProductsThisMonth,
      revenueThisMonth,
      paidRevenueThisMonth,
    }
  }

  return (
    <ProductContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getMonthlyStats,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider")
  }
  return context
}
