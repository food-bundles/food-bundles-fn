"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { openSession } from "@/components/role-switcher";

/**
 * Arriving from another Food Bundles app (the trader app) after switching
 * role there: /switch-session#token=…&role=…
 * The session is in the #fragment, which browsers never send to a server or
 * write to logs. The token is checked with the backend before it's stored.
 */
export default function SwitchSessionPage() {
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get("token");
    // Drop the token from the address bar and history right away
    window.history.replaceState({}, "", window.location.pathname);
    if (!token) {
      setError("This link is incomplete.");
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const me = await res.json();
        const role = me.activeRole ?? me.user?.role;
        if (!me.user || !role) throw new Error();
        openSession(token, me.user, role);
      })
      .catch(() => setError("Your session could not be opened. Please log in again."));
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#F6F9F7] px-4 text-center">
      {error ? (
        <>
          <p className="m-0 text-[16px] text-[#0B2E1F]">{error}</p>
          <Link href="/login" className="inline-flex h-12 items-center rounded-full bg-[#0B2E1F] px-6 font-bold text-white">
            Log in
          </Link>
        </>
      ) : (
        <>
          <Loader2 className="h-6 w-6 animate-spin text-[#00A43A]" aria-hidden />
          <p className="m-0 text-[15px] text-[#4A6358]">Opening your dashboard…</p>
        </>
      )}
    </div>
  );
}
