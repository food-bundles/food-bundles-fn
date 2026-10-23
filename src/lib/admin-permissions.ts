/**
 * Dashboard permissions on the frontend. The catalog itself lives in the
 * backend (src/config/permissions.ts, served at GET /admin-roles/permissions);
 * here we only map dashboard pages to permission modules.
 *
 * Permission keys look like "orders.view" or "orders.update_payment_status":
 * every feature has `view` plus its own actions.
 */

// Dashboard page → permission module (longest matching prefix wins)
const PAGE_MODULES: Array<[string, string]> = [
  ["/dashboard", "dashboard"],
  ["/dashboard/farmer-submissions", "farmer_submissions"],
  ["/dashboard/submission-verification", "farmer_submissions"],
  ["/dashboard/restaurant-orders", "orders"],
  ["/dashboard/deliveries", "deliveries"],
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
  ["/dashboard/settings/delivery-fees", "delivery_settings"],
];

// Pages every dashboard user may open (their own settings)
const OPEN_PAGES = ["/dashboard/settings/authenticator"];

// Pages only super admins may open
export const SUPER_ADMIN_PAGES = ["/dashboard/users/roles", "/dashboard/users/trash"];

const matches = (pathname: string, page: string) =>
  pathname === page || pathname.startsWith(page + "/");

/** Permission module for a dashboard page, or null when open to every dashboard user. */
export function getPageModule(pathname: string): string | null {
  if (OPEN_PAGES.some((p) => matches(pathname, p))) return null;
  let best: [string, string] | null = null;
  for (const entry of PAGE_MODULES) {
    // "/dashboard" itself only covers the home page, not every page below it
    const hit = entry[0] === "/dashboard" ? pathname === "/dashboard" : matches(pathname, entry[0]);
    if (hit && (!best || entry[0].length > best[0].length)) best = entry;
  }
  return best ? best[1] : null;
}

export interface PermissionUser {
  role?: string;
  permissions?: string[];
}

export const isSuperAdmin = (user?: PermissionUser | null) => user?.role === "SUPERUSER";

/**
 * can(user, "orders")                          → may open / read orders
 * can(user, "orders", "update_payment_status") → that one action
 * can(user, "orders", "manage")                → any action besides view
 */
export function can(
  user: PermissionUser | null | undefined,
  module: string,
  action: string = "view"
): boolean {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  const permissions = user.permissions || [];
  if (action === "manage") {
    return permissions.some((p) => p.startsWith(`${module}.`) && p !== `${module}.view`);
  }
  return permissions.includes(`${module}.${action}`);
}

/** Can this user open the given dashboard page? */
export function canOpenPage(user: PermissionUser | null | undefined, pathname: string): boolean {
  if (SUPER_ADMIN_PAGES.some((p) => matches(pathname, p))) {
    return isSuperAdmin(user);
  }
  const moduleKey = getPageModule(pathname);
  return moduleKey ? can(user, moduleKey) : true;
}

/**
 * Where a dashboard user lands: the statistics home when they may see it,
 * otherwise the first page their role opens (e.g. an aggregator lands on
 * submission verification).
 */
export function firstDashboardPage(user: PermissionUser | null | undefined): string {
  if (can(user, "dashboard")) return "/dashboard";
  const page = PAGE_MODULES.find(([path, module]) => path !== "/dashboard" && can(user, module));
  return page ? page[0] : "/dashboard/settings/authenticator";
}
