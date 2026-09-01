"use client";

import { useActionState, useState } from "react";

import { FormAlert } from "@/components/ui/form-alert";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { SubmitButton } from "@/components/ui/submit-button";
import { MODERATION_COPY } from "@/constants";
import { moderateAction, type ModerationState } from "@/server/moderation/actions";
import type { ModerationActionType } from "@/types";

type ModerationDialogProps = {
  type: ModerationActionType;
  targetUserId?: string;
  targetAssetId?: string;
  targetName: string;
  triggerLabel: string;
  triggerVariant?: "outline" | "ghost" | "danger" | "primary";
  size?: "sm" | "md";
};

export function ModerationDialog({
  type,
  targetUserId,
  targetAssetId,
  targetName,
  triggerLabel,
  triggerVariant = "outline",
  size = "sm",
}: ModerationDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<ModerationState, FormData>(moderateAction, {});

  const copy = MODERATION_COPY[type];
  const reasonId = `reason-${type}-${targetUserId ?? targetAssetId}`;

  if (state.ok && open) setOpen(false);

  return (
    <>
      <Button type="button" variant={triggerVariant} size={size} onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} label={copy.title}>
        <h2 className="text-[18px] font-semibold tracking-tight text-ink-900">{copy.title}</h2>
        <p className="mt-1 text-[13.5px] text-ink-700">{targetName}</p>
        <p className="mt-3 rounded-md bg-ink-50 px-3 py-2.5 text-[13px] leading-relaxed text-ink-700">
          {copy.body}
        </p>

        <form action={action} className="mt-5 space-y-4">
          <input type="hidden" name="type" value={type} />
          {targetUserId && <input type="hidden" name="targetUserId" value={targetUserId} />}
          {targetAssetId && <input type="hidden" name="targetAssetId" value={targetAssetId} />}

          <FormAlert>{state.error}</FormAlert>

          <div>
            <label className="label" htmlFor={reasonId}>
              Reason (recorded in the audit trail)
            </label>
            <textarea
              id={reasonId}
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
            <SubmitButton
              variant={copy.destructive ? "danger" : "primary"}
              pendingLabel="Applying…"
            >
              {copy.confirm}
            </SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
