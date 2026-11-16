import type { Metadata } from "next";
// The home page styles (hero background, ring, fonts…): required, see src/types/css.d.ts
import "@/components/home/home.css";
import { siteFontVariables } from "@/components/home/fonts";
import { HomeNav } from "@/components/home/home-nav";
import { BuyerCategories, HomeHero } from "@/components/home/home-hero";
import { DistributionEngine, ValuesSection } from "@/components/home/home-engine";
import { BundleSection, PartnerRing } from "@/components/home/home-bundle";
import { AppsAndCta, CardSection, ContactPill, FoodCourts } from "@/components/home/home-card";
import { HomeFooter } from "@/components/home/home-footer";

export const metadata: Metadata = {
  title: { absolute: "Food Bundles — Global fresh food infrastructure" },
  alternates: { canonical: "/" },
  description:
    "Fresh food from farmers to restaurants, hotels and schools: distribution, instant mobile-money payment and contract farming.",
};

export default function HomePage() {
  return (
    <div className={`fb-home ${siteFontVariables} relative min-h-screen overflow-x-hidden`}>
      <HomeNav />
      <main>
        <HomeHero />
        <BuyerCategories />
        <DistributionEngine />
        <BundleSection />
        <ValuesSection />
        <CardSection />
        <FoodCourts />
        <div className="pt-16">
          <PartnerRing />
        </div>
        <AppsAndCta />
      </main>
      <HomeFooter />
      <ContactPill />
    </div>
  );
}
