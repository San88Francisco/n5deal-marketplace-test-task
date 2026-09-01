"use client";

import { useActionState, useEffect, useRef } from "react";

import { FieldError } from "@/components/ui/field-error";
import { FormAlert } from "@/components/ui/form-alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { replyAction } from "@/server/conversations/actions";
import type { ActionState } from "@/types";

export function ReplyForm({ conversationId }: { conversationId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(replyAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.error && !state.fieldErrors) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <input type="hidden" name="conversationId" value={conversationId} />

      <FormAlert>{state.error}</FormAlert>

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
      <FieldError errors={state.fieldErrors?.body} />

      <div className="flex justify-end">
        <SubmitButton pendingLabel="Sending…">Send</SubmitButton>
      </div>
    </form>
  );
}
