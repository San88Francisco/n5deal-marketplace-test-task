import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { BuyerCard } from "@/components/buyers/buyer-card";
import { BuyerFilters } from "@/components/buyers/buyer-filters";
import { AssetPicker } from "@/components/buyers/asset-picker";
import { Pagination } from "@/components/ui/pagination";
import { SortSelect } from "@/components/ui/sort-select";
import { ASSET_STATUS } from "@/constants";
import { buyerFilterSchema } from "@/lib/validation";
import { requireSeller } from "@/server/auth/guards";
import { getSellerAssets, getTaxonomy } from "@/server/assets/queries";
import { searchBuyers } from "@/server/buyers/queries";
import { getSellerProfile } from "@/server/buyers/queries";
import { ROUTES } from "@/routes";
import { toQueryRecord } from "@/utils/url";
import type { SearchParams } from "@/types";

export const metadata: Metadata = { title: "Buyer directory" };

export default async function BuyerDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireSeller();
  const profile = await getSellerProfile(user.id);
  if (!profile) redirect(ROUTES.seller.profile);

  const raw = await searchParams;
  const parsed = buyerFilterSchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : buyerFilterSchema.parse({});

  const [assets, taxonomy] = await Promise.all([getSellerAssets(user.id), getTaxonomy()]);

  const selectedAsset = filters.forAssetId
    ? assets.find((asset) => asset.id === filters.forAssetId)
    : undefined;

  const { items, total, page, pageCount } = await searchBuyers(filters, {
    asset: selectedAsset
      ? {
          jurisdictionCode: selectedAsset.jurisdictionCode,
          categoryCode: selectedAsset.categoryCode,
          businessType: selectedAsset.businessType,
          askingPriceEur: selectedAsset.askingPriceEur ? Number(selectedAsset.askingPriceEur) : null,
          licenceStatus: selectedAsset.licenceStatus,
          isValidated: selectedAsset.isValidated,
        }
      : null,
  });

  return (
    <div className="container-page py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Demand side</p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-ink-900">
            Buyer directory
          </h1>
          <p className="mt-1 text-[14px] text-ink-500">
            {total} published mandate{total === 1 ? "" : "s"}
            {selectedAsset ? ` · ranked against “${selectedAsset.title}”` : ""}
          </p>
        </div>

        <SortSelect
          basePath="/sell/buyers"
          value={filters.sort}
          options={[
            { value: "recent", label: "Recently updated" },
            ...(selectedAsset ? [{ value: "match", label: "Best fit for this listing" }] : []),
            { value: "ticket_desc", label: "Largest cheque first" },
          ]}
        />
      </header>

      <div className="mt-6">
        <Suspense fallback={<div className="h-16 rounded-card bg-ink-100" />}>
          <AssetPicker
            assets={assets
              .filter((asset) => asset.status !== ASSET_STATUS.SUSPENDED)
              .map((asset) => ({ id: asset.id, title: asset.title, status: asset.status }))}
            selectedId={filters.forAssetId}
          />
        </Suspense>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <Suspense fallback={<div className="h-96 rounded-card bg-ink-100" />}>
          <BuyerFilters
            jurisdictions={taxonomy.jurisdictions}
            categories={taxonomy.categories}
          />
        </Suspense>

        <div>
          {items.length ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((buyer) => (
                  <BuyerCard
                    key={buyer.id}
                    buyer={buyer}
                    canContact
                    contactAssetId={selectedAsset?.id}
                    contactSubject={selectedAsset?.title}
                  />
                ))}
              </div>
              <Pagination
                page={page}
                pageCount={pageCount}
                basePath="/sell/buyers"
                params={toQueryRecord(raw)}
              />
            </>
          ) : (
            <div className="card grid place-items-center px-6 py-20 text-center">
              <p className="text-[16px] font-medium text-ink-900">No buyers match those filters</p>
              <p className="mt-1.5 max-w-[420px] text-[13.5px] text-ink-500">
                Buyers who have unpublished their profile are never shown here, even when they match.
              </p>
              <Link
                href={ROUTES.seller.buyers}
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
