import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AssetForm } from "@/components/assets/asset-form";
import { AssetStatusBadge } from "@/components/ui/asset-status-badge";
import { requireSeller } from "@/server/auth/guards";
import { getTaxonomy } from "@/server/assets/queries";
import { prisma } from "@/server/db";
import { toAssetFormValues } from "@/mappers/asset-form";
import { ROUTES } from "@/routes";
import { ASSET_STATUS } from "@/constants";

export const metadata: Metadata = { title: "Edit listing" };

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSeller();

  const [asset, taxonomy] = await Promise.all([
    prisma.asset.findUnique({ where: { id }, include: { features: true } }),
    getTaxonomy(),
  ]);

  if (!asset || asset.sellerId !== user.id) notFound();

  const isPublished = asset.status !== ASSET_STATUS.DRAFT;

  return (
    <div className="container-page max-w-[860px] py-10">
      <Link href={ROUTES.seller.listings} className="text-[13px] text-ink-500 hover:text-ink-900">
        ← My listings
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-[26px] font-semibold tracking-tight text-ink-900">Edit listing</h1>
        <AssetStatusBadge status={asset.status} />
        <span className="tabular text-[13px] text-ink-500">#{asset.referenceCode}</span>
      </div>

      {asset.status === ASSET_STATUS.SUSPENDED && (
        <p className="mt-4 rounded-md border border-critical-500/25 bg-critical-50 px-4 py-3 text-[13.5px] text-critical-700">
          This listing was suspended by a platform manager and cannot be edited back into
          visibility. Contact the platform team to resolve it.
        </p>
      )}

      <div className="mt-8">
        <AssetForm
          assetId={asset.id}
          isPublished={isPublished}
          jurisdictions={taxonomy.jurisdictions}
          categories={taxonomy.categories}
          defaultValues={toAssetFormValues(asset)}
        />
      </div>
    </div>
  );
}
