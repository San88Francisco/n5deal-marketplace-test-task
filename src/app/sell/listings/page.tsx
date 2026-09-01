import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { SellerListingRow } from "@/components/sell/seller-listing-row";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ASSET_STATUS, SELLER_LISTING_COLUMNS } from "@/constants";
import { ROUTES } from "@/routes";
import { requireSeller } from "@/server/auth/guards";
import { getSellerAssets } from "@/server/assets/queries";
import { getSellerProfile } from "@/server/buyers/queries";
import { isLiveAssetStatus } from "@/utils/domain";

export const metadata: Metadata = { title: "My listings" };

export default async function SellerListingsPage() {
  const user = await requireSeller();
  const profile = await getSellerProfile(user.id);
  if (!profile) redirect(ROUTES.seller.profile);

  const assets = await getSellerAssets(user.id);
  const live = assets.filter((asset) => isLiveAssetStatus(asset.status));
  const drafts = assets.filter((asset) => asset.status === ASSET_STATUS.DRAFT);

  return (
    <div className="container-page py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{profile.companyName}</p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-ink-900">My listings</h1>
          <p className="mt-1 text-[14px] text-ink-500">
            {live.length} live · {drafts.length} draft{drafts.length === 1 ? "" : "s"} ·{" "}
            {assets.length} total
          </p>
        </div>

        <Button asChild>
          <Link href={ROUTES.seller.newListing}>
            <Plus className="h-4 w-4" aria-hidden />
            New listing
          </Link>
        </Button>
      </header>

      <div className="mt-8">
        {assets.length === 0 ? (
          <EmptyState
            title="No listings yet"
            description="Publish your first asset to appear in the marketplace and start matching against buyer mandates."
          >
            <Button asChild>
              <Link href={ROUTES.seller.newListing}>Create a listing</Link>
            </Button>
          </EmptyState>
        ) : (
          <DataTable columns={SELLER_LISTING_COLUMNS}>
            {assets.map((asset) => (
              <SellerListingRow key={asset.id} asset={asset} />
            ))}
          </DataTable>
        )}
      </div>
    </div>
  );
}
