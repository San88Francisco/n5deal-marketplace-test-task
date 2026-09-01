"use client";

import type { FilterOption } from "@/types";

type FilterCheckListProps = {
  options: FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
  emptyLabel?: string;
};

export function FilterCheckList({
  options,
  selected,
  onToggle,
  emptyLabel = "Nothing to filter yet.",
}: FilterCheckListProps) {
  if (!options.length) return <p className="text-[12.5px] text-ink-300">{emptyLabel}</p>;

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

            {option.count === undefined ? null : (
              <span className="tabular text-[11.5px] text-ink-300">{option.count}</span>
            )}
          </label>
        </li>
      ))}
    </ul>
  );
}
