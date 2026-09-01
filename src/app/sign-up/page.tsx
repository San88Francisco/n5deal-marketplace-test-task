import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SignUpForm } from "@/components/auth/auth-forms";
import { getCurrentUser } from "@/server/auth/session";
import { landingFor } from "@/lib/routes";

export const metadata: Metadata = { title: "Create an account" };

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(landingFor(user.role));

  const { role } = await searchParams;
  const defaultRole = role === "SELLER" ? "SELLER" : "BUYER";

  return (
    <div className="container-page flex justify-center py-14 lg:py-20">
      <div className="w-full max-w-[460px]">
        <p className="eyebrow">Join the marketplace</p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-ink-900">
          Create your account
        </h1>
        <p className="mt-2 text-[14px] text-ink-500">
          Two minutes now, then a guided profile so the other side knows what you are looking for.
        </p>
        <div className="card mt-6 p-6">
          <SignUpForm defaultRole={defaultRole} />
        </div>
      </div>
    </div>
  );
}
