"use client";

import { Check } from "lucide-react";

import { cn } from "@/utils/cn";

type FormStepperProps = {
  steps: readonly { title: string }[];
  current: number;
  onSelect: (index: number) => void;
};

export function FormStepper({ steps, current, onSelect }: FormStepperProps) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((step, index) => (
        <li key={step.title} className="flex flex-1 items-center gap-2">
          <button
            type="button"
            onClick={() => onSelect(index)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-[13px] transition-colors",
              index === current
                ? "border-navy-900 bg-navy-900 text-white"
                : index < current
                  ? "border-ink-200 bg-white text-ink-700"
                  : "border-ink-100 bg-ink-50 text-ink-500",
            )}
          >
            <span
              className={cn(
                "tabular grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px]",
                index === current ? "bg-white text-navy-900" : "bg-ink-200 text-ink-700",
              )}
            >
              {index < current ? <Check className="h-3 w-3" aria-hidden /> : index + 1}
            </span>
            {step.title}
          </button>
        </li>
      ))}
    </ol>
  );
}
