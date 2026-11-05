import { AnimatedDotsBackground } from "@/components/animated-dots-background";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { HeroWithRestaurants } from "@/components/hero-section";
import QuickTalkSection from "@/components/quck-talk-section";
import { FoodBundlesConnect } from "@/components/showcase-section";
import { VoucherApplyQr } from "@/components/voucher-apply-qr";
// import { ChristmasAnimation } from "@/components/ChristmasAnimation";
import Image from "next/image";

export default async function HomePage() {
  const restaurants = [
    {
      name: "Imboni",
      image: "/restaurants/rest3.png",
      featuredPost:
        "Just received fresh organic tomatoes for tonight's special pasta!",
      seen: true,
    },
    {
      name: "Laza",
      image: "/restaurants/laza-girl.png",
      featuredPost:
        "Our new vegan menu is launching next week with locally sourced ingredients.",
      seen: false,
    },
    {
      name: "Mr Chip's",
      image: "/restaurants/rest8.png",
      featuredPost:
        "Fresh catch of the day: Atlantic salmon and sea bass available now!",
      seen: true,
    },
    {
      name: "Tugende Hostel",
      image: "/restaurants/Tugende Hostel.jpg",
      featuredPost:
        "Authentic spices and herbs sourced directly from India for our curry dishes.",
      seen: false,
    },
    {
      name: "Food & Stuff",
      image: "/restaurants/rest7.png",
      featuredPost:
        "Farm-to-table dining with ingredients harvested this morning!",
      seen: true,
    },
    {
      name: "sole Luna",
      image: "/restaurants/sole-luna.png",
      featuredPost: "Daily fresh seafood selection from local fishermen.",
      seen: true,
    },
    {
      name: "Petit Marché",
      image: "/restaurants/rest4.png",
      featuredPost:
        "Authentic Mediterranean cuisine with olive oil from Greece.",
      seen: false,
    },
    {
      name: "Simple by Inki",
      image: "/restaurants/rest13.png",
      featuredPost: "Modern Japanese dishes with a contemporary twist.",
      seen: true,
    },
    {
      name: "Ewaka ",
      image: "/restaurants/rest1.png",
      featuredPost: "Country-style cooking with locally grown ingredients.",
      seen: false,
    },
    {
      name: "Bicu Lounge",
      image: "/restaurants/rest9.png",
      featuredPost: "Grilled specialties with ocean-fresh seafood daily.",
      seen: true,
    },
    {
      name: "Mukati na Butta",
      image: "/restaurants/rest12.png",
      featuredPost: "Plant-based cuisine featuring seasonal vegetables.",
      seen: true,
    },
    {
      name: "Country Roots",
      image: "/restaurants/Untitled design (9).png",
      featuredPost:
        "Family-owned restaurant supporting local farmers for 25 years.",
      seen: true,
    },
       {
      name: "Imboni",
      image: "/restaurants/rest3.png",
      featuredPost:
        "Just received fresh organic tomatoes for tonight's special pasta!",
      seen: true,
    },
    {
      name: "Laza",
      image: "/restaurants/laza-girl.png",
      featuredPost:
        "Our new vegan menu is launching next week with locally sourced ingredients.",
      seen: false,
    },
    {
      name: "Mr Chip's",
      image: "/restaurants/rest8.png",
      featuredPost:
        "Fresh catch of the day: Atlantic salmon and sea bass available now!",
      seen: true,
    },
    {
      name: "Tugende Hostel",
      image: "/restaurants/Tugende Hostel.jpg",
      featuredPost:
        "Authentic spices and herbs sourced directly from India for our curry dishes.",
      seen: false,
    },
    {
      name: "Food & Stuff",
      image: "/restaurants/rest7.png",
      featuredPost:
        "Farm-to-table dining with ingredients harvested this morning!",
      seen: true,
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="h-12 bg-green-700"></div>
      <div>
        <div id="home">
          <HeroWithRestaurants restaurants={restaurants} />
        </div>
        <div id="connect">
          <FoodBundlesConnect />
        </div>

        <div id="voucher" className="bg-white py-14 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-green-700">
                  Restaurant financing
                </span>
                <h2 className="mt-4 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
                  Apply for a Food Bundles voucher card
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-600 sm:text-base">
                  Scan the QR code with your phone camera to create an account, apply for
                  your voucher card, accept the terms and conditions, and request the
                  financing your restaurant needs.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-600" />
                    Create an account or sign in if you are already registered.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-600" />
                    Submit your voucher card application and accept the terms.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-600" />
                    Request financing from your voucher page once your card is set up.
                  </li>
                </ul>
              </div>

              <VoucherApplyQr size={220} showActions={false} />
            </div>
          </div>
        </div>

        <div id="ask-help">
          <AnimatedDotsBackground className="">
            <QuickTalkSection />
          </AnimatedDotsBackground>
        </div>
        <Footer />
      </div>
      {/* <SantaClaus /> */}
      {/* <div className="fixed bottom-4 right-4 z-50">
        <Image
          src="https://res.cloudinary.com/dwv5pqkgd/image/upload/v1765878468/bg-removed_o0ogcx.png" 
          alt="Santa Claus" 
          width={20}
          height={20}
          className="w-20 h-20 object-contain animate-bounce"
        />
      </div> */}
      {/* <ChristmasAnimation /> */}
      
    </div>
  );
}
