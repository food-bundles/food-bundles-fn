import { AnimatedDotsBackground } from "@/components/animated-dots-background";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { HeroWithRestaurants } from "@/components/hero-section";
import QuickTalkSection from "@/components/quck-talk-section";
import { FoodBundlesConnect } from "@/components/showcase-section";
import { ChristmasAnimation } from "@/components/ChristmasAnimation";
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

        <div id="ask-help">
          <AnimatedDotsBackground className="">
            <QuickTalkSection />
          </AnimatedDotsBackground>
        </div>
        <Footer />
      </div>
      {/* <SantaClaus /> */}
      <div className="fixed bottom-4 right-4 z-50">
        <Image
          src="https://res.cloudinary.com/dwv5pqkgd/image/upload/v1765878468/bg-removed_o0ogcx.png" 
          alt="Santa Claus" 
          width={20}
          height={20}
          className="w-20 h-20 object-contain animate-bounce"
        />
      </div>
      {/* <ChristmasAnimation /> */}
      
    </div>
  );
}
