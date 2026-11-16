/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, Loader2, LayoutDashboard, UserPlus, Hourglass, LogIn } from "lucide-react";
import { DefaultAccountDialog } from "@/components/default-account";
import { toast } from "sonner";
import { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { roleApplicationService, roleService, type PersonRole, type RoleOption } from "@/app/services/roleService";
import { getRedirectPath } from "@/lib/navigations";
import { UserRole } from "@/lib/types";

const COOKIE = "path=/; max-age=86400; secure; samesite=strict";

/** Store the new session the same way the login page does, then open that role's dashboard */
export function openSession(token: string, user: any, role: string) {
  document.cookie = `auth-token=${token}; ${COOKIE}`;
  document.cookie = `user-role=${role}; ${COOKIE}`;
  localStorage.setItem("user", JSON.stringify(user));
  if (user?.restaurantId) localStorage.setItem("restaurantId", user.restaurantId);
  else localStorage.removeItem("restaurantId");

  // Full reload: every context (cart, wallet, permissions…) starts clean for the new role
  if (role === "TRADER" && process.env.NEXT_PUBLIC_TRADER_APP_URL) {
    window.location.href = `${process.env.NEXT_PUBLIC_TRADER_APP_URL}?token=${encodeURIComponent(token)}`;
  } else {
    window.location.href = getRedirectPath(role as UserRole);
  }
}

/**
 * The signed-in person's other roles, the dashboards they may open without
 * holding the role (act_as_role permission), and the roles they can apply for
 * from the dashboard they're in (rules set by a super admin).
 */
export function useOtherRoles() {
  const [roles, setRoles] = useState<PersonRole[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [apply, setApply] = useState<RoleOption[]>([]);
  const [actAs, setActAs] = useState<RoleOption[]>([]);
  const [switching, setSwitching] = useState<string | null>(null);

  useEffect(() => {
    roleService
      .getMyRoles()
      .then((r) => {
        setRoles(r.roles);
        setActive(r.activeRole);
      })
      .catch(() => setRoles([]));
    roleApplicationService
      .getOptions()
      .then((o) => {
        setApply(o.apply);
        setActAs(o.actAs);
      })
      .catch(() => undefined);
  }, []);

  const switchTo = async (role: string) => {
    setSwitching(role);
    try {
      const res = await roleService.switchRole(role);
      openSession(res.token, res.data.user, res.data.activeRole);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Could not switch role");
      setSwitching(null);
    }
  };

  const others = roles.filter((r) => r.role !== active && r.status === "ACTIVE");
  const waiting = roles.filter((r) => r.status === "PENDING");
  return {
    others,
    waiting,
    apply,
    actAs,
    switching,
    switchTo,
    activeLabel: roles.find((r) => r.role === active)?.label,
    empty: !others.length && !waiting.length && !apply.length && !actAs.length,
  };
}

const applyHref = (role: string) => `/apply-role?role=${encodeURIComponent(role)}`;

/** Items for a Radix dropdown account menu */
export function RoleSwitchMenuItems() {
  const { others, waiting, apply, actAs, switching, switchTo, activeLabel, empty } = useOtherRoles();
  const [defaultOpen, setDefaultOpen] = useState(false);
  if (empty) return null;
  const icon = (role: string, Fallback: typeof ArrowLeftRight) =>
    switching === role ? <Loader2 className="h-4 w-4 animate-spin" /> : <Fallback className="h-4 w-4" />;
  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-[1px] text-[#4A6358]">
        {activeLabel ? `Using: ${activeLabel}` : "Your roles"}
      </DropdownMenuLabel>
      {others.map((r) => (
        <DropdownMenuItem
          key={r.role}
          disabled={!!switching}
          onSelect={(e) => {
            e.preventDefault();
            switchTo(r.role);
          }}
          className="cursor-pointer text-[14px]"
        >
          {icon(r.role, ArrowLeftRight)}
          Switch to {r.label}
        </DropdownMenuItem>
      ))}
      {actAs.map((r) => (
        <DropdownMenuItem
          key={r.role}
          disabled={!!switching}
          onSelect={(e) => {
            e.preventDefault();
            switchTo(r.role);
          }}
          className="cursor-pointer text-[14px]"
        >
          {icon(r.role, LayoutDashboard)}
          Open {r.label} dashboard
        </DropdownMenuItem>
      ))}
      {waiting.map((r) => (
        <DropdownMenuItem key={r.role} disabled className="text-[13px]">
          <Hourglass className="h-4 w-4" />
          {r.label}: waiting for approval
        </DropdownMenuItem>
      ))}
      {apply.map((r) => (
        <DropdownMenuItem key={r.role} asChild className="cursor-pointer text-[14px]">
          <Link href={applyHref(r.role)}>
            <UserPlus className="h-4 w-4" />
            Apply to be {r.label}
          </Link>
        </DropdownMenuItem>
      ))}
      {others.length > 0 && (
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            setDefaultOpen(true);
          }}
          className="cursor-pointer text-[14px]"
        >
          <LogIn className="h-4 w-4" />
          Account opened at login…
        </DropdownMenuItem>
      )}
      <DefaultAccountDialog open={defaultOpen} onOpenChange={setDefaultOpen} />
    </>
  );
}

/** Plain buttons, for menus that are not Radix dropdowns (admin sidebar) */
export function RoleSwitchButtons({ className = "" }: { className?: string }) {
  const { others, waiting, apply, actAs, switching, switchTo, empty } = useOtherRoles();
  const [defaultOpen, setDefaultOpen] = useState(false);
  if (empty) return null;
  const row = "flex min-h-10 w-full items-center gap-2 px-3 text-[14px] hover:bg-[#F6F9F7] disabled:opacity-60 cursor-pointer";
  const icon = (role: string, Fallback: typeof ArrowLeftRight) =>
    switching === role ? <Loader2 className="h-4 w-4 animate-spin" /> : <Fallback className="h-4 w-4" />;
  return (
    <div className={className}>
      {others.map((r) => (
        <button key={r.role} type="button" disabled={!!switching} onClick={() => switchTo(r.role)} className={row}>
          {icon(r.role, ArrowLeftRight)} 
          Switch to {r.label}
        </button>
      ))}
      {actAs.length > 0 && (
        <p className="m-0 px-3 pt-2 text-[11px] font-bold uppercase tracking-[1px] text-[#4A6358]">Open as a real user</p>
      )}
      {actAs.map((r) => (
        <button key={r.role} type="button" disabled={!!switching} onClick={() => switchTo(r.role)} className={row}>
          {icon(r.role, LayoutDashboard)}
          {r.label} dashboard
        </button>
      ))}
      {waiting.map((r) => (
        <p key={r.role} className="m-0 flex min-h-10 items-center gap-2 px-3 text-[13px] text-[#4A6358]">
          <Hourglass className="h-4 w-4" /> {r.label}: waiting for approval
        </p>
      ))}
      {apply.map((r) => (
        <Link key={r.role} href={applyHref(r.role)} className={row}>
          <UserPlus className="h-4 w-4" />
          Apply to be {r.label}
        </Link>
      ))}
      {others.length > 0 && (
        <button type="button" onClick={() => setDefaultOpen(true)} className={row}>
          <LogIn className="h-4 w-4" />
          Account opened at login…
        </button>
      )}
      <DefaultAccountDialog open={defaultOpen} onOpenChange={setDefaultOpen} />
    </div>
  );
}
