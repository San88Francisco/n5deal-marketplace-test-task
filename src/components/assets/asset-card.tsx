import Link from "next/link";
import { BadgeCheck, Eye, Heart, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { MatchBadge } from "@/components/ui/match-badge";
import { ASSET_STATUS, FEATURE_LABEL, LICENCE_STATUS, LICENCE_STATUS_LABEL } from "@/constants";
import { flagEmoji, formatMoneyShort, formatNumber, humanise } from "@/utils/format";
import type { AssetListItem } from "@/server/assets/queries";
import { ROUTES } from "@/routes";

/**
 * The listing card mirrors how N5Deal presents an asset: reference number,
 * jurisdiction, licence type and business type up top; price as the anchor;
 * the "included" chips at the bottom. A buyer scanning a grid decides on those
 * six facts, so nothing else competes with them.
 */
export function AssetCard({ asset }: { asset: AssetListItem }) {
  const isSold = asset.status === ASSET_STATUS.SOLD;

  return (
    <article
      className={`card group relative flex flex-col p-5 transition-shadow hover:shadow-lift ${
        isSold ? "opacity-75" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="tabular text-[12px] font-medium text-ink-500">
            #{asset.referenceCode}
          </span>
          <span className="text-ink-200">·</span>
          <span className="text-[12.5px] text-ink-700">
            <span aria-hidden>{flagEmoji(asset.jurisdictionCode)} </span>
            {asset.jurisdiction.name}
          </span>
        </div>

        {asset.isValidated ? (
          <Badge tone="accent" title="Due diligence confirmed by N5Deal">
            <BadgeCheck className="h-3 w-3" aria-hidden />
            Validated
          </Badge>
        ) : null}
      </div>

      <h3 className="mt-3 text-[15.5px] font-semibold leading-snug text-ink-900">
        <Link href={ROUTES.assets.detail(asset.slug)} className="after:absolute after:inset-0">
          {asset.title}
        </Link>
      </h3>

      <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-500">{asset.summary}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone="navy">{asset.category.code}</Badge>
        <Badge tone="outline">{humanise(asset.businessType)}</Badge>
        <Badge tone={asset.licenceStatus === LICENCE_STATUS.ACTIVE ? "positive" : "neutral"}>
          {LICENCE_STATUS_LABEL[asset.licenceStatus]}
        </Badge>
        {isSold ? <Badge tone="neutral">Sold</Badge> : null}
        {asset.status === ASSET_STATUS.UNDER_OFFER ? <Badge tone="caution">Under offer</Badge> : null}
      </div>

      {asset.match ? (
        <div className="mt-3">
          <MatchBadge
            score={asset.match.score}
            title={
              asset.match.reasons.length
                ? `Because: ${asset.match.reasons.join(", ")}`
                : "Scored against your mandate"
            }
          />
        </div>
      ) : null}

      <div className="mt-4 flex items-end justify-between gap-4 border-t border-ink-100 pt-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-ink-500">Asking price</p>
          <p className="tabular mt-0.5 text-[19px] font-semibold text-ink-900">
            {formatMoneyShort(asset.askingPriceEur)}
          </p>
        </div>
        <dl className="tabular grid grid-cols-2 gap-x-4 gap-y-0.5 text-right text-[12px] text-ink-500">
          {asset.licenceIssuedYear ? (
            <>
              <dt className="text-left">Licensed</dt>
              <dd className="font-medium text-ink-700">{asset.licenceIssuedYear}</dd>
            </>
          ) : null}
          {asset.employees != null ? (
            <>
              <dt className="text-left">Staff</dt>
              <dd className="font-medium text-ink-700">{formatNumber(asset.employees)}</dd>
            </>
          ) : null}
        </dl>
      </div>

      {asset.features.length ? (
        <ul className="mt-3 flex flex-wrap gap-1">
          {asset.features.slice(0, 4).map((feature) => (
            <li
              key={feature.code}
              className="rounded border border-ink-100 bg-ink-50 px-1.5 py-0.5 text-[11px] text-ink-500"
            >
              {FEATURE_LABEL[feature.code] ?? humanise(feature.code)}
            </li>
          ))}
          {asset.features.length > 4 ? (
            <li className="px-1 py-0.5 text-[11px] text-ink-300">
              +{asset.features.length - 4}
            </li>
          ) : null}
        </ul>
      ) : null}

      <div className="mt-4 flex items-center gap-4 text-[11.5px] text-ink-300">
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" aria-hidden />
          {formatNumber(asset.viewCount)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Heart className="h-3.5 w-3.5" aria-hidden />
          {formatNumber(asset._count.favourites)}
        </span>
        {asset.activeClients ? (
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" aria-hidden />
            {formatNumber(asset.activeClients)} clients
          </span>
        ) : null}
      </div>
    </article>
  );
}
