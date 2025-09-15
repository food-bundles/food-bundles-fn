/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const tokenFromCookies = req.cookies.get("auth-token")?.value;

  const authHeader = req.headers.get("authorization");
  let tokenFromHeader: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    tokenFromHeader = authHeader.substring(7);
  }

  const tokenFromCustomHeader = req.headers.get("x-auth-token") || undefined;

  const token = tokenFromCookies || tokenFromHeader || tokenFromCustomHeader;

  // console.log("token from middleware", token);

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const decoded: any = jwt.decode(token);
    // console.log("decoded from middleware", decoded);

    if (!decoded || decoded.exp * 1000 < Date.now()) {
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("auth-token");
      return response;
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("auth-token");
    return response;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/restaurant/:path*", "/farmer/:path*"],
};
