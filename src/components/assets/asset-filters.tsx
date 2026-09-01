"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { flagEmoji, humanise } from "@/utils/format";
import { ROUTES } from "@/routes";
import { paramsToObject } from "@/utils/url";

type Option = { value: string; label: string; count?: number };

type Props = {
  jurisdictions: { code: string; name: string; region: string }[];
  categories: { code: string; name: string }[];
  jurisdictionCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  businessTypes: readonly string[];
  licenceStatuses: readonly string[];
  features: readonly string[];
};

/**
 * Filter state lives in the URL, not in component state. That makes a filtered
 * view shareable and bookmarkable, survives a refresh for free, and lets the
 * server component do the querying — no client-side data fetching at all.
 */
export function AssetFilters(props: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  // Plain functions, not useCallback: nothing below is memoised, so a stable
  // identity would buy nothing and cost a dependency array to keep correct.
  const update = (mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    // Any filter change resets to page 1 — staying on page 4 of a different
    // result set is a classic way to show a user an empty screen.
    next.delete("page");
    startTransition(() => router.replace(ROUTES.assets.list(paramsToObject(next)), { scroll: false }));
  };

  const toggleMulti = (key: string, value: string) =>
    update((next) => {
      const current = (next.get(key) ?? "").split(",").filter(Boolean);
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];

      if (updated.length) next.set(key, updated.join(","));
      else next.delete(key);
    });

  const selected = (key: string) => (params.get(key) ?? "").split(",").filter(Boolean);

  const activeCount =
    selected("jurisdictions").length +
    selected("categories").length +
    selected("businessTypes").length +
    selected("licenceStatuses").length +
    selected("features").length +
    (params.get("priceMin") ? 1 : 0) +
    (params.get("priceMax") ? 1 : 0) +
    (params.get("validatedOnly") === "true" ? 1 : 0);

  const jurisdictionOptions: Option[] = props.jurisdictions
    .filter((j) => props.jurisdictionCounts[j.code] || selected("jurisdictions").includes(j.code))
    .map((j) => ({
      value: j.code,
      label: `${flagEmoji(j.code)} ${j.name}`,
      count: props.jurisdictionCounts[j.code] ?? 0,
    }));

  const categoryOptions: Option[] = props.categories
    .filter((c) => props.categoryCounts[c.code] || selected("categories").includes(c.code))
    .map((c) => ({
      value: c.code,
      label: c.name,
      count: props.categoryCounts[c.code] ?? 0,
    }));

  return (
    <aside className={pending ? "opacity-60 transition-opacity" : "transition-opacity"}>
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-ink-900">Filters</h2>
        {activeCount > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              startTransition(() => {
                const next = new URLSearchParams();
                const q = params.get("q");
                if (q) next.set("q", q);
                router.replace(`/assets?${next.toString()}`, { scroll: false });
              })
            }
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Clear {activeCount}
          </Button>
        ) : null}
      </div>

      <div className="mt-4 space-y-6">
        <Group title="Jurisdiction">
          <CheckList
            options={jurisdictionOptions}
            selected={selected("jurisdictions")}
            onToggle={(value) => toggleMulti("jurisdictions", value)}
          />
        </Group>

        <Group title="Licence type">
          <CheckList
            options={categoryOptions}
            selected={selected("categories")}
            onToggle={(value) => toggleMulti("categories", value)}
          />
        </Group>

        <Group title="Business model">
          <CheckList
            options={props.businessTypes.map((value) => ({ value, label: humanise(value) }))}
            selected={selected("businessTypes")}
            onToggle={(value) => toggleMulti("businessTypes", value)}
          />
        </Group>

        <Group title="Licence status">
          <CheckList
            options={[
              { value: "ACTIVE", label: "Operating" },
              { value: "IN_APPLICATION", label: "In application" },
              { value: "DORMANT", label: "Licence only" },
            ]}
            selected={selected("licenceStatuses")}
            onToggle={(value) => toggleMulti("licenceStatuses", value)}
          />
        </Group>

        <Group title="Included">
          <CheckList
            options={props.features.map((value) => ({ value, label: humanise(value) }))}
            selected={selected("features")}
            onToggle={(value) => toggleMulti("features", value)}
          />
        </Group>

        <Group title="Asking price (EUR)">
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="Min"
              defaultValue={params.get("priceMin") ?? ""}
              className="field tabular"
              onBlur={(event) =>
                update((next) => {
                  const value = event.target.value.trim();
                  if (value) next.set("priceMin", value);
                  else next.delete("priceMin");
                })
              }
            />
            <span className="text-ink-300">–</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="Max"
              defaultValue={params.get("priceMax") ?? ""}
              className="field tabular"
              onBlur={(event) =>
                update((next) => {
                  const value = event.target.value.trim();
                  if (value) next.set("priceMax", value);
                  else next.delete("priceMax");
                })
              }
            />
          </div>

          {/* Listings priced "on request" have no number to compare against.
              They stay in a budget-filtered result unless the buyer says
              otherwise — hiding them would hide the deals worth asking about. */}
          <label className="mt-2.5 flex cursor-pointer items-start gap-2 text-[12.5px] text-ink-500">
            <input
              type="checkbox"
              className="mt-0.5 accent-navy-900"
              checked={params.get("includeOnRequest") !== "false"}
              onChange={(event) =>
                update((next) => {
                  if (event.target.checked) next.delete("includeOnRequest");
                  else next.set("includeOnRequest", "false");
                })
              }
            />
            Include listings priced on request
          </label>
        </Group>

        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-700">
          <input
            type="checkbox"
            className="accent-navy-900"
            checked={params.get("validatedOnly") === "true"}
            onChange={(event) =>
              update((next) => {
                if (event.target.checked) next.set("validatedOnly", "true");
                else next.delete("validatedOnly");
              })
            }
          />
          Validated listings only
        </label>
      </div>
    </aside>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-ink-500">
        {title}
      </h3>
      {children}
    </div>
  );
}

function CheckList({
  options,
  selected,
  onToggle,
}: {
  options: Option[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  if (!options.length) {
    return <p className="text-[12.5px] text-ink-300">Nothing to filter yet.</p>;
  }

  return (
    <ul className="max-h-56 space-y-1 overflow-y-auto pr-1">
      {options.map((option) => (
        <li key={option.value}>
          <label className="flex cursor-pointer items-center justify-between gap-2 rounded px-1 py-0.5 text-[13px] text-ink-700 hover:bg-ink-50">
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-navy-900"
                checked={selected.includes(option.value)}
                onChange={() => onToggle(option.value)}
              />
              {option.label}
            </span>
            {option.count != null ? (
              <span className="tabular text-[11.5px] text-ink-300">{option.count}</span>
            ) : null}
          </label>
        </li>
      ))}
    </ul>
  );
}
