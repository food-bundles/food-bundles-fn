"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { OptimizedImage } from "./OptimizedImage";

export function FoodBundlesConnect() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const dynamicTexts = [
    "Track your orders in real-time with our advanced delivery tracking system and stay updated on every step.",
    "Get exclusive voucher loans and discounts to help grow your restaurant business with flexible payment options.",
    "Choose from our subscription plans: Basic (20k) for essential features or Premium (50k) for advanced benefits."
  ];

  const images = [
    "/showcase/10.png",
    "/showcase/11.png",
    "/showcase/12.png"
  ];

  // src="/imgs/Food_bundle_logo.png"


  const imageAlts = [
    "Order tracking interface showing real-time delivery status and progress",
    "Voucher system interface displaying loan options and discount codes",
    "Subscription plans showing Basic 20k and Premium 50k options"
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto border-green-500">
          <div className="space-y-3 lg:space-y-5 mt-2">

            <div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold transition-colors text-orange-400">
                <span className="text-orange-400">Voucher</span> & <span className="text-green-700 hover:underline"><Link href="/restaurant/subscribe">Subscribe</Link></span>
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
                  Connect to our farm
                </h2>
                <ArrowRight className="h-6 w-6  group-hover:translate-x-1 transition-all" />
              </Link>
            </div>

            <p className="text-[12px] lg:text-[14px] text-[#0A3B1B] leading-relaxed max-w-lg">
              Food Bundles Ltd connects restaurants with local farms to deliver fresh
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

          {/* Right Content - Animated Feature Images */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[600px] h-[300px] md:h-[500px]">
              {images.map((image, index) => (
                <div
                  key={image}
                  className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${index === currentTextIndex ? "opacity-100" : "opacity-0"
                    }`}
                > 
                  <OptimizedImage
                    src={image}
                    alt={imageAlts[index]}
                    fill
                    className="object-contain"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
