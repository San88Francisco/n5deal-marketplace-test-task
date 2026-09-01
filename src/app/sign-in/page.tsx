import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import { getCurrentUser } from "@/server/auth/session";
import { landingFor } from "@/routes";
import { DemoAccounts } from "@/components/auth/demo-accounts";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage() {
  const user = await getCurrentUser();
  if (user) redirect(landingFor(user.role));

  return (
    <div className="container-page grid gap-10 py-14 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:py-20">
      <div>
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-ink-900">
          Sign in to N5Deal
        </h1>
        <p className="mt-2 text-[14px] text-ink-500">
          Access your mandate, listings and conversations.
        </p>
        <div className="card mt-6 p-6">
          <SignInForm />
        </div>
      </div>
      <DemoAccounts />
    </div>
  );
}
