/* eslint-disable @typescript-eslint/no-explicit-any */
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  console.log("Middleware - token exists:", !!token);
  console.log("Middleware - pathname:", req.nextUrl.pathname);

  if (!token) {
    console.log("Middleware - No token found, redirecting to login");
    const redirectUrl = new URL("/", req.url);
    redirectUrl.searchParams.set("showLogin", "true");
    redirectUrl.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  try {
    // Use jwt.verify instead of jwt.decode to properly validate the token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("Middleware - JWT_SECRET not configured");
      const redirectUrl = new URL("/", req.url);
      redirectUrl.searchParams.set("showLogin", "true");
      redirectUrl.searchParams.set("redirect", req.nextUrl.pathname);
      redirectUrl.searchParams.set("reason", "config_error");
      return NextResponse.redirect(redirectUrl);
    }

    const decoded: any = jwt.verify(token, jwtSecret);
    console.log(
      "Middleware - Token verified successfully, user ID:",
      decoded.id
    );

    // Check if token is expired (jwt.verify should handle this, but double-check)
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      console.log("Middleware - Token expired");
      const redirectUrl = new URL("/", req.url);
      redirectUrl.searchParams.set("showLogin", "true");
      redirectUrl.searchParams.set("redirect", req.nextUrl.pathname);
      redirectUrl.searchParams.set("reason", "expired");
      return NextResponse.redirect(redirectUrl);
    }

    console.log("Middleware - Access granted");
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
