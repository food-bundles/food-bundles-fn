import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { CombinedProvider } from "./contexts/combined-provider";
import { Toaster } from "@/components/ui/sonner";
import { ToastContainer } from "react-toastify";
import { ImageKitProvider } from "@/components/ImageKitProvider";
import Chatbot from "@/components/Chatbot";
import { GoogleOAuthProvider } from "@react-oauth/google";

const nunitoSans = Nunito_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-nunito-sans",
  display: "swap",
  fallback: ["system-ui", "arial", "sans-serif"],
});

const SITE_DESCRIPTION =
  "Food Bundles buys fresh produce directly from farmers and delivers it to restaurants, hotels and schools. Order online, pay by mobile money or card, and track every delivery.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.food.rw"),
  title: {
    default: "Food Bundles — Fresh food from farms to your kitchen",
    template: "%s | Food Bundles",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Food Bundles",
  keywords: ["Food Bundles", "food.rw", "fresh produce Rwanda", "restaurant supplier Kigali", "farm to table", "hotel food supply"],
  openGraph: {
    type: "website",
    url: "https://www.food.rw",
    siteName: "Food Bundles",
    title: "Food Bundles — Fresh food from farms to your kitchen",
    description: SITE_DESCRIPTION,
    locale: "en_RW",
    images: [{ url: "/home/food-bundles-logo.png", width: 360, height: 307, alt: "Food Bundles" }],
  },
  twitter: {
    card: "summary",
    title: "Food Bundles",
    description: SITE_DESCRIPTION,
    images: ["/home/food-bundles-logo.png"],
  },
  alternates: { canonical: "/" },
  // Google Search Console "HTML tag" method: set the code in Vercel's env vars.
  // Not needed when the domain is verified by a DNS TXT record.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${nunitoSans.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
          <ImageKitProvider>
            <CombinedProvider>
              {children}
              <Chatbot />
            </CombinedProvider>
          </ImageKitProvider>
          <ToastContainer />
          <Toaster />
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
