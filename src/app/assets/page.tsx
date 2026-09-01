import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AssetCard } from "@/components/assets/asset-card";
import { AssetFilters } from "@/components/assets/asset-filters";
import { SmartSearch } from "@/components/assets/smart-search";
import { Pagination } from "@/components/ui/pagination";
import { SortSelect } from "@/components/ui/sort-select";
import { ASSET_FEATURES, BUSINESS_TYPES, LICENCE_STATUSES, USER_ROLE } from "@/constants";
import { assetFilterSchema } from "@/lib/validation";
import { getActiveFacets, getTaxonomy, searchAssets } from "@/server/assets/queries";
import { getBuyerProfile, toMatchableBuyer } from "@/server/buyers/queries";
import { getCurrentUser } from "@/server/auth/session";
import { isAiEnabled } from "@/server/matching/ai";
import { ROUTES } from "@/routes";

export const metadata: Metadata = {
  title: "All listings",
  description: "Licensed financial companies and licences for sale across 30+ jurisdictions.",
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const raw = await searchParams;
  const parsed = assetFilterSchema.safeParse(raw);
  // A malformed URL should show the default listing page, not an error screen.
  const filters = parsed.success ? parsed.data : assetFilterSchema.parse({});

  const user = await getCurrentUser();
  const buyerProfile = user?.role === USER_ROLE.BUYER ? await getBuyerProfile(user.id) : null;

  const [{ items, total, page, pageCount }, taxonomy, facets] = await Promise.all([
    searchAssets(filters, { buyer: buyerProfile ? toMatchableBuyer(buyerProfile) : null }),
    getTaxonomy(),
    getActiveFacets(),
  ]);

  const stringParams = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value.join(",") : value]),
  );

  return (
    <div className="container-page py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Marketplace</p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-ink-900">
            All listings
          </h1>
          <p className="mt-1 text-[14px] text-ink-500">
            {total} {total === 1 ? "asset" : "assets"} available
            {buyerProfile ? " · ranked against your mandate where you sort by match" : ""}
          </p>
        </div>

        <SortSelect
          basePath="/assets"
          value={filters.sort}
          options={[
            { value: "recent", label: "Most recent" },
            ...(buyerProfile ? [{ value: "match", label: "Best match for me" }] : []),
            { value: "price_asc", label: "Price: low to high" },
            { value: "price_desc", label: "Price: high to low" },
          ]}
        />
      </header>

      <div className="mt-6">
        <Suspense fallback={<div className="h-11 rounded-md bg-ink-100" />}>
          <SmartSearch aiEnabled={isAiEnabled()} />
        </Suspense>
      </div>

      {!buyerProfile && user?.role === USER_ROLE.BUYER ? (
        <div className="mt-6 rounded-card border border-accent-300/50 bg-accent-50 p-4">
          <p className="text-[14px] font-medium text-accent-700">
            Set up your mandate to see match scores
          </p>
          <p className="mt-1 text-[13px] text-ink-700">
            Tell us the jurisdictions, licence types and cheque size you are after, and every
            listing gets scored against it.{" "}
            <Link href={ROUTES.buyer.profile} className="font-medium underline">
              Set up now
            </Link>
          </p>
        </div>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <Suspense fallback={<div className="h-96 rounded-card bg-ink-100" />}>
          <AssetFilters
            jurisdictions={taxonomy.jurisdictions}
            categories={taxonomy.categories}
            jurisdictionCounts={Object.fromEntries(facets.jurisdictionCounts)}
            categoryCounts={Object.fromEntries(facets.categoryCounts)}
          />
        </Suspense>

        <div>
          {items.length ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
              </div>
              <Pagination
                page={page}
                pageCount={pageCount}
                basePath="/assets"
                params={stringParams}
              />
            </>
          ) : (
            <div className="card grid place-items-center px-6 py-20 text-center">
              <p className="text-[16px] font-medium text-ink-900">No listings match those filters</p>
              <p className="mt-1.5 max-w-[420px] text-[13.5px] text-ink-500">
                Try widening the jurisdiction or price range. Assets that are priced on request are
                included by default — check that you have not switched them off.
              </p>
              <Link
                href={ROUTES.assets.index}
                className="mt-4 text-[13.5px] font-medium text-navy-700 hover:underline"
              >
                Clear all filters
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
