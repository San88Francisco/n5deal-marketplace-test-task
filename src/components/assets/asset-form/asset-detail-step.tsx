"use client";

import { RHFInput, RHFMultiSelect, RHFTextarea } from "@/components/rhf";
import { ASSET_COUNT_FIELDS, ASSET_FEATURES, FEATURE_LABEL } from "@/constants";
import type { AssetInput } from "@/lib/validation";
import { humanise } from "@/utils/format";

export function AssetDetailStep() {
  return (
    <div className="space-y-4">
      <RHFTextarea<AssetInput>
        name="description"
        label="Full description"
        rows={10}
        maxLength={20000}
        placeholder="Permissions held, banking relationships, team, supervisory history, what transfers with the entity."
        helperText="Blank lines separate paragraphs."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {ASSET_COUNT_FIELDS.map((field) => (
          <RHFInput<AssetInput>
            key={field.name}
            name={field.name}
            type="number"
            label={field.label}
            className="tabular"
          />
        ))}
      </div>

      <RHFMultiSelect<AssetInput>
        name="features"
        label="Included in the sale"
        options={ASSET_FEATURES.map((value) => ({
          value,
          label: FEATURE_LABEL[value] ?? humanise(value),
        }))}
      />

      <RHFTextarea<AssetInput>
        name="reasonForSale"
        label="Reason for sale"
        rows={3}
        maxLength={2000}
        placeholder="Buyers always ask. Answering it up front saves a round trip."
      />
    </div>
  );
}
