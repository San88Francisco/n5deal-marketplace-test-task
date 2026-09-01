import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/server/db";
import type { AssetFilters } from "@/lib/validation";
import { scoreMatch, type MatchableBuyer, type MatchResult } from "@/server/matching/score";
import { CATALOGUE_PAGE_SIZE, MATCH_SORT_SCAN_LIMIT, PUBLIC_ASSET_STATUSES, USER_STATUS } from "@/constants";
import type { Paginated } from "@/types";

export const PAGE_SIZE = CATALOGUE_PAGE_SIZE;

const PUBLIC_STATUSES: Prisma.EnumAssetStatusFilter = {
  in: [...PUBLIC_ASSET_STATUSES],
};

const PUBLIC_ASSET_WHERE: Prisma.AssetWhereInput = {
  status: PUBLIC_STATUSES,
  seller: { status: USER_STATUS.ACTIVE },
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

  and.push(
    ...filters.features.map((feature) => ({
      features: { some: { code: feature as never } },
    })),
  );

  if (filters.priceMin != null || filters.priceMax != null) {
    const range: Prisma.DecimalFilter = {};
    if (filters.priceMin != null) range.gte = filters.priceMin;
    if (filters.priceMax != null) range.lte = filters.priceMax;

    and.push(
      filters.includeOnRequest
        ?

          { OR: [{ askingPriceEur: range }, { askingPriceEur: null }] }
        : { askingPriceEur: range },
    );
  }

  return { AND: and };
}

function orderBy(sort: AssetFilters["sort"]): Prisma.AssetOrderByWithRelationInput[] {
  switch (sort) {
    case "price_asc":

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
): Promise<Paginated<AssetListItem>> {
  const where = buildAssetWhere(filters);
  const wantsMatchSort = filters.sort === "match" && options.buyer;

  const pagination: { skip?: number; take: number } = wantsMatchSort
    ? { take: MATCH_SORT_SCAN_LIMIT }
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

  const { buyer } = options;

  const scored: AssetListItem[] = buyer
    ? rows.map((asset) => ({
        ...asset,
        match: scoreMatch(buyer, {
          jurisdictionCode: asset.jurisdictionCode,
          categoryCode: asset.categoryCode,
          businessType: asset.businessType,
          askingPriceEur: asset.askingPriceEur ? Number(asset.askingPriceEur) : null,
          licenceStatus: asset.licenceStatus,
          isValidated: asset.isValidated,
        }),
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

const detailInclude = {
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
} satisfies Prisma.AssetInclude;

export type AssetDetail = Prisma.AssetGetPayload<{ include: typeof detailInclude }>;

export async function getAssetBySlug(slug: string): Promise<AssetDetail | null> {
  return prisma.asset.findUnique({ where: { slug }, include: detailInclude });
}

const sellerListInclude = {
  jurisdiction: true,
  category: true,
  _count: { select: { favourites: true, conversations: true } },
} satisfies Prisma.AssetInclude;

export type SellerAssetListItem = Prisma.AssetGetPayload<{ include: typeof sellerListInclude }>;

export async function getSellerAssets(sellerId: string): Promise<SellerAssetListItem[]> {
  return prisma.asset.findMany({
    where: { sellerId },
    include: sellerListInclude,
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
