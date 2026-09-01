import { z } from "zod";

import { MODERATION_ACTION_TYPES } from "@/constants";

export const moderationSchema = z.object({
  type: z.enum(MODERATION_ACTION_TYPES),
  targetUserId: z.string().trim().max(40).optional(),
  targetAssetId: z.string().trim().max(40).optional(),
  reason: z.string().trim().min(10, "Record why you are doing this").max(2000),
});

export type ModerationInput = z.infer<typeof moderationSchema>;
