import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { CombinedProvider } from "./contexts/combined-provider";
import { Toaster } from "@/components/ui/sonner";
import { ToastContainer } from "react-toastify";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

type Author = {
  name: string;
  role: string;
};

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// const poppins = Poppins({
//   weight: ["400", "500", "600", "700"], 
//   subsets: ["latin"],
//   variable: "--font-poppins",
// });

export const metadata: Metadata = {
  title: "Food Bundles",
  description:
    "Food Bundles — Developed by Sostene, Elie, Shyirambere, and Muvunyi under the leadership of Dios (Project Manager & CEO)."
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable}`}>
      <body suppressHydrationWarning>
        <CombinedProvider>{children}</CombinedProvider>
        <ToastContainer />
        <Toaster />
      </body>
    </html>
  );
}
