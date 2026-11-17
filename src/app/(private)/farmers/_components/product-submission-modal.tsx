/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { DollarSign, Package, Tag, MapPin, Map as MapIcon, Loader2, Calendar } from "lucide-react"
import "leaflet/dist/leaflet.css"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/shadcn-io/spinner"
import { toast } from "sonner"
import { Category, productSubmissionService } from "@/app/services/productSubmissionService"
import { locationService } from "@/app/services/locationService"
import { authService } from "@/app/services/authService"
import { farmersService } from "@/app/services/farmersService"

type RegisteredLocation = {
  province: string
  district: string
  sector: string
  cell: string
  village: string
}

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
  /** When the farmer will bring the harvest (ISO, within the next 14 days) */
  deliveryDate?: string
}

/** A past submission the farmer can send again in one tap */
export interface RecentSubmission {
  category: string
  productName: string
  unit: string
  wishedPrice: number
}

interface ProductSubmissionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ProductSubmissionData) => void
  /** The farmer's latest different products, shown as "Submit again" */
  recent?: RecentSubmission[]
}

/** yyyy-mm-dd in local time, for <input type="date"> */
const dayValue = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

/** The backend accepts a delivery moment between now and 14 days ahead */
const MAX_DELIVERY_DAYS = 14

const units = ["kg", "lb", "g", "oz", "bunch", "bag", "box", "crate", "dozen", "piece", "liter", "gallon"]
// Shown as buttons; the others stay one tap away under "More"
const COMMON_UNITS = ["kg", "bag", "crate", "bunch", "piece", "liter"]
const QUICK_QUANTITIES = [10, 50, 100, 500]
const rwf = (n: number) => `${Math.round(n).toLocaleString()} RWF`

export default function ProductSubmissionModal({ isOpen, onClose, onSubmit, recent = [] }: ProductSubmissionModalProps) {
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
  // Optional: the day and time the farmer will bring the harvest
  const [deliveryDay, setDeliveryDay] = useState("")
  const [deliveryTime, setDeliveryTime] = useState("09:00")
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
  // "registered" = same as the location saved at signup (default when there is
  // one); "other" = the farmer picks a different place in the fields below
  const [registeredLocation, setRegisteredLocation] = useState<RegisteredLocation | null>(null)
  // Where the produce is: the saved farm location, a map pin, or a place chosen in the lists
  const [locationMode, setLocationMode] = useState<"registered" | "map" | "other">("other")
  // Farmers without a saved farm location: keep the place they choose for next time
  const [saveAsFarm, setSaveAsFarm] = useState(true)
  const farmerIdRef = useRef<string | null>(null)

  // Map-based location picking (additive to the province/district/.../village cascade)
  const [useMapPicker, setUseMapPicker] = useState(false)
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Suppresses the cascade reset-effects below while the farmer-profile prefill is running
  const isPrefillingRef = useRef(false)
  // "Submit again": the product to keep once the category's products have loaded
  const pendingProductRef = useRef<string | null>(null)
  const [productSearch, setProductSearch] = useState("")
  const [showAllUnits, setShowAllUnits] = useState(false)
  const quantityRef = useRef<HTMLInputElement>(null)

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
      const me = await authService.getCurrentUser()
      const profile = (me?.user || me?.data?.user || null) as (Partial<RegisteredLocation> & { id?: string }) | null
      farmerIdRef.current = profile?.id ?? null
      if (!profile?.province || !profile.district || !profile.sector || !profile.cell || !profile.village) {
        // No complete signup location saved: the farmer picks one below
        setRegisteredLocation(null)
        setLocationMode("other")
        return
      }
      setRegisteredLocation({
        province: profile.province,
        district: profile.district,
        sector: profile.sector,
        cell: profile.cell,
        village: profile.village,
      })
      setLocationMode("registered")

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
    if (formData.category && categories.length > 0) {
      loadProductsForCategory(formData.category)
    } else if (!formData.category) {
      setAvailableProducts([])
      setProductSuggestions([])
    }
  }, [formData.category, categories])

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
      setProductSearch("")

      // A new category clears the product, unless "Submit again" chose one
      const pending = pendingProductRef.current
      pendingProductRef.current = null
      setFormData((prev) => ({ ...prev, productName: pending ?? "" }))
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
    setProductSearch("")
    if (errors.productName) setErrors((prev) => ({ ...prev, productName: "" }))
    // Next thing to fill: how much
    setTimeout(() => quantityRef.current?.focus(), 50)
  }

  const chooseCategory = (name: string) => {
    if (name === formData.category) return
    pendingProductRef.current = null
    handleInputChange("category", name)
    setFormData((prev) => ({ ...prev, category: name, productName: "" }))
  }

  /** "Submit again": same product, unit and price as last time; only the quantity is left */
  const fillFromRecent = (r: RecentSubmission) => {
    // Same category already open: its products are loaded, so the product is set right away
    pendingProductRef.current = formData.category === r.category ? null : r.productName
    setErrors({})
    setFormData((prev) => ({
      ...prev,
      category: r.category,
      productName: prev.category === r.category ? r.productName : prev.productName,
      unit: r.unit || prev.unit,
      wishedPrice: r.wishedPrice || prev.wishedPrice,
      quantity: 0,
    }))
    if (!COMMON_UNITS.includes(r.unit)) setShowAllUnits(true)
    setTimeout(() => quantityRef.current?.focus(), 80)
  }

  const handleInputChange = <K extends keyof ProductSubmissionData>(field: K, value: ProductSubmissionData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const chooseLocationMode = (mode: "registered" | "map" | "other") => {
    setLocationMode(mode)
    setUseMapPicker(mode === "map")
    setErrors((prev) => ({ ...prev, province: "", district: "", sector: "", cell: "", village: "", map: "" }))
    if (mode === "registered" && registeredLocation) {
      prefillFromFarmerProfile()
    } else {
      setFormData((prev) => ({ ...prev, province: "", district: "", sector: "", cell: "", village: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.category) newErrors.category = "Please select a category first"
    if (!formData.productName.trim()) newErrors.productName = "Product name is required"
    if (formData.quantity <= 0) newErrors.quantity = "Quantity must be greater than 0"
    if (formData.wishedPrice <= 0) newErrors.wishedPrice = "Price must be greater than 0"
    if (deliveryDay) {
      const when = new Date(`${deliveryDay}T${deliveryTime || "09:00"}`)
      const latest = Date.now() + MAX_DELIVERY_DAYS * 24 * 60 * 60 * 1000
      if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now())
        newErrors.deliveryDate = "Choose a day and time that has not passed yet"
      else if (when.getTime() > latest) newErrors.deliveryDate = `Choose a day within the next ${MAX_DELIVERY_DAYS} days`
    }

    // "At my farm" uses the saved place as-is; a map pin is enough on its own
    if (locationMode === "map" && !mapLocation) {
      newErrors.map = "Tap “Use my current location” or tap the map to pin where the produce is"
    }
    if (locationMode === "other") {
      if (!formData.province?.trim()) newErrors.province = "Province is required"
      if (!formData.district?.trim()) newErrors.district = "District is required"
      if (!formData.sector?.trim()) newErrors.sector = "Sector is required"
      if (!formData.cell?.trim()) newErrors.cell = "Cell is required"
      if (!formData.village?.trim()) newErrors.village = "Village is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      // Show the farmer what's missing, even when it's below the fold
      setTimeout(() => {
        document.querySelector("[data-field-error]")?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 50)
      return
    }

    setIsSubmitting(true)

    try {
      
      // Same as signup: send the saved place (the backend also falls back to it)
      const deliveryDate = deliveryDay
        ? new Date(`${deliveryDay}T${deliveryTime || "09:00"}`).toISOString()
        : undefined
      const payload = {
        ...(locationMode === "registered" && registeredLocation
          ? { ...formData, ...registeredLocation }
          : formData),
        deliveryDate,
      }
      const response = await productSubmissionService.submitProduct(payload)

      // First place chosen by a farmer without a saved farm location: keep it as their farm
      if (response && locationMode === "other" && !registeredLocation && saveAsFarm && farmerIdRef.current) {
        const place = {
          province: formData.province,
          district: formData.district,
          sector: formData.sector,
          cell: formData.cell,
          village: formData.village,
        }
        const saved = await farmersService.updateFarmer(farmerIdRef.current, place).catch(() => null)
        if (saved?.success) setRegisteredLocation(place)
      }
      

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
        setDeliveryDay("")
        setDeliveryTime("09:00")
        setUseMapPicker(false)
        setMapLocation(null)
        setUsedRegisteredLocation(false)
        setLocationMode(registeredLocation || (locationMode === "other" && saveAsFarm) ? "registered" : "other")
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
    // "fruitsAndVeg" → "fruits And Veg", "FRUITS_VEG" → "FRUITS & VEG"; all-caps names stay whole
    return category.name
      .replace(/_/g, " & ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .trim()
  }

  // ── view helpers ─────────────────────────────────────────────────────────
  const chip = (on: boolean) =>
    `min-h-11 rounded-full px-4 text-[15px] font-bold transition-colors cursor-pointer ${
      on
        ? "bg-[#0B2E1F] text-white"
        : "border border-[#DCE6DF] bg-white text-[#0B2E1F] hover:border-[#00A43A]"
    }`
  const field =
    "h-12 w-full rounded-xl border bg-white px-4 text-[16px] text-[#0B2E1F] placeholder:text-[#7A8E83] focus:border-[#00A43A] focus:outline-none focus:ring-2 focus:ring-[#00A43A]/25 disabled:bg-[#F6F9F7]"
  const stepTitle = (n: number, text: string, done: boolean) => (
    <h3 className="m-0 flex items-center gap-2.5 text-[17px] font-bold text-[#0B2E1F]">
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] ${
          done ? "bg-[#00A43A] text-white" : "bg-[#0B2E1F] text-white"
        }`}
      >
        {done ? <Check className="h-4 w-4" /> : n}
      </span>
      {text}
    </h3>
  )
  const errorText = (key: string) =>
    errors[key] ? (
      <p data-field-error className="m-0 text-[13px] font-bold text-red-600">
        {errors[key]}
      </p>
    ) : null

  const visibleProducts = (
    productSearch.trim()
      ? availableProducts.filter((p) => p.toLowerCase().includes(productSearch.trim().toLowerCase()))
      : availableProducts
  ).slice(0, 24)
  const typedIsNew =
    productSearch.trim().length > 1 &&
    !availableProducts.some((p) => p.toLowerCase() === productSearch.trim().toLowerCase())
  const total = formData.quantity > 0 && formData.wishedPrice > 0 ? formData.quantity * formData.wishedPrice : 0
  const ready = !!formData.category && !!formData.productName && formData.quantity > 0 && formData.wishedPrice > 0
  const unitChoices = showAllUnits ? units : COMMON_UNITS.includes(formData.unit) ? COMMON_UNITS : [...COMMON_UNITS, formData.unit]
  const registeredText = registeredLocation
    ? [registeredLocation.village, registeredLocation.cell, registeredLocation.sector, registeredLocation.district]
        .filter(Boolean)
        .join(", ")
    : ""

  const locationSelect = (
    key: "province" | "district" | "sector" | "cell" | "village",
    label: string,
    options: string[],
    disabled: boolean,
  ) => (
    <label className="flex flex-col gap-1.5">
      <span className="text-[14px] font-bold text-[#0B2E1F]">{label}</span>
      <select
        value={formData[key]}
        onChange={(e) => handleInputChange(key, e.target.value)}
        disabled={disabled}
        className={`${field} ${errors[key] ? "border-red-400" : "border-[#DCE6DF]"}`}
      >
        <option value="">Choose…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {errorText(key)}
    </label>
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[94vh] flex-col gap-0 overflow-hidden rounded-[22px] border-[#DCE6DF] bg-white p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-[#EEF3EF] px-5 pb-4 pt-5 text-left sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E3F3E8]">
              <Sprout className="h-5 w-5 text-[#007A35]" />
            </span>
            <div>
              <DialogTitle className="text-[22px] font-bold tracking-[-0.4px] text-[#0B2E1F] [font-family:var(--font-inter-tight),sans-serif]">
                Sell your produce
              </DialogTitle>
              <DialogDescription className="m-0 text-[14px] text-[#4A6358]">
                Tell us what you have, how much and your price. It takes a minute.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="contents">
          <div className="flex-1 overflow-y-auto px-5 sm:px-7">
            <div className="flex flex-col gap-7 py-5">
              {/* Submit again: last products in one tap */}
              {recent.length > 0 && (
                <section className="flex flex-col gap-2.5 rounded-2xl bg-[#F6F9F7] p-4">
                  <p className="m-0 flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-[0.8px] text-[#4A6358]">
                    <RotateCcw className="h-3.5 w-3.5" /> Submit again
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((r) => {
                      const on = formData.productName === r.productName && formData.category === r.category
                      return (
                        <button
                          key={`${r.category}-${r.productName}`}
                          type="button"
                          onClick={() => fillFromRecent(r)}
                          className={`flex min-h-11 flex-col items-start justify-center rounded-xl px-3.5 py-1.5 text-left transition-colors cursor-pointer ${
                            on ? "bg-[#0B2E1F] text-white" : "border border-[#DCE6DF] bg-white text-[#0B2E1F] hover:border-[#00A43A]"
                          }`}
                        >
                          <span className="text-[14px] font-bold leading-tight">{r.productName}</span>
                          <span className={`text-[12px] ${on ? "text-white/70" : "text-[#4A6358]"}`}>
                            {rwf(r.wishedPrice)} / {r.unit}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* 1. What */}
              <section className="flex flex-col gap-3">
                {stepTitle(1, "What are you selling?", !!formData.productName)}
                {loadingCategories ? (
                  <p className="m-0 flex items-center gap-2 text-[14px] text-[#4A6358]">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Category">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        role="radio"
                        aria-checked={formData.category === c.name}
                        onClick={() => chooseCategory(c.name)}
                        className={chip(formData.category === c.name)}
                      >
                        {formatCategoryName(c)}
                      </button>
                    ))}
                  </div>
                )}
                {errorText("category")}

                {formData.category && (
                  <div className="flex flex-col gap-2.5 rounded-2xl border border-[#DCE6DF] p-3.5">
                    {formData.productName ? (
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-[16px] font-bold text-[#0B2E1F]">
                          <Check className="h-5 w-5 text-[#00A43A]" /> {formData.productName}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, productName: "" }))}
                          className="text-[14px] font-bold text-[#007A35] underline underline-offset-2 hover:text-[#0B2E1F] cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A8E83]" />
                          <input
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                const first = visibleProducts[0]
                                if (first) selectProduct(first)
                              }
                            }}
                            placeholder={loadingProducts ? "Loading products…" : "Search your product"}
                            disabled={loadingProducts}
                            aria-label="Product"
                            className={`${field} pl-10 ${errors.productName ? "border-red-400" : "border-[#DCE6DF]"}`}
                          />
                          {productSearch && (
                            <button
                              type="button"
                              onClick={() => setProductSearch("")}
                              aria-label="Clear"
                              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#4A6358] hover:bg-[#F6F9F7] cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        {visibleProducts.length > 0 && (
                          <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
                            {visibleProducts.map((p) => (
                              <button key={p} type="button" onClick={() => selectProduct(p)} className={chip(false)}>
                                {p}
                              </button>
                            ))}
                          </div>
                        )}
                        {!loadingProducts && (typedIsNew || availableProducts.length === 0) && (
                          <p className="m-0 text-[13px] text-[#4A6358]">
                            {availableProducts.length === 0 ? "No products in this category yet." : "Not in the list?"} Contact Food
                            Bundles to add it.
                          </p>
                        )}
                      </>
                    )}
                    {errorText("productName")}
                  </div>
                )}
              </section>

              {formData.productName && (
                <>
                  {/* 2. How much */}
                  <section className="flex flex-col gap-3">
                    {stepTitle(2, "How much do you have?", formData.quantity > 0)}
                    <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Unit">
                      {unitChoices.map((u) => (
                        <button
                          key={u}
                          type="button"
                          role="radio"
                          aria-checked={formData.unit === u}
                          onClick={() => handleInputChange("unit", u)}
                          className={`min-h-10 rounded-full px-3.5 text-[14px] font-bold transition-colors cursor-pointer ${
                            formData.unit === u ? "bg-[#00A43A] text-white" : "border border-[#DCE6DF] bg-white text-[#0B2E1F] hover:border-[#00A43A]"
                          }`}
                        >
                          {u}
                        </button>
                      ))}
                      {!showAllUnits && (
                        <button
                          type="button"
                          onClick={() => setShowAllUnits(true)}
                          className="min-h-10 px-2 text-[14px] font-bold text-[#007A35] underline underline-offset-2 cursor-pointer"
                        >
                          More
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative w-full sm:w-56">
                        <input
                          ref={quantityRef}
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.1"
                          value={formData.quantity || ""}
                          onChange={(e) => handleInputChange("quantity", Number.parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          aria-label={`Quantity in ${formData.unit}`}
                          className={`${field} pr-16 text-[20px] font-bold ${errors.quantity ? "border-red-400" : "border-[#DCE6DF]"}`}
                        />
                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[15px] font-bold text-[#4A6358]">
                          {formData.unit}
                        </span>
                      </div>
                      {QUICK_QUANTITIES.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => handleInputChange("quantity", Math.round(((formData.quantity || 0) + q) * 10) / 10)}
                          className="min-h-10 rounded-full border border-[#DCE6DF] bg-white px-3 text-[14px] font-bold text-[#0B2E1F] hover:border-[#00A43A] cursor-pointer"
                        >
                          +{q}
                        </button>
                      ))}
                    </div>
                    {errorText("quantity")}
                  </section>

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

            {/* When the farmer will bring it (optional), so the aggregator can plan */}
            {formData.category && formData.productName && (
              <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <Label htmlFor="deliveryDay" className="text-base font-semibold flex items-center gap-2 text-gray-900">
                  <Calendar className="w-4 h-4" />
                  When will you bring it? (optional)
                </Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    id="deliveryDay"
                    type="date"
                    min={dayValue(new Date())}
                    max={dayValue(new Date(Date.now() + MAX_DELIVERY_DAYS * 24 * 60 * 60 * 1000))}
                    value={deliveryDay}
                    onChange={(e) => {
                      setDeliveryDay(e.target.value)
                      setErrors((prev) => ({ ...prev, deliveryDate: "" }))
                    }}
                    className={`h-12 bg-white text-gray-900 ${errors.deliveryDate ? "border-red-300" : ""}`}
                  />
                  <Input
                    id="deliveryTime"
                    type="time"
                    aria-label="Delivery time"
                    value={deliveryTime}
                    disabled={!deliveryDay}
                    onChange={(e) => {
                      setDeliveryTime(e.target.value)
                      setErrors((prev) => ({ ...prev, deliveryDate: "" }))
                    }}
                    className="h-12 bg-white text-gray-900"
                  />
                </div>
                {errors.deliveryDate ? (
                  <p className="text-red-500 text-sm">{errors.deliveryDate}</p>
                ) : (
                  <p className="text-xs text-gray-500">Within the next {MAX_DELIVERY_DAYS} days. Your aggregator sees it.</p>
                )}
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

                {loadingFarmerLocation && !registeredLocation && (
                  <p className="text-sm text-gray-500">Loading your registered location...</p>
                )}

                {/* Where is the produce? Same as signup (default) or somewhere else */}
                {registeredLocation && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => chooseLocationMode("registered")}
                      className={`text-left rounded-lg border px-3 py-2.5 transition-colors cursor-pointer ${
                        locationMode === "registered"
                          ? "border-green-600 bg-green-50 ring-1 ring-green-600"
                          : "border-gray-300 hover:border-green-300"
                      }`}
                    >
                      <span className="block text-sm font-semibold text-gray-900">
                        Same as my signup location
                      </span>
                      <span className="block text-xs text-gray-600 mt-0.5">
                        {[
                          registeredLocation.village,
                          registeredLocation.cell,
                          registeredLocation.sector,
                          registeredLocation.district,
                          registeredLocation.province,
                        ].join(", ")}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => chooseLocationMode("other")}
                      className={`text-left rounded-lg border px-3 py-2.5 transition-colors cursor-pointer ${
                        locationMode === "other"
                          ? "border-green-600 bg-green-50 ring-1 ring-green-600"
                          : "border-gray-300 hover:border-green-300"
                      }`}
                    >
                      <span className="block text-sm font-semibold text-gray-900">A different location</span>
                      <span className="block text-xs text-gray-600 mt-0.5">
                        Choose the province, district, sector, cell and village
                      </span>
                    </button>
                  </div>
                )}

                {locationMode === "other" && (
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
                )}

                {/* Optional map picker for GPS precision, additive to the fields above */}
                {useMapPicker && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Tap <strong>Use my current location</strong> or tap the map to drop a pin. It helps us find
                      the nearest market; it doesn&apos;t replace the location above.
                    </p>
                    <div className="h-64 flex">
                      <MapComponent
                        showLocateButton
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
                    {errorText("wishedPrice")}
                  </section>

                  {/* 4. Where */}
                  <section className="flex flex-col gap-3">
                    {stepTitle(
                      4,
                      "Where is it?",
                      locationMode === "registered" ? !!registeredLocation : locationMode === "map" ? !!mapLocation : !!formData.village,
                    )}

                    {loadingFarmerLocation && !registeredLocation && (
                      <p className="m-0 flex items-center gap-2 text-[14px] text-[#4A6358]">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading your farm location…
                      </p>
                    )}

                    <div className={`grid gap-2 ${registeredLocation ? "sm:grid-cols-3" : "sm:grid-cols-2"}`} role="radiogroup" aria-label="Where is it?">
                      {registeredLocation && (
                        <button
                          type="button"
                          role="radio"
                          aria-checked={locationMode === "registered"}
                          onClick={() => chooseLocationMode("registered")}
                          className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors cursor-pointer ${
                          locationMode === "registered" ? "border-[#00A43A] bg-[#EFFAF3] ring-1 ring-[#00A43A]" : "border-[#DCE6DF] hover:border-[#00A43A]"
                        }`}
                        >
                          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#00A43A]" />
                          <span>
                            <span className="block text-[15px] font-bold text-[#0B2E1F]">At my farm</span>
                            <span className="block text-[13px] text-[#4A6358]">{registeredText}</span>
                          </span>
                        </button>
                      )}
                      <button
                        type="button"
                        role="radio"
                        aria-checked={locationMode === "map"}
                        onClick={() => chooseLocationMode("map")}
                        className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors cursor-pointer ${
                          locationMode === "map" ? "border-[#00A43A] bg-[#EFFAF3] ring-1 ring-[#00A43A]" : "border-[#DCE6DF] hover:border-[#00A43A]"
                        }`}
                      >
                        <MapIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#00A43A]" />
                        <span>
                          <span className="block text-[15px] font-bold text-[#0B2E1F]">Pin on the map</span>
                          <span className="block text-[13px] text-[#4A6358]">Use my phone&apos;s location or tap the map</span>
                        </span>
                      </button>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={locationMode === "other"}
                        onClick={() => chooseLocationMode("other")}
                        className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors cursor-pointer ${
                          locationMode === "other" ? "border-[#00A43A] bg-[#EFFAF3] ring-1 ring-[#00A43A]" : "border-[#DCE6DF] hover:border-[#00A43A]"
                        }`}
                      >
                        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#4A6358]" />
                        <span>
                          <span className="block text-[15px] font-bold text-[#0B2E1F]">Choose the place</span>
                          <span className="block text-[13px] text-[#4A6358]">Province, district, sector…</span>
                        </span>
                      </button>
                    </div>

                    {locationMode === "other" && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {locationSelect("province", "Province", provinces, loadingLocation)}
                        {locationSelect("district", "District", districts, !formData.province || districts.length === 0)}
                        {locationSelect("sector", "Sector", sectors, !formData.district || sectors.length === 0)}
                        {locationSelect("cell", "Cell", cells, !formData.sector || cells.length === 0)}
                        <div className="sm:col-span-2">
                          {locationSelect("village", "Village", villages, !formData.cell || villages.length === 0)}
                        </div>
                        <label className="flex flex-col gap-1.5 sm:col-span-2">
                          <span className="text-[14px] font-bold text-[#0B2E1F]">
                            Landmark <span className="font-normal text-[#4A6358]">(optional)</span>
                          </span>
                          <input
                            value={formData.streetNumber || ""}
                            onChange={(e) => handleInputChange("streetNumber", e.target.value)}
                            placeholder="e.g. Plot 12, near the market"
                            className={`${field} border-[#DCE6DF]`}
                          />
                        </label>
                        {!registeredLocation && (
                          <label className="flex cursor-pointer items-center gap-2.5 rounded-xl bg-[#F6F9F7] px-3.5 py-3 text-[14px] text-[#0B2E1F] sm:col-span-2">
                            <input
                              type="checkbox"
                              checked={saveAsFarm}
                              onChange={(e) => setSaveAsFarm(e.target.checked)}
                              className="h-5 w-5 accent-[#00A43A]"
                            />
                            Save as my farm location, so next time I just pick “At my farm”
                          </label>
                        )}
                      </div>
                    )}

                    {locationMode === "map" && (
                      <div className="flex flex-col gap-2">
                        <p className="m-0 text-[14px] text-[#4A6358]">
                          Tap <b>Use my current location</b>, or tap the map where the produce is. We collect it from the
                          nearest collection site.
                        </p>
                        <div className="flex h-64 overflow-hidden rounded-2xl border border-[#DCE6DF]">
                          <MapComponent
                            showLocateButton
                            tempLocation={mapLocation}
                            onLocationSelect={(location) => {
                              setMapLocation(location)
                              setFormData((prev) => ({ ...prev, latitude: location.lat, longitude: location.lng }))
                            }}
                          />
                        </div>
                        {mapLocation ? (
                          <p className="m-0 flex items-center gap-1.5 text-[13px] font-bold text-[#007A35]">
                            <Check className="h-4 w-4" /> Pinned ({mapLocation.lat.toFixed(5)}, {mapLocation.lng.toFixed(5)})
                          </p>
                        ) : (
                          errorText("map")
                        )}
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>
          </div>

          {/* Footer: what will be sent, in plain words */}
          <div className="flex flex-col gap-2 border-t border-[#EEF3EF] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <p className="m-0 text-[14px] text-[#4A6358]">
              {ready
                ? `${formData.quantity} ${formData.unit} of ${formData.productName} at ${rwf(formData.wishedPrice)} / ${formData.unit}`
                : "Fill the steps above to submit."}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-12 flex-1 rounded-full border border-[#DCE6DF] bg-white px-5 text-[15px] font-bold text-[#0B2E1F] hover:border-[#00A43A] disabled:opacity-60 sm:flex-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.category || !formData.productName}
                className="inline-flex h-12 flex-[2] items-center justify-center gap-2 rounded-full bg-[#0B2E1F] px-6 text-[15px] font-bold text-white transition-colors hover:bg-[#0F5C36] disabled:opacity-50 sm:flex-none cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                  </>
                ) : total > 0 ? (
                  `Submit · ${rwf(total)}`
                ) : (
                  "Submit produce"
                )}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
