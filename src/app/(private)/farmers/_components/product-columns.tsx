"use client"

import { stageLabel, foodBundlesPriceNote } from "./status-helpers";
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, MapPin, UserRound } from "lucide-react"
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
    cell: ({ row }) => (
      <span className="text-sm">
        {typeof row.original.category === 'string' 
          ? row.original.category 
          : row.original.category.name}
      </span>
    ),
  },
{
  accessorKey: "location",
  header: "Location",
  cell: ({ row }) => (
    <div className="flex items-start text-[#4A6358]">
      <MapPin className="w-4 h-4 mr-1 text-[#7A8E83] mt-0.5" />
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
    cell: ({ row }) => {
      const note = foodBundlesPriceNote(row.original);
      return (
        <div className="leading-tight">
          <div>{row.original.price}</div>
          {note && (
            <div className="text-xs font-medium text-green-700">
              {note.label}: {note.value}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "displayStatus",
    header: "Status",
    cell: ({ row }) => (
      <Badge className={`${row.original.statusColor} border-0 text-xs`}>
        {stageLabel(row.original.displayStatus)}
      </Badge>
    ),
  },
  // Who receives the harvest, and how it was paid once paid
  {
    id: "aggregator",
    header: "Aggregator",
    cell: ({ row }) => {
      const { aggregator, paymentMethod } = row.original
      return (
        <div className="flex flex-col gap-1 text-xs">
          {aggregator ? (
            <span className="flex items-start gap-1 text-gray-700">
              <UserRound className="w-3.5 h-3.5 mt-0.5 text-green-700 shrink-0" />
              <span>
                <span className="font-medium">{aggregator.name}</span>
                {aggregator.phone && <span className="block text-gray-500">{aggregator.phone}</span>}
              </span>
            </span>
          ) : (
            <span className="text-gray-400">Not assigned yet</span>
          )}
          {paymentMethod && (
            <Badge variant="outline" className="w-fit text-[10px]">
              Paid by {paymentMethod === "MOMO" ? "MoMo" : "cash"}
            </Badge>
          )}
        </div>
      )
    },
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleViewDetails(row.original)}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs px-2 py-1"
        >
          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">View</span>
        </Button>
      </div>
    ),
  },
]
