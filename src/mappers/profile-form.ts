import type { BuyerProfileInput, SellerProfileInput } from "@/lib/validation";
import type { BuyerListItem } from "@/server/buyers/queries";

type SellerProfileRecord = {
  companyName: string;
  headline: string;
  about: string;
  websiteUrl: string | null;
  country: string;
  sellerType: SellerProfileInput["sellerType"];
  operatesIn: { jurisdictionCode: string }[];
};

export const toBuyerFormValues = (
  profile: BuyerListItem | null,
): Partial<BuyerProfileInput> =>
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
    : {};

export const toSellerFormValues = (
  profile: SellerProfileRecord | null,
): Partial<SellerProfileInput> =>
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
    : {};
