/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";


export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  const pathname = req.nextUrl.pathname;

  // Routes foe logged-in users only
  const protectedRoutes = ["/dashboard", "/restaurant", "/farmer"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const guestOnlyRoutes = ["/guest"];
  const isGuestOnlyRoute = guestOnlyRoutes.some((route) =>
    pathname.startsWith(route)
  );
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

  if (isProtectedRoute) {
    if (!token) {
      const redirectUrl = new URL("/", req.url);
      return NextResponse.redirect(redirectUrl);
    }

    try {
      const decoded: any = jwt.decode(token);

      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        const redirectUrl = new URL("/login", req.url);
        redirectUrl.searchParams.set("redirect", pathname);
        redirectUrl.searchParams.set("reason", "expired");
        return NextResponse.redirect(redirectUrl);
      }

      return NextResponse.next();
    } catch (error) {
      const redirectUrl = new URL("/login", req.url);
      redirectUrl.searchParams.set("redirect", pathname);
      redirectUrl.searchParams.set("reason", "invalid");
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/restaurant/:path*",
    "/farmer/:path*",
    "/guest/:path*",
  ],
};
