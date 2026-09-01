"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { RHFForm, RHFInput, RHFMultiSelect, RHFSelect, RHFTextarea } from "@/components/rhf";
import { humanise } from "@/utils/format";
import { SELLER_TYPES } from "@/constants";
import { sellerProfileSchema, type SellerProfileInput } from "@/lib/validation";
import { saveSellerProfileAction } from "@/server/profiles/actions";
import { ROUTES } from "@/routes";

export function SellerProfileForm({
  jurisdictions,
  defaultValues,
  isNew,
}: {
  jurisdictions: { code: string; name: string }[];
  defaultValues: Partial<SellerProfileInput>;
  isNew: boolean;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm<SellerProfileInput>({
    resolver: zodResolver(sellerProfileSchema),
    defaultValues: {
      companyName: "",
      headline: "",
      about: "",
      websiteUrl: "",
      country: "",
      sellerType: "OWNER",
      operatesIn: [],
      ...defaultValues,
    },
  });

  async function onSubmit(values: SellerProfileInput) {
    setServerError(null);
    setSaved(false);

    const result = await saveSellerProfileAction(values);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }

    setSaved(true);
    if (isNew) router.push(ROUTES.seller.newListing);
    else router.refresh();
  }

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="space-y-8">
      {serverError && (
        <p className="rounded-md border border-critical-500/25 bg-critical-50 px-3 py-2 text-[13px] text-critical-700">
          {serverError}
        </p>
      )}
      {saved && (
        <p className="rounded-md border border-positive-500/25 bg-positive-50 px-3 py-2 text-[13px] text-positive-700">
          Company profile saved.
        </p>
      )}

      <section className="card p-6">
        <h2 className="text-[15px] font-semibold text-ink-900">Your company</h2>
        <p className="mt-1 text-[13px] text-ink-500">
          Buyers see this on every listing you publish.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <RHFInput<SellerProfileInput>
            name="companyName"
            label="Company name"
            placeholder="Baltic Licence Partners"
          />
          <RHFSelect<SellerProfileInput>
            name="sellerType"
            label="You are"
            options={SELLER_TYPES.map((value) => ({ value, label: humanise(value) }))}
          />
          <RHFInput<SellerProfileInput>
            name="country"
            label="Country"
            placeholder="LT"
            maxLength={2}
            className="uppercase"
            helperText="Two-letter code"
          />
          <RHFInput<SellerProfileInput>
            name="websiteUrl"
            label="Website (optional)"
            placeholder="https://example.com"
          />
        </div>

        <div className="mt-4 space-y-4">
          <RHFInput<SellerProfileInput>
            name="headline"
            label="One-line summary"
            placeholder="Owner-side advisory for Baltic EMI and PI disposals"
          />
          <RHFTextarea<SellerProfileInput>
            name="about"
            label="About"
            rows={4}
            maxLength={4000}
            placeholder="Your track record, the kinds of entities you bring to market, and how you handle change-of-control."
          />
          <RHFMultiSelect<SellerProfileInput>
            name="operatesIn"
            label="Jurisdictions you operate in"
            searchable
            options={jurisdictions.map((item) => ({
              value: item.code,
              label: `${item.name} (${item.code})`,
            }))}
          />
        </div>
      </section>

      <p className="rounded-md border border-ink-200 bg-ink-50 px-4 py-3 text-[13px] text-ink-500">
        The <strong className="font-medium text-ink-700">Verified</strong> badge is granted by the
        platform team after KYB review — it is not something you can set yourself.
      </p>

      <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting
          ? "Saving…"
          : isNew
            ? "Save and create your first listing"
            : "Save changes"}
      </Button>
    </RHFForm>
  );
}
