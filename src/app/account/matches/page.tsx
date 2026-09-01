import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AssetCard } from "@/components/assets/asset-card";
import { Button } from "@/components/ui/button";
import { assetFilterSchema } from "@/lib/validation";
import { requireBuyer } from "@/server/auth/guards";
import { searchAssets } from "@/server/assets/queries";
import { getBuyerProfile, toMatchableBuyer } from "@/server/buyers/queries";
import { matchBand } from "@/server/matching/score";
import { ROUTES } from "@/routes";

export const metadata: Metadata = { title: "Matched for you" };

/**
 * The payoff for filling in a mandate: the whole marketplace, ranked, split into
 * "worth a call" and "worth a look". Weak matches are hidden rather than padded
 * in — a recommendation list that includes everything recommends nothing.
 */
export default async function MatchesPage() {
  const user = await requireBuyer();
  const profile = await getBuyerProfile(user.id);
  if (!profile) redirect(ROUTES.buyer.profile);

  const filters = assetFilterSchema.parse({ sort: "match" });
  const { items } = await searchAssets(filters, { buyer: toMatchableBuyer(profile) });

  const strong = items.filter((asset) => matchBand(asset.match?.score ?? 0) === "strong");
  const good = items.filter((asset) => matchBand(asset.match?.score ?? 0) === "good");
  const partial = items.filter((asset) => matchBand(asset.match?.score ?? 0) === "partial");

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

      {strong.length + good.length + partial.length === 0 ? (
        <div className="card mt-8 grid place-items-center px-6 py-20 text-center">
          <p className="text-[16px] font-medium text-ink-900">Nothing matches your mandate yet</p>
          <p className="mt-1.5 max-w-[440px] text-[13.5px] text-ink-500">
            Your mandate may be narrower than the current inventory. Widening the jurisdictions or
            raising the cheque ceiling is usually the fastest fix.
          </p>
          <div className="mt-4 flex gap-2">
            <Button asChild variant="outline">
              <Link href={ROUTES.buyer.profile}>Adjust mandate</Link>
            </Button>
            <Button asChild>
              <Link href={ROUTES.assets.index}>Browse everything</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          <Section
            title="Strong matches"
            hint="These line up with your mandate on jurisdiction, licence type and budget."
            assets={strong}
          />
          <Section
            title="Worth a look"
            hint="Close, but one axis is off — usually price or business model."
            assets={good}
          />
          <Section
            title="Partial matches"
            hint="Included for completeness. Expect at least one significant mismatch."
            assets={partial}
          />
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  hint,
  assets,
}: {
  title: string;
  hint: string;
  assets: Awaited<ReturnType<typeof searchAssets>>["items"];
}) {
  if (!assets.length) return null;

  return (
    <section>
      <h2 className="text-[18px] font-semibold tracking-tight text-ink-900">
        {title} <span className="tabular text-ink-300">({assets.length})</span>
      </h2>
      <p className="mt-1 text-[13.5px] text-ink-500">{hint}</p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </section>
  );
}
