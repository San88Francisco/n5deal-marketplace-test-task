"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { contactAction, type ContactState } from "@/server/conversations/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending…" : "Send message"}
    </Button>
  );
}

/**
 * Contact is a dialog rather than a separate page: the buyer is mid-evaluation
 * and should not lose the listing they are reading. The subject is pre-filled
 * with the listing title so the thread carries its own context.
 */
export function ContactDialog({
  counterpartyId,
  counterpartyName,
  assetId,
  subject,
  triggerLabel,
  variant = "primary",
  suggestion,
}: {
  counterpartyId: string;
  counterpartyName: string;
  assetId?: string;
  subject: string;
  triggerLabel: string;
  variant?: "primary" | "outline";
  suggestion?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<ContactState, FormData>(contactAction, {});

  return (
    <>
      <Button type="button" variant={variant} className="w-full" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-navy-950/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Contact ${counterpartyName}`}
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-[520px] rounded-card bg-white p-6 shadow-lift">
            <h2 className="text-[18px] font-semibold tracking-tight text-ink-900">
              Contact {counterpartyName}
            </h2>
            <p className="mt-1 text-[13px] text-ink-500">
              Messages stay on the platform. Both sides see the listing this thread is about.
            </p>

            <form action={action} className="mt-5 space-y-4">
              <input type="hidden" name="counterpartyId" value={counterpartyId} />
              {assetId ? <input type="hidden" name="assetId" value={assetId} /> : null}

              {state.error ? (
                <p className="rounded-md border border-critical-500/25 bg-critical-50 px-3 py-2 text-[13px] text-critical-700">
                  {state.error}
                </p>
              ) : null}

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
                {state.fieldErrors?.subject ? (
                  <p className="field-error">{state.fieldErrors.subject[0]}</p>
                ) : null}
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
                {state.fieldErrors?.body ? (
                  <p className="field-error">{state.fieldErrors.body[0]}</p>
                ) : null}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Submit />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
