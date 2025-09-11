"use client"

import DashboardHeader from "./_components/header"
import StatsCards from "./_components/stats-cards"
import ProductManagement from "./_components/product-management"

export default function FarmerDashboard() {
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <DashboardHeader onNotificationClick={() =>(true)} />

        <div className="flex-1 flex">
          {/* Dashboard Content */}
          <div className="flex-1 p-6 space-y-6">
            {/* Stats Cards */}
            <StatsCards />

            {/* Product Management */}
            <ProductManagement />
          </div>

        </div>
      </div>

    </div>
  )
}
