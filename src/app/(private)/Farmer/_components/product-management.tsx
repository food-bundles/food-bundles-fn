/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { Plus, Calendar, Eye, Trash2, Package, Tag, X, Hash, MapPin, RefreshCw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import ProductSubmissionModal, { ProductSubmissionData } from "./product-submission-modal"
import { productColumns } from "./product-columns"
import { DataTable } from "@/components/data-table"
import { Product } from "./product-context"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { productSubmissionService, Submission } from "@/app/services/productSubmissionService"

interface productSubmitData {
  productName: string
  category: string
  quantity: number
  unit: string
  submittedDate: string
  price: string
  status: string
  statusColor: string
  image: string
  location: string
  priceValue: number
}

// Status color mapping function
const getStatusColor = (status: string): string => {
  switch (status) {
    case "APPROVED":
    case "Approved":
      return "bg-green-100 text-green-800"
    case "PENDING":
    case "Pending":
      return "bg-yellow-100 text-yellow-800"
    case "VERIFIED":
    case "Verified":
      return "bg-blue-100 text-blue-800"
    case "REJECTED":
    case "Rejected":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Transform database submission to Product format
const transformSubmissionToProduct = (submission: Submission): Product => {
  const locationParts = [
    submission.village,
    submission.cell,
    submission.sector,
  ].filter(Boolean)

  const location = locationParts.length > 0 ? locationParts.join(", ") : "Rwanda"

  return {
    id: submission.id,
    name: submission.productName,
    category: submission.category?.name || "General",
    quantity: `${submission.submittedQty}`,
    unit: submission.unit,
    submittedDate: new Date(submission.submittedAt).toLocaleDateString(),
    price: `RWF ${submission.wishedPrice.toLocaleString()}`,
    status: submission.status,
    statusColor: getStatusColor(submission.status),
    image: "/placeholder.svg?height=48&width=48&text=Product",
    location,
    priceValue: submission.wishedPrice,
  }
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>("All")
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [dateFilter, setDateFilter] = useState("")
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewProduct, setViewProduct] = useState<Product | null>(null) 

  const statusOptions = ["All", "PENDING", "VERIFIED", "APPROVED", "REJECTED"]

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      setError(null)
      const submissions = await productSubmissionService.getSubmissionHistory()
      const transformedProducts = submissions.map(transformSubmissionToProduct)
      setProducts(transformedProducts)
    } catch (err) {
      console.error("Failed to fetch submissions:", err)
      setError("Failed to load submissions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesStatus = selectedStatus === "All" || product.status === selectedStatus
    const matchesDate = !dateFilter || product.submittedDate.includes(dateFilter)
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.location.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesDate && matchesSearch
  })

  const handleProductSubmit = async (data: ProductSubmissionData) => {
    try {
      setLoading(true)
      await productSubmissionService.submitProduct(data)
      await fetchSubmissions()
      setShowSubmissionModal(false)
      alert("Product submitted successfully!")
    } catch (error) {
      console.error("Error submitting product:", error)
      alert("Failed to submit product. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (product: Product | null, lock = false) => {
    setViewProduct(product)
  }

  const handleRefresh = () => {
    fetchSubmissions()
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setSelectedStatus("All")
    setDateFilter("")
  }

  // Loading state
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Failed to load products
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Product Management
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowSubmissionModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
                disabled={loading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Submit Product
              </Button>
            </div>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {statusOptions.map((status) => (
              <Button
                key={status}
                variant="outline"
                size="sm"
                onClick={() => setSelectedStatus(status)}
                className={
                  selectedStatus === status
                    ? "bg-green-600 text-white border-green-600 hover:bg-green-700"
                    : "bg-transparent text-gray-600 border-gray-300 hover:bg-gray-50"
                }
              >
                {status} ({status === "All" ? products.length : products.filter((p) => p.status === status).length})
              </Button>
            ))}
          </div>

          {/* Search and Date Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search products, categories, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDateFilter(!showDateFilter)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Date Filter
              </Button>
              {(searchTerm || selectedStatus !== "All" || dateFilter) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearFilters}
                  className="text-red-600 hover:text-red-700"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {showDateFilter && (
            <div className="mb-6 max-w-xs">
              <Input 
                type="date" 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Filter by date"
              />
            </div>
          )}

          {/* Data Table */}
          <DataTable
            columns={productColumns(handleViewDetails)}
            data={filteredProducts}
            title=""
            descrption=""
            showExport={false}
            showSearch={false}
            showColumnVisibility={true}
            showPagination={true}
            showRowSelection={false}
          />

          {/* Empty State */}
          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found</p>
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Product Submission Modal */}
      <ProductSubmissionModal
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        onSubmit={handleProductSubmit}
      />

      {/* Product Details Hover Card */}
      {!!viewProduct && (
        <div 
          className="fixed z-50 top-40 right-4 bg-white rounded-2xl shadow-2xl w-auto max-w-xs p-4 border border-gray-200"
          onMouseLeave={() => setViewProduct(null)}
        >
          <button
            onClick={() => setViewProduct(null)}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          <h2 className="text-lg font-semibold text-gray-900 mb-3 pr-6">Product Details</h2>

          <div className="flex flex-col gap-3 text-sm text-gray-700">
            {/* Name */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-3 h-3 text-blue-600" />
                </div>
                <span className="font-medium">Name:</span>
              </div>
              <span className="text-right">{viewProduct.name}</span>
            </div>

            {/* Category */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Tag className="w-3 h-3 text-purple-600" />
                </div>
                <span className="font-medium">Category:</span>
              </div>
              <span className="text-right">{viewProduct.category}</span>
            </div>

            {/* Quantity */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Hash className="w-3 h-3 text-green-600" />
                </div>
                <span className="font-medium">Quantity:</span>
              </div>
              <span className="text-right">{viewProduct.quantity}</span>
            </div>

            {/* Location */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3 h-3 text-red-600" />
                </div>
                <span className="font-medium">Location:</span>
              </div>
              <span className="text-right">{viewProduct.location}</span>
            </div>

            {/* Price */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-yellow-600"></div>
                </div>
                <span className="font-medium">Price:</span>
              </div>
              <span className="text-right font-semibold">{viewProduct.price}</span>
            </div>

            {/* Status */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                </div>
                <span className="font-medium">Status:</span>
              </div>
              <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(viewProduct.status)}`}>
                {viewProduct.status}
              </span>
            </div>

            {/* Submitted */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-3 h-3 text-indigo-600" />
                </div>
                <span className="font-medium">Submitted:</span>
              </div>
              <span className="text-right">{viewProduct.submittedDate}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}