import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/server/auth/constants";

const PRIVATE_PREFIXES = ["/account", "/sell", "/manage", "/messages"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (request.cookies.get(SESSION_COOKIE)) {
    return NextResponse.next();
  }

  const signIn = new URL("/sign-in", request.url);
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: ["/account/:path*", "/sell/:path*", "/manage/:path*", "/messages/:path*"],
};
