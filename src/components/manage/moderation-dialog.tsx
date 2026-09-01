"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { moderateAction, type ModerationState } from "@/server/moderation/actions";

const COPY: Record<
  string,
  { title: string; body: string; confirm: string; destructive?: boolean }
> = {
  USER_SUSPEND: {
    title: "Suspend participant",
    body: "They lose access immediately, their sessions are ended, and their profile and listings leave the marketplace. Existing conversations become read-only. This is reversible.",
    confirm: "Suspend",
    destructive: true,
  },
  USER_REINSTATE: {
    title: "Reinstate participant",
    body: "Access is restored and their profile becomes visible again. Listings stay in whatever state they were left in.",
    confirm: "Reinstate",
  },
  USER_REMOVE: {
    title: "Remove participant",
    body: "A permanent removal. The account is retained internally so conversations and the audit trail stay intact, but nothing is exposed publicly and their listings are archived.",
    confirm: "Remove permanently",
    destructive: true,
  },
  ASSET_SUSPEND: {
    title: "Suspend listing",
    body: "The listing leaves the marketplace and its owner cannot republish it. They will see that it is under review.",
    confirm: "Suspend listing",
    destructive: true,
  },
  ASSET_REINSTATE: {
    title: "Reinstate listing",
    body: "The listing returns to the state it was in before suspension.",
    confirm: "Reinstate listing",
  },
  SELLER_VERIFY: {
    title: "Mark seller as verified",
    body: "Adds the Verified badge to their profile and every listing they publish. Only do this after KYB documents have been checked.",
    confirm: "Mark verified",
  },
};

function Submit({ label, destructive }: { label: string; destructive?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={destructive ? "danger" : "primary"} disabled={pending}>
      {pending ? "Applying…" : label}
    </Button>
  );
}

/**
 * Every moderation action goes through this one dialog, and every one of them
 * requires a written reason. The reason is not decoration: it is what the audit
 * trail records, and what the participant is shown when they next sign in.
 */
export function ModerationDialog({
  type,
  targetUserId,
  targetAssetId,
  targetName,
  triggerLabel,
  triggerVariant = "outline",
  size = "sm",
}: {
  type: keyof typeof COPY;
  targetUserId?: string;
  targetAssetId?: string;
  targetName: string;
  triggerLabel: string;
  triggerVariant?: "outline" | "ghost" | "danger" | "primary";
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<ModerationState, FormData>(moderateAction, {});
  const copy = COPY[type];

  if (state.ok && open) setOpen(false);

  return (
    <>
      <Button type="button" variant={triggerVariant} size={size} onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-navy-950/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={copy.title}
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-[520px] rounded-card bg-white p-6 shadow-lift">
            <h2 className="text-[18px] font-semibold tracking-tight text-ink-900">{copy.title}</h2>
            <p className="mt-1 text-[13.5px] text-ink-700">{targetName}</p>
            <p className="mt-3 rounded-md bg-ink-50 px-3 py-2.5 text-[13px] leading-relaxed text-ink-700">
              {copy.body}
            </p>

            <form action={action} className="mt-5 space-y-4">
              <input type="hidden" name="type" value={type} />
              {targetUserId ? (
                <input type="hidden" name="targetUserId" value={targetUserId} />
              ) : null}
              {targetAssetId ? (
                <input type="hidden" name="targetAssetId" value={targetAssetId} />
              ) : null}

              {state.error ? (
                <p className="rounded-md border border-critical-500/25 bg-critical-50 px-3 py-2 text-[13px] text-critical-700">
                  {state.error}
                </p>
              ) : null}

              <div>
                <label className="label" htmlFor={`reason-${type}-${targetUserId ?? targetAssetId}`}>
                  Reason (recorded in the audit trail)
                </label>
                <textarea
                  id={`reason-${type}-${targetUserId ?? targetAssetId}`}
                  name="reason"
                  rows={4}
                  required
                  minLength={10}
                  className="field resize-y"
                  placeholder="What rule was broken, and what evidence did you look at?"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Submit label={copy.confirm} destructive={copy.destructive} />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
