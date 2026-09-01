import { Badge } from "@/components/ui/badge";
import { ValidatedBadge } from "@/components/ui/validated-badge";
import { ASSET_STATUS, LICENCE_STATUS, LICENCE_STATUS_LABEL } from "@/constants";
import type { AssetDetail } from "@/server/assets/queries";
import { humanise } from "@/utils/format";

export function AssetBadgeRow({ asset }: { asset: AssetDetail }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="tabular text-[13px] font-medium text-ink-500">#{asset.referenceCode}</span>

      <Badge tone="navy">{asset.category.code}</Badge>
      <Badge tone="outline">{humanise(asset.businessType)}</Badge>
      <Badge tone={asset.licenceStatus === LICENCE_STATUS.ACTIVE ? "positive" : "neutral"}>
        {LICENCE_STATUS_LABEL[asset.licenceStatus]}
      </Badge>

      {asset.isValidated && <ValidatedBadge />}
      {asset.status === ASSET_STATUS.UNDER_OFFER && <Badge tone="caution">Under offer</Badge>}
      {asset.status === ASSET_STATUS.SOLD && <Badge tone="neutral">Sold</Badge>}
    </div>
  );
}
