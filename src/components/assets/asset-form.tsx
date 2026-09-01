"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  RHFForm,
  RHFInput,
  RHFMultiSelect,
  RHFSelect,
  RHFSwitch,
  RHFTextarea,
} from "@/components/rhf";
import { FEATURE_LABEL, LICENCE_STATUS, LICENCE_STATUS_LABEL } from "@/constants";
import { humanise } from "@/utils/format";
import { ASSET_FEATURES, BUSINESS_TYPES, LICENCE_STATUSES } from "@/constants";
import { assetSchema, type AssetInput } from "@/lib/validation";
import { saveAssetAction } from "@/server/assets/actions";
import { cn } from "@/utils/cn";
import { ROUTES } from "@/routes";

/**
 * Three steps rather than one long page. Publishing a regulated asset needs
 * roughly twenty fields; asking for all of them at once is how you get abandoned
 * drafts. Each step validates only its own fields, so a seller cannot be blocked
 * by an error they cannot see yet — and "Save as draft" works from any step.
 */
const STEPS = [
  {
    title: "The asset",
    fields: ["title", "summary", "jurisdictionCode", "categoryCode", "businessType"],
  },
  {
    title: "Licence & financials",
    fields: [
      "licenceStatus",
      "regulator",
      "licenceIssuedYear",
      "yearEstablished",
      "askingPriceEur",
      "revenueEur",
      "ebitdaEur",
    ],
  },
  {
    title: "Detail",
    fields: ["description", "employees", "activeClients", "features", "reasonForSale"],
  },
] as const satisfies readonly { title: string; fields: readonly (keyof AssetInput)[] }[];

export function AssetForm({
  jurisdictions,
  categories,
  defaultValues,
  assetId,
  isPublished,
}: {
  jurisdictions: { code: string; name: string }[];
  categories: { code: string; name: string }[];
  defaultValues: Partial<AssetInput>;
  assetId?: string;
  isPublished?: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<AssetInput>({
    resolver: zodResolver(assetSchema),
    mode: "onBlur",
    defaultValues: {
      title: "",
      summary: "",
      description: "",
      jurisdictionCode: "",
      categoryCode: "",
      businessType: "PAYMENT",
      askingPriceEur: null,
      revenueEur: null,
      ebitdaEur: null,
      licenceStatus: LICENCE_STATUS.ACTIVE,
      regulator: "",
      licenceIssuedYear: null,
      yearEstablished: null,
      employees: null,
      activeClients: null,
      hasPassporting: false,
      reasonForSale: "",
      features: [],
      ...defaultValues,
    },
  });

  async function next() {
    const valid = await form.trigger(STEPS[step].fields as never);
    if (valid) setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  async function save(publish: boolean) {
    setServerError(null);

    // Publishing runs the whole schema; saving a draft only needs whatever the
    // seller has typed so far to be internally consistent.
    if (publish) {
      const valid = await form.trigger();
      if (!valid) {
        const firstBrokenStep = STEPS.findIndex((candidate) =>
          candidate.fields.some((field) => form.getFieldState(field as never).invalid),
        );
        if (firstBrokenStep >= 0) setStep(firstBrokenStep);
        return;
      }
    }

    const result = await saveAssetAction(form.getValues(), { assetId, publish });

    if (result.error) {
      setServerError(result.error);
      return;
    }
    if (result.fieldErrors) {
      setServerError("Some fields are still incomplete — a draft was not saved.");
      return;
    }

    router.push(ROUTES.seller.listings);
    router.refresh();
  }

  return (
    <RHFForm
      form={form}
      onSubmit={() => save(true)}
      className="space-y-6"
      onKeyDown={(event) => {
        // Enter should advance the wizard, not publish from step one.
        if (event.key === "Enter" && step < STEPS.length - 1) event.preventDefault();
      }}
    >
      <ol className="flex items-center gap-2">
        {STEPS.map((item, index) => (
          <li key={item.title} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => setStep(index)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-[13px] transition-colors",
                index === step
                  ? "border-navy-900 bg-navy-900 text-white"
                  : index < step
                    ? "border-ink-200 bg-white text-ink-700"
                    : "border-ink-100 bg-ink-50 text-ink-500",
              )}
            >
              <span
                className={cn(
                  "tabular grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px]",
                  index === step ? "bg-white text-navy-900" : "bg-ink-200 text-ink-700",
                )}
              >
                {index < step ? <Check className="h-3 w-3" aria-hidden /> : index + 1}
              </span>
              {item.title}
            </button>
          </li>
        ))}
      </ol>

      {serverError ? (
        <p className="rounded-md border border-critical-500/25 bg-critical-50 px-3 py-2 text-[13px] text-critical-700">
          {serverError}
        </p>
      ) : null}

      <div className="card p-6">
        {step === 0 ? (
          <div className="space-y-4">
            <RHFInput<AssetInput>
              name="title"
              label="Listing title"
              placeholder="Lithuanian EMI with full EEA passporting, trading since 2019"
              helperText="Lead with the jurisdiction and licence — that is what buyers scan for."
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
                placeholder="Select…"
                options={jurisdictions.map((item) => ({
                  value: item.code,
                  label: `${item.name} (${item.code})`,
                }))}
              />
              <RHFSelect<AssetInput>
                name="categoryCode"
                label="Licence type"
                placeholder="Select…"
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
        ) : null}

        {step === 1 ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <RHFSelect<AssetInput>
                name="licenceStatus"
                label="Licence status"
                options={LICENCE_STATUSES.map((value) => ({
                  value,
                  label: LICENCE_STATUS_LABEL[value] ?? value,
                }))}
              />
              <RHFInput<AssetInput>
                name="regulator"
                label="Regulator"
                placeholder="Bank of Lithuania"
              />
              <RHFInput<AssetInput>
                name="licenceIssuedYear"
                type="number"
                label="Licence issued (year)"
                className="tabular"
              />
              <RHFInput<AssetInput>
                name="yearEstablished"
                type="number"
                label="Company founded (year)"
                className="tabular"
              />
            </div>

            <div className="grid gap-4 border-t border-ink-100 pt-4 sm:grid-cols-3">
              <RHFInput<AssetInput>
                name="askingPriceEur"
                type="number"
                label="Asking price (EUR)"
                className="tabular"
                helperText="Leave empty for “price on request”."
              />
              <RHFInput<AssetInput>
                name="revenueEur"
                type="number"
                label="Revenue, last FY (EUR)"
                className="tabular"
              />
              <RHFInput<AssetInput>
                name="ebitdaEur"
                type="number"
                label="EBITDA, last FY (EUR)"
                className="tabular"
              />
            </div>

            <RHFSwitch<AssetInput>
              name="hasPassporting"
              label="EEA passporting rights"
              description="The licence can be passported into other EEA member states."
            />
          </div>
        ) : null}

        {step === 2 ? (
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
              <RHFInput<AssetInput>
                name="employees"
                type="number"
                label="Employees"
                className="tabular"
              />
              <RHFInput<AssetInput>
                name="activeClients"
                type="number"
                label="Active clients"
                className="tabular"
              />
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
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next}>
              Continue
            </Button>
          ) : null}
        </div>

        <div className="flex gap-2">
          {!isPublished ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => save(false)}
              disabled={form.formState.isSubmitting}
            >
              Save as draft
            </Button>
          ) : null}
          <Button type="submit" variant="accent" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Saving…"
              : isPublished
                ? "Save changes"
                : "Publish listing"}
          </Button>
        </div>
      </div>
    </RHFForm>
  );
}
