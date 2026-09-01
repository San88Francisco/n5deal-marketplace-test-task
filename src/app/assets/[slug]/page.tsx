import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AssetBadgeRow } from "@/components/assets/asset-detail/asset-badge-row";
import { AssetDescription } from "@/components/assets/asset-detail/asset-description";
import { AssetFacts } from "@/components/assets/asset-detail/asset-facts";
import { AssetFeatures } from "@/components/assets/asset-detail/asset-features";
import { AssetPricingCard } from "@/components/assets/asset-detail/asset-pricing-card";
import { AssetSellerCard } from "@/components/assets/asset-detail/asset-seller-card";
import { ASSET_STATUS, USER_ROLE, USER_STATUS } from "@/constants";
import { toMatchableAsset } from "@/mappers/asset-form";
import { ROUTES } from "@/routes";
import { getAssetBySlug, recordAssetView } from "@/server/assets/queries";
import { getBuyerProfile, toMatchableBuyer } from "@/server/buyers/queries";
import { getCurrentUser } from "@/server/auth/session";
import { prisma } from "@/server/db";
import { scoreMatch } from "@/server/matching/score";

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
  const isManager = user?.role === USER_ROLE.PLATFORM_MANAGER;
  const isBuyer = user?.role === USER_ROLE.BUYER;

  const publiclyVisible =
    asset.status !== ASSET_STATUS.SUSPENDED &&
    asset.status !== ASSET_STATUS.DRAFT &&
    asset.seller.status === USER_STATUS.ACTIVE;

  if (!publiclyVisible && !isOwner && !isManager) notFound();

  const buyerProfile = isBuyer ? await getBuyerProfile(user.id) : null;
  const match = buyerProfile
    ? scoreMatch(toMatchableBuyer(buyerProfile), toMatchableAsset(asset))
    : null;

  const favourited = user
    ? (await prisma.favourite.findUnique({
        where: { userId_assetId: { userId: user.id, assetId: asset.id } },
      })) !== null
    : false;

  if (!isOwner && !isManager) await recordAssetView(asset.id);

  return (
    <div className="container-page py-10">
      <Link href={ROUTES.assets.index} className="text-[13px] text-ink-500 hover:text-ink-900">
        ← All listings
      </Link>

      {!publiclyVisible && (
        <p className="mt-4 rounded-md border border-caution-500/30 bg-caution-50 px-4 py-3 text-[13.5px] text-caution-700">
          {asset.status === ASSET_STATUS.DRAFT
            ? "This listing is a draft. Only you can see it until you publish."
            : "This listing is not visible on the marketplace."}
        </p>
      )}

      <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article>
          <AssetBadgeRow asset={asset} />

          <h1 className="mt-3 text-[30px] font-semibold leading-tight tracking-tight text-ink-900">
            {asset.title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-700">{asset.summary}</p>

          <AssetFacts asset={asset} />
          <AssetFeatures features={asset.features} />
          <AssetDescription asset={asset} />
        </article>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <AssetPricingCard
            asset={asset}
            match={match}
            canContact={isBuyer && asset.seller.status === USER_STATUS.ACTIVE && publiclyVisible}
            canFavourite={isBuyer}
            favourited={favourited}
            isOwner={isOwner}
            isAnonymous={!user}
            showThesisExplainer={Boolean(buyerProfile?.investmentThesis)}
          />

          <AssetSellerCard asset={asset} />
        </aside>
      </div>
    </div>
  );
}
