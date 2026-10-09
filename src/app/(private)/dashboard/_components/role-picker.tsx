"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminRole, adminRoleService } from "@/app/services/adminRoleService";
import { useAdminAccess } from "@/app/hooks/useAdminAccess";

// Built-in account types (own apps or legacy); dashboard roles come from the API
const BUILT_IN = [
  { value: "ADMIN", label: "Admin (full access)" },
  { value: "AGGREGATOR", label: "Aggregator" },
  { value: "LOGISTICS", label: "Logistics" },
  { value: "TRADER", label: "Trader" },
  { value: "MARKET_PRICES", label: "Market Prices" },
];

const DYNAMIC_PREFIX = "role:";

/** Turn the picker value into the API payload: { role } or { adminRoleId }. */
export function toRolePayload(value: string): { role?: string; adminRoleId?: string } {
  return value.startsWith(DYNAMIC_PREFIX)
    ? { adminRoleId: value.slice(DYNAMIC_PREFIX.length) }
    : { role: value };
}

/**
 * Role select for invites and new admins. Super admins also see the dashboard
 * roles they created (and can create super admins); others see built-in types.
 */
export function RolePicker({
  value,
  onChange,
  disabled,
  invalid,
  hideBuiltIn = [],
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  hideBuiltIn?: string[];
}) {
  const { isSuperAdmin } = useAdminAccess();
  const [roles, setRoles] = useState<AdminRole[]>([]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    adminRoleService.getRoles().then((res) => res.success && setRoles(res.data));
  }, [isSuperAdmin]);

  const builtIn = BUILT_IN.filter((o) => !hideBuiltIn.includes(o.value));

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={`mt-1 w-full ${invalid ? "border-red-500" : ""}`}>
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        {roles.length > 0 && (
          <SelectGroup>
            <SelectLabel className="text-xs text-green-700">Dashboard roles</SelectLabel>
            {roles.map((role) => (
              <SelectItem key={role.id} value={`${DYNAMIC_PREFIX}${role.id}`}>
                {role.name}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        <SelectGroup>
          {roles.length > 0 && (
            <SelectLabel className="text-xs text-gray-500">Other account types</SelectLabel>
          )}
          {builtIn.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
          {isSuperAdmin && <SelectItem value="SUPERUSER">Super Admin</SelectItem>}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
