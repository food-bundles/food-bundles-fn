"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

export function FoodBundlesConnect() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const dynamicTexts = [
    "Get exclusive savings with our voucher system and enjoy premium benefits through our subscribe plans.",
    "Use voucher codes for instant discounts and subscribe to unlock priority delivery and special pricing.",
    "Save more with voucher rewards and subscribe for continuous benefits that grow with your business."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Showcase text changing after 10 seconds');
      setCurrentTextIndex((prev) => (prev + 1) % dynamicTexts.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [dynamicTexts.length]);

  const renderTextWithColors = (text: string) => {
    return text.split(' ').map((word, index) => {
      if (word.toLowerCase().includes('voucher')) {
        return <span key={index} className="text-orange-400 font-semibold">{word} </span>;
      } else if (word.toLowerCase().includes('subscribe')) {
        return <span key={index} className="text-green-700 font-semibold">{word} </span>;
      }
      return word + ' ';
    });
  };

  return (
    <section className="relative py-2 bg-white overflow-hidden">
      {/* === Green Circular Gradient === */}
      {/* <div className="absolute top-[-120px] left-[-120px] w-[450px] h-[550px] bg-[radial-gradient(circle_at_center,rgba(187,247,208,0.1)_0%,rgba(134,239,172,0.2)_70%,transparent_100%)] rounded-full blur-2xl">test</div> */}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 border border-green-500">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto border-green-500">
          <div className="space-y-3 lg:space-y-5 mt-2">

            <div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold transition-colors text-orange-400">
                <span className="text-orange-400">Voucher</span> & <span className="text-green-700">Subscribe</span>
              </h2>
              <p className="text-[13px] lg:text-[15px] text-gray-700 leading-relaxed max-w-lg mt-6 transition-all duration-500 ease-in-out">
                {renderTextWithColors(dynamicTexts[currentTextIndex])}
              </p>
            </div>
            <div className="space-y-2 mt-5">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 group text-green-700 group-hover:text-green-800 coursor-pointersubs transition-colors"
              >
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold transition-colors">
                  Connect
                </h2>
                <ArrowRight className="h-6 w-6  group-hover:translate-x-1 transition-all" />
              </Link>
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
                src="https://ik.imagekit.io/foodbundles/imgs/phones1.jpg?updatedAt=1762176585881"
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
