import Link from "next/link";

import { ModerationDialog } from "@/components/manage/moderation-dialog";
import { AssetStatusBadge } from "@/components/ui/asset-status-badge";
import { Badge } from "@/components/ui/badge";
import { ASSET_STATUS, MODERATION_ACTION, USER_STATUS } from "@/constants";
import { ROUTES } from "@/routes";
import type { ManagedAssetListItem } from "@/server/moderation/service";
import { flagEmoji, formatDate, formatMoneyShort, humanise } from "@/utils/format";

export function ManagedListingRow({ asset }: { asset: ManagedAssetListItem }) {
  const isSuspended = asset.status === ASSET_STATUS.SUSPENDED;

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
        <p className="text-[13.5px] text-ink-900">
          {asset.seller.sellerProfile?.companyName ?? asset.seller.fullName}
        </p>
        {asset.seller.status !== USER_STATUS.ACTIVE && (
          <Badge tone="caution" className="mt-1">
            Seller {humanise(asset.seller.status).toLowerCase()}
          </Badge>
        )}
      </td>

      <td className="px-5 py-4">
        <div className="flex flex-col items-start gap-1">
          <AssetStatusBadge status={asset.status} />
          {asset.isValidated && <Badge tone="accent">Validated</Badge>}
        </div>
      </td>

      <td className="tabular px-5 py-4 text-[13.5px] text-ink-900">
        {formatMoneyShort(asset.askingPriceEur, "On request")}
      </td>

      <td className="px-5 py-4 text-[13px] text-ink-500">{formatDate(asset.updatedAt)}</td>

      <td className="px-5 py-4">
        <div className="flex justify-end">
          <ModerationDialog
            type={isSuspended ? MODERATION_ACTION.ASSET_REINSTATE : MODERATION_ACTION.ASSET_SUSPEND}
            targetAssetId={asset.id}
            targetName={asset.title}
            triggerLabel={isSuspended ? "Reinstate" : "Suspend"}
          />
        </div>
      </td>
    </tr>
  );
}
