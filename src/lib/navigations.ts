import { UserRole } from "@/lib/types";

const TraderAppUrl = process.env.NEXT_PUBLIC_TRADER_APP_URL as string;

// Protected route prefixes and the roles allowed on them (used by middleware too)
export const ROLE_ROUTES: Record<string, string | string[]> = {
  "/dashboard": ["ADMIN", "SUPERUSER", "MARKET_PRICES"],
  "/restaurant": "RESTAURANT",
  "/farmers": "FARMER",
  "/aggregator": "AGGREGATOR",
  "/logistics": "LOGISTICS",
  "/traders": "TRADER",
};

export function isRoleAllowedOnPath(role: string, pathname: string): boolean {
  const required = Object.entries(ROLE_ROUTES).find(([route]) =>
    pathname.startsWith(route)
  )?.[1];
  if (!required) return true; // public route
  const allowed = Array.isArray(required) ? required : [required];
  if (allowed.includes(role)) {
    return role !== "MARKET_PRICES" || pathname.startsWith("/dashboard/markets");
  }
  return required === "RESTAURANT" && (role === "AFFILIATOR" || role === "HOTEL");
}

// Only same-site paths like "/dashboard/news" — never "//evil.com" or "https://..."
export function sanitizeRedirect(redirect: string | null | undefined): string | null {
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//") || redirect.startsWith("/\\")) {
    return null;
  }
  return redirect;
}

/**
 * Where to send a user after login: the page they were sent away from
 * (?redirect=...) when their role may access it, otherwise their home page.
 */
export function getPostLoginPath(userRole: UserRole, redirect?: string | null): string {
  const safe = sanitizeRedirect(redirect);
  if (safe && userRole !== UserRole.TRADER && isRoleAllowedOnPath(userRole, safe)) {
    return safe;
  }
  return getRedirectPath(userRole);
}

// Build /login?redirect=<current page> for the browser (client-side only)
export function buildLoginUrl(reason?: "expired"): string {
  const params = new URLSearchParams();
  if (typeof window !== "undefined") {
    const current = window.location.pathname + window.location.search;
    if (current !== "/" && !current.startsWith("/login")) params.set("redirect", current);
  }
  if (reason) params.set("reason", reason);
  const query = params.toString();
  return query ? `/login?${query}` : "/login";
}

export function getRedirectPath(userRole: UserRole): string {
  switch (userRole) {
    case UserRole.FARMER:
      return "/farmers";
    case UserRole.RESTAURANT:
      return "/restaurant";
    case UserRole.HOTEL:
      return "/restaurant";
    case UserRole.AFFILIATOR:
      return "/restaurant";
    case UserRole.AGGREGATOR:
      return "/aggregator";
    case UserRole.ADMIN:
      return "/dashboard";
    case UserRole.TRADER:
      return TraderAppUrl;
    case UserRole.LOGISTICS:
      return "/logistics";
    case UserRole.SUPERUSER:
      return "/dashboard";
    case UserRole.MARKET_PRICES:
      return "/dashboard/markets";
    default:
      console.warn(`Unknown user role: ${userRole}. Redirecting to default.`);
      return "/";
  }
}
