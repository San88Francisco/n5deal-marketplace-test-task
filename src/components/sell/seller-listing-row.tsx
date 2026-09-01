import Link from "next/link";
import { Eye, Heart, MessageSquare } from "lucide-react";

import { ListingStatusMenu } from "@/components/assets/listing-status-menu";
import { AssetStatusBadge } from "@/components/ui/asset-status-badge";
import { Button } from "@/components/ui/button";
import { StatList } from "@/components/ui/stat-list";
import { ASSET_STATUS } from "@/constants";
import { ROUTES } from "@/routes";
import type { SellerAssetListItem } from "@/server/assets/queries";
import { flagEmoji, formatDate, formatMoneyShort, formatNumber } from "@/utils/format";

export function SellerListingRow({ asset }: { asset: SellerAssetListItem }) {
  const isSuspended = asset.status === ASSET_STATUS.SUSPENDED;

  const stats = [
    { label: "Views", value: formatNumber(asset.viewCount), icon: <Eye className="h-3.5 w-3.5" aria-hidden /> },
    {
      label: "Saved",
      value: formatNumber(asset._count.favourites),
      icon: <Heart className="h-3.5 w-3.5" aria-hidden />,
    },
    {
      label: "Conversations",
      value: formatNumber(asset._count.conversations),
      icon: <MessageSquare className="h-3.5 w-3.5" aria-hidden />,
    },
  ];

  return (
    <tr className="border-b border-ink-100 last:border-0">
      <td className="px-5 py-4">
        <Link
          href={ROUTES.assets.detail(asset.slug)}
          className="text-[14px] font-medium text-ink-900 hover:underline"
        >
          {asset.title}
        </Link>
        <p className="mt-0.5 text-[12.5px] text-ink-500">
          #{asset.referenceCode} · {flagEmoji(asset.jurisdictionCode)} {asset.jurisdiction.name} ·{" "}
          {asset.category.code}
        </p>
      </td>

      <td className="px-5 py-4">
        <AssetStatusBadge status={asset.status} />
      </td>

      <td className="tabular px-5 py-4 text-[13.5px] text-ink-900">
        {formatMoneyShort(asset.askingPriceEur, "On request")}
      </td>

      <td className="px-5 py-4">
        <StatList stats={stats} />
      </td>

      <td className="px-5 py-4 text-[13px] text-ink-500">{formatDate(asset.updatedAt)}</td>

      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          {isSuspended ? (
            <span className="text-[12.5px] text-critical-500">Under review</span>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href={ROUTES.seller.editListing(asset.id)}>Edit</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href={ROUTES.seller.buyersForAsset(asset.id)}>Find buyers</Link>
              </Button>
              <ListingStatusMenu assetId={asset.id} status={asset.status} />
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
