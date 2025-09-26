import { UserRole } from "@/lib/types";

export function getRedirectPath(userRole: UserRole): string {
  switch (userRole) {
    case UserRole.FARMER:
      return "/farmer";
    case UserRole.RESTAURANT:
      return "/restaurant";
    case UserRole.AGGREGATOR:
      return "/aggregator";
    case UserRole.ADMIN:
    case UserRole.LOGISTIC:
      return "/dashboard";
    default:
      console.warn(`Unknown user role: ${userRole}. Redirecting to default.`);
      return "/";
  }
}
