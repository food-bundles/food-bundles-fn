/* eslint-disable @typescript-eslint/no-unused-vars */

import { ProductSubmissionData } from "../(private)/farmers/_components/product-submission-modal"
import createAxiosClient from "../hooks/axiosClient"

export interface CreatProductSubmissionData {
  productName: string
  category: string
  quantity: number
  unit: string
  wishedPrice: number
  province?: string
  district?: string
  sector?: string
  cell?: string
  village?: string
}

export interface SubmissionStats {
  totalSubmissions: number
  pendingSubmissions: number
  approvedSubmissions: number
  rejectedSubmissions: number
  totalEarnings: number
}

export interface Submission {
  id: string
  productName: string
  submittedQty: number
  unit: string
  wishedPrice: number
  status: "PENDING" | "VERIFIED" | "APPROVED" | "REJECTED"
  createdAt: string
  updatedAt: string
  farmerId: string
  village: string,
  cell:  string,
  sector: string,
  district: string,
  province: string
  category: {
    id: string
    name: string
    description?: string
    submittedAt: string
  }
  submittedAt: string
}


export interface CategoryResponse {
  categories: string[]
}

export interface ProductSuggestionResponse {
  suggestions: string[]
}

export interface Product {
  id: string
  productName: string
  category: {
    id: string
    name: string
    description?: string
  }
  unitPrice: number
  unit: string
}

export interface ProductsResponse {
  products: Product[]
}

export interface FarmerProfile {
  id: string
  phone: string
  email: string
  province?: string
  district?: string
  sector?: string
  cell?: string
  village?: string
}

export interface Category {
  id: string
  name: string
  description?: string
}

export interface Category {
  id: string
  name: string
  description?: string
}

// service class
export const productSubmissionService = {
  getFarmerLocation: async (Id: string): Promise<FarmerProfile | null> => {
    try {
      // Validate ID before making request
      if (!Id || Id === "null" || Id === "undefined" || Id === "current") {
        return null
      }

      const axiosClient = createAxiosClient()
      const response = await axiosClient.get<FarmerProfile>(`/farmers/${Id}`)
      return response.data
      } catch (error) {
      if (error instanceof Error) {
        console.error("Error message:", error.message)
      }
      return null
    }
  },

  getCurrentFarmerProfile: async (Id?: string): Promise<FarmerProfile | null> => {
    try {
      const axiosClient = createAxiosClient()

      // Get the actual farmer ID from localStorage or authentication
      let farmerId: string | null | undefined = Id

      if (!farmerId || farmerId === "current") {
        // Try to get the real farmer ID from localStorage
        farmerId =
          localStorage.getItem("farmerId") || localStorage.getItem("userId") || sessionStorage.getItem("farmerId")

        if (!farmerId || farmerId === "null" || farmerId === "undefined") {
          return null
        }
      }


      const response = await axiosClient.get<FarmerProfile>(`/farmers/${farmerId}`)
      return response.data
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error message:", error.message)
      }

      return null
    }
  },


  fetchCategories: async (): Promise<Category[]> => {
    try {
      const axiosClient = createAxiosClient()
      const response = await axiosClient.get<Category[]>("/category")
      return response.data
        } catch (error) {
      if (error instanceof Error) {
        console.error("Error message:", error.message)
      }

      throw new Error("Failed to load categories. Please check your connection and try again.")
    }
  },

  fetchActiveCategories: async (): Promise<Category[]> => {
    try {
      const axiosClient = createAxiosClient()
      const response = await axiosClient.get<{ success: boolean; data: Category[] }>("/category/active")
      return response.data.data || response.data
     } catch (error) {
      if (error instanceof Error) {
        console.error("Error message:", error.message)
      }
      throw new Error("Failed to load active categories. Please try again later.")
    }
  },

  fetchCategoryById: async (categoryId: string): Promise<Category | null> => {
    try {
      const axiosClient = createAxiosClient()
      const response = await axiosClient.get<Category>(`/category/${categoryId}`)

      

      return response.data
    } catch (error) {
      return null
    }
  },

  // Get products by specific category
  getProductsByCategory: async (categoryId: string): Promise<string[]> => {
  try {
    const axiosClient = createAxiosClient()
    const response = await axiosClient.get<{
      message: string
      data: {
        id: string
        name: string
        products: Product[]
      }
    }>(`/category/${categoryId}`)

    const products = response.data.data.products || []
    const productNames = products.map((product: Product) => product.productName)
    return [...new Set(productNames)] // Remove duplicates
  } catch (error) {
    console.error(`Failed to fetch products for category ${categoryId}:`, error)
    return []
  }
},
  getAllProducts: async (category?: string): Promise<Product[]> => {
    try {
      const axiosClient = createAxiosClient()
      let url = "/products?page=1&limit=100"
      if (category) {
        url += `&category=${encodeURIComponent(category)}`
      }

      const response = await axiosClient.get(url)
      
      // Handle different response structures
      if (response.data?.data) {
        return response.data.data
      } else if (Array.isArray(response.data)) {
        return response.data
      } else {
        console.warn("Unexpected response structure:", response.data)
        return []
      }
    } catch (error) {
      console.error("Failed to fetch all products from database:", error)
      return []
    }
  },


  // Get product details if it exists
  getProductDetails: async (productName: string, categoryName: string): Promise<Product | null> => {
    try {
      console.log("[getProductDetails] Searching for product:", productName, "in category:", categoryName)
      const axiosClient = createAxiosClient()
      
      // First try to get all products and filter by name and category
      console.log("[getProductDetails] Fetching all products...")
      const allProducts = await productSubmissionService.getAllProducts()
      console.log("[getProductDetails] All products:", allProducts)
      
      // Find product by name and category
      const matchingProduct = allProducts.find(product => {
        const nameMatch = product.productName.toLowerCase() === productName.toLowerCase()
        const categoryMatch = product.category.name.toLowerCase() === categoryName.toLowerCase()
        console.log("[getProductDetails] Checking product:", product.productName, "category:", product.category.name, "nameMatch:", nameMatch, "categoryMatch:", categoryMatch)
        return nameMatch && categoryMatch
      })
      
      console.log("[getProductDetails] Matching product from all products:", matchingProduct)
      
      if (matchingProduct) {
        return matchingProduct
      }
      
      // Fallback: try the search endpoint
      console.log("[getProductDetails] Trying search endpoint...")
      const response = await axiosClient.get<Product[]>(
        `/products/search?name=${encodeURIComponent(productName)}&category=${encodeURIComponent(categoryName)}`,
      )
      
      console.log("[getProductDetails] Search response:", response.data)

      return response.data.length > 0 ? response.data[0] : null
    } catch (error) {
      console.error("[getProductDetails] Failed to get product details:", error)
      return null
    }
  },

  submitProduct: async (data: ProductSubmissionData): Promise<ProductSubmissionData> => {
  try {
    console.log("[submitProduct] Starting submission with data:", data)
    const axiosClient = createAxiosClient()

    // Get product details to find the product ID
    console.log("[submitProduct] Looking for product:", data.productName, "in category:", data.category)
    const existingProduct = await productSubmissionService.getProductDetails(
      data.productName,
      data.category
    )
    
    console.log("[submitProduct] Found product:", existingProduct)

    if (!existingProduct) {
      throw new Error("Product not found. Please select a valid product from the list.")
    }

    const submissionPayload = {
      quantity: data.quantity,
      wishedPrice: data.wishedPrice,
      province: data.province,
      district: data.district,
      sector: data.sector,
      cell: data.cell,
      village: data.village,
    }
    
    console.log("[submitProduct] Submitting to URL:", `/farmers/submit-product/${existingProduct.id}`)
    console.log("[submitProduct] Payload:", submissionPayload)

    const response = await axiosClient.post(
      `/farmers/submit-product/${existingProduct.id}`,
      submissionPayload,
      { headers: { "Content-Type": "application/json" } }
    )
    
    console.log("[submitProduct] Response:", response.data)

    return response.data
     } catch (error) {
      console.error("[submitProduct] Error:", error)
      if (error instanceof Error) {
        console.error("[submitProduct] Error message:", error.message)
      }
    throw error
  }
},

  // Get farmer's submission history
  getSubmissionHistory: async (): Promise<Submission[]> => {
    try {
      const axiosClient = createAxiosClient()
      const response = await axiosClient.get("/submissions")
      return response.data.data // ✅ make sure it’s always an array
  } catch (error) {
    console.error("Failed to fetch submissions:", error)
    return [] 
  }
   
  },

  // Get submission statistics
  getSubmissionStats: async (farmerId?: string): Promise<SubmissionStats> => {
    try {
      const axiosClient = createAxiosClient()

      let url: string
      if (farmerId && farmerId !== "current") {
        url = `/farmers/${farmerId}/submission-stats`
      } else {
        // For current user, try to get their actual farmer ID
        const currentProfile = await productSubmissionService.getCurrentFarmerProfile()
        if (currentProfile) {
          url = `/farmers/${currentProfile.id}/submission-stats`
        } else {
          // Fallback to a generic endpoint if it exists
          url = "/submissions/stats"
        }
      }

      const response = await axiosClient.get<SubmissionStats>(url)
      return response.data
    } catch (error) {
      console.error("Failed to fetch submission stats:", error)
      return {
        totalSubmissions: 0,
        pendingSubmissions: 0,
        approvedSubmissions: 0,
        rejectedSubmissions: 0,
        totalEarnings: 0,
      }
    }
  },

  // Cancel/withdraw a pending submission
 updateSubmissionQuantity: async (submissionId: string, productId: string, quantity: number): Promise<boolean> => {
  try {
    const axiosClient = createAxiosClient()
    
    await axiosClient.put(`/submissions/${submissionId}/products/${productId}/update-quantity`, {
      quantity: quantity
    })
    
    return true
  } catch (error) {
    console.error("Failed to update submission quantity:", error)
    return false
  }
},

  // Check authentication status
  checkAuthStatus: async (): Promise<boolean> => {
    try {
      const axiosClient = createAxiosClient()
      const response = await axiosClient.get("/auth/verify")
      return response.status === 200
    } catch (error) {
      console.error("Authentication check failed:", error)
      return false
    }
  },

  // Debug function to help troubleshoot issues
  debugApiEndpoints: async () => {
    const axiosClient = createAxiosClient()

    // Test authentication endpoints
    const endpointsToTest = ["/auth/verify", "/locations", "/category"]

    for (const endpoint of endpointsToTest) {
      try {
        const response = await axiosClient.get(endpoint)
          } catch (error) {
      if (error instanceof Error) {
        console.error("Error message:", error.message)
      }
      }
    }

    // Check localStorage contents
    const keys = ["farmerId", "userId", "token", "authToken", "user", "farmer"]
    keys.forEach((key) => {
      const value = localStorage.getItem(key)
    })

    // Test farmer profile endpoint if we have an ID
   const farmerId =localStorage.getItem("farmerId") || localStorage.getItem("userId") || sessionStorage.getItem("farmerId")
   
    if (farmerId && farmerId !== "null" && farmerId !== "undefined") {
      try {
        const response = await axiosClient.get(`/farmers/${farmerId}`)
        console.log("Farmer profile data:", response.data)
          } catch (error) {
      if (error instanceof Error) {
        console.error("Error message:", error.message)
      }
      }
    } 
  },

 
}
