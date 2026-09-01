"use client";

import { Search } from "lucide-react";

import { cn } from "@/utils/cn";

type FilterSearchInputProps = {
  defaultValue?: string;
  placeholder: string;
  onCommit: (value: string) => void;
  className?: string;
};

export function FilterSearchInput({
  defaultValue,
  placeholder,
  onCommit,
  className,
}: FilterSearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300">
        <Search className="h-4 w-4" />
      </span>

      <input
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={placeholder}
        className="field pl-9"
        onBlur={(event) => onCommit(event.target.value.trim())}
      />
    </div>
  );
}
