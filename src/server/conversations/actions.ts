"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { replySchema, startConversationSchema } from "@/lib/validation";
import { assertRole, AuthorizationError } from "@/server/auth/guards";
import { replyToConversation, startConversation } from "@/server/conversations/service";
import { ROUTES } from "@/routes";
import type { ContactableRole } from "@/types";
import { USER_ROLE } from "@/constants";

export type ContactState = { error?: string; fieldErrors?: Record<string, string[]> };

export async function contactAction(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = startConversationSchema.safeParse({
    assetId: formData.get("assetId") || undefined,
    counterpartyId: formData.get("counterpartyId"),
    subject: formData.get("subject"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  let conversationId: string;

  try {
    const user = await assertRole(USER_ROLE.BUYER, USER_ROLE.SELLER);
    const result = await startConversation({
      actorId: user.id,
      actorRole: user.role as ContactableRole,
      counterpartyId: parsed.data.counterpartyId,
      assetId: parsed.data.assetId ?? null,
      subject: parsed.data.subject,
      body: parsed.data.body,
    });
    conversationId = result.conversationId;
  } catch (error) {
    if (error instanceof AuthorizationError) return { error: error.message };
    console.error("[contact] failed", error);
    return { error: "Could not send that message. Try again." };
  }

  revalidatePath(ROUTES.messages.index);
  redirect(ROUTES.messages.thread(conversationId));
}

export async function replyAction(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = replySchema.safeParse({
    conversationId: formData.get("conversationId"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const user = await assertRole(USER_ROLE.BUYER, USER_ROLE.SELLER);
    await replyToConversation({
      actorId: user.id,
      conversationId: parsed.data.conversationId,
      body: parsed.data.body,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) return { error: error.message };
    console.error("[reply] failed", error);
    return { error: "Could not send that message. Try again." };
  }

  revalidatePath(`/messages/${parsed.data.conversationId}`);
  return {};
}
