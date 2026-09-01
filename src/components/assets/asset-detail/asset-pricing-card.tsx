import Link from "next/link";
import { Heart } from "lucide-react";

import { MatchBreakdown } from "@/components/assets/asset-detail/match-breakdown";
import { MatchExplainer } from "@/components/assets/match-explainer";
import { ContactDialog } from "@/components/messages/contact-dialog";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/routes";
import type { AssetDetail } from "@/server/assets/queries";
import type { MatchResult } from "@/server/matching/score";
import { formatMoneyFull } from "@/utils/format";
import { toggleFavouriteAction } from "@/server/assets/actions";
import { cn } from "@/utils/cn";

type AssetPricingCardProps = {
  asset: AssetDetail;
  match: MatchResult | null;
  canContact: boolean;
  canFavourite: boolean;
  favourited: boolean;
  isOwner: boolean;
  isAnonymous: boolean;
  showThesisExplainer: boolean;
};

export function AssetPricingCard({
  asset,
  match,
  canContact,
  canFavourite,
  favourited,
  isOwner,
  isAnonymous,
  showThesisExplainer,
}: AssetPricingCardProps) {
  const financials = [
    { label: "Revenue (last FY)", value: formatMoneyFull(asset.revenueEur, "Not disclosed") },
    { label: "EBITDA (last FY)", value: formatMoneyFull(asset.ebitdaEur, "Not disclosed") },
  ];

  return (
    <div className="card p-6">
      <p className="text-[11px] uppercase tracking-wider text-ink-500">Asking price</p>
      <p className="tabular mt-1 text-[28px] font-semibold text-ink-900">
        {formatMoneyFull(asset.askingPriceEur)}
      </p>

      <dl className="mt-4 space-y-2 border-t border-ink-100 pt-4">
        {financials.map((row) => (
          <div key={row.label} className="flex justify-between gap-4">
            <dt className="text-[13px] text-ink-500">{row.label}</dt>
            <dd className="tabular text-[13.5px] font-medium text-ink-900">{row.value}</dd>
          </div>
        ))}
      </dl>

      {match && (
        <MatchBreakdown match={match}>
          {showThesisExplainer && <MatchExplainer assetId={asset.id} />}
        </MatchBreakdown>
      )}

      <div className="mt-6 space-y-2">
        {canContact && (
          <ContactDialog
            counterpartyId={asset.sellerId}
            counterpartyName={asset.seller.sellerProfile?.companyName ?? asset.seller.fullName}
            assetId={asset.id}
            subject={asset.title}
            triggerLabel="Contact seller"
          />
        )}

        {canFavourite && (
          <form action={toggleFavouriteAction}>
            <input type="hidden" name="assetId" value={asset.id} />
            <Button type="submit" variant="outline" className="w-full">
              <Heart
                className={cn("h-4 w-4", favourited && "fill-critical-500 text-critical-500")}
                aria-hidden
              />
              {favourited ? "Saved to watchlist" : "Save to watchlist"}
            </Button>
          </form>
        )}

        {isAnonymous && (
          <Button asChild className="w-full">
            <Link href={ROUTES.auth.signUp("BUYER")}>Sign up to contact the seller</Link>
          </Button>
        )}

        {isOwner && (
          <Button asChild variant="outline" className="w-full">
            <Link href={ROUTES.seller.editListing(asset.id)}>Edit listing</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
