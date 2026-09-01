import type { Metadata } from "next";

import { ManagedListingRow } from "@/components/manage/managed-listing-row";
import { ManageFilters } from "@/components/manage/manage-filters";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { MANAGED_LISTING_COLUMNS, MANAGED_LISTING_FILTER_SELECTS } from "@/constants";
import { managedAssetFilterSchema } from "@/lib/validation";
import { ROUTES } from "@/routes";
import { requireManager } from "@/server/auth/guards";
import { searchAllAssets } from "@/server/moderation/service";
import type { SearchParams } from "@/types";
import { toQueryRecord } from "@/utils/url";

export const metadata: Metadata = { title: "Listings" };

export default async function ManageListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireManager();
  const raw = await searchParams;
  const parsed = managedAssetFilterSchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : managedAssetFilterSchema.parse({});

  const { items, total, page, pageCount } = await searchAllAssets(filters);

  return (
    <div className="container-page py-10">
      <p className="eyebrow">Platform manager</p>
      <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-ink-900">Listings</h1>
      <p className="mt-1 text-[14px] text-ink-500">
        {total} listing{total === 1 ? "" : "s"} in every state, including drafts and archived
      </p>

      <div className="mt-6">
        <ManageFilters
          basePath={ROUTES.manage.listings()}
          placeholder="Search by title, summary or seller"
          selects={MANAGED_LISTING_FILTER_SELECTS}
        />
      </div>

      <div className="mt-6">
        <DataTable
          columns={MANAGED_LISTING_COLUMNS}
          minWidth="900px"
          isEmpty={items.length === 0}
          emptyLabel="No listings match those filters."
        >
          {items.map((asset) => (
            <ManagedListingRow key={asset.id} asset={asset} />
          ))}
        </DataTable>
      </div>

      <Pagination
        page={page}
        pageCount={pageCount}
        basePath={ROUTES.manage.listings()}
        params={toQueryRecord(raw)}
      />
    </div>
  );
}
