"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { ClearFiltersButton } from "@/components/filters/clear-filters-button";
import { FilterCheckList } from "@/components/filters/filter-check-list";
import { FilterGroup } from "@/components/filters/filter-group";
import {
  ASSET_FEATURES,
  BUSINESS_TYPES,
  FEATURE_LABEL,
  LICENCE_STATUS_LABEL,
  LICENCE_STATUSES,
} from "@/constants";
import { ROUTES } from "@/routes";
import type { CategoryOption, FilterGroupConfig, JurisdictionOption } from "@/types";
import { flagEmoji, humanise } from "@/utils/format";
import { paramsToObject } from "@/utils/url";

const MULTI_KEYS = [
  "jurisdictions",
  "categories",
  "businessTypes",
  "licenceStatuses",
  "features",
] as const;

const PRICE_INPUTS = [
  { key: "priceMin", placeholder: "Min" },
  { key: "priceMax", placeholder: "Max" },
] as const;

type AssetFiltersProps = {
  jurisdictions: JurisdictionOption[];
  categories: CategoryOption[];
  jurisdictionCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
};

export function AssetFilters({
  jurisdictions,
  categories,
  jurisdictionCounts,
  categoryCounts,
}: AssetFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const selected = (key: string) => (params.get(key) ?? "").split(",").filter(Boolean);

  const update = (mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    next.delete("page");
    startTransition(() =>
      router.replace(ROUTES.assets.list(paramsToObject(next)), { scroll: false }),
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
      const query = params.get("q");
      if (query) next.set("q", query);
      router.replace(ROUTES.assets.list(paramsToObject(next)), { scroll: false });
    });

  const activeCount =
    MULTI_KEYS.reduce((total, key) => total + selected(key).length, 0) +
    PRICE_INPUTS.filter((input) => params.get(input.key)).length +
    (params.get("validatedOnly") === "true" ? 1 : 0);

  const groups: FilterGroupConfig[] = [
    {
      key: "jurisdictions",
      title: "Jurisdiction",
      options: jurisdictions
        .filter(
          (item) => jurisdictionCounts[item.code] || selected("jurisdictions").includes(item.code),
        )
        .map((item) => ({
          value: item.code,
          label: `${flagEmoji(item.code)} ${item.name}`,
          count: jurisdictionCounts[item.code] ?? 0,
        })),
    },
    {
      key: "categories",
      title: "Licence type",
      options: categories
        .filter((item) => categoryCounts[item.code] || selected("categories").includes(item.code))
        .map((item) => ({
          value: item.code,
          label: item.name,
          count: categoryCounts[item.code] ?? 0,
        })),
    },
    {
      key: "businessTypes",
      title: "Business model",
      options: BUSINESS_TYPES.map((value) => ({ value, label: humanise(value) })),
    },
    {
      key: "licenceStatuses",
      title: "Licence status",
      options: LICENCE_STATUSES.map((value) => ({
        value,
        label: LICENCE_STATUS_LABEL[value] ?? humanise(value),
      })),
    },
    {
      key: "features",
      title: "Included",
      options: ASSET_FEATURES.map((value) => ({
        value,
        label: FEATURE_LABEL[value] ?? humanise(value),
      })),
    },
  ];

  return (
    <aside className={pending ? "opacity-60 transition-opacity" : "transition-opacity"}>
      <div className="flex items-center justify-between">
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

        <FilterGroup title="Asking price (EUR)">
          <div className="flex items-center gap-2">
            {PRICE_INPUTS.map((input, index) => (
              <div key={input.key} className="flex flex-1 items-center gap-2">
                {index > 0 && <span className="text-ink-300">–</span>}
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder={input.placeholder}
                  aria-label={`${input.placeholder} asking price`}
                  defaultValue={params.get(input.key) ?? ""}
                  className="field tabular"
                  onBlur={(event) => setParam(input.key, event.target.value.trim())}
                />
              </div>
            ))}
          </div>

          <label className="mt-2.5 flex cursor-pointer items-start gap-2 text-[12.5px] text-ink-500">
            <input
              type="checkbox"
              className="mt-0.5 accent-navy-900"
              checked={params.get("includeOnRequest") !== "false"}
              onChange={(event) =>
                setParam("includeOnRequest", event.target.checked ? "" : "false")
              }
            />
            Include listings priced on request
          </label>
        </FilterGroup>

        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-700">
          <input
            type="checkbox"
            className="accent-navy-900"
            checked={params.get("validatedOnly") === "true"}
            onChange={(event) => setParam("validatedOnly", event.target.checked ? "true" : "")}
          />
          Validated listings only
        </label>
      </div>
    </aside>
  );
}
