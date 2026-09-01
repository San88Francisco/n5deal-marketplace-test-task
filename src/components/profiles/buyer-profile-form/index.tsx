"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { BuyerIdentitySection } from "@/components/profiles/buyer-profile-form/buyer-identity-section";
import { BuyerMandateSection } from "@/components/profiles/buyer-profile-form/buyer-mandate-section";
import { BuyerThesisSection } from "@/components/profiles/buyer-profile-form/buyer-thesis-section";
import { RHFForm } from "@/components/rhf";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { INVESTOR_TYPE, TIMELINE } from "@/constants";
import { buyerProfileSchema, type BuyerProfileInput } from "@/lib/validation";
import { ROUTES } from "@/routes";
import { saveBuyerProfileAction } from "@/server/profiles/actions";
import type { CategoryOption, JurisdictionOption } from "@/types";

const EMPTY_PROFILE: BuyerProfileInput = {
  companyName: "",
  headline: "",
  about: "",
  websiteUrl: "",
  country: "",
  investorType: INVESTOR_TYPE.STRATEGIC,
  ticketMinEur: 0,
  ticketMaxEur: 0,
  timeline: TIMELINE.EXPLORING,
  wantsOperatingOnly: false,
  proofOfFundsReady: false,
  investmentThesis: "",
  isPublished: true,
  targetJurisdictions: [],
  targetCategories: [],
  targetBusinessTypes: [],
};

type BuyerProfileFormProps = {
  jurisdictions: JurisdictionOption[];
  categories: CategoryOption[];
  defaultValues: Partial<BuyerProfileInput>;
  isNew: boolean;
};

export function BuyerProfileForm({
  jurisdictions,
  categories,
  defaultValues,
  isNew,
}: BuyerProfileFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm<BuyerProfileInput>({
    resolver: zodResolver(buyerProfileSchema),
    defaultValues: { ...EMPTY_PROFILE, ...defaultValues },
  });

  const onSubmit = async (values: BuyerProfileInput) => {
    setServerError(null);
    setSaved(false);

    const result = await saveBuyerProfileAction(values);

    if (!result.ok) {
      setServerError(result.error);
      return;
    }

    setSaved(true);

    if (isNew) router.push(ROUTES.assets.index);
    else router.refresh();
  };

  return (
    <RHFForm form={form} onSubmit={onSubmit} className="space-y-8">
      <FormAlert>{serverError}</FormAlert>
      {saved && <FormAlert tone="success">Mandate saved.</FormAlert>}

      <BuyerIdentitySection />
      <BuyerMandateSection jurisdictions={jurisdictions} categories={categories} />
      <BuyerThesisSection />

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Saving…"
            : isNew
              ? "Save and browse listings"
              : "Save changes"}
        </Button>

        {form.formState.isSubmitted && !form.formState.isValid && (
          <span className="text-[13px] text-critical-500">
            Some fields need attention. See the messages above.
          </span>
        )}
      </div>
    </RHFForm>
  );
}
