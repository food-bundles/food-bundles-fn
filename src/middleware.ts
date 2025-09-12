/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  console.log("[v0] Token from middleware:", token ? "Present" : "Missing");

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("showLogin", "true");
    loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
    loginUrl.searchParams.set("reason", "missing");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const decoded: any = jwt.decode(token);
    console.log("[v0] Decoded token:", decoded ? "Valid structure" : "Invalid");

    if (!decoded) {
      throw new Error("Invalid token structure");
    }

    if (!decoded.exp) {
      console.log("[v0] Token missing expiration");
      throw new Error("Token missing expiration");
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      console.log("[v0] Token expired");
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("showLogin", "true");
      loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
      loginUrl.searchParams.set("reason", "expired");
      return NextResponse.redirect(loginUrl);
    }

    const response = NextResponse.next();
    if (decoded.userId) {
      response.headers.set("x-user-id", decoded.userId);
    }
    if (decoded.role) {
      response.headers.set("x-user-role", decoded.role);
    }

    console.log("[v0] Authentication successful");
    return response;
  } catch (error) {
    console.log("[v0] Token validation error:", error);
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("showLogin", "true");
    loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
    loginUrl.searchParams.set("reason", "invalid");
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/restaurant/:path*",
    "/farmer/:path*",
    "/admin/:path*",
  ],
};
