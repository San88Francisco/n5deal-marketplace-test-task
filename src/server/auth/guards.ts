import "server-only";

import { notFound, redirect } from "next/navigation";
import type { User, UserRole } from "@prisma/client";

import { getAuthState } from "@/server/auth/session";
import { ROUTES } from "@/routes";
import { USER_ROLE } from "@/constants";

export async function requireUser(): Promise<User> {
  const state = await getAuthState();

  if (state.status === "suspended") redirect(ROUTES.auth.suspended);
  if (state.status === "anonymous") redirect(ROUTES.auth.signIn);

  return state.user;
}

export async function requireRole(...roles: UserRole[]): Promise<User> {
  const user = await requireUser();

  if (!roles.includes(user.role)) {
    notFound();
  }

  return user;
}

export const requireBuyer = () => requireRole(USER_ROLE.BUYER);
export const requireSeller = () => requireRole(USER_ROLE.SELLER);
export const requireManager = () => requireRole(USER_ROLE.PLATFORM_MANAGER);

export class AuthorizationError extends Error {
  constructor(message = "Not authorised") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function roleOrNull(...roles: UserRole[]): Promise<User | null> {
  const state = await getAuthState();

  if (state.status !== "active") return null;

  return roles.includes(state.user.role) ? state.user : null;
}

export async function assertRole(...roles: UserRole[]): Promise<User> {
  const state = await getAuthState();

  if (state.status !== "active") throw new AuthorizationError("Not signed in");
  if (!roles.includes(state.user.role)) throw new AuthorizationError("Wrong role");

  return state.user;
}
