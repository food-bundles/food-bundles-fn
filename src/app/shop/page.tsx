import type { Metadata } from "next";
import { SiteShell } from "@/components/home/site-shell";
import { ShopCatalog } from "@/components/shop/shop-catalog";

export const metadata: Metadata = {
  title: "Shop — Food Bundles",
  description: "Fresh produce, meat and drinks from Rwanda's farmers, delivered to your kitchen.",
};

// Open to everyone: visitors fill a cart in the browser and log in at checkout.
export default function ShopPage() {
  return (
    <SiteShell>
      <section className="fb-mesh px-4 pb-10 pt-10 text-white sm:px-8 sm:pt-14">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-3">
          <span className="inline-flex items-center gap-2 self-start rounded-full bg-white/15 px-3 py-1.5 text-[13px] font-bold tracking-[1.2px]">
            <span className="fb-live h-2 w-2 rounded-full bg-[#00D048]" />
            TODAY’S MARKET
          </span>
          <h1 className="fb-display m-0 text-[clamp(36px,5vw,60px)] font-bold leading-[1] tracking-[-1.8px]">
            Fresh from the farm gate.
          </h1>
          <p className="m-0 max-w-[560px] text-lg leading-relaxed text-[#E4F5EA]">
            Produce, meat and drinks from Rwanda’s farmers. Fill your cart now — you only log in when you check out.
          </p>
        </div>
      </section>
      <ShopCatalog />
    </SiteShell>
  );
}
