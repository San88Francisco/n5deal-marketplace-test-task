import { LICENCE_STATUS, MATCH_BAND_VALUE } from "@/constants";
import type { LicenceStatus, MatchBand } from "@/types";

export type MatchableBuyer = {
  targetJurisdictions: string[];
  targetCategories: string[];
  targetBusinessTypes: string[];
  ticketMinEur: number;
  ticketMaxEur: number;
  wantsOperatingOnly: boolean;
};

export type MatchableAsset = {
  jurisdictionCode: string;
  categoryCode: string;
  businessType: string;
  askingPriceEur: number | null;
  licenceStatus: LicenceStatus;
  isValidated: boolean;
};

export type MatchFactorCode =
  "jurisdiction" | "category" | "businessType" | "budget" | "operating" | "validated";

export type MatchFactor = {
  code: MatchFactorCode;
  label: string;
  weight: number;
  earned: number;
};

export type MatchResult = {
  score: number;
  factors: MatchFactor[];
  reasons: string[];
  concerns: string[];
};

const WEIGHTS: Record<MatchFactorCode, number> = {
  jurisdiction: 30,
  category: 25,
  businessType: 15,
  budget: 20,
  operating: 5,
  validated: 5,
};

const BUDGET_DRIFT_STEPS = [
  { maxDrift: 0.15, share: 0.7 },
  { maxDrift: 0.4, share: 0.4 },
  { maxDrift: 1, share: 0.15 },
] as const;

const BAND_THRESHOLDS = [
  { min: 80, band: MATCH_BAND_VALUE.strong },
  { min: 60, band: MATCH_BAND_VALUE.good },
  { min: 40, band: MATCH_BAND_VALUE.partial },
] as const;

function scoreBudget(price: number | null, min: number, max: number): number {
  if (price == null) return WEIGHTS.budget * 0.5;
  if (price >= min && price <= max) return WEIGHTS.budget;

  const reference = price > max ? max : min;
  if (reference <= 0) return 0;

  const drift = Math.abs(price - reference) / reference;
  const step = BUDGET_DRIFT_STEPS.find((candidate) => drift <= candidate.maxDrift);

  return step ? WEIGHTS.budget * step.share : 0;
}

export function scoreMatch(buyer: MatchableBuyer, asset: MatchableAsset): MatchResult {
  const jurisdictionHit = buyer.targetJurisdictions.includes(asset.jurisdictionCode);
  const categoryHit = buyer.targetCategories.includes(asset.categoryCode);
  const businessHit = buyer.targetBusinessTypes.includes(asset.businessType);
  const noBusinessPreference = buyer.targetBusinessTypes.length === 0;
  const budgetEarned = scoreBudget(asset.askingPriceEur, buyer.ticketMinEur, buyer.ticketMaxEur);
  const operatingOk = !buyer.wantsOperatingOnly || asset.licenceStatus === LICENCE_STATUS.ACTIVE;

  const factors: MatchFactor[] = [
    {
      code: "jurisdiction",
      label: "Jurisdiction",
      weight: WEIGHTS.jurisdiction,
      earned: jurisdictionHit ? WEIGHTS.jurisdiction : 0,
    },
    {
      code: "category",
      label: "Licence type",
      weight: WEIGHTS.category,
      earned: categoryHit ? WEIGHTS.category : 0,
    },
    {
      code: "businessType",
      label: "Business model",
      weight: WEIGHTS.businessType,
      earned: noBusinessPreference
        ? WEIGHTS.businessType * 0.5
        : businessHit
          ? WEIGHTS.businessType
          : 0,
    },
    { code: "budget", label: "Cheque size", weight: WEIGHTS.budget, earned: budgetEarned },
    {
      code: "operating",
      label: "Operating status",
      weight: WEIGHTS.operating,
      earned: operatingOk ? WEIGHTS.operating : 0,
    },
    {
      code: "validated",
      label: "Due diligence",
      weight: WEIGHTS.validated,
      earned: asset.isValidated ? WEIGHTS.validated : 0,
    },
  ];

  const budgetInsideRange = budgetEarned === WEIGHTS.budget;
  const budgetOutOfRange = budgetEarned === 0;
  const priceOnRequest = asset.askingPriceEur == null;

  const reasons = [
    jurisdictionHit && "Target jurisdiction",
    categoryHit && "Licence type on mandate",
    businessHit && "Business model fits",
    priceOnRequest && "Price on request",
    !priceOnRequest && budgetInsideRange && "Within cheque size",
    asset.isValidated && "Validated by N5Deal",
  ].filter((reason): reason is string => Boolean(reason));

  const concerns = [
    !jurisdictionHit && "Outside the stated target jurisdictions",
    !categoryHit && "Licence type is not on the mandate",
    !priceOnRequest && budgetOutOfRange && "Well outside the stated cheque size",
    !priceOnRequest &&
      !budgetInsideRange &&
      !budgetOutOfRange &&
      "Near the edge of the cheque size",
    buyer.wantsOperatingOnly &&
      !operatingOk &&
      "Buyer wants a trading business, this licence is not active",
  ].filter((concern): concern is string => Boolean(concern));

  const total = factors.reduce((sum, factor) => sum + factor.earned, 0);
  const maximum = factors.reduce((sum, factor) => sum + factor.weight, 0);

  return {
    score: Math.round((total / maximum) * 100),
    factors,
    reasons,
    concerns,
  };
}

export const matchBand = (score: number): MatchBand =>
  BAND_THRESHOLDS.find((threshold) => score >= threshold.min)?.band ?? MATCH_BAND_VALUE.weak;
