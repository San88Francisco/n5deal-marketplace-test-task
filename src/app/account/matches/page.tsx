import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AssetSection } from "@/components/assets/asset-section";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MATCH_SECTIONS } from "@/constants";
import { assetFilterSchema } from "@/lib/validation";
import { ROUTES } from "@/routes";
import { requireBuyer } from "@/server/auth/guards";
import { searchAssets } from "@/server/assets/queries";
import { getBuyerProfile, toMatchableBuyer } from "@/server/buyers/queries";
import { matchBand } from "@/server/matching/score";
import { groupBy } from "@/utils/array";

export const metadata: Metadata = { title: "Matched for you" };

export default async function MatchesPage() {
  const user = await requireBuyer();
  const profile = await getBuyerProfile(user.id);
  if (!profile) redirect(ROUTES.buyer.profile);

  const filters = assetFilterSchema.parse({ sort: "match" });
  const { items } = await searchAssets(filters, { buyer: toMatchableBuyer(profile) });

  const byBand = groupBy(items, (asset) => matchBand(asset.match?.score ?? 0));
  const sections = MATCH_SECTIONS.map((section) => ({
    ...section,
    assets: byBand[section.band] ?? [],
  }));

  const hasMatches = sections.some((section) => section.assets.length > 0);

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{profile.companyName}</p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-ink-900">
            Matched for you
          </h1>
          <p className="mt-1 max-w-[620px] text-[14px] text-ink-500">
            Scored against your mandate: {profile.targetJurisdictions.length} jurisdictions,{" "}
            {profile.targetCategories.length} licence types, cheque size and timeline.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href={ROUTES.buyer.profile}>Adjust mandate</Link>
        </Button>
      </div>

      {hasMatches ? (
        <div className="mt-8 space-y-10">
          {sections.map((section) => (
            <AssetSection
              key={section.band}
              title={section.title}
              hint={section.hint}
              assets={section.assets}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="Nothing matches your mandate yet"
            description="Your mandate may be narrower than the current inventory. Widening the jurisdictions or raising the cheque ceiling is usually the fastest fix."
          >
            <Button asChild variant="outline">
              <Link href={ROUTES.buyer.profile}>Adjust mandate</Link>
            </Button>
            <Button asChild>
              <Link href={ROUTES.assets.index}>Browse everything</Link>
            </Button>
          </EmptyState>
        </div>
      )}
    </div>
  );
}
