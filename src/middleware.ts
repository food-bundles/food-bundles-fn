
/* eslint-disable @typescript-eslint/no-explicit-any */
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  console.log("Middleware - token exists:", !!token);

  if (!token) {
    const redirectUrl = new URL("/", req.url);
    redirectUrl.searchParams.set("showLogin", "true");
    redirectUrl.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  try {

    const decoded: any = jwt.decode(token);

    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      console.log("Middleware - Token expired");
      const redirectUrl = new URL("/", req.url);
      redirectUrl.searchParams.set("showLogin", "true");
      redirectUrl.searchParams.set("redirect", req.nextUrl.pathname);
      redirectUrl.searchParams.set("reason", "expired");
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware - Token verification failed:", error);
    const redirectUrl = new URL("/", req.url);
    redirectUrl.searchParams.set("showLogin", "true");
    redirectUrl.searchParams.set("redirect", req.nextUrl.pathname);
    redirectUrl.searchParams.set("reason", "invalid");
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/restaurant/:path*", "/farmer/:path*"],
};


