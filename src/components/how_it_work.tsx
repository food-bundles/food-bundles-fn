import { User, Search, Utensils } from 'lucide-react'

export default function HowItWorks() {
  return (
    <section className="relative z-10 px-8 py-24 bg-[#F9FAFB]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Our platform streamlines the process from farm to restaurant, making local sourcing simple, efficient and reliable.
          </p>
        </div>

        {/* Three Steps */}
        <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
          {/* Step 1: Farmers Submit Products */}
          <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Farmers Submit Products
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Local farmers list their available produce with details like quantity, price, and harvest dates.
            </p>
          </div>

          {/* Step 2: Browse Quality Produce */}
          <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Browse Quality Produce
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Restaurants browse through a curated marketplace of fresh, local ingredients from verified farms.
            </p>
          </div>

          {/* Step 3: Fast Restaurant Delivery */}
          <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Utensils className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Fast Restaurant Delivery
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Scheduled deliveries ensure restaurants receive fresh ingredients exactly when they need them.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
