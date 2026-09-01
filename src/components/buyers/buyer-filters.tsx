"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TIMELINE_LABEL } from "@/constants";
import { flagEmoji, humanise } from "@/utils/format";
import { ROUTES } from "@/routes";

type Props = {
  jurisdictions: { code: string; name: string }[];
  categories: { code: string; name: string }[];
  businessTypes: readonly string[];
  investorTypes: readonly string[];
  timelines: readonly string[];
};

/** Same URL-as-state approach as the asset facets — see asset-filters.tsx. */
export function BuyerFilters(props: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  // Plain functions rather than useCallback — see the note in asset-filters.
  const update = (mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    next.delete("page");
    startTransition(() => router.replace(`${ROUTES.seller.buyers}?${next.toString()}`, { scroll: false }));
  };

  const selected = (key: string) => (params.get(key) ?? "").split(",").filter(Boolean);

  const toggle = (key: string, value: string) =>
    update((next) => {
      const current = (next.get(key) ?? "").split(",").filter(Boolean);
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      if (updated.length) next.set(key, updated.join(","));
      else next.delete(key);
    });

  const activeCount =
    selected("jurisdictions").length +
    selected("categories").length +
    selected("businessTypes").length +
    selected("investorTypes").length +
    selected("timelines").length +
    (params.get("ticketMin") ? 1 : 0) +
    (params.get("proofOfFundsOnly") === "true" ? 1 : 0);

  return (
    <aside className={pending ? "opacity-60 transition-opacity" : "transition-opacity"}>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300">
          <Search className="h-4 w-4" />
        </span>
        <input
          defaultValue={params.get("q") ?? ""}
          placeholder="Search mandates"
          aria-label="Search buyer mandates"
          className="field pl-9"
          onBlur={(event) =>
            update((next) => {
              const value = event.target.value.trim();
              if (value) next.set("q", value);
              else next.delete("q");
            })
          }
        />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-ink-900">Filters</h2>
        {activeCount > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              startTransition(() => {
                const next = new URLSearchParams();
                const forAssetId = params.get("forAssetId");
                if (forAssetId) {
                  next.set("forAssetId", forAssetId);
                  next.set("sort", "match");
                }
                router.replace(`${ROUTES.seller.buyers}?${next.toString()}`, { scroll: false });
              })
            }
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Clear {activeCount}
          </Button>
        ) : null}
      </div>

      <div className="mt-4 space-y-6">
        <Group title="Target jurisdiction">
          <CheckList
            options={props.jurisdictions.map((item) => ({
              value: item.code,
              label: `${flagEmoji(item.code)} ${item.name}`,
            }))}
            selected={selected("jurisdictions")}
            onToggle={(value) => toggle("jurisdictions", value)}
          />
        </Group>

        <Group title="Licence type sought">
          <CheckList
            options={props.categories.map((item) => ({ value: item.code, label: item.name }))}
            selected={selected("categories")}
            onToggle={(value) => toggle("categories", value)}
          />
        </Group>

        <Group title="Investor type">
          <CheckList
            options={props.investorTypes.map((value) => ({ value, label: humanise(value) }))}
            selected={selected("investorTypes")}
            onToggle={(value) => toggle("investorTypes", value)}
          />
        </Group>

        <Group title="Timeline">
          <CheckList
            options={props.timelines.map((value) => ({
              value,
              label: TIMELINE_LABEL[value] ?? humanise(value),
            }))}
            selected={selected("timelines")}
            onToggle={(value) => toggle("timelines", value)}
          />
        </Group>

        <Group title="Business model">
          <CheckList
            options={props.businessTypes.map((value) => ({ value, label: humanise(value) }))}
            selected={selected("businessTypes")}
            onToggle={(value) => toggle("businessTypes", value)}
          />
        </Group>

        <Group title="Can write at least (EUR)">
          <input
            type="number"
            inputMode="numeric"
            placeholder="e.g. 1000000"
            defaultValue={params.get("ticketMin") ?? ""}
            className="field tabular"
            onBlur={(event) =>
              update((next) => {
                const value = event.target.value.trim();
                if (value) next.set("ticketMin", value);
                else next.delete("ticketMin");
              })
            }
          />
        </Group>

        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-700">
          <input
            type="checkbox"
            className="accent-navy-900"
            checked={params.get("proofOfFundsOnly") === "true"}
            onChange={(event) =>
              update((next) => {
                if (event.target.checked) next.set("proofOfFundsOnly", "true");
                else next.delete("proofOfFundsOnly");
              })
            }
          />
          Proof of funds ready only
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
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <ul className="max-h-52 space-y-1 overflow-y-auto pr-1">
      {options.map((option) => (
        <li key={option.value}>
          <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-[13px] text-ink-700 hover:bg-ink-50">
            <input
              type="checkbox"
              className="accent-navy-900"
              checked={selected.includes(option.value)}
              onChange={() => onToggle(option.value)}
            />
            {option.label}
          </label>
        </li>
      ))}
    </ul>
  );
}
