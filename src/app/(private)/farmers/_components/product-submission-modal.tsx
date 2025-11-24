/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, DollarSign, Package, Tag, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Category, productSubmissionService } from "@/app/services/productSubmissionService"
import { locationService } from "@/app/services/locationService"

export interface ProductSubmissionData {
  productName: string
  category: string
  quantity:number
  unit: string
  wishedPrice: number
  province: string
  district: string
  sector: string
  cell: string
  village: string
}

interface ProductSubmissionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ProductSubmissionData) => void
}

const units = ["kg", "lb", "g", "oz", "bunch", "bag", "box", "crate", "dozen", "piece", "liter", "gallon"]

export default function ProductSubmissionModal({ isOpen, onClose, onSubmit }: ProductSubmissionModalProps) {
  const [formData, setFormData] = useState<ProductSubmissionData>({
    productName: "",
    category: "",
    quantity: 0,
    unit: "kg",
    wishedPrice: 0,
    province: "",
    district: "",
    sector: "",
    cell: "",
    village: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [availableProducts, setAvailableProducts] = useState<string[]>([])
  const [productSuggestions, setProductSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [provinces, setProvinces] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [sectors, setSectors] = useState<string[]>([])
  const [cells, setCells] = useState<string[]>([])
  const [villages, setVillages] = useState<string[]>([])

  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)

  // Load data on mount
  useEffect(() => {
    if (isOpen) {
      loadCategories()
      loadProvinces()
    }
  }, [isOpen])

  // Load products when category changes
  useEffect(() => {
    if (formData.category) {
      loadProductsForCategory(formData.category)
    } else {
      setAvailableProducts([])
      setProductSuggestions([])
    }
  }, [formData.category])

  useEffect(() => {
    if (formData.province) {
      loadDistricts(formData.province)
      // Reset dependent fields
      setFormData((prev) => ({ ...prev, district: "", sector: "", cell: "", village: "" }))
    }
  }, [formData.province])

  useEffect(() => {
    if (formData.district) {
      loadSectors(formData.province, formData.district)
      // Reset dependent fields
      setFormData((prev) => ({ ...prev, sector: "", cell: "", village: "" }))
    }
  }, [formData.district])

  useEffect(() => {
    if (formData.sector && formData.district && formData.province) {
      loadCells(formData.province, formData.district, formData.sector)
      // Reset dependent field
      setFormData((prev) => ({ ...prev, cell: "", village: "" }))
    }
  }, [formData.sector, formData.district, formData.province])

  useEffect(() => {
    if (formData.cell && formData.sector && formData.district && formData.province) {
      loadVillages(formData.province, formData.district, formData.sector, formData.cell)
      // Reset dependent field
      setFormData((prev) => ({ ...prev, village: "" }))
    }
  }, [formData.cell])


 // Updated modal functions to work with corrected API calls
// You'll need to add state variables to track selected province, district, sector

const loadProvinces = async () => {
  try {
    const locationHierarchy = await locationService.fetchLocationHierarchy(provinces)
    const provinceNames =
      Array.isArray(locationHierarchy)
        ? locationHierarchy.map((prov) => prov.name || prov)
        : locationHierarchy.provinces
          ? locationHierarchy.provinces.map((prov: any) => prov.name || prov)
          : []
    setProvinces(provinceNames)
    // Reset dependent selections
    setDistricts([])
    setSectors([])
    setCells([])
    setVillages([])
  } catch (error) {
    console.error("Failed to load provinces:", error)
  }
}

const loadDistricts = async (province: string) => {
  try {
    const districts = await  locationService.getDistrictsByProvince(province)
    setDistricts(districts)
    // Reset dependent selections
    setSectors([])
    setCells([])
    setVillages([])
  } catch (error) {
    console.error("Failed to load districts:", error)
    setDistricts([])
  }
}

const loadSectors = async (province: string, district: string) => {
  try {
    const sectors = await  locationService.getSectorsByDistrict(province, district)
    setSectors(sectors)
    // Reset dependent selections
    setCells([])
    setVillages([])
  } catch (error) {
    console.error("Failed to load sectors:", error)
    setSectors([])
  }
}

const loadCells = async (province: string, district: string, sector: string) => {
  try {
    const cells = await  locationService.getCellsBySector(province, district, sector)
    setCells(cells)
    setVillages([])
  } catch (error) {
    console.error("Failed to load cells:", error)
    setCells([])
  }
}

const loadVillages = async (province: string, district: string, sector: string, cell: string) => {
  try {
    const villages = await  locationService.getVillagesByCell(province, district, sector, cell)
    setVillages(villages)
  } catch (error) {
    console.error("Failed to load villages:", error)
    setVillages([])
  }
}
  const loadCategories = async () => {
    setLoadingCategories(true)
    try {
      const fetchedCategories = await productSubmissionService.fetchActiveCategories()
      setCategories(fetchedCategories)

      if (fetchedCategories.length === 0) {
        toast.warning("No categories available. Please contact support.")
      }
    } catch (error: any) {

      if (error.message.includes("Unable to connect")) {
        toast.error("Cannot connect to server. Please ensure the API server is running.")
      } else if (error?.response?.status === 401) {
        toast.error("Please log in again to continue")
      } else if (error?.response?.status === 403) {
        toast.error("Access denied. Please contact support if this persists.")
      } else {
        toast.error("Failed to load categories. Please try again later.")
      }
    } finally {
      setLoadingCategories(false)
    }
  }

  const loadProductsForCategory = async (categoryName: string) => {
    setLoadingProducts(true)
    try {
      const category = categories.find((cat) => cat.name === categoryName)
      if (!category) {
        throw new Error("Category not found")
      }

      const products = await productSubmissionService.getProductsByCategory(category.id)
      setAvailableProducts(products)

      // Clear product name when category changes
      setFormData((prev) => ({ ...prev, productName: "" }))
    } catch (error) {
      console.error("Failed to load products:", error)
      toast.error("Failed to load products for category")
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleProductNameChange = (value: string) => {
    setFormData((prev) => ({ ...prev, productName: value }))

    if (errors.productName) {
      setErrors((prev) => ({ ...prev, productName: "" }))
    }

    // Show suggestions when typing
    if (value.trim() && formData.category && availableProducts.length > 0) {
      const filtered = availableProducts.filter((product) => product.toLowerCase().includes(value.toLowerCase()))
      setProductSuggestions(filtered.slice(0, 8))
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  const selectProduct = (productName: string) => {
    setFormData((prev) => ({ ...prev, productName }))
    setShowSuggestions(false)
  }

  const handleInputChange = <K extends keyof ProductSubmissionData>(field: K, value: ProductSubmissionData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.category) newErrors.category = "Please select a category first"
    if (!formData.productName.trim()) newErrors.productName = "Product name is required"
    if (formData.quantity <= 0) newErrors.quantity = "Quantity must be greater than 0"
    if (formData.wishedPrice <= 0) newErrors.wishedPrice = "Price must be greater than 0"

    if (!formData.province?.trim()) newErrors.province = "Province is required"
    if (!formData.district?.trim()) newErrors.district = "District is required"
    if (!formData.sector?.trim()) newErrors.sector = "Sector is required"
    if (!formData.cell?.trim()) newErrors.cell = "Cell is required"
    if (!formData.village?.trim()) newErrors.village = "Village is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      
      const response = await productSubmissionService.submitProduct(formData)
      

      // Check if submission was successful
      if (response) {
        onSubmit(formData)
        toast.success("Product submitted successfully!")

        // Reset form
        setFormData({
          productName: "",
          category: "",
          quantity: 0,
          unit: "kg",
          wishedPrice: 0,
          province: "",
          district: "",
          sector: "",
          cell: "",
          village: "",
        })
        setErrors({})
        onClose()
      } else {
        toast.error("Failed to submit product")
      }
    } catch (error: any) {
   

      let errorMessage = "Something went wrong. Please try again."
      
      if (error.message?.includes("Product not found")) {
        errorMessage = "Selected product is not available. Please choose a different product."
      } else if (error.message?.includes("Authentication required") || error.response?.status === 401) {
        errorMessage = "Please log in again to continue"
      } else if (error.message?.includes("Unable to connect")) {
        errorMessage = "Cannot connect to server. Please check your connection."
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to submit products"
      } else if (error.response?.status === 409) {
        errorMessage = "Product already exists or duplicate submission"
      } else if (error.response?.status === 422) {
        errorMessage = "Invalid product data. Please check your inputs."
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCategoryName = (category: Category) => {
    return category.name
      .replace(/_/g, " & ")
      .replace(/([A-Z])/g, " $1")
      .trim()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl bg-white">
        <CardHeader className="pb-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Submit New Product</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-700 hover:bg-gray-100">
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-gray-600 mt-2">
            Select a category first, then choose your product and enter location details
          </p>
        </CardHeader>

        <CardContent className="p-6 bg-white">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Category Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">
                  1
                </span>
                Select Category
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-base font-semibold text-gray-900">
                  Product Category *
                </Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  disabled={loadingCategories}
                  className={`w-full h-12 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900 ${
                    errors.category ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="">{loadingCategories ? "Loading categories..." : "Select a category"}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {formatCategoryName(category)}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
              </div>
            </div>

            {/* Step 2: Product Selection */}
            {formData.category && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">
                    2
                  </span>
                  Choose Product
                </div>

                <div className="space-y-2 relative">
                  <Label
                    htmlFor="productName"
                    className="text-base font-semibold flex items-center gap-2 text-gray-900"
                  >
                    <Tag className="w-4 h-4" />
                    Product Name *
                  </Label>
                  <Input
                    id="productName"
                    value={formData.productName}
                    onChange={(e) => handleProductNameChange(e.target.value)}
                    placeholder={
                      loadingProducts
                        ? "Loading products..."
                        : availableProducts.length > 0
                          ? "Type to search or select from existing products..."
                          : "Enter product name..."
                    }
                    disabled={loadingProducts}
                    className={`h-12 bg-white text-gray-900 ${errors.productName ? "border-red-300" : ""}`}
                    onFocus={() => {
                      if (availableProducts.length > 0 && !formData.productName) {
                        setProductSuggestions(availableProducts.slice(0, 8))
                        setShowSuggestions(true)
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 200)
                    }}
                  />

                  {/* Product Suggestions Dropdown */}
                  {showSuggestions && productSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                      {productSuggestions.map((product, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 text-gray-900"
                          onClick={() => selectProduct(product)}
                        >
                          {product}
                        </button>
                      ))}
                    </div>
                  )}

                  {errors.productName && <p className="text-red-500 text-sm">{errors.productName}</p>}

                  {availableProducts.length > 0 && (
                    <p className="text-sm text-gray-500">
                      products available in {formData.category.replace(/_/g, " & ")}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Product Details */}
            {formData.category && formData.productName && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">
                    3
                  </span>
                  Product Details
                </div>

                {/* Quantity and Unit */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-base font-semibold text-gray-900">
                      Quantity *
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.quantity || ""}
                      onChange={(e) => handleInputChange("quantity", Number.parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className={`h-12 bg-white text-gray-900 ${errors.quantity ? "border-red-300" : ""}`}
                    />
                    {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit" className="text-base font-semibold text-gray-900">
                      Unit
                    </Label>
                    <select
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => handleInputChange("unit", e.target.value)}
                      className="w-full h-12 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
                    >
                      {units.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="wishedPrice"
                      className="text-base font-semibold flex items-center gap-2 text-gray-900"
                    >
                      <DollarSign className="w-4 h-4" />
                      Wished Price * (per {formData.unit})
                    </Label>
                    <Input
                      id="wishedPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.wishedPrice || ""}
                      onChange={(e) => handleInputChange("wishedPrice", Number.parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className={`h-12 bg-white text-gray-900 ${errors.wishedPrice ? "border-red-300" : ""}`}
                    />
                    {errors.wishedPrice && <p className="text-red-500 text-sm">{errors.wishedPrice}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Location Details */}
            {formData.category && formData.productName && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                  <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">
                    4
                  </span>
                  <MapPin className="w-5 h-5" />
                  Location Details
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Province */}
                  <div className="space-y-2">
                    <Label htmlFor="province" className="text-base font-semibold text-gray-900">
                      Province *
                    </Label>
                    <select
                      id="province"
                      value={formData.province}
                      onChange={(e) => handleInputChange("province", e.target.value)}
                      disabled={loadingLocation}
                      className={`w-full h-12 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900 ${
                        errors.province ? "border-red-300" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Province</option>
                      {provinces.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                    {errors.province && <p className="text-red-500 text-sm">{errors.province}</p>}
                  </div>

                  {/* District */}
                  <div className="space-y-2">
                    <Label htmlFor="district" className="text-base font-semibold text-gray-900">
                      District *
                    </Label>
                    <select
                      id="district"
                      value={formData.district}
                      onChange={(e) => handleInputChange("district", e.target.value)}
                      disabled={!formData.province || districts.length === 0}
                      className={`w-full h-12 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900 ${
                        errors.district ? "border-red-300" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select District</option>
                      {districts.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                    {errors.district && <p className="text-red-500 text-sm">{errors.district}</p>}
                  </div>

                  {/* Sector */}
                  <div className="space-y-2">
                    <Label htmlFor="sector" className="text-base font-semibold text-gray-900">
                      Sector *
                    </Label>
                    <select
                      id="sector"
                      value={formData.sector}
                      onChange={(e) => handleInputChange("sector", e.target.value)}
                      disabled={!formData.district || sectors.length === 0}
                      className={`w-full h-12 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900 ${
                        errors.sector ? "border-red-300" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Sector</option>
                      {sectors.map((sector) => (
                        <option key={sector} value={sector}>
                          {sector}
                        </option>
                      ))}
                    </select>
                    {errors.sector && <p className="text-red-500 text-sm">{errors.sector}</p>}
                  </div>

                  {/* Cell */}
                  <div className="space-y-2">
                    <Label htmlFor="cell" className="text-base font-semibold text-gray-900">
                      Cell *
                    </Label>
                    <select
                      id="cell"
                      value={formData.cell}
                      onChange={(e) => handleInputChange("cell", e.target.value)}
                      disabled={!formData.sector || cells.length === 0}
                      className={`w-full h-12 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900 ${
                        errors.cell ? "border-red-300" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Cell</option>
                      {cells.map((cell) => (
                        <option key={cell} value={cell}>
                          {cell}
                        </option>
                      ))}
                    </select>
                    {errors.cell && <p className="text-red-500 text-sm">{errors.cell}</p>}
                  </div>

                  {/* Village */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="village" className="text-base font-semibold text-gray-900">
                      Village *
                    </Label>
                    <select
                      id="village"
                      value={formData.village}
                      onChange={(e) => handleInputChange("village", e.target.value)}
                      disabled={!formData.cell || villages.length === 0}
                      className={`w-full h-12 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900 ${
                        errors.village ? "border-red-300" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Village</option>
                      {villages.map((village) => (
                        <option key={village} value={village}>
                          {village}
                        </option>
                      ))}
                    </select>
                    {errors.village && <p className="text-red-500 text-sm">{errors.village}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-8 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.category || !formData.productName}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 font-semibold disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  "Submit Product"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

