import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/server/db";
import { AuthorizationError } from "@/server/auth/guards";
import type { ManagedAssetFilters, ModerationInput, ParticipantFilters } from "@/lib/validation";
import type { Paginated } from "@/types";
import { ADMIN_PAGE_SIZE, ASSET_STATUS, MODERATION_ACTION, USER_ROLE, USER_STATUS } from "@/constants";

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
  if (!actor || actor.role !== USER_ROLE.PLATFORM_MANAGER) {
    throw new AuthorizationError("Only platform managers can moderate");
  }

  const writes: Prisma.PrismaPromise<unknown>[] = [];

  if (input.type.startsWith("USER_") || input.type === MODERATION_ACTION.SELLER_VERIFY) {
    if (!input.targetUserId) throw new Error("A target participant is required");

    const target = await prisma.user.findUnique({ where: { id: input.targetUserId } });
    if (!target) throw new Error("Participant not found");

    if (target.id === actor.id) {
      throw new AuthorizationError("You cannot moderate your own account");
    }
    if (target.role === USER_ROLE.PLATFORM_MANAGER) {
      // Managers are peers; removing one another is an admin operation, not a
      // marketplace moderation action.
      throw new AuthorizationError("Platform managers cannot moderate each other");
    }

    switch (input.type) {
      case MODERATION_ACTION.USER_SUSPEND:
        writes.push(
          prisma.user.update({
            where: { id: target.id },
            data: { status: USER_STATUS.SUSPENDED, statusReason: input.reason },
          }),
          prisma.session.deleteMany({ where: { userId: target.id } }),
        );
        break;

      case MODERATION_ACTION.USER_REINSTATE:
        writes.push(
          prisma.user.update({
            where: { id: target.id },
            data: { status: USER_STATUS.ACTIVE, statusReason: null },
          }),
        );
        break;

      case MODERATION_ACTION.USER_REMOVE:
        writes.push(
          prisma.user.update({
            where: { id: target.id },
            data: { status: USER_STATUS.REMOVED, statusReason: input.reason },
          }),
          prisma.session.deleteMany({ where: { userId: target.id } }),
          // Their listings leave the marketplace with them, but are archived
          // rather than deleted so the deal history survives.
          prisma.asset.updateMany({
            where: { sellerId: target.id, status: { notIn: [ASSET_STATUS.SOLD, ASSET_STATUS.ARCHIVED] } },
            data: { status: ASSET_STATUS.ARCHIVED },
          }),
        );
        break;

      case MODERATION_ACTION.SELLER_VERIFY:
        if (target.role !== USER_ROLE.SELLER) throw new Error("Only sellers can be verified");
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

    if (input.type === MODERATION_ACTION.ASSET_SUSPEND) {
      writes.push(
        prisma.asset.update({ where: { id: asset.id }, data: { status: ASSET_STATUS.SUSPENDED } }),
      );
    } else {
      writes.push(
        prisma.asset.update({
          where: { id: asset.id },
          data: { status: asset.publishedAt ? ASSET_STATUS.PUBLISHED : ASSET_STATUS.DRAFT },
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

const participantInclude = {
  buyerProfile: { select: { companyName: true, investorType: true, ticketMaxEur: true } },
  sellerProfile: { select: { companyName: true, sellerType: true, isVerified: true } },
  _count: { select: { assets: true } },
} satisfies Prisma.UserInclude;

export type ParticipantListItem = Prisma.UserGetPayload<{ include: typeof participantInclude }>;

export async function searchParticipants(
  filters: ParticipantFilters,
): Promise<Paginated<ParticipantListItem>> {
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
      include: participantInclude,
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

const managedAssetInclude = {
  jurisdiction: true,
  category: true,
  seller: {
    select: {
      id: true,
      fullName: true,
      status: true,
      sellerProfile: { select: { companyName: true } },
    },
  },
} satisfies Prisma.AssetInclude;

export type ManagedAssetListItem = Prisma.AssetGetPayload<{ include: typeof managedAssetInclude }>;

export async function searchAllAssets(
  query: ManagedAssetFilters,
): Promise<Paginated<ManagedAssetListItem>> {
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
      include: managedAssetInclude,
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
    prisma.user.count({ where: { role: USER_ROLE.BUYER, status: USER_STATUS.ACTIVE } }),
    prisma.user.count({ where: { role: USER_ROLE.SELLER, status: USER_STATUS.ACTIVE } }),
    prisma.asset.count({ where: { status: { in: [ASSET_STATUS.PUBLISHED, ASSET_STATUS.UNDER_OFFER] } } }),
    prisma.user.count({ where: { status: { in: [USER_STATUS.SUSPENDED, USER_STATUS.REMOVED] } } }),
    prisma.conversation.count(),
    prisma.asset.count({ where: { status: ASSET_STATUS.PUBLISHED, isValidated: false } }),
  ]);

  return { buyers, sellers, published, suspended, conversations, unvalidated };
}
