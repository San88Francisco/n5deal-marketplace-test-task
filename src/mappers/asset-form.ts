import type { Asset, AssetFeature } from "@prisma/client";

import type { AssetInput } from "@/lib/validation";
import type { MatchableAsset } from "@/server/matching/score";

type AssetWithFeatures = Asset & { features: AssetFeature[] };

export const toAssetFormValues = (asset: AssetWithFeatures): Partial<AssetInput> => ({
  title: asset.title,
  summary: asset.summary,
  description: asset.description,
  jurisdictionCode: asset.jurisdictionCode,
  categoryCode: asset.categoryCode,
  businessType: asset.businessType,
  askingPriceEur: asset.askingPriceEur ? Number(asset.askingPriceEur) : null,
  revenueEur: asset.revenueEur ? Number(asset.revenueEur) : null,
  ebitdaEur: asset.ebitdaEur ? Number(asset.ebitdaEur) : null,
  licenceStatus: asset.licenceStatus,
  regulator: asset.regulator ?? "",
  licenceIssuedYear: asset.licenceIssuedYear,
  yearEstablished: asset.yearEstablished,
  employees: asset.employees,
  activeClients: asset.activeClients,
  hasPassporting: asset.hasPassporting,
  reasonForSale: asset.reasonForSale ?? "",
  features: asset.features.map((feature) => feature.code),
});

export const toMatchableAsset = (asset: {
  jurisdictionCode: string;
  categoryCode: string;
  businessType: MatchableAsset["businessType"];
  askingPriceEur: unknown;
  licenceStatus: MatchableAsset["licenceStatus"];
  isValidated: boolean;
}): MatchableAsset => ({
  jurisdictionCode: asset.jurisdictionCode,
  categoryCode: asset.categoryCode,
  businessType: asset.businessType,
  askingPriceEur: asset.askingPriceEur ? Number(asset.askingPriceEur) : null,
  licenceStatus: asset.licenceStatus,
  isValidated: asset.isValidated,
});
