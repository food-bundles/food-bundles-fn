/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { DollarSign, Package, Tag, MapPin, Map as MapIcon, Loader2 } from "lucide-react"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/shadcn-io/spinner"
import { toast } from "sonner"
import { Category, productSubmissionService } from "@/app/services/productSubmissionService"
import { locationService } from "@/app/services/locationService"

const MapComponent = dynamic(
  () => import("@/app/(private)/restaurant/checkout/_components/MapComponent"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 rounded border border-gray-300 bg-gray-100 flex items-center justify-center">
        <Spinner variant="ring" className="w-8 h-8" />
      </div>
    ),
  },
)

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
  /** Optional free-text precision aid (house/plot number, landmark). */
  streetNumber?: string
  /** Optional GPS pin, captured via the map picker for delivery precision. */
  latitude?: number
  longitude?: number
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
    streetNumber: "",
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
  const [loadingFarmerLocation, setLoadingFarmerLocation] = useState(false)
  const [usedRegisteredLocation, setUsedRegisteredLocation] = useState(false)

  // Map-based location picking (additive to the province/district/.../village cascade)
  const [useMapPicker, setUseMapPicker] = useState(false)
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Suppresses the cascade reset-effects below while the farmer-profile prefill is running
  const isPrefillingRef = useRef(false)

  // Load data on mount, then try to prefill location from the farmer's own registered profile
  useEffect(() => {
    if (isOpen) {
      loadCategories()
      loadProvinces()
      prefillFromFarmerProfile()
    }
  }, [isOpen])

  /**
   * Pre-populates the location cascade with the farmer's own registered
   * address so most submissions need zero location input. The farmer can
   * still change any field afterward (via the cascade or the map picker).
   */
  const prefillFromFarmerProfile = async () => {
    setLoadingFarmerLocation(true)
    isPrefillingRef.current = true
    try {
      const profile = await productSubmissionService.getCurrentFarmerProfile()
      if (!profile?.province) {
        return
      }

      let districtOptions: string[] = []
      let sectorOptions: string[] = []
      let cellOptions: string[] = []
      let villageOptions: string[] = []

      if (profile.district) {
        districtOptions = await locationService.getDistrictsByProvince(profile.province)
        setDistricts(districtOptions)
      }
      if (profile.district && profile.sector) {
        sectorOptions = await locationService.getSectorsByDistrict(profile.province, profile.district)
        setSectors(sectorOptions)
      }
      if (profile.sector && profile.cell) {
        cellOptions = await locationService.getCellsBySector(profile.province, profile.district!, profile.sector)
        setCells(cellOptions)
      }
      if (profile.cell && profile.village) {
        villageOptions = await locationService.getVillagesByCell(
          profile.province,
          profile.district!,
          profile.sector!,
          profile.cell,
        )
        setVillages(villageOptions)
      }

      setFormData((prev) => ({
        ...prev,
        province: profile.province || "",
        district: districtOptions.includes(profile.district || "") ? profile.district! : "",
        sector: sectorOptions.includes(profile.sector || "") ? profile.sector! : "",
        cell: cellOptions.includes(profile.cell || "") ? profile.cell! : "",
        village: villageOptions.includes(profile.village || "") ? profile.village! : "",
      }))
      setUsedRegisteredLocation(true)
    } catch (error) {
      console.error("Failed to prefill farmer location:", error)
    } finally {
      setLoadingFarmerLocation(false)
      // Defer clearing the flag so the cascade effects triggered by the
      // setFormData above (province/district/... changing) see it as true.
      setTimeout(() => {
        isPrefillingRef.current = false
      }, 0)
    }
  }

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
      if (!isPrefillingRef.current) {
        // Reset dependent fields
        setFormData((prev) => ({ ...prev, district: "", sector: "", cell: "", village: "" }))
      }
    }
  }, [formData.province])

  useEffect(() => {
    if (formData.district) {
      loadSectors(formData.province, formData.district)
      if (!isPrefillingRef.current) {
        // Reset dependent fields
        setFormData((prev) => ({ ...prev, sector: "", cell: "", village: "" }))
      }
    }
  }, [formData.district])

  useEffect(() => {
    if (formData.sector && formData.district && formData.province) {
      loadCells(formData.province, formData.district, formData.sector)
      if (!isPrefillingRef.current) {
        // Reset dependent field
        setFormData((prev) => ({ ...prev, cell: "", village: "" }))
      }
    }
  }, [formData.sector, formData.district, formData.province])

  useEffect(() => {
    if (formData.cell && formData.sector && formData.district && formData.province) {
      loadVillages(formData.province, formData.district, formData.sector, formData.cell)
      if (!isPrefillingRef.current) {
        // Reset dependent field
        setFormData((prev) => ({ ...prev, village: "" }))
      }
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
          streetNumber: "",
        })
        setErrors({})
        setUseMapPicker(false)
        setMapLocation(null)
        setUsedRegisteredLocation(false)
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] bg-white flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">Submit New Product</DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 mt-2">
            Select a category first, then choose your product and enter location details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="contents">
          <div className="overflow-y-auto scrollbar-thin px-6 flex-1">
            <div className="space-y-8 py-4">
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
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                    <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">
                      4
                    </span>
                    <MapPin className="w-5 h-5" />
                    Location Details
                  </div>

                  <button
                    type="button"
                    onClick={() => setUseMapPicker((prev) => !prev)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                      useMapPicker
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <MapIcon className="w-4 h-4" />
                    {useMapPicker ? "Hide map" : "Pin exact location on map"}
                  </button>
                </div>

                {loadingFarmerLocation && (
                  <p className="text-sm text-gray-500">Loading your registered location...</p>
                )}

                {!loadingFarmerLocation && usedRegisteredLocation && (
                  <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                    Using your registered location — change the fields below if this submission is from elsewhere.
                  </p>
                )}

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

                  {/* Street number / landmark (optional precision aid) */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="streetNumber" className="text-base font-semibold text-gray-900">
                      Street Number / Landmark (optional)
                    </Label>
                    <Input
                      id="streetNumber"
                      value={formData.streetNumber || ""}
                      onChange={(e) => handleInputChange("streetNumber", e.target.value)}
                      placeholder="e.g. Plot 12, near the market"
                      className="h-12 bg-white text-gray-900"
                    />
                  </div>
                </div>

                {/* Optional map picker for GPS precision, additive to the fields above */}
                {useMapPicker && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Pin your exact location for delivery accuracy — this doesn&apos;t replace the province,
                      district, sector, cell, and village selected above.
                    </p>
                    <div className="h-64">
                      <MapComponent
                        tempLocation={mapLocation}
                        onLocationSelect={(location) => {
                          setMapLocation(location)
                          setFormData((prev) => ({
                            ...prev,
                            latitude: location.lat,
                            longitude: location.lng,
                          }))
                        }}
                      />
                    </div>
                    {mapLocation && (
                      <p className="text-xs text-gray-500">
                        Pinned: {mapLocation.lat.toFixed(6)}, {mapLocation.lng.toFixed(6)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            </div>
          </div>

          {/* Action Buttons */}
          <DialogFooter className="px-6 pb-6 pt-4 border-t border-gray-200">
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

