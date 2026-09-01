"use client";

import { RHFInput, RHFMultiSelect, RHFSelect, RHFSwitch } from "@/components/rhf";
import { BUSINESS_TYPES, TIMELINE_OPTION_LABEL, TIMELINES } from "@/constants";
import type { BuyerProfileInput } from "@/lib/validation";
import type { CategoryOption, JurisdictionOption } from "@/types";
import { humanise } from "@/utils/format";

const TICKET_FIELDS = [
  { name: "ticketMinEur", label: "Minimum cheque (EUR)" },
  { name: "ticketMaxEur", label: "Maximum cheque (EUR)" },
] as const;

const PREFERENCE_SWITCHES = [
  {
    name: "wantsOperatingOnly",
    label: "Operating businesses only",
    description: "Exclude dormant licences and applications still in progress.",
  },
  {
    name: "proofOfFundsReady",
    label: "Proof of funds ready",
    description: "Shown to sellers as a signal that you can move quickly.",
  },
] as const;

type BuyerMandateSectionProps = {
  jurisdictions: JurisdictionOption[];
  categories: CategoryOption[];
};

export function BuyerMandateSection({ jurisdictions, categories }: BuyerMandateSectionProps) {
  return (
    <section className="card p-6">
      <h2 className="text-[15px] font-semibold text-ink-900">What you are looking for</h2>
      <p className="mt-1 text-[13px] text-ink-500">
        Every listing is scored against these. The more precise they are, the more useful your
        matches.
      </p>

      <div className="mt-5 space-y-5">
        <RHFMultiSelect<BuyerProfileInput>
          name="targetJurisdictions"
          label="Target jurisdictions"
          searchable
          options={jurisdictions.map((item) => ({
            value: item.code,
            label: `${item.name} (${item.code})`,
          }))}
        />

        <RHFMultiSelect<BuyerProfileInput>
          name="targetCategories"
          label="Licence types"
          options={categories.map((item) => ({
            value: item.code,
            label: `${item.name} (${item.code})`,
          }))}
        />

        <RHFMultiSelect<BuyerProfileInput>
          name="targetBusinessTypes"
          label="Business models"
          helperText="Leave empty if you have no preference. An empty list is not counted against a listing."
          options={BUSINESS_TYPES.map((value) => ({ value, label: humanise(value) }))}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {TICKET_FIELDS.map((field) => (
          <RHFInput<BuyerProfileInput>
            key={field.name}
            name={field.name}
            type="number"
            inputMode="numeric"
            label={field.label}
            className="tabular"
          />
        ))}

        <RHFSelect<BuyerProfileInput>
          name="timeline"
          label="Timeline"
          containerClassName="sm:col-span-2"
          options={TIMELINES.map((value) => ({
            value,
            label: TIMELINE_OPTION_LABEL[value] ?? humanise(value),
          }))}
        />
      </div>

      <div className="mt-6 space-y-4 border-t border-ink-100 pt-5">
        {PREFERENCE_SWITCHES.map((preference) => (
          <RHFSwitch<BuyerProfileInput>
            key={preference.name}
            name={preference.name}
            label={preference.label}
            description={preference.description}
          />
        ))}
      </div>
    </section>
  );
}
