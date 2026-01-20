import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { CombinedProvider } from "./contexts/combined-provider";
import { Toaster } from "@/components/ui/sonner";
import { ToastContainer } from "react-toastify";
import { ImageKitProvider } from "@/components/ImageKitProvider";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Food Bundles"
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable}`}>
      <body suppressHydrationWarning>
        <ImageKitProvider>
          <CombinedProvider>{children}</CombinedProvider>
        </ImageKitProvider>
        <ToastContainer />
        <Toaster />
      </body>
    </html>
  );
}
