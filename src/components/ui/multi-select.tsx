"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/utils/cn";
import type { SelectOption } from "@/types";

type MultiSelectProps = {
  options: SelectOption[];
  value: string[];
  onChange: (next: string[]) => void;
  columns?: 1 | 2;
  searchable?: boolean;
  emptyLabel?: string;
  invalid?: boolean;
};

export function MultiSelect({
  options,
  value,
  onChange,
  columns = 2,
  searchable = false,
  emptyLabel = "Nothing to choose from",
  invalid,
}: MultiSelectProps) {
  const [query, setQuery] = React.useState("");

  const visible = query
    ? options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const toggle = (candidate: string) =>
    onChange(
      value.includes(candidate)
        ? value.filter((item) => item !== candidate)
        : [...value, candidate],
    );

  return (
    <div
      className={cn("rounded-md border bg-white", invalid ? "border-critical-500" : "border-ink-200")}
    >
      {searchable ? (
        <div className="border-b border-ink-100 p-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter…"
            aria-label="Filter options"
            className="w-full rounded border border-ink-200 px-2 py-1 text-[13px] placeholder:text-ink-300 focus:border-navy-600 focus:outline-none"
          />
        </div>
      ) : null}

      {visible.length ? (
        <ul
          className={cn(
            "max-h-52 overflow-y-auto p-2",
            columns === 2 ? "grid grid-cols-1 gap-x-3 sm:grid-cols-2" : "space-y-0.5",
          )}
        >
          {visible.map((option) => {
            const active = value.includes(option.value);

            return (
              <li key={option.value}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-[13px] hover:bg-ink-50",
                    active ? "text-ink-900" : "text-ink-700",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors",
                      active ? "border-navy-900 bg-navy-900 text-white" : "border-ink-300 bg-white",
                    )}
                  >
                    {active ? <Check className="h-3 w-3" aria-hidden /> : null}
                  </span>

                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={active}
                    onChange={() => toggle(option.value)}
                  />
                  {option.label}
                </label>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="p-3 text-[13px] text-ink-300">{emptyLabel}</p>
      )}

      {value.length ? (
        <p className="border-t border-ink-100 px-3 py-1.5 text-[12px] text-ink-500">
          {value.length} selected
        </p>
      ) : null}
    </div>
  );
}
