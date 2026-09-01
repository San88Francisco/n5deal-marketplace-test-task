import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getAuthState } from "@/server/auth/session";
import { signOutAction } from "@/server/auth/actions";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/routes";

export const metadata: Metadata = { title: "Account suspended" };

export default async function SuspendedPage() {
  const state = await getAuthState();
  if (state.status !== "suspended") redirect(ROUTES.home);

  return (
    <div className="container-page flex justify-center py-20">
      <div className="card max-w-[560px] p-8">
        <p className="eyebrow text-caution-700">Account suspended</p>
        <h1 className="mt-2 text-[24px] font-semibold tracking-tight text-ink-900">
          Your access is paused
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-700">
          A platform manager suspended this account. Your listings and profile are hidden from the
          marketplace, and existing conversations are read-only until the review closes.
        </p>

        {state.user.statusReason && (
          <div className="mt-5 rounded-md border border-caution-500/25 bg-caution-50 p-4">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-caution-700">
              Reason given
            </p>
            <p className="mt-1 text-[14px] leading-relaxed text-ink-900">
              {state.user.statusReason}
            </p>
          </div>
        )}

        <p className="mt-5 text-[13px] text-ink-500">
          If you believe this is a mistake, reply to the platform team from the email address on
          this account.
        </p>

        <form action={signOutAction} className="mt-6">
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
