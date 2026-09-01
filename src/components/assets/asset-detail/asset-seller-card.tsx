import { Building2 } from "lucide-react";

import { VerifiedBadge } from "@/components/ui/verified-badge";
import { USER_STATUS } from "@/constants";
import type { AssetDetail } from "@/server/assets/queries";
import { formatDate, formatNumber, humanise } from "@/utils/format";

export function AssetSellerCard({ asset }: { asset: AssetDetail }) {
  const { seller } = asset;
  const profile = seller.sellerProfile;

  return (
    <div className="card p-6">
      <p className="eyebrow">Listed by</p>

      <div className="mt-2 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-navy-900 text-white">
          <Building2 className="h-5 w-5" aria-hidden />
        </span>

        <div>
          <p className="flex items-center gap-1.5 text-[14px] font-semibold text-ink-900">
            {profile?.companyName ?? seller.fullName}
            {profile?.isVerified && <VerifiedBadge title="Verified seller" />}
          </p>
          <p className="mt-0.5 text-[12.5px] text-ink-500">
            {profile ? humanise(profile.sellerType) : "Seller"}
          </p>
        </div>
      </div>

      {profile?.headline && (
        <p className="mt-3 text-[13px] leading-relaxed text-ink-700">{profile.headline}</p>
      )}

      {seller.status !== USER_STATUS.ACTIVE && (
        <p className="mt-3 rounded-md bg-caution-50 px-3 py-2 text-[12.5px] text-caution-700">
          This seller is currently under review by the platform team.
        </p>
      )}

      <p className="mt-4 border-t border-ink-100 pt-3 text-[12px] text-ink-300">
        Listed {formatDate(asset.publishedAt ?? asset.createdAt)} ·{" "}
        {formatNumber(asset.viewCount)} views · {formatNumber(asset._count.favourites)} saved
      </p>
    </div>
  );
}
