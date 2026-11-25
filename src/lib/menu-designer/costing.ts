// Menu designer. The same file is in the website (src/lib/menu-designer) and the app (src/features/menus/lib): keep both the same.
import type { MenuContent, MenuDish, MenuIngredient, MenuSection, PricedProduct } from './types';

/** Share of the selling price that food usually costs in a healthy restaurant (30%) */
export const TARGET_FOOD_COST = 0.3;

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/** The Food Bundles product an ingredient most likely means (by its search words, then its name) */
export function findProduct(ingredient: MenuIngredient, products: PricedProduct[]): PricedProduct | undefined {
  const words = [...(ingredient.match ?? []), ingredient.name].map(norm).filter(Boolean);
  for (const word of words) {
    const exact = products.find((p) => norm(p.name) === word);
    if (exact) return exact;
    const partial = products.find((p) => norm(p.name).includes(word));
    if (partial) return partial;
  }
  return undefined;
}

/** Links every ingredient that has no product yet to the matching Food Bundles product */
export function linkIngredients(content: MenuContent, products: PricedProduct[]): MenuContent {
  if (!products.length) return content;
  return {
    ...content,
    sections: content.sections.map((s) => ({
      ...s,
      dishes: s.dishes.map((d) => ({
        ...d,
        ingredients: d.ingredients.map((g) => {
          if (g.productId && products.some((p) => p.id === g.productId)) return g;
          const product = findProduct(g, products);
          return product ? { ...g, productId: product.id } : { ...g, productId: undefined };
        }),
      })),
    })),
  };
}

export interface DishCost {
  /** Cost of one plate at the customer's Food Bundles prices (linked ingredients only) */
  cost: number;
  /** Ingredients with no Food Bundles product: their cost is unknown */
  missing: string[];
}

export function dishCost(dish: MenuDish, products: PricedProduct[]): DishCost {
  let cost = 0;
  const missing: string[] = [];
  for (const g of dish.ingredients) {
    const product = g.productId ? products.find((p) => p.id === g.productId) : undefined;
    if (product) cost += product.price * (g.qty || 0);
    else missing.push(g.name);
  }
  return { cost: Math.round(cost), missing };
}

/** The price a dish sells for: its own, else its section's set price */
export const sellingPrice = (dish: MenuDish, section: MenuSection) => dish.price ?? section.price;

/** Margin as a share of the selling price (0.65 = 65%), or null without a price */
export const margin = (price: number | undefined, cost: number) => (price && price > 0 ? (price - cost) / price : null);

/** A price where food is 30% of it, rounded up to the next 500 RWF */
export const suggestedPrice = (cost: number) => (cost > 0 ? Math.ceil(cost / TARGET_FOOD_COST / 500) * 500 : 0);

export type MarginLevel = 'good' | 'ok' | 'low' | 'unknown';

/** 65%+ good, 50-65% ok, below 50% low */
export const marginLevel = (m: number | null): MarginLevel => (m === null ? 'unknown' : m >= 0.65 ? 'good' : m >= 0.5 ? 'ok' : 'low');

/** "10K" / "8.5K" / "750" for menus */
export const shortRwf = (n: number) =>
  n >= 1000 ? `${(Math.round(n / 100) / 10).toString().replace(/\.0$/, '')}K` : String(Math.round(n));

export const fullRwf = (n: number) => `${Math.round(n).toLocaleString('en-US')} RWF`;

let counter = 0;
/** A short id for new sections and dishes */
export const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}${(counter++).toString(36)}`;
