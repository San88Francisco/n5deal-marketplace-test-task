"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { ClearFiltersButton } from "@/components/filters/clear-filters-button";
import { FilterCheckList } from "@/components/filters/filter-check-list";
import { FilterGroup } from "@/components/filters/filter-group";
import { FilterSearchInput } from "@/components/filters/filter-search-input";
import { BUSINESS_TYPES, BUYER_SORT, INVESTOR_TYPES, TIMELINE_LABEL, TIMELINES } from "@/constants";
import { ROUTES } from "@/routes";
import type { CategoryOption, FilterGroupConfig, JurisdictionOption } from "@/types";
import { flagEmoji, humanise } from "@/utils/format";

const MULTI_KEYS = [
  "jurisdictions",
  "categories",
  "investorTypes",
  "timelines",
  "businessTypes",
] as const;

type BuyerFiltersProps = {
  jurisdictions: JurisdictionOption[];
  categories: CategoryOption[];
};

export function BuyerFilters({ jurisdictions, categories }: BuyerFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const selected = (key: string) => (params.get(key) ?? "").split(",").filter(Boolean);

  const update = (mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    next.delete("page");
    startTransition(() =>
      router.replace(`${ROUTES.seller.buyers}?${next.toString()}`, { scroll: false }),
    );
  };

  const toggleMulti = (key: string, value: string) =>
    update((next) => {
      const current = selected(key);
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];

      if (updated.length) next.set(key, updated.join(","));
      else next.delete(key);
    });

  const setParam = (key: string, value: string) =>
    update((next) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });

  const clearAll = () =>
    startTransition(() => {
      const next = new URLSearchParams();
      const forAssetId = params.get("forAssetId");

      if (forAssetId) {
        next.set("forAssetId", forAssetId);
        next.set("sort", BUYER_SORT.match);
      }

      router.replace(`${ROUTES.seller.buyers}?${next.toString()}`, { scroll: false });
    });

  const activeCount =
    MULTI_KEYS.reduce((total, key) => total + selected(key).length, 0) +
    (params.get("ticketMin") ? 1 : 0) +
    (params.get("proofOfFundsOnly") === "true" ? 1 : 0);

  const groups: FilterGroupConfig[] = [
    {
      key: "jurisdictions",
      title: "Target jurisdiction",
      options: jurisdictions.map((item) => ({
        value: item.code,
        label: `${flagEmoji(item.code)} ${item.name}`,
      })),
    },
    {
      key: "categories",
      title: "Licence type sought",
      options: categories.map((item) => ({ value: item.code, label: item.name })),
    },
    {
      key: "investorTypes",
      title: "Investor type",
      options: INVESTOR_TYPES.map((value) => ({ value, label: humanise(value) })),
    },
    {
      key: "timelines",
      title: "Timeline",
      options: TIMELINES.map((value) => ({
        value,
        label: TIMELINE_LABEL[value] ?? humanise(value),
      })),
    },
    {
      key: "businessTypes",
      title: "Business model",
      options: BUSINESS_TYPES.map((value) => ({ value, label: humanise(value) })),
    },
  ];

  return (
    <aside className={pending ? "opacity-60 transition-opacity" : "transition-opacity"}>
      <FilterSearchInput
        defaultValue={params.get("q") ?? ""}
        placeholder="Search mandates"
        onCommit={(value) => setParam("q", value)}
      />

      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-ink-900">Filters</h2>
        <ClearFiltersButton count={activeCount} onClear={clearAll} />
      </div>

      <div className="mt-4 space-y-6">
        {groups.map((group) => (
          <FilterGroup key={group.key} title={group.title}>
            <FilterCheckList
              options={group.options}
              selected={selected(group.key)}
              onToggle={(value) => toggleMulti(group.key, value)}
            />
          </FilterGroup>
        ))}

        <FilterGroup title="Can write at least (EUR)">
          <input
            type="number"
            inputMode="numeric"
            placeholder="e.g. 1000000"
            aria-label="Minimum cheque size"
            defaultValue={params.get("ticketMin") ?? ""}
            className="field tabular"
            onBlur={(event) => setParam("ticketMin", event.target.value.trim())}
          />
        </FilterGroup>

        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-700">
          <input
            type="checkbox"
            className="accent-navy-900"
            checked={params.get("proofOfFundsOnly") === "true"}
            onChange={(event) => setParam("proofOfFundsOnly", event.target.checked ? "true" : "")}
          />
          Proof of funds ready only
        </label>
      </div>
    </aside>
  );
}
