"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function SortSelect({
  basePath,
  value,
  options,
}: {
  basePath: string;
  value: string;
  options: { value: string; label: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-[13px] text-ink-500">
      Sort by
      <select
        value={value}
        onChange={(event) => {
          const next = new URLSearchParams(params.toString());
          next.set("sort", event.target.value);
          next.delete("page");
          startTransition(() =>
            router.replace(`${basePath}?${next.toString()}`, { scroll: false }),
          );
        }}
        className="field h-9 w-auto py-0 text-[13px]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
