import "server-only";

import { prisma } from "@/server/db";
import { AuthorizationError } from "@/server/auth/guards";
import { ASSET_STATUS, USER_ROLE, USER_STATUS } from "@/constants";
import type { ContactableRole } from "@/types";

export async function startConversation(params: {
  actorId: string;
  actorRole: ContactableRole;
  counterpartyId: string;
  assetId?: string | null;
  subject: string;
  body: string;
}) {
  const buyerId = params.actorRole === USER_ROLE.BUYER ? params.actorId : params.counterpartyId;
  const sellerId = params.actorRole === USER_ROLE.SELLER ? params.actorId : params.counterpartyId;

  const [buyer, seller] = await Promise.all([
    prisma.user.findUnique({
      where: { id: buyerId },
      select: { id: true, role: true, status: true },
    }),
    prisma.user.findUnique({
      where: { id: sellerId },
      select: { id: true, role: true, status: true },
    }),
  ]);

  if (!buyer || buyer.role !== USER_ROLE.BUYER) throw new AuthorizationError("Buyer not found");
  if (!seller || seller.role !== USER_ROLE.SELLER) throw new AuthorizationError("Seller not found");

  if (buyer.status !== USER_STATUS.ACTIVE || seller.status !== USER_STATUS.ACTIVE) {
    throw new AuthorizationError("That participant is not available");
  }

  let assetId: string | null = params.assetId ?? null;
  if (assetId) {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: { id: true, sellerId: true, status: true },
    });

    if (!asset || asset.sellerId !== sellerId || asset.status === ASSET_STATUS.SUSPENDED) {
      assetId = null;
    }
  }

  const existing = await prisma.conversation.findFirst({
    where: { buyerId, sellerId, assetId },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.message.create({
        data: { conversationId: existing.id, senderId: params.actorId, body: params.body },
      }),
      prisma.conversation.update({
        where: { id: existing.id },
        data: { lastMessageAt: new Date() },
      }),
    ]);

    return { conversationId: existing.id, reused: true };
  }

  const conversation = await prisma.conversation.create({
    data: {
      buyerId,
      sellerId,
      assetId,
      subject: params.subject,
      messages: { create: { senderId: params.actorId, body: params.body } },
    },
  });

  return { conversationId: conversation.id, reused: false };
}

export async function replyToConversation(params: {
  actorId: string;
  conversationId: string;
  body: string;
}) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: params.conversationId },
    include: {
      buyer: { select: { id: true, status: true } },
      seller: { select: { id: true, status: true } },
    },
  });

  if (!conversation) throw new AuthorizationError("Conversation not found");

  const isParticipant =
    conversation.buyerId === params.actorId || conversation.sellerId === params.actorId;
  if (!isParticipant) throw new AuthorizationError("Not your conversation");

  const counterparty =
    conversation.buyerId === params.actorId ? conversation.seller : conversation.buyer;
  if (counterparty.status !== USER_STATUS.ACTIVE) {
    throw new AuthorizationError("This conversation is read-only");
  }

  await prisma.$transaction([
    prisma.message.create({
      data: { conversationId: conversation.id, senderId: params.actorId, body: params.body },
    }),
    prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    }),
  ]);
}

export async function listConversations(userId: string) {
  return prisma.conversation.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    include: {
      asset: { select: { id: true, slug: true, title: true, referenceCode: true, status: true } },
      buyer: {
        select: {
          id: true,
          fullName: true,
          status: true,
          buyerProfile: { select: { companyName: true } },
        },
      },
      seller: {
        select: {
          id: true,
          fullName: true,
          status: true,
          sellerProfile: { select: { companyName: true } },
        },
      },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: true } },
    },
    orderBy: { lastMessageAt: "desc" },
  });
}

export async function getConversation(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      asset: { select: { id: true, slug: true, title: true, referenceCode: true, status: true } },
      buyer: {
        select: {
          id: true,
          fullName: true,
          status: true,
          buyerProfile: { select: { id: true, companyName: true } },
        },
      },
      seller: {
        select: {
          id: true,
          fullName: true,
          status: true,
          sellerProfile: { select: { companyName: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, fullName: true } } },
      },
    },
  });

  if (!conversation) return null;
  if (conversation.buyerId !== userId && conversation.sellerId !== userId) return null;

  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() },
  });

  return conversation;
}

export async function countUnread(userId: string) {
  return prisma.message.count({
    where: {
      readAt: null,
      senderId: { not: userId },
      conversation: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    },
  });
}
