"use client";

import { RHFSwitch, RHFTextarea } from "@/components/rhf";
import type { BuyerProfileInput } from "@/lib/validation";

export function BuyerThesisSection() {
  return (
    <section className="card p-6">
      <h2 className="text-[15px] font-semibold text-ink-900">Investment thesis</h2>
      <p className="mt-1 text-[13px] text-ink-500">
        Free text for the things a filter cannot express: deal-breakers, integration plans, sector
        preferences. This is what the AI summary reads when it explains a match to you.
      </p>

      <div className="mt-5 space-y-5">
        <RHFTextarea<BuyerProfileInput>
          name="investmentThesis"
          rows={5}
          maxLength={4000}
          placeholder="Must be a trading institution with existing safeguarding arrangements. We keep the compliance team. Not interested in shelf companies."
        />

        <RHFSwitch<BuyerProfileInput>
          name="isPublished"
          label="List me in the buyer directory"
          description="Turn this off to stay invisible to sellers while a live process is running. You can still browse and contact sellers yourself."
        />
      </div>
    </section>
  );
}
