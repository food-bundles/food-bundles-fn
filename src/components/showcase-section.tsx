import Image from "next/image";

export function FoodBundlesConnect() {
  return (
    <section className="relative py-2 bg-white overflow-hidden">
      {/* === Green Circular Gradient === */}
      <div className="absolute top-[-120px] left-[-120px] w-[450px] h-[550px] bg-[radial-gradient(circle_at_center,rgba(187,247,208,0.1)_0%,rgba(134,239,172,0.2)_70%,transparent_100%)] rounded-full blur-2xl"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
          <div className="space-y-3 lg:space-y-5 mt-4">
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-green-700">
                Connect
              </h2>
            </div>

            <p className="text-[12px] lg:text-[14px] text-[#0A3B1B] leading-relaxed max-w-lg">
              FoodBundles connects restaurants with local farms to deliver fresh
              ingredients efficiently. It offers real-time order tracking,
              simple inventory management, and promotes sustainability in the
              food supply chain.
            </p>

            <div className="flex items-center gap-6 pt-4">
              <div>
                <p className="text-3xl font-bold text-green-700">24/7</p>
                <p className="text-[13px] text-[#0A3B1B]">Fresh Delivery</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-700">
                  99 <span className="text-orange-400">%</span>
                </p>
                <p className="text-[13px] text-[#0A3B1B]">Products</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-700">
                  50 <span className="text-orange-400">+</span>
                </p>
                <p className="text-[13px] text-[#0A3B1B]">Restaurants</p>
              </div>
            </div>
          </div>

          {/* Right Content - Two Phones Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[600px] h-[300px] md:h-[500px]">
              <Image
                src="/imgs/phones1.jpg"
                alt="FoodBundles app interface showing product catalog and order tracking on two mobile phones"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
