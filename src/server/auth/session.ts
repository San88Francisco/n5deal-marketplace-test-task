import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";

import { prisma } from "@/server/db";

export const SESSION_COOKIE = "n5deal_session";

const SESSION_TTL_DAYS = 7;
const BCRYPT_ROUNDS = 10;

/**
 * The cookie carries a raw 256-bit token; the database stores only its SHA-256
 * digest. A dump of the sessions table therefore cannot be replayed as a login.
 * SHA-256 (not bcrypt) is correct here: the token is already high-entropy, so
 * there is nothing to brute-force, and session lookup must stay cheap.
 */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Constant-time compare, used where a secret is checked outside bcrypt. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function createSession(userId: string, userAgent?: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: { tokenHash: hashToken(token), userId, expiresAt, userAgent },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    // deleteMany, not delete: a stale cookie must not throw on sign-out.
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export type AuthState =
  | { status: "anonymous" }
  /** Signed in, but suspended by a platform manager. Kept distinct from
   *  anonymous so the UI can explain *why* access stopped instead of silently
   *  bouncing the person back to the login form. */
  | { status: "suspended"; user: User }
  | { status: "active"; user: User };

/**
 * Resolves the current auth state from the session cookie.
 *
 * The user's status is re-read from the database on every call. That is the
 * whole reason this app uses server-side sessions instead of a JWT: when a
 * platform manager suspends someone, the block applies on that person's very
 * next request rather than whenever their token would have expired.
 */
export async function getAuthState(): Promise<AuthState> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return { status: "anonymous" };

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session) return { status: "anonymous" };

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return { status: "anonymous" };
  }

  if (session.user.status === "REMOVED") {
    // Terminal: the account is gone, so every session it holds goes with it.
    await prisma.session.deleteMany({ where: { userId: session.userId } });
    return { status: "anonymous" };
  }

  if (session.user.status === "SUSPENDED") {
    return { status: "suspended", user: session.user };
  }

  return { status: "active", user: session.user };
}

/** Convenience wrapper: the signed-in, non-suspended user, or null. */
export async function getCurrentUser(): Promise<User | null> {
  const state = await getAuthState();
  return state.status === "active" ? state.user : null;
}
