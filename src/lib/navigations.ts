import { UserRole } from "@/lib/types";

const TraderAppUrl = process.env.NEXT_PUBLIC_TRADER_APP_URL as string;

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
    default:
      console.warn(`Unknown user role: ${userRole}. Redirecting to default.`);
      return "/";
  }
}
