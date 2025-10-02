"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, MapPin } from "lucide-react"
import { Product } from "./product-context"

export const productColumns = (
  handleViewDetails: (p: Product | null) => void,
): ColumnDef<Product>[] => [
  {
    id: "no", 
    header: "No",
    cell: ({ row }) => row.index + 1, 
  },
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-black text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
          {row.original.name}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
  },
{
  accessorKey: "location",
  header: "Location",
  cell: ({ row }) => (
    <div className="flex items-start text-gray-600">
      <MapPin className="w-4 h-4 mr-1 text-gray-400 mt-0.5" />
      <span className="text-xs sm:text-sm leading-tight line-clamp-2">
        {row.original.location}
      </span>
    </div>
  ),
},

  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  
  {
    accessorKey: "submittedDate",
    header: "Date",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge className={`${row.original.statusColor} border-0 text-xs`}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-2">
    <Button
  variant="outline"
  size="sm"
  onMouseEnter={() => {
  handleViewDetails(row.original);
  }}
  onMouseLeave={() => {
   
      setTimeout(() => handleViewDetails(null), 100);
 
  }}
  onClick={() => handleViewDetails(row.original)} // lock modal open
  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs px-2 py-1"
>
  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
  <span className="hidden sm:inline">View</span>
</Button>

      </div>
    ),
  },
]
