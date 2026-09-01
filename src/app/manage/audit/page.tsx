import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatDate, formatRelative, humanise } from "@/utils/format";
import { requireManager } from "@/server/auth/guards";
import { getModerationHistory } from "@/server/moderation/service";
import { ROUTES } from "@/routes";

export const metadata: Metadata = { title: "Audit trail" };

/**
 * Append-only by construction: there is no UI to edit or delete an entry,
 * because the value of an audit trail is precisely that nobody can tidy it up.
 */
export default async function AuditPage() {
  await requireManager();
  const actions = await getModerationHistory();

  return (
    <div className="container-page max-w-[900px] py-10">
      <p className="eyebrow">Platform manager</p>
      <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-ink-900">Audit trail</h1>
      <p className="mt-1 text-[14px] text-ink-500">
        Every moderation action, with the reason recorded at the time. Nothing here can be edited or
        removed.
      </p>

      {actions.length === 0 ? (
        <p className="card mt-8 px-5 py-12 text-center text-[14px] text-ink-500">
          No actions recorded yet.
        </p>
      ) : (
        <ol className="mt-8 space-y-3">
          {actions.map((action) => (
            <li key={action.id} className="card p-5">
              <div className="flex flex-wrap items-center gap-3">
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
                <span className="text-[13.5px] font-medium text-ink-900">
                  {action.targetUser ? (
                    `${action.targetUser.fullName} · ${action.targetUser.email}`
                  ) : action.targetAsset ? (
                    <Link
                      href={ROUTES.assets.detail(action.targetAsset.slug)}
                      className="hover:underline"
                    >
                      #{action.targetAsset.referenceCode} {action.targetAsset.title}
                    </Link>
                  ) : (
                    "Target no longer exists"
                  )}
                </span>
                <span className="ml-auto text-[12px] text-ink-300" title={formatDate(action.createdAt)}>
                  {formatRelative(action.createdAt)}
                </span>
              </div>

              <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-700">{action.reason}</p>
              <p className="mt-2 text-[12px] text-ink-500">
                Recorded by {action.actor.fullName}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
