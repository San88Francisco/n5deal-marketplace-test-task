import type { Decimal } from "@prisma/client/runtime/library";

/**
 * Presentation helpers. Kept out of components so the same listing renders
 * identically in a card, a table and a message header.
 */

type Money = Decimal | number | string | null | undefined;

/** Compact money for cards: "€2.4M", "€620K". N5Deal quotes prices this way. */
export function formatMoneyShort(value: Money, fallback = "Price on request"): string {
  if (value == null) return fallback;
  const amount = Number(value);
  if (!Number.isFinite(amount)) return fallback;

  if (amount >= 1_000_000_000) return `€${trim(amount / 1_000_000_000)}B`;
  if (amount >= 1_000_000) return `€${trim(amount / 1_000_000)}M`;
  if (amount >= 1_000) return `€${trim(amount / 1_000)}K`;
  return `€${Math.round(amount)}`;
}

function trim(value: number): string {
  return value >= 100 ? value.toFixed(0) : value.toFixed(1).replace(/\.0$/, "");
}

/** Full precision, for detail pages and forms. */
export function formatMoneyFull(value: Money, fallback = "On request"): string {
  if (value == null) return fallback;
  const amount = Number(value);
  if (!Number.isFinite(amount)) return fallback;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number | null | undefined, fallback = "—"): string {
  if (value == null) return fallback;
  return new Intl.NumberFormat("en-GB").format(value);
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatRelative(value: Date | string): string {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;

  return formatDate(date);
}

/** SCREAMING_SNAKE enum values are unreadable in a UI. */
export function humanise(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const LICENCE_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Operating",
  IN_APPLICATION: "In application",
  DORMANT: "Licence only",
};

export const ASSET_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  UNDER_OFFER: "Under offer",
  SOLD: "Sold",
  SUSPENDED: "Suspended",
  ARCHIVED: "Archived",
};

export const TIMELINE_LABEL: Record<string, string> = {
  IMMEDIATE: "Immediate (under 3 months)",
  SHORT: "3–6 months",
  MEDIUM: "6–12 months",
  EXPLORING: "Exploring",
};

export const FEATURE_LABEL: Record<string, string> = {
  STAFF: "Staff",
  OFFICE: "Office",
  BANK_ACCOUNTS: "Bank accounts",
  MULTI_CURRENCY: "Multi-currency",
  SOFTWARE_PLATFORM: "Software platform",
  PAYMENT_RAILS: "Payment rails",
  CLIENT_BASE: "Client base",
  SECURITY_AUDIT: "Security audit",
};

/** Regional indicator letters render as a flag on most platforms. Codes that
 *  are not two letters (BVI) fall back to the code itself. */
export function flagEmoji(code: string): string {
  if (code.length !== 2) return "";
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65),
  );
}
