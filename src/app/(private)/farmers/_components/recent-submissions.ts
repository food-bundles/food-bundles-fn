import type { Product } from "./product-context";
import type { RecentSubmission } from "./product-submission-modal";

/** "Submit again": the farmer's latest different products (newest first), for the submit form */
export function recentFromProducts(products: Product[], max = 6): RecentSubmission[] {
  const seen = new Set<string>();
  const list: RecentSubmission[] = [];
  for (const p of products) {
    const key = `${p.category?.name}|${p.name}`.toLowerCase();
    if (seen.has(key) || !p.category?.name) continue;
    seen.add(key);
    list.push({ category: p.category.name, productName: p.name, unit: p.unit || "kg", wishedPrice: p.priceValue });
    if (list.length === max) break;
  }
  return list;
}
