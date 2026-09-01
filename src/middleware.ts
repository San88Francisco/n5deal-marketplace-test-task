import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/server/auth/constants";

/**
 * A cheap cookie-presence check, nothing more.
 *
 * Middleware runs on the edge without database access, so it cannot know
 * whether a session is still valid or whether its owner has since been
 * suspended. It is UX — bouncing obviously-anonymous traffic away from private
 * routes before a page renders. Every real authorisation decision happens in
 * the server modules, next to the data (see src/server/auth/guards.ts).
 */
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
