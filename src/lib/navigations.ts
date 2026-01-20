import { UserRole } from "@/lib/types";

export function getRedirectPath(userRole: UserRole): string {
  switch (userRole) {
    case UserRole.FARMER:
      return "/farmers";
    case UserRole.RESTAURANT:
      return "/restaurant";
    case UserRole.AFFILIATOR:
      return "/restaurant";
    case UserRole.AGGREGATOR:
      return "/aggregator";
    case UserRole.ADMIN:
      return "/dashboard";
    case UserRole.TRADER:
      return "/traders";
    case UserRole.LOGISTICS:
      return "/logistics";
    default:
      console.warn(`Unknown user role: ${userRole}. Redirecting to default.`);
      return "/";
  }
}
