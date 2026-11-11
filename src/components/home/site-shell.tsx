import type { ReactNode } from "react";
import "./home.css";
import { siteFontVariables } from "./fonts";
import { HomeNav } from "./home-nav";
import { HomeFooter } from "./home-footer";
import { ContactPill } from "./home-card";

// Frame for every public page that isn't the home page: the same header,
// footer and contact pill as the landing page, on the food.rw look.
export function SiteShell({ children, footer = true }: { children: ReactNode; footer?: boolean }) {
  return (
    <div className={`fb-home ${siteFontVariables} flex min-h-screen flex-col`}>
      <HomeNav variant="solid" />
      <main className="grow">{children}</main>
      {footer && <HomeFooter />}
      <ContactPill />
    </div>
  );
}
