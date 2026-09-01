"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { prisma } from "@/server/db";
import { signInSchema, signUpSchema } from "@/lib/validation";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/server/auth/session";
import { landingFor, ROUTES } from "@/routes";
import { USER_ROLE, USER_STATUS } from "@/constants";

export type ActionState = { error?: string; fieldErrors?: Record<string, string[]> };

export async function signInAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return { error: "Those credentials do not match an account." };

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) return { error: "Those credentials do not match an account." };

  if (user.status === USER_STATUS.SUSPENDED) {
    return {
      error: `Your account is suspended. ${user.statusReason ?? "Contact the platform team."}`,
    };
  }
  if (user.status === USER_STATUS.REMOVED) {
    return { error: "This account has been removed from the platform." };
  }

  const headerList = await headers();
  await createSession(user.id, headerList.get("user-agent") ?? undefined);

  redirect(landingFor(user.role));
}

export async function signUpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "An account already exists for that email." };
  }

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      fullName: parsed.data.fullName,
      passwordHash: await hashPassword(parsed.data.password),
      role: parsed.data.role,
    },
  });

  const headerList = await headers();
  await createSession(user.id, headerList.get("user-agent") ?? undefined);

  redirect(parsed.data.role === USER_ROLE.BUYER ? "/account/buyer-profile" : "/account/seller-profile");
}

export async function signOutAction() {
  await destroySession();
  redirect(ROUTES.home);
}
