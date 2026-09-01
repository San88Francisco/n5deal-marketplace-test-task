import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/server/db";
import type { BuyerFilters } from "@/lib/validation";
import { scoreMatch, type MatchableAsset, type MatchResult } from "@/server/matching/score";
import { CATALOGUE_PAGE_SIZE, MATCH_SORT_SCAN_LIMIT } from "@/constants";
import type { Paginated } from "@/types";

export const PAGE_SIZE = CATALOGUE_PAGE_SIZE;

const buyerInclude = {
  user: { select: { id: true, fullName: true, status: true, createdAt: true } },
  targetJurisdictions: { include: { jurisdiction: true } },
  targetCategories: { include: { category: true } },
  targetBusinessTypes: true,
} satisfies Prisma.BuyerProfileInclude;

export type BuyerListItem = Prisma.BuyerProfileGetPayload<{ include: typeof buyerInclude }> & {
  match?: MatchResult;
};

/** A buyer is visible to sellers only if they published the profile *and* their
 *  account is in good standing. */
const PUBLIC_BUYER_WHERE: Prisma.BuyerProfileWhereInput = {
  isPublished: true,
  user: { status: "ACTIVE" },
};

export function buildBuyerWhere(filters: BuyerFilters): Prisma.BuyerProfileWhereInput {
  const and: Prisma.BuyerProfileWhereInput[] = [PUBLIC_BUYER_WHERE];

  if (filters.q) {
    and.push({
      OR: [
        { companyName: { contains: filters.q } },
        { headline: { contains: filters.q } },
        { about: { contains: filters.q } },
        { investmentThesis: { contains: filters.q } },
      ],
    });
  }

  if (filters.jurisdictions.length) {
    and.push({ targetJurisdictions: { some: { jurisdictionCode: { in: filters.jurisdictions } } } });
  }
  if (filters.categories.length) {
    and.push({ targetCategories: { some: { categoryCode: { in: filters.categories } } } });
  }
  if (filters.businessTypes.length) {
    and.push({
      targetBusinessTypes: {
        some: { businessType: { in: filters.businessTypes as Prisma.EnumBusinessTypeFilter["in"] } },
      },
    });
  }
  if (filters.investorTypes.length) {
    and.push({ investorType: { in: filters.investorTypes as Prisma.EnumInvestorTypeFilter["in"] } });
  }
  if (filters.timelines.length) {
    and.push({
      timeline: { in: filters.timelines as Prisma.EnumAcquisitionTimelineFilter["in"] },
    });
  }
  if (filters.proofOfFundsOnly) {
    and.push({ proofOfFundsReady: true });
  }
  if (filters.ticketMin != null) {
    // "Show buyers who could write at least this cheque" — compare against their
    // ceiling, not their floor.
    and.push({ ticketMaxEur: { gte: filters.ticketMin } });
  }

  return { AND: and };
}

function orderBy(sort: BuyerFilters["sort"]): Prisma.BuyerProfileOrderByWithRelationInput[] {
  switch (sort) {
    case "ticket_desc":
      return [{ ticketMaxEur: "desc" }];
    default:
      return [{ updatedAt: "desc" }];
  }
}

export async function searchBuyers(
  filters: BuyerFilters,
  options: { asset?: MatchableAsset | null } = {},
): Promise<Paginated<BuyerListItem>> {
  const where = buildBuyerWhere(filters);
  const wantsMatchSort = filters.sort === "match" && options.asset;

  // See the note in assets/queries.ts: ranking by score cannot happen in SQL, so
  // a match-sorted page is cut after scoring.
  const pagination: { skip?: number; take: number } = wantsMatchSort
    ? { take: MATCH_SORT_SCAN_LIMIT }
    : { skip: (filters.page - 1) * PAGE_SIZE, take: PAGE_SIZE };

  const [total, rows] = await Promise.all([
    prisma.buyerProfile.count({ where }),
    prisma.buyerProfile.findMany({
      where,
      include: buyerInclude,
      orderBy: orderBy(filters.sort),
      ...pagination,
    }),
  ]);

  const { asset } = options;

  const scored: BuyerListItem[] = asset
    ? rows.map((buyer) => ({
        ...buyer,
        match: scoreMatch(toMatchableBuyer(buyer), asset),
      }))
    : rows;

  const items = wantsMatchSort
    ? [...scored]
        .sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0))
        .slice((filters.page - 1) * PAGE_SIZE, filters.page * PAGE_SIZE)
    : scored;

  return {
    items,
    total,
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getBuyerProfile(userId: string) {
  return prisma.buyerProfile.findUnique({
    where: { userId },
    include: buyerInclude,
  });
}

export async function getBuyerProfileById(id: string) {
  return prisma.buyerProfile.findUnique({
    where: { id },
    include: buyerInclude,
  });
}

export async function getSellerProfile(userId: string) {
  return prisma.sellerProfile.findUnique({
    where: { userId },
    include: { operatesIn: { include: { jurisdiction: true } }, user: true },
  });
}

/** Turns a stored buyer profile into the shape the scoring engine expects. */
export function toMatchableBuyer(buyer: BuyerListItem) {
  return {
    targetJurisdictions: buyer.targetJurisdictions.map((row) => row.jurisdictionCode),
    targetCategories: buyer.targetCategories.map((row) => row.categoryCode),
    targetBusinessTypes: buyer.targetBusinessTypes.map((row) => row.businessType),
    ticketMinEur: Number(buyer.ticketMinEur),
    ticketMaxEur: Number(buyer.ticketMaxEur),
    wantsOperatingOnly: buyer.wantsOperatingOnly,
  };
}
