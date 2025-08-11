import { Button } from "@/components/ui/button"
import { CheckCircle, Truck, DollarSign, Users, Leaf, Clock } from "lucide-react"

export default function WhyChoose() {
  return (
    <section className="relative z-10 px-8 py-16 bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why Choose FoodBundle?</h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">We create value for both sides of the marketplace</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* For Farmers - Left Column */}
          <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-gray-100/50">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">For Farmers</h3>
            </div>

            <div className="space-y-6 mb-8">
              {/* Direct Market Access */}
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Direct Market Access</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Connect directly with restaurants seeking your produce
                  </p>
                </div>
              </div>

              {/* Fair Pricing */}
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Fair Pricing</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Set your own prices and receive full value for quality
                  </p>
                </div>
              </div>

              {/* Simplified Logistics */}
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Truck className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Simplified Logistics</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We handle delivery coordination and scheduling
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold text-base">
              Join as Farmer →
            </Button>
          </div>

          {/* For Restaurants - Right Column */}
          <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-gray-100/50">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">For Restaurants</h3>
            </div>

            <div className="space-y-6 mb-8">
              {/* Fresh Local Ingredients */}
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Leaf className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Fresh Local Ingredients</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Access to seasonal produce picked at peak freshness
                  </p>
                </div>
              </div>

              {/* Reliable Supply Chain */}
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Reliable Supply Chain</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">Consistent quality and on-time deliveries</p>
                </div>
              </div>

              {/* Supporting Local Economy */}
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Supporting Local Economy</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">Build your brand through sustainable sourcing</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold text-base">
              Register Restaurant →
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
