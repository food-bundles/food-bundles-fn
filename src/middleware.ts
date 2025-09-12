/* eslint-disable @typescript-eslint/no-explicit-any */
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  console.log("token from middleware", token);

  if (!token) {
    const redirectUrl = new URL("/", req.url);
    redirectUrl.searchParams.set("showLogin", "true");
    redirectUrl.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const decoded: any = jwt.decode(token);
    console.log("decoded from middleware", decoded);

    if (decoded.exp * 1000 < Date.now()) {
      const redirectUrl = new URL("/", req.url);
      redirectUrl.searchParams.set("showLogin", "true");
      redirectUrl.searchParams.set("redirect", req.nextUrl.pathname);
      redirectUrl.searchParams.set("reason", "expired");
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  } catch {
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
