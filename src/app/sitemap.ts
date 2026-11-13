import type { MetadataRoute } from "next";

const SITE = "https://www.food.rw";

// Public pages Google may list. Logged-in areas (dashboard, restaurant,
// farmers, traders) are left out and blocked in robots.ts.
const PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/shop", priority: 0.9, changeFrequency: "daily" },
  { path: "/price-comparison", priority: 0.8, changeFrequency: "daily" },
  { path: "/signup", priority: 0.7, changeFrequency: "monthly" },
  { path: "/apply-voucher", priority: 0.6, changeFrequency: "monthly" },
  { path: "/stories", priority: 0.6, changeFrequency: "weekly" },
  { path: "/support", priority: 0.5, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/refund-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/login", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PAGES.map((p) => ({
    url: `${SITE}${p.path === "/" ? "" : p.path}`,
    lastModified,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
