import type { Metadata } from "next";
import Link from "next/link";

import { AssetCard } from "@/components/assets/asset-card";
import { Button } from "@/components/ui/button";
import { requireBuyer } from "@/server/auth/guards";
import { prisma } from "@/server/db";
import { getBuyerProfile, toMatchableBuyer } from "@/server/buyers/queries";
import { scoreMatch } from "@/server/matching/score";
import { ROUTES } from "@/routes";

export const metadata: Metadata = { title: "Watchlist" };

export default async function WatchlistPage() {
  const user = await requireBuyer();
  const [profile, favourites] = await Promise.all([
    getBuyerProfile(user.id),
    prisma.favourite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        asset: {
          include: {
            jurisdiction: true,
            category: true,
            features: true,
            seller: { select: { id: true, fullName: true, status: true, sellerProfile: true } },
            _count: { select: { favourites: true } },
          },
        },
      },
    }),
  ]);

  const buyer = profile ? toMatchableBuyer(profile) : null;

  // A saved listing whose seller was suspended is kept but flagged, rather than
  // silently vanishing from a list the buyer curated themselves.
  const items = favourites.map((favourite) => ({
    ...favourite.asset,
    unavailable:
      favourite.asset.seller.status !== "ACTIVE" || favourite.asset.status === "SUSPENDED",
    match: buyer
      ? scoreMatch(buyer, {
          jurisdictionCode: favourite.asset.jurisdictionCode,
          categoryCode: favourite.asset.categoryCode,
          businessType: favourite.asset.businessType,
          askingPriceEur: favourite.asset.askingPriceEur
            ? Number(favourite.asset.askingPriceEur)
            : null,
          licenceStatus: favourite.asset.licenceStatus,
          isValidated: favourite.asset.isValidated,
        })
      : undefined,
  }));

  const available = items.filter((item) => !item.unavailable);
  const unavailable = items.filter((item) => item.unavailable);

  return (
    <div className="container-page py-10">
      <p className="eyebrow">Buyer</p>
      <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-ink-900">Watchlist</h1>
      <p className="mt-1 text-[14px] text-ink-500">
        {items.length} saved listing{items.length === 1 ? "" : "s"}
      </p>

      {items.length === 0 ? (
        <div className="card mt-8 grid place-items-center px-6 py-20 text-center">
          <p className="text-[16px] font-medium text-ink-900">Nothing saved yet</p>
          <p className="mt-1.5 max-w-[420px] text-[13.5px] text-ink-500">
            Save listings while you browse to keep a shortlist you can come back to.
          </p>
          <Button asChild className="mt-4">
            <Link href={ROUTES.assets.index}>Browse listings</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {available.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>

          {unavailable.length ? (
            <section className="mt-12">
              <h2 className="text-[16px] font-semibold text-ink-900">No longer available</h2>
              <p className="mt-1 text-[13.5px] text-ink-500">
                These are kept on your list, but the listing or its seller is currently under review.
              </p>
              <div className="mt-4 grid gap-5 opacity-60 sm:grid-cols-2 xl:grid-cols-3">
                {unavailable.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
