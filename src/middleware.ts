/* eslint-disable @typescript-eslint/no-explicit-any */
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  console.log("token from middleware", token);

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const decoded: any = jwt.decode(token);
    console.log("decoded from middleware", decoded);

    // ✅ Only check expiration, not role
    if (decoded.exp * 1000 < Date.now()) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/restaurant/:path*", "/farmer/:path*"],
};
