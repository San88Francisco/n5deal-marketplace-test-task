"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";

import { Select } from "@/components/ui/form-primitives";

/**
 * Shared search + dropdown row for the manager tables. Same URL-as-state rule
 * as the public facets, so a manager can paste a filtered view to a colleague.
 */
export function ManageFilters({
  basePath,
  placeholder,
  selects,
}: {
  basePath: string;
  placeholder: string;
  selects: { key: string; label: string; options: { value: string; label: string }[] }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function update(mutate: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    next.delete("page");
    startTransition(() => router.replace(`${basePath}?${next.toString()}`, { scroll: false }));
  }

  return (
    <div
      className={`flex flex-wrap items-end gap-3 ${pending ? "opacity-60" : ""} transition-opacity`}
    >
      <div className="relative min-w-[260px] flex-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300">
          <Search className="h-4 w-4" />
        </span>
        <input
          defaultValue={params.get("q") ?? ""}
          placeholder={placeholder}
          aria-label={placeholder}
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

      {selects.map((select) => (
        <label key={select.key} className="flex flex-col gap-1 text-[12px] text-ink-500">
          {select.label}
          <Select
            options={select.options}
            value={params.get(select.key) ?? ""}
            className="h-10 w-auto min-w-[160px] py-0 text-[13px]"
            onChange={(event) =>
              update((next) => {
                if (event.target.value) next.set(select.key, event.target.value);
                else next.delete(select.key);
              })
            }
          />
        </label>
      ))}
    </div>
  );
}
