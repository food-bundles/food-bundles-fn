import localFont from "next/font/local";

// Fonts of the food.rw look: Inter Tight for headings, Carlito (Calibri's
// metric twin) for body text. Used together with the .fb-home class.
// Self-hosted in src/fonts so builds never depend on Google Fonts.
const interTight = localFont({
  src: "../../fonts/inter-tight-latin-var.woff2",
  weight: "100 900",
  variable: "--font-inter-tight",
  display: "swap",
});

const carlito = localFont({
  src: [
    { path: "../../fonts/carlito-latin-400.woff2", weight: "400", style: "normal" },
    { path: "../../fonts/carlito-latin-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-carlito",
  display: "swap",
});

export const siteFontVariables = `${interTight.variable} ${carlito.variable}`;
