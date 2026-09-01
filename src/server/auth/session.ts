import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";

import { prisma } from "@/server/db";
import { SESSION_COOKIE } from "@/server/auth/constants";
import { BCRYPT_ROUNDS, SESSION_TTL_DAYS, USER_STATUS } from "@/constants";

export { SESSION_COOKIE };

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

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
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export type AuthState =
  { status: "anonymous" } | { status: "suspended"; user: User } | { status: "active"; user: User };

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

  if (session.user.status === USER_STATUS.REMOVED) {
    await prisma.session.deleteMany({ where: { userId: session.userId } });
    return { status: "anonymous" };
  }

  if (session.user.status === USER_STATUS.SUSPENDED) {
    return { status: "suspended", user: session.user };
  }

  return { status: "active", user: session.user };
}

export async function getCurrentUser(): Promise<User | null> {
  const state = await getAuthState();
  return state.status === "active" ? state.user : null;
}
