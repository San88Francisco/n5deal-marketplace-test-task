import type { Metadata } from "next";

import { BuyerProfileForm } from "@/components/profiles/buyer-profile-form";
import { requireBuyer } from "@/server/auth/guards";
import { getBuyerProfile } from "@/server/buyers/queries";
import { getTaxonomy } from "@/server/assets/queries";

export const metadata: Metadata = { title: "My mandate" };

export default async function BuyerProfilePage() {
  const user = await requireBuyer();
  const [profile, taxonomy] = await Promise.all([getBuyerProfile(user.id), getTaxonomy()]);

  return (
    <div className="container-page max-w-[820px] py-10">
      <p className="eyebrow">Buyer profile</p>
      <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-ink-900">
        {profile ? "Your mandate" : "Set up your mandate"}
      </h1>
      <p className="mt-2 max-w-[620px] text-[14px] leading-relaxed text-ink-500">
        {profile
          ? "Keep this current — it drives which listings surface for you and which sellers reach out."
          : "Tell us what you are looking for. Every listing on the marketplace is then scored against it, and sellers can find you in the buyer directory."}
      </p>

      <div className="mt-8">
        <BuyerProfileForm
          jurisdictions={taxonomy.jurisdictions}
          categories={taxonomy.categories}
          isNew={!profile}
          defaultValues={
            profile
              ? {
                  companyName: profile.companyName,
                  headline: profile.headline,
                  about: profile.about,
                  websiteUrl: profile.websiteUrl ?? "",
                  country: profile.country,
                  investorType: profile.investorType,
                  ticketMinEur: Number(profile.ticketMinEur),
                  ticketMaxEur: Number(profile.ticketMaxEur),
                  timeline: profile.timeline,
                  wantsOperatingOnly: profile.wantsOperatingOnly,
                  proofOfFundsReady: profile.proofOfFundsReady,
                  investmentThesis: profile.investmentThesis ?? "",
                  isPublished: profile.isPublished,
                  targetJurisdictions: profile.targetJurisdictions.map((row) => row.jurisdictionCode),
                  targetCategories: profile.targetCategories.map((row) => row.categoryCode),
                  targetBusinessTypes: profile.targetBusinessTypes.map((row) => row.businessType),
                }
              : {}
          }
        />
      </div>
    </div>
  );
}
