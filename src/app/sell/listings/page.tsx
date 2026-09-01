import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Eye, Heart, MessageSquare, Plus } from "lucide-react";

import { AssetStatusBadge } from "@/components/ui/asset-status-badge";
import { Button } from "@/components/ui/button";
import { ListingStatusMenu } from "@/components/assets/listing-status-menu";
import { flagEmoji, formatDate, formatMoneyShort, formatNumber } from "@/utils/format";
import { requireSeller } from "@/server/auth/guards";
import { getSellerAssets } from "@/server/assets/queries";
import { getSellerProfile } from "@/server/buyers/queries";
import { ROUTES } from "@/routes";
import { ASSET_STATUS } from "@/constants";
import { isLiveAssetStatus } from "@/utils/domain";

export const metadata: Metadata = { title: "My listings" };

export default async function SellerListingsPage() {
  const user = await requireSeller();
  const profile = await getSellerProfile(user.id);

  // A listing without a company behind it is not credible, so the profile comes
  // first rather than being nagged about later.
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

      {assets.length === 0 ? (
        <div className="card mt-8 grid place-items-center px-6 py-20 text-center">
          <p className="text-[16px] font-medium text-ink-900">No listings yet</p>
          <p className="mt-1.5 max-w-[440px] text-[13.5px] text-ink-500">
            Publish your first asset to appear in the marketplace and start matching against buyer
            mandates.
          </p>
          <Button asChild className="mt-4">
            <Link href={ROUTES.seller.newListing}>Create a listing</Link>
          </Button>
        </div>
      ) : (
        <div className="card mt-8 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-ink-100 text-[12px] uppercase tracking-wider text-ink-500">
                <th className="px-5 py-3 font-medium">Listing</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Engagement</th>
                <th className="px-5 py-3 font-medium">Updated</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-5 py-4">
                    <Link
                      href={ROUTES.assets.detail(asset.slug)}
                      className="text-[14px] font-medium text-ink-900 hover:underline"
                    >
                      {asset.title}
                    </Link>
                    <p className="mt-0.5 text-[12.5px] text-ink-500">
                      #{asset.referenceCode} · {flagEmoji(asset.jurisdictionCode)}{" "}
                      {asset.jurisdiction.name} · {asset.category.code}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <AssetStatusBadge status={asset.status} />
                  </td>
                  <td className="tabular px-5 py-4 text-[13.5px] text-ink-900">
                    {formatMoneyShort(asset.askingPriceEur, "On request")}
                  </td>
                  <td className="px-5 py-4">
                    <div className="tabular flex gap-3 text-[12.5px] text-ink-500">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" aria-hidden />
                        {formatNumber(asset.viewCount)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" aria-hidden />
                        {formatNumber(asset._count.favourites)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" aria-hidden />
                        {formatNumber(asset._count.conversations)}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-ink-500">
                    {formatDate(asset.updatedAt)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {asset.status === ASSET_STATUS.SUSPENDED ? (
                        <span className="text-[12.5px] text-critical-500">Under review</span>
                      ) : (
                        <>
                          <Button asChild variant="ghost" size="sm">
                            <Link href={ROUTES.seller.editListing(asset.id)}>Edit</Link>
                          </Button>
                          <Button asChild variant="ghost" size="sm">
                            <Link href={ROUTES.seller.buyersForAsset(asset.id)}>
                              Find buyers
                            </Link>
                          </Button>
                          <ListingStatusMenu assetId={asset.id} status={asset.status} />
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
