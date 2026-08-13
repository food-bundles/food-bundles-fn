"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { OptimizedImage } from "./OptimizedImage";

type Phase = "entering" | "visible" | "exiting";

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

const imageAlts = [
  "Order tracking interface showing real-time delivery status and progress",
  "Voucher system interface displaying loan options and discount codes",
  "Subscription plans showing Basic 20k and Premium 50k options"
];

export function FoodBundlesConnect() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [scrollPhase, setScrollPhase] = useState<Phase>("entering");
  const [dynPhase, setDynPhase] = useState<Phase>("entering");
  const [phonePhase, setPhonePhase] = useState<Phase>("entering");
  const sectionRef = useRef<HTMLElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animate everything in on mount
  useEffect(() => {
    scrollTimer.current = setTimeout(() => {
      setScrollPhase("visible");
      setDynPhase("visible");
      setPhonePhase("visible");
    }, 80);
    return () => { if (scrollTimer.current) clearTimeout(scrollTimer.current); };
  }, []);

  // Re-animate scroll-driven parts every time section enters viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (scrollTimer.current) clearTimeout(scrollTimer.current);
          setScrollPhase("entering");
          scrollTimer.current = setTimeout(() => setScrollPhase("visible"), 80);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Slide interval — 4s: animate dynamic text + phone out, swap, animate in
  useEffect(() => {
    const interval = setInterval(() => {
      const next = (currentIndex + 1) % dynamicTexts.length;
      // Exit dynamic text and phone together
      setDynPhase("exiting");
      setPhonePhase("exiting");
      slideTimer.current = setTimeout(() => {
        setDisplayIndex(next);
        setCurrentIndex(next);
        setDynPhase("entering");
        setPhonePhase("entering");
        setTimeout(() => {
          setDynPhase("visible");
          setPhonePhase("visible");
        }, 50);
      }, 450);
    }, 8000);
    return () => {
      clearInterval(interval);
      if (slideTimer.current) clearTimeout(slideTimer.current);
    };
  }, [currentIndex]);

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

  // Scroll-driven: static left content fades up on every viewport entry
  const scrollStyle: React.CSSProperties = {
    entering: { opacity: 0, transform: "translateY(24px)", transition: "opacity 0.8s ease-out, transform 0.8s ease-out" },
    visible:  { opacity: 1, transform: "translateY(0)",   transition: "opacity 0.8s ease-out, transform 0.8s ease-out" },
    exiting:  { opacity: 0, transform: "translateY(-16px)", transition: "opacity 0.4s ease-in, transform 0.4s ease-in" },
  }[scrollPhase];

  // Slide-driven: dynamic title + paragraph animate out/in on each slide change
  const dynStyle: React.CSSProperties = {
    entering: { opacity: 0, transform: "translateY(20px)", transition: "opacity 0.6s ease-out, transform 0.6s ease-out" },
    visible:  { opacity: 1, transform: "translateY(0)",   transition: "opacity 0.6s ease-out, transform 0.6s ease-out" },
    exiting:  { opacity: 0, transform: "translateY(-16px)", transition: "opacity 0.35s ease-in, transform 0.35s ease-in" },
  }[dynPhase];

  const phoneStyle: React.CSSProperties = {
    entering: { opacity: 0, transform: "translateX(40px)", transition: "opacity 0.5s ease-out, transform 0.5s ease-out" },
    visible:  { opacity: 1, transform: "translateX(0)",   transition: "opacity 0.5s ease-out, transform 0.5s ease-out" },
    exiting:  { opacity: 0, transform: "translateX(-30px)", transition: "opacity 0.35s ease-in, transform 0.35s ease-in" },
  }[phonePhase];

  return (
    <section ref={sectionRef} className="relative py-2 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">

          {/* Left — static parts animate in on every scroll into view */}
          <div className="space-y-3 lg:space-y-5 mt-2" style={scrollStyle}>
            {/* Dynamic title + paragraph — also animate on each slide change */}
            <div style={dynStyle}>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-orange-400">
                <span className="text-black/60">Voucher</span> & <span className="text-green-700 hover:underline"><Link href="/restaurant/subscribe">Subscribe</Link></span>
              </h2>
              <p className="text-[13px] lg:text-[15px] text-gray-700 leading-relaxed max-w-lg mt-6">
                {renderTextWithColors(dynamicTexts[displayIndex])}
              </p>
            </div>
            <div className="space-y-2 mt-5">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 group text-green-700 group-hover:text-green-800 cursor-pointer transition-colors"
              >
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold transition-colors">
                  Connect to our farm
                </h2>
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-all" />
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
                <p className="text-3xl font-bold text-green-700">99 <span className="text-orange-400">%</span></p>
                <p className="text-[13px] text-[#0A3B1B]">Products</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-700">50 <span className="text-orange-400">+</span></p>
                <p className="text-[13px] text-[#0A3B1B]">Restaurants</p>
              </div>
            </div>
          </div>

          {/* Right — phone slides in from right, exits to left */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[600px] h-[300px] md:h-[500px]" style={phoneStyle}>
              <OptimizedImage
                src={images[displayIndex]}
                alt={imageAlts[displayIndex]}
                fill
                className="object-contain"
                priority={displayIndex === 0}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
