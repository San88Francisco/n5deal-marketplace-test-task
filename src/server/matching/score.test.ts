import { describe, expect, it } from "vitest";

import { matchBand, scoreMatch, type MatchableAsset, type MatchableBuyer } from "./score";

const buyer: MatchableBuyer = {
  targetJurisdictions: ["LT", "MT"],
  targetCategories: ["EMI", "PI"],
  targetBusinessTypes: ["PAYMENT"],
  ticketMinEur: 500_000,
  ticketMaxEur: 2_000_000,
  wantsOperatingOnly: true,
};

const asset: MatchableAsset = {
  jurisdictionCode: "LT",
  categoryCode: "EMI",
  businessType: "PAYMENT",
  askingPriceEur: 1_400_000,
  licenceStatus: "ACTIVE",
  isValidated: true,
};

describe("scoreMatch", () => {
  it("gives a perfect score when every axis lines up", () => {
    expect(scoreMatch(buyer, asset).score).toBe(100);
  });

  it("collapses when nothing lines up", () => {
    const result = scoreMatch(buyer, {
      jurisdictionCode: "SG",
      categoryCode: "BANK",
      businessType: "GAMING",
      askingPriceEur: 40_000_000,
      licenceStatus: "DORMANT",
      isValidated: false,
    });

    expect(result.score).toBe(0);
    expect(result.concerns.length).toBeGreaterThan(0);
  });

  it("treats a price slightly over the ceiling as a negotiation, not a rejection", () => {
    const slightlyOver = scoreMatch(buyer, { ...asset, askingPriceEur: 2_200_000 });
    const wayOver = scoreMatch(buyer, { ...asset, askingPriceEur: 20_000_000 });

    expect(slightlyOver.score).toBeGreaterThan(wayOver.score);
    expect(slightlyOver.score).toBeGreaterThan(80);
    expect(slightlyOver.concerns).toContain("Near the edge of the cheque size");
  });

  it("scores a price-on-request listing neutrally instead of dropping it", () => {
    const onRequest = scoreMatch(buyer, { ...asset, askingPriceEur: null });
    const inBudget = scoreMatch(buyer, asset);
    const outOfBudget = scoreMatch(buyer, { ...asset, askingPriceEur: 90_000_000 });

    expect(onRequest.score).toBeLessThan(inBudget.score);
    expect(onRequest.score).toBeGreaterThan(outOfBudget.score);
    expect(onRequest.reasons).toContain("Price on request");
  });

  it("does not punish a buyer who stated no business-model preference", () => {
    const noPreference = scoreMatch(
      { ...buyer, targetBusinessTypes: [] },
      { ...asset, businessType: "CRYPTO" },
    );
    const mismatch = scoreMatch(buyer, { ...asset, businessType: "CRYPTO" });

    expect(noPreference.score).toBeGreaterThan(mismatch.score);
  });

  it("penalises a dormant licence only when the buyer asked for a trading business", () => {
    const strict = scoreMatch(buyer, { ...asset, licenceStatus: "DORMANT" });
    const relaxed = scoreMatch(
      { ...buyer, wantsOperatingOnly: false },
      { ...asset, licenceStatus: "DORMANT" },
    );

    expect(strict.score).toBeLessThan(relaxed.score);
    expect(strict.concerns).toContain(
      "Buyer wants a trading business, this licence is not active",
    );
  });

  it("never returns a score outside 0-100", () => {
    const cases: MatchableAsset[] = [
      asset,
      { ...asset, askingPriceEur: 0 },
      { ...asset, askingPriceEur: null, isValidated: false },
      { ...asset, jurisdictionCode: "XX", categoryCode: "XX", businessType: "XX" },
    ];

    cases.forEach((candidate) => {
      const { score } = scoreMatch(buyer, candidate);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  it("survives a buyer whose cheque floor is zero", () => {
    const result = scoreMatch(
      { ...buyer, ticketMinEur: 0, ticketMaxEur: 0 },
      { ...asset, askingPriceEur: 1_000_000 },
    );

    expect(Number.isFinite(result.score)).toBe(true);
  });
});

describe("matchBand", () => {
  it("maps scores onto bands", () => {
    expect(matchBand(95)).toBe("strong");
    expect(matchBand(80)).toBe("strong");
    expect(matchBand(65)).toBe("good");
    expect(matchBand(45)).toBe("partial");
    expect(matchBand(10)).toBe("weak");
  });
});
