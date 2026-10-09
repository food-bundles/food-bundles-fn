/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { ROLE_ROUTES, sanitizeRedirect } from "@/lib/navigations";
import { canOpenPage } from "@/lib/admin-permissions";

// Send to login, remembering the page (with its query) to return to afterwards
const redirectToLogin = (req: NextRequest, reason?: string) => {
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set(
    "redirect",
    req.nextUrl.pathname + req.nextUrl.search,
  );
  if (reason) loginUrl.searchParams.set("reason", reason);
  return NextResponse.redirect(loginUrl);
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  const pathname = req.nextUrl.pathname;

  // Role-based route protection
  const roleRoutes = ROLE_ROUTES;

  const protectedRoutes = Object.keys(roleRoutes);
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const guestOnlyRoutes = ["/guest"];
  const isGuestOnlyRoute = guestOnlyRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Auth pages that logged-in users shouldn't access
  const authPages = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/reset-password-phone",
  ];
  const isAuthPage = authPages.includes(pathname);

  // Handle auth pages - redirect logged-in users to where they were going (or home)
  if (isAuthPage) {
    if (token) {
      try {
        const decoded: any = jwt.decode(token);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          return NextResponse.next();
        }
        const target =
          sanitizeRedirect(req.nextUrl.searchParams.get("redirect")) || "/";
        return NextResponse.redirect(new URL(target, req.url));
      } catch (error) {
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Handle guest-only routes
  if (isGuestOnlyRoute) {
    if (token) {
      try {
        const decoded: any = jwt.decode(token);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          return NextResponse.next();
        }
        const redirectUrl = new URL("/", req.url);
        redirectUrl.searchParams.set("showGuestToast", "true");
        return NextResponse.redirect(redirectUrl);
      } catch (error) {
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Handle protected routes with role checking
  if (isProtectedRoute) {
    if (!token) {
      return redirectToLogin(req);
    }

    try {
      const decoded: any = jwt.decode(token);

      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        return redirectToLogin(req, "expired");
      }

      // Check user role via API
      let userRole: string | null = null;
      let userData: any = null;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          userData = await response.json();
          userRole = userData.user?.role || userData.data?.user?.role;
          
          // Redirect TRADER users to trader app
          if (userRole === "TRADER") {
            const traderUrl = process.env.NEXT_PUBLIC_TRADER_APP_URL as string;
            return NextResponse.redirect(new URL(traderUrl, req.url));
          }
        } else {
          // Fallback: Check if we have a role cookie for special cases like AFFILIATOR
          // where the /me endpoint might be failing on the backend
          const roleCookie = req.cookies.get("user-role")?.value;
          if (roleCookie) {
            userRole = roleCookie;
          }
        }
      } catch (error) {
        // If network error, still check cookie as fallback
        const roleCookie = req.cookies.get("user-role")?.value;
        if (roleCookie) {
          userRole = roleCookie;
        }
      }

      // Find required role for current route
      const requiredRole = Object.entries(roleRoutes).find(([route]) =>
        pathname.startsWith(route),
      )?.[1];

      // Role check logic
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      const isAuthorized =
        allowedRoles.includes(userRole!) ||
        (requiredRole === "RESTAURANT" &&
          (userRole === "AFFILIATOR" || userRole === "HOTEL"));

      if (!userRole || !isAuthorized) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      // Dashboard pages are gated by the user's role permissions (from /me).
      // If /me failed we can't tell, so let the page load — the API still
      // enforces permissions on every request.
      const meUser = userData?.user || userData?.data?.user;
      if (pathname.startsWith("/dashboard") && meUser && !canOpenPage(meUser, pathname)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }

      if (userRole === "TRADER" && pathname.startsWith("/traders")) {
        if (pathname === "/traders/agreement") {
          return NextResponse.next();
        }
        const agreementAccepted =
          req.cookies.get("traderAgreementAccepted")?.value === "true";
        if (!agreementAccepted) {
          return NextResponse.redirect(new URL("/traders/agreement", req.url));
        }
      }

      return NextResponse.next();
    } catch (error) {
      console.error("Middleware error:", error);
      return redirectToLogin(req, "error");
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/aggregator/:path*",
    "/logistics/:path*",
    "/restaurant/:path*",
    "/farmers/:path*",
    "/traders/:path*",
    "/guest/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/reset-password-phone",
  ],
};
