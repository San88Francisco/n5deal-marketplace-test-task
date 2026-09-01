"use server";

import { revalidatePath } from "next/cache";

import { moderationSchema } from "@/lib/validation";
import { assertRole, AuthorizationError } from "@/server/auth/guards";
import { applyModeration } from "@/server/moderation/service";
import { USER_ROLE } from "@/constants";
import { ROUTES } from "@/routes";

export type ModerationState = { error?: string; ok?: true };

export async function moderateAction(
  _prev: ModerationState,
  formData: FormData,
): Promise<ModerationState> {
  const parsed = moderationSchema.safeParse({
    type: formData.get("type"),
    targetUserId: formData.get("targetUserId") || undefined,
    targetAssetId: formData.get("targetAssetId") || undefined,
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  try {
    const manager = await assertRole(USER_ROLE.PLATFORM_MANAGER);
    await applyModeration(manager.id, parsed.data);
  } catch (error) {
    if (error instanceof AuthorizationError) return { error: error.message };
    console.error("[moderation] failed", error);
    return { error: error instanceof Error ? error.message : "Could not apply that action." };
  }

  revalidatePath(ROUTES.manage.overview);
  revalidatePath(ROUTES.manage.participants());
  revalidatePath(ROUTES.manage.listings());
  revalidatePath(ROUTES.manage.audit);
  revalidatePath(ROUTES.assets.index);
  return { ok: true };
}
