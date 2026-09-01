import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";

import { SellerProfileForm } from "@/components/profiles/seller-profile-form";
import { requireSeller } from "@/server/auth/guards";
import { getSellerProfile } from "@/server/buyers/queries";
import { getTaxonomy } from "@/server/assets/queries";

export const metadata: Metadata = { title: "Company profile" };

export default async function SellerProfilePage() {
  const user = await requireSeller();
  const [profile, taxonomy] = await Promise.all([getSellerProfile(user.id), getTaxonomy()]);

  return (
    <div className="container-page max-w-[820px] py-10">
      <p className="eyebrow">Seller profile</p>
      <div className="mt-1 flex items-center gap-2">
        <h1 className="text-[26px] font-semibold tracking-tight text-ink-900">
          {profile ? "Your company" : "Set up your company profile"}
        </h1>
        {profile?.isVerified ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2.5 py-0.5 text-[11.5px] font-medium text-accent-700 ring-1 ring-inset ring-accent-300/60">
            <BadgeCheck className="h-3 w-3" aria-hidden />
            Verified
          </span>
        ) : null}
      </div>
      <p className="mt-2 max-w-[620px] text-[14px] leading-relaxed text-ink-500">
        Buyers in this market check who they are dealing with before they look at the asset. A
        complete profile is the difference between a reply and silence.
      </p>

      <div className="mt-8">
        <SellerProfileForm
          jurisdictions={taxonomy.jurisdictions}
          isNew={!profile}
          defaultValues={
            profile
              ? {
                  companyName: profile.companyName,
                  headline: profile.headline,
                  about: profile.about,
                  websiteUrl: profile.websiteUrl ?? "",
                  country: profile.country,
                  sellerType: profile.sellerType,
                  operatesIn: profile.operatesIn.map((row) => row.jurisdictionCode),
                }
              : {}
          }
        />
      </div>
    </div>
  );
}
