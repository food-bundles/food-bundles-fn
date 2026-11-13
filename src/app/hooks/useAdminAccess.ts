"use client";

import { useEffect, useState } from "react";
import { authService } from "@/app/services/authService";
import { can, isSuperAdmin, PermissionUser } from "@/lib/admin-permissions";

type AdminUser = PermissionUser & {
  id?: string;
  username?: string;
  adminRole?: { id: string; name: string } | null;
  /** Customer types this user works with (null = all) */
  customerTypeScope?: string[] | null;
};

/** Current dashboard user with permission helpers (from GET /me). */
export function useAdminAccess() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    authService
      .getCurrentUser()
      .then((res: { user?: AdminUser } | null) => !cancelled && setUser(res?.user ?? null))
      .catch(() => !cancelled && setUser(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    user,
    loading,
    isSuperAdmin: isSuperAdmin(user),
    can: (module: string, action: string = "view") => can(user, module, action),
  };
}
