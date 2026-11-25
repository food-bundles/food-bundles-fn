// Menu designer. The same file is in the website (src/lib/menu-designer) and the app (src/features/menus/lib): keep both the same.

/** One ingredient of a dish: a Food Bundles product and how much of it one plate uses (in the product's unit) */
export interface MenuIngredient {
  productId?: string;
  name: string;
  qty: number;
  /** Search words to find the product when a template is opened (not saved) */
  match?: string[];
}

export interface MenuDish {
  id: string;
  name: string;
  description?: string;
  /** Selling price (RWF); empty = the section's set price */
  price?: number;
  image?: string;
  ingredients: MenuIngredient[];
}

export interface MenuSection {
  id: string;
  title: string;
  note?: string;
  /** One price for the whole section ("Lunch special @ 10K") */
  price?: number;
  dishes: MenuDish[];
}

export interface MenuContent {
  title: string;
  subtitle?: string;
  /** e.g. "Available 11AM - 4PM" */
  note?: string;
  /** e.g. "For reservation 0788 354 403" */
  contact?: string;
  sections: MenuSection[];
}

export type MenuLayout = 'list' | 'cards' | 'bold';

export interface MenuTheme {
  background: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  headingFont: string;
  bodyFont: string;
  /** Google Fonts families to load, e.g. "Playfair+Display:wght@600;800" */
  fonts: string[];
  uppercaseHeadings?: boolean;
  centered?: boolean;
  /** Dotted line between a dish and its price */
  leaders?: boolean;
  showImages?: boolean;
}

export interface MenuTemplate {
  id: string;
  name: string;
  description: string;
  layout: MenuLayout;
  theme: MenuTheme;
  starter: MenuContent;
}

/** A Food Bundles product at the price this customer pays */
export interface PricedProduct {
  id: string;
  name: string;
  unit: string;
  price: number;
}

/** A saved menu as the API returns it */
export interface SavedMenu {
  id: string;
  name: string;
  templateId: string;
  content: MenuContent;
  updatedAt: string;
}

export interface SavedMenuSummary {
  id: string;
  name: string;
  templateId: string;
  title: string;
  dishCount: number;
  updatedAt: string;
}
