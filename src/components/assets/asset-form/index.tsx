"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AssetBasicsStep } from "@/components/assets/asset-form/asset-basics-step";
import { AssetDetailStep } from "@/components/assets/asset-form/asset-detail-step";
import { AssetLicenceStep } from "@/components/assets/asset-form/asset-licence-step";
import { FormStepper } from "@/components/assets/asset-form/form-stepper";
import { RHFForm } from "@/components/rhf";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { ASSET_FORM_STEPS, BUSINESS_TYPE, LICENCE_STATUS } from "@/constants";
import { assetSchema, type AssetInput } from "@/lib/validation";
import { ROUTES } from "@/routes";
import { saveAssetAction } from "@/server/assets/actions";
import type { CategoryOption, JurisdictionOption } from "@/types";

const EMPTY_ASSET: AssetInput = {
  title: "",
  summary: "",
  description: "",
  jurisdictionCode: "",
  categoryCode: "",
  businessType: BUSINESS_TYPE.PAYMENT,
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
};

type AssetFormProps = {
  jurisdictions: JurisdictionOption[];
  categories: CategoryOption[];
  defaultValues: Partial<AssetInput>;
  assetId?: string;
  isPublished?: boolean;
};

export function AssetForm({
  jurisdictions,
  categories,
  defaultValues,
  assetId,
  isPublished,
}: AssetFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<AssetInput>({
    resolver: zodResolver(assetSchema),
    mode: "onBlur",
    defaultValues: { ...EMPTY_ASSET, ...defaultValues },
  });

  const isLastStep = step === ASSET_FORM_STEPS.length - 1;

  const goNext = async () => {
    const valid = await form.trigger(ASSET_FORM_STEPS[step].fields as never);
    if (valid) setStep((current) => Math.min(current + 1, ASSET_FORM_STEPS.length - 1));
  };

  const save = async (publish: boolean) => {
    setServerError(null);

    if (publish) {
      const valid = await form.trigger();

      if (!valid) {
        const brokenStep = ASSET_FORM_STEPS.findIndex((candidate) =>
          candidate.fields.some((field) => form.getFieldState(field as never).invalid),
        );
        if (brokenStep >= 0) setStep(brokenStep);
        return;
      }
    }

    const result = await saveAssetAction(form.getValues(), { assetId, publish });

    if (result.error) {
      setServerError(result.error);
      return;
    }

    if (result.fieldErrors) {
      setServerError("Some fields are still incomplete, so the draft was not saved.");
      return;
    }

    router.push(ROUTES.seller.listings);
    router.refresh();
  };

  const steps = [
    <AssetBasicsStep key="basics" jurisdictions={jurisdictions} categories={categories} />,
    <AssetLicenceStep key="licence" />,
    <AssetDetailStep key="detail" />,
  ];

  return (
    <RHFForm
      form={form}
      onSubmit={() => save(true)}
      className="space-y-6"
      onKeyDown={(event) => {
        if (event.key === "Enter" && !isLastStep) event.preventDefault();
      }}
    >
      <FormStepper steps={ASSET_FORM_STEPS} current={step} onSelect={setStep} />

      <FormAlert>{serverError}</FormAlert>

      <div className="card p-6">{steps[step]}</div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {step > 0 && (
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {!isLastStep && (
            <Button type="button" onClick={goNext}>
              Continue
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {!isPublished && (
            <Button
              type="button"
              variant="outline"
              onClick={() => save(false)}
              disabled={form.formState.isSubmitting}
            >
              Save as draft
            </Button>
          )}

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
