import Image from "next/image"
import { Star } from "lucide-react"

export default function Testimonials() {
  return (
    <section className="relative z-10 px-8 py-16 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            What Our Users Say
            <span className="block w-24 h-1 bg-orange-500 mx-auto mt-2 rounded-full"></span>
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Hear from our community of farmers and restaurant owners
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Sarah Johnson - Farmer Testimonial */}
          <div className="bg-gray-50/50 rounded-2xl p-8 shadow-sm border border-gray-100/50">
            <div className="flex items-center mb-6">
              <Image
                src="/images/sarah.svg"
                alt="Sarah Johnson"
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover mr-4"
              />
              <div>
                <div className="flex text-yellow-500 mb-1">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <h4 className="font-semibold text-gray-900 text-lg">Sarah Johnson</h4>
                <p className="text-sm text-gray-600">Organic Vegetable Farmer</p>
              </div>
            </div>
            <p className="text-base text-gray-700 leading-relaxed">
              {
                '"FoodBundle has revolutionized how I sell my produce. I\'ve connected with high-end restaurants I never had access to before, and my revenue has increased by 30%."'
              }
            </p>
          </div>

          {/* Michael Chen - Restaurant Owner Testimonial */}
          <div className="bg-gray-50/50 rounded-2xl p-8 shadow-sm border border-gray-100/50">
            <div className="flex items-center mb-6">
              <Image
                src="/images/Michael.svg"
                alt="Michael Chen"
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover mr-4"
              />
              <div>
                <div className="flex text-yellow-500 mb-1">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <h4 className="font-semibold text-gray-900 text-lg">Michael Chen</h4>
                <p className="text-sm text-gray-600">Executive Chef, Harvest Table</p>
              </div>
            </div>
            <p className="text-base text-gray-700 leading-relaxed">
              {
                '"The quality and freshness of ingredients we source through FoodBundle has elevated our menu. Our customers notice the difference, and we\'ve built great relationships with local farmers."'
              }
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
