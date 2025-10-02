import DashboardHeader from "./_components/farmerheader"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import StatsCards from "./_components/stats-cards"
import ProductManagement from "./_components/product-management"
import { ProductProvider } from "./_components/product-context"

export default function FarmerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Add here when needed */}
      
      {/* Main Content Wrapper */}
      <div className="flex flex-col min-h-screen">
        {/* Header - Sticky at top */}
        <DashboardHeader />
        
        {/* Main Content Area */}
        <main className="flex-1 w-full">
          {/* Dashboard Content Container */}
          <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-3 sm:py-4 md:py-6 lg:py-8">
            {/* Stats Cards - Uncomment when ready */}
            {/* <StatsCards /> */}
            
            {/* Product Management Section */}
            <ProductProvider>
              <ProductManagement />
            </ProductProvider>
          </div>
        </main>
      </div>
    </div>
  )
}