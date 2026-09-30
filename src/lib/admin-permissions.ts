/**
 * Dashboard permissions on the frontend. The catalog itself lives in the
 * backend (src/config/permissions.ts, served at GET /admin-roles/permissions);
 * here we only map dashboard pages to permission modules.
 *
 * Permission keys look like "orders.view" / "orders.manage".
 */

// Dashboard page → permission module (longest matching prefix wins)
const PAGE_MODULES: Array<[string, string]> = [
  ["/dashboard/farmer-submissions", "farmer_submissions"],
  ["/dashboard/restaurant-orders", "orders"],
  ["/dashboard/stock/products", "products"],
  ["/dashboard/stock/categories", "categories"],
  ["/dashboard/stock/units", "units"],
  ["/dashboard/stock/payment-methods", "payment_methods"],
  ["/dashboard/stock/customer-types", "customer_types"],
  ["/dashboard/stock/fb-reports", "sales_reports"],
  ["/dashboard/sales", "sales_reports"],
  ["/dashboard/subscriptions", "subscriptions"],
  ["/dashboard/markets", "markets"],
  ["/dashboard/market-reports", "markets"],
  ["/dashboard/predictive-intelligence", "intelligence"],
  ["/dashboard/supply-intelligence", "intelligence"],
  ["/dashboard/market-price-intelligence", "intelligence"],
  ["/dashboard/restaurant-kyc", "restaurant_kyc"],
  ["/dashboard/vouchers", "vouchers"],
  ["/dashboard/deposits", "deposits"],
  ["/dashboard/payments", "deposits"],
  ["/dashboard/newsletter", "newsletter"],
  ["/dashboard/invitations", "invitations"],
  ["/dashboard/users/lookup", "user_lookup"],
  ["/dashboard/users/farmers", "farmers"],
  ["/dashboard/users/restaurants", "restaurants"],
  ["/dashboard/users/affiliators", "affiliators"],
  ["/dashboard/users/administration", "admins"],
  ["/dashboard/contact-submissions", "messages"],
  ["/dashboard/promo-codes", "promo_codes"],
  ["/dashboard/settings/notification-recipient", "sms_recipients"],
];

// Pages only super admins may open
export const SUPER_ADMIN_PAGES = ["/dashboard/users/roles"];

/** Permission module for a dashboard page, or null when open to every dashboard user. */
export function getPageModule(pathname: string): string | null {
  let best: [string, string] | null = null;
  for (const entry of PAGE_MODULES) {
    if (pathname === entry[0] || pathname.startsWith(entry[0] + "/")) {
      if (!best || entry[0].length > best[0].length) best = entry;
    }
  }
  return best ? best[1] : null;
}

export interface PermissionUser {
  role?: string;
  permissions?: string[];
}

export const isSuperAdmin = (user?: PermissionUser | null) => user?.role === "SUPERUSER";

/** can(user, "orders") → view access; can(user, "orders", "manage") → edit access */
export function can(
  user: PermissionUser | null | undefined,
  module: string,
  action: "view" | "manage" = "view"
): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  return !!user.permissions?.includes(`${module}.${action}`);
}

/** Can this user open the given dashboard page? */
export function canOpenPage(user: PermissionUser | null | undefined, pathname: string): boolean {
  if (SUPER_ADMIN_PAGES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return isSuperAdmin(user);
  }
  const moduleKey = getPageModule(pathname);
  return moduleKey ? can(user, moduleKey) : true;
}
