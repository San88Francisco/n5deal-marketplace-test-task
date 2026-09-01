import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11.5px] font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-ink-100 text-ink-700",
        navy: "bg-navy-900/8 text-navy-900",
        accent: "bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-300/60",
        positive: "bg-positive-50 text-positive-700",
        caution: "bg-caution-50 text-caution-700",
        critical: "bg-critical-50 text-critical-700",
        outline: "border border-ink-200 bg-white text-ink-700",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
