import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/server/db";
import type { AssetFilters } from "@/lib/validation";
import { scoreMatch, type MatchableBuyer, type MatchResult } from "@/server/matching/score";

export const PAGE_SIZE = 9;

/**
 * Statuses a listing can have and still be visible to buyers. SOLD stays in the
 * index deliberately — comparable pricing is one of the few public signals in
 * M&A, and hiding it makes the marketplace look thinner than it is.
 */
const PUBLIC_STATUSES: Prisma.EnumAssetStatusFilter = {
  in: ["PUBLISHED", "UNDER_OFFER", "SOLD"],
};

/**
 * A listing is only public if its *seller* is also in good standing. Without
 * this, suspending a seller would leave their listings live — the moderation
 * flow would look like it worked while doing nothing.
 */
const PUBLIC_ASSET_WHERE: Prisma.AssetWhereInput = {
  status: PUBLIC_STATUSES,
  seller: { status: "ACTIVE" },
};

export function buildAssetWhere(filters: AssetFilters): Prisma.AssetWhereInput {
  const and: Prisma.AssetWhereInput[] = [PUBLIC_ASSET_WHERE];

  if (filters.q) {
    and.push({
      OR: [
        { title: { contains: filters.q } },
        { summary: { contains: filters.q } },
        { description: { contains: filters.q } },
        { regulator: { contains: filters.q } },
      ],
    });
  }

  if (filters.jurisdictions.length) {
    and.push({ jurisdictionCode: { in: filters.jurisdictions } });
  }
  if (filters.categories.length) {
    and.push({ categoryCode: { in: filters.categories } });
  }
  if (filters.businessTypes.length) {
    and.push({ businessType: { in: filters.businessTypes as Prisma.EnumBusinessTypeFilter["in"] } });
  }
  if (filters.licenceStatuses.length) {
    and.push({
      licenceStatus: { in: filters.licenceStatuses as Prisma.EnumLicenceStatusFilter["in"] },
    });
  }
  if (filters.validatedOnly) {
    and.push({ isValidated: true });
  }

  // Every requested feature must be present, so one AND clause per feature
  // rather than a single `in` (which would mean "any of").
  for (const feature of filters.features) {
    and.push({ features: { some: { code: feature as never } } });
  }

  if (filters.priceMin != null || filters.priceMax != null) {
    const range: Prisma.DecimalFilter = {};
    if (filters.priceMin != null) range.gte = filters.priceMin;
    if (filters.priceMax != null) range.lte = filters.priceMax;

    and.push(
      filters.includeOnRequest
        ? // "Price on request" listings have no number to compare. Dropping them
          // from a budget filter would hide exactly the deals a buyer has to ask
          // about, so they stay in unless the buyer opts out.
          { OR: [{ askingPriceEur: range }, { askingPriceEur: null }] }
        : { askingPriceEur: range },
    );
  }

  return { AND: and };
}

function orderBy(sort: AssetFilters["sort"]): Prisma.AssetOrderByWithRelationInput[] {
  switch (sort) {
    case "price_asc":
      // nulls last: "on request" should not lead a cheapest-first list.
      return [{ askingPriceEur: { sort: "asc", nulls: "last" } }, { publishedAt: "desc" }];
    case "price_desc":
      return [{ askingPriceEur: { sort: "desc", nulls: "last" } }, { publishedAt: "desc" }];
    default:
      return [{ publishedAt: "desc" }, { createdAt: "desc" }];
  }
}

const listInclude = {
  jurisdiction: true,
  category: true,
  features: true,
  seller: { select: { id: true, fullName: true, sellerProfile: true } },
  _count: { select: { favourites: true } },
} satisfies Prisma.AssetInclude;

export type AssetListItem = Prisma.AssetGetPayload<{ include: typeof listInclude }> & {
  match?: MatchResult;
};

export async function searchAssets(
  filters: AssetFilters,
  options: { buyer?: MatchableBuyer | null } = {},
): Promise<{ items: AssetListItem[]; total: number; page: number; pageCount: number }> {
  const where = buildAssetWhere(filters);
  const wantsMatchSort = filters.sort === "match" && options.buyer;

  // Match sorting happens in memory (the score is not a column), so when it is
  // requested we pull the filtered set and page after ranking. Safe at this data
  // volume; at scale the score would be precomputed into a column.
  const pagination: { skip?: number; take: number } = wantsMatchSort
    ? { take: 200 }
    : { skip: (filters.page - 1) * PAGE_SIZE, take: PAGE_SIZE };

  const [total, rows] = await Promise.all([
    prisma.asset.count({ where }),
    prisma.asset.findMany({
      where,
      include: listInclude,
      orderBy: orderBy(filters.sort),
      ...pagination,
    }),
  ]);

  let items: AssetListItem[] = rows;

  if (options.buyer) {
    const buyer = options.buyer;
    items = rows.map((asset) => ({
      ...asset,
      match: scoreMatch(buyer, {
        jurisdictionCode: asset.jurisdictionCode,
        categoryCode: asset.categoryCode,
        businessType: asset.businessType,
        askingPriceEur: asset.askingPriceEur ? Number(asset.askingPriceEur) : null,
        licenceStatus: asset.licenceStatus,
        isValidated: asset.isValidated,
      }),
    }));

    if (wantsMatchSort) {
      items.sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0));
      items = items.slice((filters.page - 1) * PAGE_SIZE, filters.page * PAGE_SIZE);
    }
  }

  return {
    items,
    total,
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getAssetBySlug(slug: string) {
  return prisma.asset.findUnique({
    where: { slug },
    include: {
      jurisdiction: true,
      category: true,
      features: true,
      seller: {
        select: {
          id: true,
          fullName: true,
          status: true,
          sellerProfile: { include: { operatesIn: { include: { jurisdiction: true } } } },
        },
      },
      _count: { select: { favourites: true } },
    },
  });
}

/** Listings owned by one seller, including drafts and suspended ones. */
export async function getSellerAssets(sellerId: string) {
  return prisma.asset.findMany({
    where: { sellerId },
    include: {
      jurisdiction: true,
      category: true,
      _count: { select: { favourites: true, conversations: true } },
    },
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function getTaxonomy() {
  const [jurisdictions, categories] = await Promise.all([
    prisma.jurisdiction.findMany({ orderBy: [{ region: "asc" }, { name: "asc" }] }),
    prisma.licenceCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  return { jurisdictions, categories };
}

/** Jurisdictions and categories that actually have public listings — used to
 *  keep the filter sidebar honest instead of offering 38 dead options. */
export async function getActiveFacets() {
  const [byJurisdiction, byCategory] = await Promise.all([
    prisma.asset.groupBy({
      by: ["jurisdictionCode"],
      where: PUBLIC_ASSET_WHERE,
      _count: { _all: true },
    }),
    prisma.asset.groupBy({
      by: ["categoryCode"],
      where: PUBLIC_ASSET_WHERE,
      _count: { _all: true },
    }),
  ]);

  return {
    jurisdictionCounts: new Map(byJurisdiction.map((row) => [row.jurisdictionCode, row._count._all])),
    categoryCounts: new Map(byCategory.map((row) => [row.categoryCode, row._count._all])),
  };
}

export async function recordAssetView(assetId: string) {
  await prisma.asset.update({
    where: { id: assetId },
    data: { viewCount: { increment: 1 } },
  });
}
