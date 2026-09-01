import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AssetForm } from "@/components/assets/asset-form";
import { requireSeller } from "@/server/auth/guards";
import { getTaxonomy } from "@/server/assets/queries";
import { getSellerProfile } from "@/server/buyers/queries";
import { ROUTES } from "@/routes";

export const metadata: Metadata = { title: "New listing" };

export default async function NewListingPage() {
  const user = await requireSeller();
  const [profile, taxonomy] = await Promise.all([getSellerProfile(user.id), getTaxonomy()]);
  if (!profile) redirect(ROUTES.seller.profile);

  return (
    <div className="container-page max-w-[860px] py-10">
      <p className="eyebrow">New listing</p>
      <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-ink-900">
        Publish an asset
      </h1>
      <p className="mt-2 max-w-[620px] text-[14px] leading-relaxed text-ink-500">
        Three short steps. You can save a draft at any point and come back — nothing is visible to
        buyers until you publish.
      </p>

      <div className="mt-8">
        <AssetForm
          jurisdictions={
            // A seller can only list where they say they operate, unless they
            // listed nowhere — then the full taxonomy is offered.
            profile.operatesIn.length
              ? profile.operatesIn.map((row) => row.jurisdiction)
              : taxonomy.jurisdictions
          }
          categories={taxonomy.categories}
          defaultValues={{}}
        />
      </div>
    </div>
  );
}
