"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Target } from "lucide-react";

import { Select } from "@/components/ui/select";
import { ASSET_STATUS, ASSET_STATUS_LABEL } from "@/constants";

export function AssetPicker({
  assets,
  selectedId,
}: {
  assets: { id: string; title: string; status: string }[];
  selectedId?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  if (!assets.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-card border border-navy-800 bg-navy-950 px-5 py-4">
      <Target className="h-4 w-4 shrink-0 text-accent-300" aria-hidden />
      <label className="text-[13.5px] text-ink-200" htmlFor="asset-picker">
        Rank buyers for
      </label>
      <Select
        id="asset-picker"
        disabled={pending}
        className="h-9 w-auto max-w-[420px] border-navy-700 bg-navy-900 py-0 text-[13px] text-white"
        value={selectedId ?? ""}
        options={[
          { value: "", label: "All buyers (no ranking)" },
          ...assets.map((asset) => ({
            value: asset.id,
            label:
              asset.status === ASSET_STATUS.PUBLISHED
                ? asset.title
                : `${asset.title} — ${ASSET_STATUS_LABEL[asset.status] ?? asset.status}`,
          })),
        ]}
        onChange={(event) => {
          const next = new URLSearchParams(params.toString());
          const value = event.target.value;

          if (value) {
            next.set("forAssetId", value);
            next.set("sort", "match");
          } else {
            next.delete("forAssetId");
            next.set("sort", "recent");
          }
          next.delete("page");

          startTransition(() => router.replace(`/sell/buyers?${next.toString()}`, { scroll: false }));
        }}
      />
      {selectedId && (
        <span className="text-[12.5px] text-ink-300">
          Scores compare each mandate against this listing&rsquo;s jurisdiction, licence type,
          business model and price.
        </span>
      )}
    </div>
  );
}
