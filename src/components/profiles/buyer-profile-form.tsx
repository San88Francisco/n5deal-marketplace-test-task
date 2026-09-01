"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  RHFForm,
  RHFInput,
  RHFMultiSelect,
  RHFSelect,
  RHFSwitch,
  RHFTextarea,
} from "@/components/rhf";
import { humanise } from "@/utils/format";
import { BUSINESS_TYPES, INVESTOR_TYPES, TIMELINES } from "@/constants";
import { buyerProfileSchema, type BuyerProfileInput } from "@/lib/validation";
import { saveBuyerProfileAction } from "@/server/profiles/actions";
import { ROUTES } from "@/routes";

const TIMELINE_LABELS: Record<string, string> = {
  IMMEDIATE: "Immediate — under 3 months",
  SHORT: "3–6 months",
  MEDIUM: "6–12 months",
  EXPLORING: "Exploring, no fixed horizon",
};

/**
 * The buyer's mandate. This is the single most important form in the product:
 * everything the marketplace ranks, filters and recommends is derived from it,
 * so it asks for structure (jurisdictions, categories, cheque size) rather than
 * a paragraph, and keeps the free text for the part a rules engine cannot use.
 */
export function BuyerProfileForm({
  jurisdictions,
  categories,
  defaultValues,
  isNew,
}: {
  jurisdictions: { code: string; name: string; region: string }[];
  categories: { code: string; name: string }[];
  defaultValues: Partial<BuyerProfileInput>;
  isNew: boolean;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm<BuyerProfileInput>({
    resolver: zodResolver(buyerProfileSchema),
    defaultValues: {
      companyName: "",
      headline: "",
      about: "",
      websiteUrl: "",
      country: "",
      investorType: "STRATEGIC",
      ticketMinEur: 0,
      ticketMaxEur: 0,
      timeline: "EXPLORING",
      wantsOperatingOnly: false,
      proofOfFundsReady: false,
      investmentThesis: "",
      isPublished: true,
      targetJurisdictions: [],
      targetCategories: [],
      targetBusinessTypes: [],
      ...defaultValues,
    },
  });

  async function onSubmit(values: BuyerProfileInput) {
    setServerError(null);
    setSaved(false);

    const result = await saveBuyerProfileAction(values);

    if (!result.ok) {
      setServerError(result.error);
      return;
    }

    setSaved(true);
    // A first-time buyer goes straight to the marketplace, where their new
    // mandate is already scoring listings — that payoff should be immediate.
    if (isNew) router.push(ROUTES.assets.index);
    else router.refresh();
  }

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="space-y-8">
      {serverError ? (
        <p className="rounded-md border border-critical-500/25 bg-critical-50 px-3 py-2 text-[13px] text-critical-700">
          {serverError}
        </p>
      ) : null}
      {saved ? (
        <p className="rounded-md border border-positive-500/25 bg-positive-50 px-3 py-2 text-[13px] text-positive-700">
          Mandate saved.
        </p>
      ) : null}

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
            helperText="Two-letter code, e.g. SE, DE, AE"
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
            helperText="Leave empty if you have no preference — an empty list is not counted against a listing."
            options={BUSINESS_TYPES.map((value) => ({ value, label: humanise(value) }))}
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <RHFInput<BuyerProfileInput>
            name="ticketMinEur"
            type="number"
            inputMode="numeric"
            label="Minimum cheque (EUR)"
            className="tabular"
          />
          <RHFInput<BuyerProfileInput>
            name="ticketMaxEur"
            type="number"
            inputMode="numeric"
            label="Maximum cheque (EUR)"
            className="tabular"
          />
          <RHFSelect<BuyerProfileInput>
            name="timeline"
            label="Timeline"
            containerClassName="sm:col-span-2"
            options={TIMELINES.map((value) => ({ value, label: TIMELINE_LABELS[value] ?? value }))}
          />
        </div>

        <div className="mt-6 space-y-4 border-t border-ink-100 pt-5">
          <RHFSwitch<BuyerProfileInput>
            name="wantsOperatingOnly"
            label="Operating businesses only"
            description="Exclude dormant licences and applications still in progress."
          />
          <RHFSwitch<BuyerProfileInput>
            name="proofOfFundsReady"
            label="Proof of funds ready"
            description="Shown to sellers as a signal that you can move quickly."
          />
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-[15px] font-semibold text-ink-900">Investment thesis</h2>
        <p className="mt-1 text-[13px] text-ink-500">
          Free text for the things a filter cannot express — deal-breakers, integration plans,
          sector preferences. This is what the AI summary reads when it explains a match to you.
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

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : isNew ? "Save and browse listings" : "Save changes"}
        </Button>
        {form.formState.isSubmitted && !form.formState.isValid ? (
          <span className="text-[13px] text-critical-500">
            Some fields need attention — see the messages above.
          </span>
        ) : null}
      </div>
    </RHFForm>
  );
}
