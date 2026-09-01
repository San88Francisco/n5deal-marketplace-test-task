"use client";

import { useState, useTransition } from "react";

import { setAssetStatusAction } from "@/server/assets/actions";
import { Select } from "@/components/ui/select";
import { ASSET_STATUS } from "@/constants";

const OPTIONS = [
  { value: ASSET_STATUS.DRAFT, label: "Draft" },
  { value: ASSET_STATUS.PUBLISHED, label: "Published" },
  { value: ASSET_STATUS.UNDER_OFFER, label: "Under offer" },
  { value: ASSET_STATUS.SOLD, label: "Sold" },
  { value: ASSET_STATUS.ARCHIVED, label: "Archived" },
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
