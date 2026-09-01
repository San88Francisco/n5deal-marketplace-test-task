import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { matchBand } from "@/server/matching/score";

const badgeVariants = cva(
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

export function Badge({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

/** Status of a listing, coloured by what it means for a buyer. */
export function AssetStatusBadge({ status }: { status: string }) {
  const tone =
    status === "PUBLISHED"
      ? "positive"
      : status === "UNDER_OFFER"
        ? "caution"
        : status === "SUSPENDED"
          ? "critical"
          : "neutral";

  const label =
    { DRAFT: "Draft", PUBLISHED: "Published", UNDER_OFFER: "Under offer", SOLD: "Sold", SUSPENDED: "Suspended", ARCHIVED: "Archived" }[
      status
    ] ?? status;

  return <Badge tone={tone as never}>{label}</Badge>;
}

export function UserStatusBadge({ status }: { status: string }) {
  const tone = status === "ACTIVE" ? "positive" : status === "SUSPENDED" ? "caution" : "critical";
  const label = { ACTIVE: "Active", SUSPENDED: "Suspended", REMOVED: "Removed" }[status] ?? status;
  return <Badge tone={tone as never}>{label}</Badge>;
}

/**
 * The match score. Shows the number and the band, never a bare percentage
 * without a hover explanation — an unexplained score is not trustworthy.
 */
export function MatchBadge({ score, title }: { score: number; title?: string }) {
  const band = matchBand(score);
  const tone =
    band === "strong" ? "positive" : band === "good" ? "navy" : band === "partial" ? "caution" : "neutral";
  const label = { strong: "Strong match", good: "Good match", partial: "Partial match", weak: "Weak match" }[band];

  return (
    <Badge tone={tone as never} title={title} className="tabular">
      <span className="font-semibold">{score}</span>
      <span className="opacity-70">·</span>
      <span>{label}</span>
    </Badge>
  );
}
