"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { replyAction, type ContactState } from "@/server/conversations/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending…" : "Send"}
    </Button>
  );
}

export function ReplyForm({ conversationId }: { conversationId: string }) {
  const [state, action] = useActionState<ContactState, FormData>(replyAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the box once the server confirms the send, not optimistically — a
  // failed message the user has to retype is worse than a slow one.
  useEffect(() => {
    if (!state.error && !state.fieldErrors) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <input type="hidden" name="conversationId" value={conversationId} />

      {state.error ? (
        <p className="rounded-md border border-critical-500/25 bg-critical-50 px-3 py-2 text-[13px] text-critical-700">
          {state.error}
        </p>
      ) : null}

      <label className="label" htmlFor="reply-body">
        Reply
      </label>
      <textarea
        id="reply-body"
        name="body"
        rows={4}
        required
        className="field resize-y"
        placeholder="Write your reply…"
      />
      {state.fieldErrors?.body ? (
        <p className="field-error">{state.fieldErrors.body[0]}</p>
      ) : null}

      <div className="flex justify-end">
        <Submit />
      </div>
    </form>
  );
}
