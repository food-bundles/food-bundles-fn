import { ProductSubmissionData } from "../(private)/Farmer/_components/product-submission-modal"
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

export interface LocationHierarchy {
  provinces: string[]
  districts: { [province: string]: string[] }
  sectors: { [district: string]: string[] }
  cells: { [sector: string]: string[] }
  villages: { [cell: string]: string[] }
}

export interface LocationResponse {
  success: boolean
  data: LocationHierarchy
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
  category: string
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
        console.error("Invalid farmer ID provided:", Id)
        return null
      }

      const axiosClient = createAxiosClient()
      const response = await axiosClient.get<FarmerProfile>(`/farmers/${Id}`)
      return response.data
    } catch (error: any) {
      console.error("Failed to fetch farmer location:", error)

      if (error?.response?.status === 404) {
        console.error("Farmer not found with ID:", Id)
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
          console.error("No valid farmer ID found in storage")
          return null
        }
      }

      console.log("Fetching farmer profile for ID:", farmerId)

      const response = await axiosClient.get<FarmerProfile>(`/farmers/${farmerId}`)
      return response.data
    } catch (error: any) {
      console.error("Failed to fetch current farmer profile:", error)

      // Log more details for debugging
      if (error.response) {
        console.error("Response status:", error.response.status)
        console.error("Response data:", error.response.data)
        console.error("Request URL:", error.config?.url)

        if (error.response.status === 404) {
          console.error("Farmer profile not found - check if farmer ID is correct")
        } else if (error.response.status === 401) {
          console.error("Authentication failed - user may need to log in again")
        }
      }

      return null
    }
  },

  fetchUserLocations: async (): Promise<string[]> => {
    try {
      const axiosClient = createAxiosClient()
      const response = await axiosClient.get<LocationResponse>("/locations")
      return response.data.data.provinces
    } catch (error) {
      console.error("Failed to fetch locations from database:", error)
      throw new Error("Failed to load locations. Please try again later.")
    }
  },

  fetchCategories: async (): Promise<Category[]> => {
    try {
      const axiosClient = createAxiosClient()
      const response = await axiosClient.get<Category[]>("/category")
      return response.data
    } catch (error: any) {
      console.error("Failed to fetch categories from database:", error)

      // Log specific error details for debugging
      if (error.response) {
        console.error("Response status:", error.response.status)
        console.error("Response data:", error.response.data)
      }

      throw new Error("Failed to load categories. Please check your connection and try again.")
    }
  },

  fetchActiveCategories: async (): Promise<Category[]> => {
    try {
      const axiosClient = createAxiosClient()
      const response = await axiosClient.get<{ success: boolean; data: Category[] }>("/category/active")
      return response.data.data || response.data
    } catch (error: any) {
      console.error("Failed to fetch active categories from database:", error)
      throw new Error("Failed to load active categories. Please try again later.")
    }
  },

  fetchCategoryById: async (categoryId: string): Promise<Category | null> => {
    try {
      const axiosClient = createAxiosClient()
      const response = await axiosClient.get<Category>(`/category/${categoryId}`)

      console.log("Fetched category:", response.data);
      

      return response.data
    } catch (error) {
      console.error("Failed to fetch category from database:", error)
      return null
    }
  },

  // Get products by specific category
  getProductsByCategory: async (categoryId: string): Promise<string[]> => {
    try {
      const axiosClient = createAxiosClient()
      const response = await axiosClient.get<{ success: boolean; data: Product[] }>(`/category/${categoryId}`)

      const products = response.data.data || response.data
      // Return unique product names for the category
      const productNames = products.map((product) => product.productName)
      return [...new Set(productNames)] // Remove duplicates
    } catch (error) {
      console.error(`Failed to fetch products for category ${categoryId}:`, error)
      return []
    }
  },

  // Get all products from a category name (not ID)
  getProductsByCategoryName: async (categoryName: string): Promise<string[]> => {
    try {
      const axiosClient = createAxiosClient()

      // First, try to get the category ID from the category name
      const categories = await productSubmissionService.fetchCategories()
      const category = categories.find((cat) => cat.name === categoryName)

      if (!category) {
        throw new Error(`Category not found: ${categoryName}`)
      }

      // Use the category ID endpoint instead of query parameter
      const response = await axiosClient.get<Product[]>(`/category/${category.id}`)

      // Return unique product names for the category
      const productNames = response.data.map((product) => product.productName)
      return [...new Set(productNames)] // Remove duplicates
    } catch (error: any) {
      console.error(`Failed to fetch products for category ${categoryName}:`, error)

      if (error.response) {
        console.error("Response status:", error.response.status)
        console.error("Response data:", error.response.data)
        console.error("Response headers:", error.response.headers)
      } else if (error.request) {
        console.error("No response received:", error.request)
      } else {
        console.error("Error setting up request:", error.message)
      }

      throw new Error(`Failed to load products for category ${categoryName}. Please try again later.`)
    }
  },

  getAllProducts: async (category?: string): Promise<Product[]> => {
    try {
      const axiosClient = createAxiosClient()
      let url = "/products"
      if (category) {
        url += `?category=${encodeURIComponent(category)}`
      }

      const response = await axiosClient.get<Product[]>(url)
      return response.data
    } catch (error) {
      console.error("Failed to fetch all products from database:", error)
      return []
    }
  },

  // Check if a product exists in the database
  checkProductExists: async (productName: string, categoryName: string): Promise<boolean> => {
    try {
      const categoryProducts = await productSubmissionService.getProductsByCategoryName(categoryName)
      return categoryProducts.some((name) => name.toLowerCase() === productName.toLowerCase())
    } catch (error) {
      console.error("Failed to check if product exists:", error)
      return false
    }
  },

  // Get product details if it exists
  getProductDetails: async (productName: string, category: string): Promise<Product | null> => {
    try {
      const axiosClient = createAxiosClient()
      const response = await axiosClient.get<Product[]>(
        `/products/search?name=${encodeURIComponent(productName)}&category=${encodeURIComponent(category)}`,
      )

      return response.data.length > 0 ? response.data[0] : null
    } catch (error) {
      console.error("Failed to get product details:", error)
      return null
    }
  },

  submitProduct: async (data: ProductSubmissionData): Promise<any> => {
    try {
      const axiosClient = createAxiosClient()

      // First, try to get or create the product
      let productId: string

      try {
        // Check if product exists
        const existingProduct = await productSubmissionService.getProductDetails(data.productName, data.category)

        if (existingProduct) {
          productId = existingProduct.id
        } else {
          // If product doesn't exist, you might need to create it first
          throw new Error(
            "Product not found. Please select from existing products or contact support to add new products.",
          )
        }
      } catch (productError) {
        console.error("Error getting product ID:", productError)
        throw new Error("Unable to submit product. Please try again or contact support.")
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

      // Use the correct endpoint with productId
      const response = await axiosClient.post(`/farmers/submit-product/${productId}`, submissionPayload, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      return response.data
    } catch (error: any) {
      console.error("Failed to submit product:", error)
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

    console.log("=== API Debug Information ===")
    console.log("Base URL:", axiosClient.defaults.baseURL)
    console.log("Headers:", axiosClient.defaults.headers)

    // Test authentication endpoints
    const endpointsToTest = ["/auth/verify", "/locations", "/category"]

    for (const endpoint of endpointsToTest) {
      try {
        const response = await axiosClient.get(endpoint)
        console.log(`${endpoint} - Status: ${response.status}`)
      } catch (error: any) {
        console.log(` ${endpoint} - Status: ${error?.response?.status || "Network Error"}`)
      }
    }

    // Check localStorage contents
    console.log("=== Local Storage Contents ===")
    const keys = ["farmerId", "userId", "token", "authToken", "user", "farmer"]
    keys.forEach((key) => {
      const value = localStorage.getItem(key)
      console.log(`${key}:`, value ? (key.includes("token") ? "Present" : value) : "Missing")
    })

    // Test farmer profile endpoint if we have an ID
   const farmerId =localStorage.getItem("farmerId") || localStorage.getItem("userId") || sessionStorage.getItem("farmerId")
   
    if (farmerId && farmerId !== "null" && farmerId !== "undefined") {
      try {
        const response = await axiosClient.get(`/farmers/${farmerId}`)
        console.log(`/farmers/${farmerId} - Status: ${response.status}`)
        console.log("Farmer profile data:", response.data)
      } catch (error: any) {
        console.log(` /farmers/${farmerId} - Status: ${error?.response?.status || "Network Error"}`)
        if (error?.response?.data) {
          console.log("Error details:", error.response.data)
        }
      }
    } else {
      console.log("⚠️ No valid farmer ID found in localStorage")
    }
  },

  fetchLocationHierarchy: async (): Promise<LocationHierarchy> => {
    try {
      const axiosClient = createAxiosClient()
      const response = await axiosClient.get<LocationResponse>("/locations/hierarchy")
      return response.data.data
    } catch (error) {
      console.error("Failed to fetch location hierarchy:", error)
      // Return Rwanda's basic administrative structure as fallback
      return {
        provinces: ["Kigali City", "Eastern Province", "Northern Province", "Southern Province", "Western Province"],
        districts: {},
        sectors: {},
        cells: {},
        villages: {},
      }
    }
  },

  getDistrictsByProvince: async (province: string): Promise<string[]> => {
    try {
      const axiosClient = createAxiosClient()
      const response = await axiosClient.get<{ success: boolean; data: string[] }>(
        `/locations/districts?province=${encodeURIComponent(province)}`,
      )
      return response.data.data || []
    } catch (error) {
      console.error("Failed to fetch districts:", error)
      return []
    }
  },

  getSectorsByDistrict: async (district: string): Promise<string[]> => {
    try {
      const axiosClient = createAxiosClient()
      const response = await axiosClient.get<{ success: boolean; data: string[] }>(
        `/locations/sectors?district=${encodeURIComponent(district)}`,
      )
      return response.data.data || []
    } catch (error) {
      console.error("Failed to fetch sectors:", error)
      return []
    }
  },

  getCellsBySector: async (sector: string): Promise<string[]> => {
    try {
      const axiosClient = createAxiosClient()
      const response = await axiosClient.get<{ success: boolean; data: string[] }>(
        `/locations/cells?sector=${encodeURIComponent(sector)}`,
      )
      return response.data.data || []
    } catch (error) {
      console.error("Failed to fetch cells:", error)
      return []
    }
  },

  getVillagesByCell: async (cell: string): Promise<string[]> => {
    try {
      const axiosClient = createAxiosClient()
      const response = await axiosClient.get<{ success: boolean; data: string[] }>(
        `/locations/villages?cell=${encodeURIComponent(cell)}`,
      )
      return response.data.data || []
    } catch (error) {
      console.error("Failed to fetch villages:", error)
      return []
    }
  },
}

// Export singleton
