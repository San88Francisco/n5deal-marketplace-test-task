"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { FormAlert } from "@/components/ui/form-alert";
import { Modal } from "@/components/ui/modal";
import { SubmitButton } from "@/components/ui/submit-button";
import { contactAction } from "@/server/conversations/actions";
import type { ActionState } from "@/types";

type ContactDialogProps = {
  counterpartyId: string;
  counterpartyName: string;
  assetId?: string;
  subject: string;
  triggerLabel: string;
  variant?: "primary" | "outline";
  suggestion?: string;
};

export function ContactDialog({
  counterpartyId,
  counterpartyName,
  assetId,
  subject,
  triggerLabel,
  variant = "primary",
  suggestion,
}: ContactDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<ActionState, FormData>(contactAction, {});

  return (
    <>
      <Button type="button" variant={variant} className="w-full" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} label={`Contact ${counterpartyName}`}>
        <h2 className="text-[18px] font-semibold tracking-tight text-ink-900">
          Contact {counterpartyName}
        </h2>
        <p className="mt-1 text-[13px] text-ink-500">
          Messages stay on the platform. Both sides see the listing this thread is about.
        </p>

        <form action={action} className="mt-5 space-y-4">
          <input type="hidden" name="counterpartyId" value={counterpartyId} />
          {assetId && <input type="hidden" name="assetId" value={assetId} />}

          <FormAlert>{state.error}</FormAlert>

          <div>
            <label className="label" htmlFor="contact-subject">
              Subject
            </label>
            <input
              id="contact-subject"
              name="subject"
              defaultValue={subject}
              className="field"
              required
            />
            <FieldError errors={state.fieldErrors?.subject} />
          </div>

          <div>
            <label className="label" htmlFor="contact-body">
              Message
            </label>
            <textarea
              id="contact-body"
              name="body"
              rows={6}
              className="field resize-y"
              defaultValue={suggestion}
              placeholder="Introduce yourself and ask the two or three questions that would move this forward."
              required
            />
            <FieldError errors={state.fieldErrors?.body} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton pendingLabel="Sending…">Send message</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
