

import DashboardHeader from "./_components/farmerheader"
import StatsCards from "./_components/stats-cards"
import ProductManagement from "./_components/product-management"
import { ProductProvider } from "./_components/product-context"

export default function FarmerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <DashboardHeader />

        <div className="flex-1 flex">
          {/* Dashboard Content */}
          <div className="container mx-auto px-6 py-6">
         
            {/* <StatsCards /> */}

            <ProductProvider>
            <ProductManagement />
            </ProductProvider>
          </div>
        </div>
      </div>
    </div>
  )
}
