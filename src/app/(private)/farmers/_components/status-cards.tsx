"use client"

import { Package, Clock, CheckCircle, XCircle, FileCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatusCardsProps {
  products: Array<{ status: string }>
  onStatusClick?: (status: string) => void
  selectedStatus?: string
}

export default function StatusCards({ products, onStatusClick, selectedStatus }: StatusCardsProps) {
  const statusConfig = [
    {
      label: "All Products",
      value: "All",
      icon: Package,
      color: "from-gray-500 to-gray-600",
    },
    {
      label: "Pending",
      value: "PENDING",
      icon: Clock,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      label: "Verified",
      value: "VERIFIED",
      icon: FileCheck,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Approved",
      value: "APPROVED",
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Rejected",
      value: "REJECTED",
      icon: XCircle,
      color: "from-red-500 to-red-600",
    },
  ]

  const getCount = (status: string) => {
    if (status === "All") return products.length
    return products.filter((p) => p.status === status).length
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {statusConfig.map((stat) => {
        const count = getCount(stat.value)
        const isSelected = selectedStatus === stat.value

        return (
          <Card
            key={stat.value}
            onClick={() => onStatusClick?.(stat.value)}
            className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
              isSelected ? "ring-2 ring-green-500" : ""
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{count}</h3>
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
