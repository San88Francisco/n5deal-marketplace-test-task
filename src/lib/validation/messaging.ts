import { z } from "zod";

export const startConversationSchema = z.object({
  assetId: z.string().trim().max(40).optional(),
  counterpartyId: z.string().trim().min(1).max(40),
  subject: z.string().trim().min(3).max(200),
  body: z.string().trim().min(10, "Write at least a sentence").max(10_000),
});

export const replySchema = z.object({
  conversationId: z.string().trim().min(1).max(40),
  body: z.string().trim().min(1).max(10_000),
});

export const smartQuerySchema = z.object({
  query: z.string().trim().min(3, "Describe what you are looking for").max(500),
});

export const assetIdSchema = z.object({
  assetId: z.string().trim().min(1).max(40),
});
