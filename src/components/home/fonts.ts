import { Carlito, Inter_Tight } from "next/font/google";

// Fonts of the food.rw look: Inter Tight for headings, Carlito (Calibri's
// metric twin) for body text. Used together with the .fb-home class.
const interTight = Inter_Tight({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const carlito = Carlito({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-carlito",
  display: "swap",
});

export const siteFontVariables = `${interTight.variable} ${carlito.variable}`;
