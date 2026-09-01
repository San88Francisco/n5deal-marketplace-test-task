import "server-only";

import { redirect } from "next/navigation";
import type { User, UserRole } from "@prisma/client";

import { getAuthState } from "@/server/auth/session";

/**
 * Authorisation lives here — next to the data, not in middleware.
 *
 * Middleware in this app only does a cheap cookie presence check to keep
 * anonymous traffic off private routes; it cannot be the security boundary,
 * because it never sees the user's current status. Every server module that
 * touches protected data calls one of these guards.
 */

export async function requireUser(): Promise<User> {
  const state = await getAuthState();

  if (state.status === "suspended") redirect("/account/suspended");
  if (state.status === "anonymous") redirect("/sign-in");

  return state.user;
}

export async function requireRole(...roles: UserRole[]): Promise<User> {
  const user = await requireUser();

  if (!roles.includes(user.role)) {
    // 404 rather than 403: a buyer poking at /manage should not learn that a
    // manager console exists at that path.
    redirect("/not-found");
  }

  return user;
}

export const requireBuyer = () => requireRole("BUYER");
export const requireSeller = () => requireRole("SELLER");
export const requireManager = () => requireRole("PLATFORM_MANAGER");

/** For Server Actions and Route Handlers, where redirecting is wrong. */
export class AuthorizationError extends Error {
  constructor(message = "Not authorised") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function assertRole(...roles: UserRole[]): Promise<User> {
  const state = await getAuthState();

  if (state.status !== "active") throw new AuthorizationError("Not signed in");
  if (!roles.includes(state.user.role)) throw new AuthorizationError("Wrong role");

  return state.user;
}
