/**
 * Deterministic match scoring between a buyer mandate and a listing.
 *
 * This is a pure function on purpose. It is the ranking users actually act on,
 * so it must be explainable ("why is this 82%?"), testable, instant and free.
 * The LLM layer sits *on top* of this (see ./ai.ts): it writes prose about a
 * score it did not compute, and it parses language into filters. It never
 * decides the order.
 */

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
  licenceStatus: "ACTIVE" | "IN_APPLICATION" | "DORMANT";
  isValidated: boolean;
};

export type MatchFactor = {
  code: "jurisdiction" | "category" | "businessType" | "budget" | "operating" | "validated";
  label: string;
  weight: number;
  earned: number;
};

export type MatchResult = {
  /** 0-100, rounded. */
  score: number;
  factors: MatchFactor[];
  /** The factors that actually contributed, best first — shown as chips in the UI. */
  reasons: string[];
  /** Hard mismatches worth surfacing rather than hiding. */
  concerns: string[];
};

const WEIGHTS = {
  jurisdiction: 30,
  category: 25,
  businessType: 15,
  budget: 20,
  operating: 5,
  validated: 5,
} as const;

/**
 * Budget scoring is graded rather than binary. A listing 10% over a buyer's
 * ceiling is a negotiation, not a non-match; one at triple the ceiling is noise.
 * A listing with no public price ("on request") scores neutral — absence of a
 * number is not evidence of a bad fit.
 */
function scoreBudget(price: number | null, min: number, max: number): number {
  if (price == null) return WEIGHTS.budget * 0.5;
  if (price >= min && price <= max) return WEIGHTS.budget;

  const reference = price > max ? max : min;
  if (reference <= 0) return 0;

  const drift = Math.abs(price - reference) / reference;
  if (drift <= 0.15) return WEIGHTS.budget * 0.7;
  if (drift <= 0.4) return WEIGHTS.budget * 0.4;
  if (drift <= 1) return WEIGHTS.budget * 0.15;
  return 0;
}

export function scoreMatch(buyer: MatchableBuyer, asset: MatchableAsset): MatchResult {
  const factors: MatchFactor[] = [];
  const reasons: string[] = [];
  const concerns: string[] = [];

  const jurisdictionHit = buyer.targetJurisdictions.includes(asset.jurisdictionCode);
  factors.push({
    code: "jurisdiction",
    label: "Jurisdiction",
    weight: WEIGHTS.jurisdiction,
    earned: jurisdictionHit ? WEIGHTS.jurisdiction : 0,
  });
  if (jurisdictionHit) reasons.push("Target jurisdiction");
  else concerns.push("Outside the stated target jurisdictions");

  const categoryHit = buyer.targetCategories.includes(asset.categoryCode);
  factors.push({
    code: "category",
    label: "Licence type",
    weight: WEIGHTS.category,
    earned: categoryHit ? WEIGHTS.category : 0,
  });
  if (categoryHit) reasons.push("Licence type on mandate");
  else concerns.push("Licence type is not on the mandate");

  // An empty business-type list means "no preference", which should not be
  // punished — treat it as a neutral half score rather than a miss.
  const noBusinessPreference = buyer.targetBusinessTypes.length === 0;
  const businessHit = buyer.targetBusinessTypes.includes(asset.businessType);
  const businessEarned = noBusinessPreference
    ? WEIGHTS.businessType * 0.5
    : businessHit
      ? WEIGHTS.businessType
      : 0;
  factors.push({
    code: "businessType",
    label: "Business model",
    weight: WEIGHTS.businessType,
    earned: businessEarned,
  });
  if (businessHit) reasons.push("Business model fits");

  const budgetEarned = scoreBudget(asset.askingPriceEur, buyer.ticketMinEur, buyer.ticketMaxEur);
  factors.push({
    code: "budget",
    label: "Cheque size",
    weight: WEIGHTS.budget,
    earned: budgetEarned,
  });
  if (asset.askingPriceEur == null) {
    reasons.push("Price on request");
  } else if (budgetEarned === WEIGHTS.budget) {
    reasons.push("Within cheque size");
  } else if (budgetEarned === 0) {
    concerns.push("Well outside the stated cheque size");
  } else {
    concerns.push("Near the edge of the cheque size");
  }

  const operatingOk = !buyer.wantsOperatingOnly || asset.licenceStatus === "ACTIVE";
  factors.push({
    code: "operating",
    label: "Operating status",
    weight: WEIGHTS.operating,
    earned: operatingOk ? WEIGHTS.operating : 0,
  });
  if (buyer.wantsOperatingOnly && !operatingOk) {
    concerns.push("Buyer wants a trading business, this licence is not active");
  }

  factors.push({
    code: "validated",
    label: "Due diligence",
    weight: WEIGHTS.validated,
    earned: asset.isValidated ? WEIGHTS.validated : 0,
  });
  if (asset.isValidated) reasons.push("Validated by N5Deal");

  const total = factors.reduce((sum, factor) => sum + factor.earned, 0);
  const maximum = factors.reduce((sum, factor) => sum + factor.weight, 0);

  return {
    score: Math.round((total / maximum) * 100),
    factors,
    reasons,
    concerns,
  };
}

/** Coarse band used for the badge colour and for copy like "Strong match". */
export function matchBand(score: number): "strong" | "good" | "partial" | "weak" {
  if (score >= 80) return "strong";
  if (score >= 60) return "good";
  if (score >= 40) return "partial";
  return "weak";
}
