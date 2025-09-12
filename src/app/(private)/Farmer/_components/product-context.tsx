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
  const [products, setProducts] = useState<Product[]>([
    // {
    //   id: "1",
    //   name: "Organic Apples",
    //   category: "Fruits",
    //   quantity: "25 ,
    //   submittedDate: "2024-01-15",
    //   price: "RWF 45.50",
    //   status: "Pending",
    //   statusColor: "bg-yellow-100 text-yellow-800",
    //   image: "/imgs/tomatoes.svg",
    //   location: "Kigali, Rwanda",
    //   priceValue: 45.5,
    // },
    // {
    //   id: "2",
    //   name: "Fresh Carrots",
    //   category: "Vegetables",
    //   quantity: 18 ,
    //   submittedDate: "2024-01-14",
    //   price: "RWF 32.75",
    //   status: "Approved",
    //   statusColor: "bg-green-100 text-green-800",
    //   image: "/imgs/carrots.svg",
    //   location: "Musanze, Rwanda",
    //   priceValue: 32.75,
    // },
    // {
    //   id: "3",
    //   name: "Heirloom Tomatoes",
    //   category: "Vegetables",
    //   quantity: 15,
    //   submittedDate: "2024-01-12",
    //   price: "RWF 38.25",
    //   status: "Paid",
    //   statusColor: "bg-purple-100 text-purple-800",
    //   image: "/imgs/tomatoes.svg",
    //   location: "Huye, Rwanda",
    //   priceValue: 38.25,
    //   paidDate: "2024-01-18",
    // },
    // {
    //   id: "4",
    //   name: "Organic Spinach",
    //   category: "Vegetables",
    //   quantity: "12 kg",
    //   submittedDate: "2024-01-10",
    //   price: "RWF 28.00",
    //   status: "Paid",
    //   statusColor: "bg-purple-100 text-purple-800",
    //   image: "/imgs/spinach.svg",
    //   location: "Nyagatare, Rwanda",
    //   priceValue: 28.0,
    //   paidDate: "2024-01-16",
    // },
    // {
    //   id: "5",
    //   name: "Fresh Lettuce",
    //   category: "Vegetables",
    //   quantity: "20 kg",
    //   submittedDate: "2024-01-08",
    //   price: "RWF 22.50",
    //   status: "Approved",
    //   statusColor: "bg-green-100 text-green-800",
    //   image: "/imgs/spinach.svg",
    //   location: "Rubavu, Rwanda",
    //   priceValue: 22.5,
    // },
    // {
    //   id: "6",
    //   name: "Organic Potatoes",
    //   category: "Tubers",
    //   quantity: "30 kg",
    //   submittedDate: "2024-01-05",
    //   price: "RWF 55.00",
    //   status: "Paid",
    //   statusColor: "bg-purple-100 text-purple-800",
    //   image: "/imgs/tomatoes.svg",
    //   location: "Muhanga, Rwanda",
    //   priceValue: 55.0,
    //   paidDate: "2024-01-12",
    // },
    // {
    //   id: "7",
    //   name: "Fresh Beans",
    //   category: "Legumes",
    //   quantity: "22 kg",
    //   submittedDate: "2024-01-03",
    //   price: "RWF 42.75",
    //   status: "Approved",
    //   statusColor: "bg-green-100 text-green-800",
    //   image: "/imgs/carrots.svg",
    //   location: "Kayonza, Rwanda",
    //   priceValue: 42.75,
    // },
  ])

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
