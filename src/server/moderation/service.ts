import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/server/db";
import { AuthorizationError } from "@/server/auth/guards";
import type { ModerationInput, ParticipantFilters } from "@/lib/validation";
import { ADMIN_PAGE_SIZE } from "@/constants";

export const PAGE_SIZE = ADMIN_PAGE_SIZE;

/**
 * Every manager action goes through this one function so that three invariants
 * hold without depending on the caller remembering them:
 *
 *   1. the state change and the audit record are written in one transaction —
 *      an action that is not recorded did not happen;
 *   2. suspending or removing a participant destroys their sessions, so the
 *      block is immediate rather than eventual;
 *   3. managers cannot act on themselves or on each other.
 */
export async function applyModeration(actorId: string, input: ModerationInput) {
  const actor = await prisma.user.findUnique({ where: { id: actorId } });
  if (!actor || actor.role !== "PLATFORM_MANAGER") {
    throw new AuthorizationError("Only platform managers can moderate");
  }

  const writes: Prisma.PrismaPromise<unknown>[] = [];

  if (input.type.startsWith("USER_") || input.type === "SELLER_VERIFY") {
    if (!input.targetUserId) throw new Error("A target participant is required");

    const target = await prisma.user.findUnique({ where: { id: input.targetUserId } });
    if (!target) throw new Error("Participant not found");

    if (target.id === actor.id) {
      throw new AuthorizationError("You cannot moderate your own account");
    }
    if (target.role === "PLATFORM_MANAGER") {
      // Managers are peers; removing one another is an admin operation, not a
      // marketplace moderation action.
      throw new AuthorizationError("Platform managers cannot moderate each other");
    }

    switch (input.type) {
      case "USER_SUSPEND":
        writes.push(
          prisma.user.update({
            where: { id: target.id },
            data: { status: "SUSPENDED", statusReason: input.reason },
          }),
          prisma.session.deleteMany({ where: { userId: target.id } }),
        );
        break;

      case "USER_REINSTATE":
        writes.push(
          prisma.user.update({
            where: { id: target.id },
            data: { status: "ACTIVE", statusReason: null },
          }),
        );
        break;

      case "USER_REMOVE":
        writes.push(
          prisma.user.update({
            where: { id: target.id },
            data: { status: "REMOVED", statusReason: input.reason },
          }),
          prisma.session.deleteMany({ where: { userId: target.id } }),
          // Their listings leave the marketplace with them, but are archived
          // rather than deleted so the deal history survives.
          prisma.asset.updateMany({
            where: { sellerId: target.id, status: { notIn: ["SOLD", "ARCHIVED"] } },
            data: { status: "ARCHIVED" },
          }),
        );
        break;

      case "SELLER_VERIFY":
        if (target.role !== "SELLER") throw new Error("Only sellers can be verified");
        writes.push(
          prisma.sellerProfile.update({
            where: { userId: target.id },
            data: { isVerified: true },
          }),
        );
        break;
    }
  } else {
    if (!input.targetAssetId) throw new Error("A target listing is required");

    const asset = await prisma.asset.findUnique({ where: { id: input.targetAssetId } });
    if (!asset) throw new Error("Listing not found");

    if (input.type === "ASSET_SUSPEND") {
      writes.push(
        prisma.asset.update({ where: { id: asset.id }, data: { status: "SUSPENDED" } }),
      );
    } else {
      writes.push(
        prisma.asset.update({
          where: { id: asset.id },
          data: { status: asset.publishedAt ? "PUBLISHED" : "DRAFT" },
        }),
      );
    }
  }

  writes.push(
    prisma.moderationAction.create({
      data: {
        actorId: actor.id,
        type: input.type,
        targetUserId: input.targetUserId ?? null,
        targetAssetId: input.targetAssetId ?? null,
        reason: input.reason,
      },
    }),
  );

  await prisma.$transaction(writes);
}

export async function searchParticipants(filters: ParticipantFilters) {
  const and: Prisma.UserWhereInput[] = [];

  if (filters.q) {
    and.push({
      OR: [
        { fullName: { contains: filters.q } },
        { email: { contains: filters.q } },
        { buyerProfile: { companyName: { contains: filters.q } } },
        { sellerProfile: { companyName: { contains: filters.q } } },
      ],
    });
  }
  if (filters.role) and.push({ role: filters.role });
  if (filters.status) and.push({ status: filters.status });

  const where: Prisma.UserWhereInput = and.length ? { AND: and } : {};

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: {
        buyerProfile: { select: { companyName: true, investorType: true, ticketMaxEur: true } },
        sellerProfile: { select: { companyName: true, sellerType: true, isVerified: true } },
        _count: { select: { assets: true } },
      },
      orderBy: [{ createdAt: "desc" }],
      skip: (filters.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return {
    items,
    total,
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Every listing, whatever its state — the manager view is not the public one. */
export async function searchAllAssets(query: { q?: string; status?: string; page: number }) {
  const and: Prisma.AssetWhereInput[] = [];

  if (query.q) {
    and.push({
      OR: [
        { title: { contains: query.q } },
        { summary: { contains: query.q } },
        { seller: { fullName: { contains: query.q } } },
      ],
    });
  }
  if (query.status) {
    and.push({ status: query.status as Prisma.EnumAssetStatusFilter["equals"] });
  }

  const where: Prisma.AssetWhereInput = and.length ? { AND: and } : {};

  const [total, items] = await Promise.all([
    prisma.asset.count({ where }),
    prisma.asset.findMany({
      where,
      include: {
        jurisdiction: true,
        category: true,
        seller: { select: { id: true, fullName: true, status: true, sellerProfile: { select: { companyName: true } } } },
      },
      orderBy: [{ updatedAt: "desc" }],
      skip: (query.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return { items, total, page: query.page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getModerationHistory(params: { userId?: string; assetId?: string } = {}) {
  return prisma.moderationAction.findMany({
    where: {
      ...(params.userId ? { targetUserId: params.userId } : {}),
      ...(params.assetId ? { targetAssetId: params.assetId } : {}),
    },
    include: {
      actor: { select: { id: true, fullName: true } },
      targetUser: { select: { id: true, fullName: true, email: true } },
      targetAsset: { select: { id: true, slug: true, title: true, referenceCode: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getPlatformStats() {
  const [buyers, sellers, published, suspended, conversations, unvalidated] = await Promise.all([
    prisma.user.count({ where: { role: "BUYER", status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "SELLER", status: "ACTIVE" } }),
    prisma.asset.count({ where: { status: { in: ["PUBLISHED", "UNDER_OFFER"] } } }),
    prisma.user.count({ where: { status: { in: ["SUSPENDED", "REMOVED"] } } }),
    prisma.conversation.count(),
    prisma.asset.count({ where: { status: "PUBLISHED", isValidated: false } }),
  ]);

  return { buyers, sellers, published, suspended, conversations, unvalidated };
}
