import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Building2, Heart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { MatchBadge } from "@/components/ui/match-badge";
import { Button } from "@/components/ui/button";
import { ContactDialog } from "@/components/messages/contact-dialog";
import { MatchExplainer } from "@/components/assets/match-explainer";
import { ASSET_STATUS, FEATURE_LABEL, LICENCE_STATUS, LICENCE_STATUS_LABEL, USER_ROLE, USER_STATUS } from "@/constants";
import { flagEmoji, formatDate, formatMoneyFull, formatNumber, humanise } from "@/utils/format";
import { prisma } from "@/server/db";
import { getAssetBySlug, recordAssetView } from "@/server/assets/queries";
import { getBuyerProfile, toMatchableBuyer } from "@/server/buyers/queries";
import { getCurrentUser } from "@/server/auth/session";
import { scoreMatch } from "@/server/matching/score";
import { toggleFavouriteAction } from "@/server/assets/actions";
import { ROUTES } from "@/routes";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const asset = await getAssetBySlug(slug);
  if (!asset) return { title: "Listing not found" };
  return { title: asset.title, description: asset.summary };
}

export default async function AssetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const asset = await getAssetBySlug(slug);
  if (!asset) notFound();

  const user = await getCurrentUser();
  const isOwner = user?.id === asset.sellerId;

  // A suspended listing, or one whose seller is suspended, is invisible to
  // everyone except its owner and a platform manager.
  const publiclyVisible =
    asset.status !== ASSET_STATUS.SUSPENDED && asset.status !== ASSET_STATUS.DRAFT && asset.seller.status === USER_STATUS.ACTIVE;
  if (!publiclyVisible && !isOwner && user?.role !== USER_ROLE.PLATFORM_MANAGER) notFound();

  const buyerProfile = user?.role === USER_ROLE.BUYER ? await getBuyerProfile(user.id) : null;
  const match = buyerProfile
    ? scoreMatch(toMatchableBuyer(buyerProfile), {
        jurisdictionCode: asset.jurisdictionCode,
        categoryCode: asset.categoryCode,
        businessType: asset.businessType,
        askingPriceEur: asset.askingPriceEur ? Number(asset.askingPriceEur) : null,
        licenceStatus: asset.licenceStatus,
        isValidated: asset.isValidated,
      })
    : null;

  const favourited = user
    ? (await prisma.favourite.findUnique({
        where: { userId_assetId: { userId: user.id, assetId: asset.id } },
      })) != null
    : false;

  // Owners and managers looking at their own listing should not inflate its
  // view count.
  if (!isOwner && user?.role !== USER_ROLE.PLATFORM_MANAGER) await recordAssetView(asset.id);

  const facts = [
    { label: "Jurisdiction", value: `${flagEmoji(asset.jurisdictionCode)} ${asset.jurisdiction.name}` },
    { label: "Licence type", value: `${asset.category.name} (${asset.category.code})` },
    { label: "Business model", value: humanise(asset.businessType) },
    { label: "Licence status", value: LICENCE_STATUS_LABEL[asset.licenceStatus] },
    { label: "Regulator", value: asset.regulator ?? "—" },
    { label: "Licence issued", value: asset.licenceIssuedYear?.toString() ?? "—" },
    { label: "Company founded", value: asset.yearEstablished?.toString() ?? "—" },
    { label: "Employees", value: formatNumber(asset.employees) },
    { label: "Active clients", value: formatNumber(asset.activeClients) },
    { label: "EEA passporting", value: asset.hasPassporting ? "Yes" : "No" },
  ];

  const financials = [
    { label: "Asking price", value: formatMoneyFull(asset.askingPriceEur) },
    { label: "Revenue (last FY)", value: formatMoneyFull(asset.revenueEur, "Not disclosed") },
    { label: "EBITDA (last FY)", value: formatMoneyFull(asset.ebitdaEur, "Not disclosed") },
  ];

  return (
    <div className="container-page py-10">
      <Link href={ROUTES.assets.index} className="text-[13px] text-ink-500 hover:text-ink-900">
        ← All listings
      </Link>

      {!publiclyVisible ? (
        <p className="mt-4 rounded-md border border-caution-500/30 bg-caution-50 px-4 py-3 text-[13.5px] text-caution-700">
          {asset.status === ASSET_STATUS.DRAFT
            ? "This listing is a draft. Only you can see it until you publish."
            : "This listing is not visible on the marketplace."}
        </p>
      ) : null}

      <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article>
          <div className="flex flex-wrap items-center gap-2">
            <span className="tabular text-[13px] font-medium text-ink-500">
              #{asset.referenceCode}
            </span>
            <Badge tone="navy">{asset.category.code}</Badge>
            <Badge tone="outline">{humanise(asset.businessType)}</Badge>
            <Badge tone={asset.licenceStatus === LICENCE_STATUS.ACTIVE ? "positive" : "neutral"}>
              {LICENCE_STATUS_LABEL[asset.licenceStatus]}
            </Badge>
            {asset.isValidated ? (
              <Badge tone="accent">
                <BadgeCheck className="h-3 w-3" aria-hidden />
                Validated
              </Badge>
            ) : null}
            {asset.status === ASSET_STATUS.UNDER_OFFER ? <Badge tone="caution">Under offer</Badge> : null}
            {asset.status === ASSET_STATUS.SOLD ? <Badge tone="neutral">Sold</Badge> : null}
          </div>

          <h1 className="mt-3 text-[30px] font-semibold leading-tight tracking-tight text-ink-900">
            {asset.title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-700">{asset.summary}</p>

          <section className="card mt-8 p-6">
            <h2 className="text-[15px] font-semibold text-ink-900">Key facts</h2>
            <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {facts.map((fact) => (
                <div key={fact.label} className="flex justify-between gap-4 border-b border-ink-100 pb-2">
                  <dt className="text-[13px] text-ink-500">{fact.label}</dt>
                  <dd className="tabular text-right text-[13.5px] font-medium text-ink-900">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {asset.features.length ? (
            <section className="card mt-6 p-6">
              <h2 className="text-[15px] font-semibold text-ink-900">Included in the sale</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {asset.features.map((feature) => (
                  <li key={feature.code}>
                    <Badge tone="outline">{FEATURE_LABEL[feature.code] ?? humanise(feature.code)}</Badge>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="card mt-6 p-6">
            <h2 className="text-[15px] font-semibold text-ink-900">About this asset</h2>
            <div className="mt-3 space-y-3 text-[14.5px] leading-relaxed text-ink-700">
              {asset.description.split("\n").filter(Boolean).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {asset.reasonForSale ? (
              <div className="mt-5 rounded-md bg-ink-50 p-4">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-500">
                  Reason for sale
                </p>
                <p className="mt-1 text-[14px] text-ink-700">{asset.reasonForSale}</p>
              </div>
            ) : null}
          </section>
        </article>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <p className="text-[11px] uppercase tracking-wider text-ink-500">Asking price</p>
            <p className="tabular mt-1 text-[28px] font-semibold text-ink-900">
              {formatMoneyFull(asset.askingPriceEur)}
            </p>

            <dl className="mt-4 space-y-2 border-t border-ink-100 pt-4">
              {financials.slice(1).map((row) => (
                <div key={row.label} className="flex justify-between gap-4">
                  <dt className="text-[13px] text-ink-500">{row.label}</dt>
                  <dd className="tabular text-[13.5px] font-medium text-ink-900">{row.value}</dd>
                </div>
              ))}
            </dl>

            {match ? (
              <div className="mt-5 border-t border-ink-100 pt-4">
                <MatchBadge score={match.score} />
                <ul className="mt-3 space-y-1.5">
                  {match.factors.map((factor) => (
                    <li key={factor.code} className="flex items-center justify-between gap-3 text-[12.5px]">
                      <span className="text-ink-500">{factor.label}</span>
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-100">
                          <span
                            className="block h-full rounded-full bg-navy-700"
                            style={{ width: `${(factor.earned / factor.weight) * 100}%` }}
                          />
                        </span>
                        <span className="tabular w-8 text-right text-ink-700">
                          {Math.round((factor.earned / factor.weight) * 100)}%
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>

                {buyerProfile?.investmentThesis ? (
                  <MatchExplainer assetId={asset.id} />
                ) : null}
              </div>
            ) : null}

            <div className="mt-6 space-y-2">
              {user?.role === USER_ROLE.BUYER && asset.seller.status === USER_STATUS.ACTIVE && publiclyVisible ? (
                <ContactDialog
                  counterpartyId={asset.sellerId}
                  counterpartyName={asset.seller.sellerProfile?.companyName ?? asset.seller.fullName}
                  assetId={asset.id}
                  subject={asset.title}
                  triggerLabel="Contact seller"
                />
              ) : null}

              {user?.role === USER_ROLE.BUYER ? (
                <form action={toggleFavouriteAction}>
                  <input type="hidden" name="assetId" value={asset.id} />
                  <Button type="submit" variant="outline" className="w-full">
                    <Heart
                      className={`h-4 w-4 ${favourited ? "fill-critical-500 text-critical-500" : ""}`}
                      aria-hidden
                    />
                    {favourited ? "Saved to watchlist" : "Save to watchlist"}
                  </Button>
                </form>
              ) : null}

              {!user ? (
                <Button asChild className="w-full">
                  <Link href={ROUTES.auth.signUp("BUYER")}>Sign up to contact the seller</Link>
                </Button>
              ) : null}

              {isOwner ? (
                <Button asChild variant="outline" className="w-full">
                  <Link href={ROUTES.seller.editListing(asset.id)}>Edit listing</Link>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="card p-6">
            <p className="eyebrow">Listed by</p>
            <div className="mt-2 flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-navy-900 text-white">
                <Building2 className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="flex items-center gap-1.5 text-[14px] font-semibold text-ink-900">
                  {asset.seller.sellerProfile?.companyName ?? asset.seller.fullName}
                  {asset.seller.sellerProfile?.isVerified ? (
                    <BadgeCheck className="h-4 w-4 text-accent-600" aria-label="Verified seller" />
                  ) : null}
                </p>
                <p className="mt-0.5 text-[12.5px] text-ink-500">
                  {asset.seller.sellerProfile
                    ? humanise(asset.seller.sellerProfile.sellerType)
                    : "Seller"}
                </p>
              </div>
            </div>

            {asset.seller.sellerProfile?.headline ? (
              <p className="mt-3 text-[13px] leading-relaxed text-ink-700">
                {asset.seller.sellerProfile.headline}
              </p>
            ) : null}

            {asset.seller.status !== USER_STATUS.ACTIVE ? (
              <p className="mt-3 rounded-md bg-caution-50 px-3 py-2 text-[12.5px] text-caution-700">
                This seller is currently under review by the platform team.
              </p>
            ) : null}

            <p className="mt-4 border-t border-ink-100 pt-3 text-[12px] text-ink-300">
              Listed {formatDate(asset.publishedAt ?? asset.createdAt)} · {formatNumber(asset.viewCount)} views
              · {formatNumber(asset._count.favourites)} saved
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
