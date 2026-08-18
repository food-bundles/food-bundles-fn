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
});

export const metadata: Metadata = {
  title: "Food Bundles"
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${nunitoSans.variable}`}>
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
