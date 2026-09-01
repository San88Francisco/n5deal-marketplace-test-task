"use client";

import { useState, useTransition } from "react";

import { setAssetStatusAction } from "@/server/assets/actions";
import { Select } from "@/components/ui/form-primitives";

/**
 * The seller-controlled part of a listing's lifecycle. SUSPENDED is absent on
 * purpose — only a platform manager can set or clear it, and a seller must not
 * be able to quietly republish something that was taken down.
 */
const OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "UNDER_OFFER", label: "Under offer" },
  { value: "SOLD", label: "Sold" },
  { value: "ARCHIVED", label: "Archived" },
];

export function ListingStatusMenu({ assetId, status }: { assetId: string; status: string }) {
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();

  return (
    <Select
      aria-label="Listing status"
      options={OPTIONS}
      value={value}
      disabled={pending}
      className="h-8 w-auto py-0 text-[13px]"
      onChange={(event) => {
        const next = event.target.value;
        setValue(next);

        const formData = new FormData();
        formData.set("assetId", assetId);
        formData.set("status", next);
        startTransition(() => void setAssetStatusAction(formData));
      }}
    />
  );
}
