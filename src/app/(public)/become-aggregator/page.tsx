"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/app/contexts/auth-context";
import { getRedirectPath } from "@/lib/navigations";
import { UserRole } from "@/lib/types";

// Where the aggregator QR code points.
// Logged in → their own account. Not logged in → the login page, which offers
// new aggregators the preliminary agreement and the application form.
export default function BecomeAggregatorPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && user?.role) {
      router.replace(getRedirectPath(user.role as UserRole));
    } else {
      router.replace(`/login?for=aggregator&redirect=${encodeURIComponent("/become-aggregator")}`);
    }
  }, [isLoading, isAuthenticated, user?.role, router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center gap-2 text-[#4A6358]">
      <Loader2 className="h-5 w-5 animate-spin" /> Opening…
    </div>
  );
}
