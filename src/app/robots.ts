import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Logged-in areas and API routes are not for search results
      disallow: ["/dashboard", "/restaurant", "/farmers", "/traders", "/aggregator", "/logistics", "/api", "/unauthorized"],
    },
    sitemap: "https://www.food.rw/sitemap.xml",
    host: "https://www.food.rw",
  };
}
