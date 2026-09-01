"use client";

import { RHFInput, RHFSelect, RHFTextarea } from "@/components/rhf";
import { BUSINESS_TYPES } from "@/constants";
import type { AssetInput } from "@/lib/validation";
import type { CategoryOption, JurisdictionOption } from "@/types";
import { humanise } from "@/utils/format";

type AssetBasicsStepProps = {
  jurisdictions: JurisdictionOption[];
  categories: CategoryOption[];
};

export function AssetBasicsStep({ jurisdictions, categories }: AssetBasicsStepProps) {
  return (
    <div className="space-y-4">
      <RHFInput<AssetInput>
        name="title"
        label="Listing title"
        placeholder="Lithuanian EMI with full EEA passporting, trading since 2019"
        helperText="Lead with the jurisdiction and licence, because that is what buyers scan for."
      />

      <RHFTextarea<AssetInput>
        name="summary"
        label="Summary"
        rows={3}
        maxLength={400}
        placeholder="One or two lines that appear on the listing card."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <RHFSelect<AssetInput>
          name="jurisdictionCode"
          label="Jurisdiction"
          placeholder="Select a jurisdiction"
          options={jurisdictions.map((item) => ({
            value: item.code,
            label: `${item.name} (${item.code})`,
          }))}
        />

        <RHFSelect<AssetInput>
          name="categoryCode"
          label="Licence type"
          placeholder="Select a licence type"
          options={categories.map((item) => ({
            value: item.code,
            label: `${item.name} (${item.code})`,
          }))}
        />

        <RHFSelect<AssetInput>
          name="businessType"
          label="Business model"
          options={BUSINESS_TYPES.map((value) => ({ value, label: humanise(value) }))}
        />
      </div>
    </div>
  );
}
