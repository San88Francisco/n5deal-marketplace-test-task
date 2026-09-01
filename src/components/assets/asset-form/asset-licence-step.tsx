"use client";

import { RHFInput, RHFSelect, RHFSwitch } from "@/components/rhf";
import {
  ASSET_MONEY_FIELDS,
  ASSET_YEAR_FIELDS,
  LICENCE_STATUS_LABEL,
  LICENCE_STATUSES,
} from "@/constants";
import type { AssetInput } from "@/lib/validation";
import { humanise } from "@/utils/format";

export function AssetLicenceStep() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <RHFSelect<AssetInput>
          name="licenceStatus"
          label="Licence status"
          options={LICENCE_STATUSES.map((value) => ({
            value,
            label: LICENCE_STATUS_LABEL[value] ?? humanise(value),
          }))}
        />

        <RHFInput<AssetInput> name="regulator" label="Regulator" placeholder="Bank of Lithuania" />

        {ASSET_YEAR_FIELDS.map((field) => (
          <RHFInput<AssetInput>
            key={field.name}
            name={field.name}
            type="number"
            label={field.label}
            className="tabular"
          />
        ))}
      </div>

      <div className="grid gap-4 border-t border-ink-100 pt-4 sm:grid-cols-3">
        {ASSET_MONEY_FIELDS.map((field) => (
          <RHFInput<AssetInput>
            key={field.name}
            name={field.name}
            type="number"
            label={field.label}
            helperText={field.helperText}
            className="tabular"
          />
        ))}
      </div>

      <RHFSwitch<AssetInput>
        name="hasPassporting"
        label="EEA passporting rights"
        description="The licence can be passported into other EEA member states."
      />
    </div>
  );
}
