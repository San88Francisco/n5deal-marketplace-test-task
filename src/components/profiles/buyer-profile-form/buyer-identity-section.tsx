"use client";

import { RHFInput, RHFSelect, RHFTextarea } from "@/components/rhf";
import { INVESTOR_TYPES } from "@/constants";
import type { BuyerProfileInput } from "@/lib/validation";
import { humanise } from "@/utils/format";

export function BuyerIdentitySection() {
  return (
    <section className="card p-6">
      <h2 className="text-[15px] font-semibold text-ink-900">Who you are</h2>
      <p className="mt-1 text-[13px] text-ink-500">
        Sellers see this before they decide whether to engage.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <RHFInput<BuyerProfileInput>
          name="companyName"
          label="Company or fund name"
          placeholder="Nordway Capital"
        />

        <RHFSelect<BuyerProfileInput>
          name="investorType"
          label="Investor type"
          options={INVESTOR_TYPES.map((value) => ({ value, label: humanise(value) }))}
        />

        <RHFInput<BuyerProfileInput>
          name="country"
          label="Country"
          placeholder="SE"
          maxLength={2}
          className="uppercase"
          helperText="Two-letter code, for example SE, DE or AE."
        />

        <RHFInput<BuyerProfileInput>
          name="websiteUrl"
          label="Website (optional)"
          placeholder="https://example.com"
        />
      </div>

      <div className="mt-4 space-y-4">
        <RHFInput<BuyerProfileInput>
          name="headline"
          label="One-line summary"
          placeholder="Acquiring an operating EU e-money institution to launch a SEPA product"
          helperText="This is the line sellers scan in the buyer directory."
        />

        <RHFTextarea<BuyerProfileInput>
          name="about"
          label="About your business"
          rows={4}
          maxLength={4000}
          placeholder="What you do today, why you are acquiring, and what you bring to the target."
        />
      </div>
    </section>
  );
}
