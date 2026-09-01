import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatRelative, humanise } from "@/utils/format";
import { requireManager } from "@/server/auth/guards";
import { getModerationHistory, getPlatformStats } from "@/server/moderation/service";
import { ROUTES } from "@/routes";

export const metadata: Metadata = { title: "Platform overview" };

export default async function ManageOverviewPage() {
  await requireManager();
  const [stats, recent] = await Promise.all([getPlatformStats(), getModerationHistory()]);

  const cards = [
    { label: "Active buyers", value: stats.buyers, href: "/manage/participants?role=BUYER" },
    { label: "Active sellers", value: stats.sellers, href: "/manage/participants?role=SELLER" },
    { label: "Live listings", value: stats.published, href: "/manage/listings?status=PUBLISHED" },
    {
      label: "Suspended or removed",
      value: stats.suspended,
      href: "/manage/participants?status=SUSPENDED",
    },
    { label: "Conversations", value: stats.conversations },
    {
      label: "Awaiting validation",
      value: stats.unvalidated,
      href: "/manage/listings?status=PUBLISHED",
    },
  ];

  return (
    <div className="container-page py-10">
      <p className="eyebrow">Platform manager</p>
      <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-ink-900">Overview</h1>
      <p className="mt-1 text-[14px] text-ink-500">
        Marketplace health, and the last actions taken by the platform team.
      </p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const content = (
            <div className="card h-full p-5 transition-shadow hover:shadow-lift">
              <dt className="text-[12px] uppercase tracking-wider text-ink-500">{card.label}</dt>
              <dd className="tabular mt-1 text-[28px] font-semibold text-ink-900">{card.value}</dd>
            </div>
          );

          return card.href ? (
            <Link key={card.label} href={card.href}>
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </dl>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-[18px] font-semibold tracking-tight text-ink-900">Recent actions</h2>
          <Link href={ROUTES.manage.audit} className="text-[13px] text-navy-700 hover:underline">
            Full audit trail →
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="card mt-4 px-5 py-10 text-center text-[14px] text-ink-500">
            No moderation actions recorded yet.
          </p>
        ) : (
          <ul className="card mt-4 divide-y divide-ink-100">
            {recent.slice(0, 6).map((action) => (
              <li key={action.id} className="flex flex-wrap items-start gap-3 px-5 py-4">
                <Badge
                  tone={
                    action.type.includes("SUSPEND") || action.type.includes("REMOVE")
                      ? "critical"
                      : action.type.includes("VERIFY")
                        ? "accent"
                        : "positive"
                  }
                >
                  {humanise(action.type)}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium text-ink-900">
                    {action.targetUser?.fullName ?? action.targetAsset?.title ?? "Unknown target"}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-ink-500">{action.reason}</p>
                </div>
                <p className="shrink-0 text-[12px] text-ink-300">
                  {action.actor.fullName} · {formatRelative(action.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
