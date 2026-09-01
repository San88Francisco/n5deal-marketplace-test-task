import type { Decimal } from "@prisma/client/runtime/library";

import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from "@/constants";

type Money = Decimal | number | string | null | undefined;

const MONEY_UNITS = [
  { threshold: 1_000_000_000, suffix: "B" },
  { threshold: 1_000_000, suffix: "M" },
  { threshold: 1_000, suffix: "K" },
] as const;

const trim = (value: number): string =>
  value >= 100 ? value.toFixed(0) : value.toFixed(1).replace(/\.0$/, "");

export function formatMoneyShort(value: Money, fallback = "Price on request"): string {
  if (value == null) return fallback;

  const amount = Number(value);
  if (!Number.isFinite(amount)) return fallback;

  const unit = MONEY_UNITS.find(({ threshold }) => amount >= threshold);
  return unit ? `€${trim(amount / unit.threshold)}${unit.suffix}` : `€${Math.round(amount)}`;
}

export function formatMoneyFull(value: Money, fallback = "On request"): string {
  if (value == null) return fallback;

  const amount = Number(value);
  if (!Number.isFinite(amount)) return fallback;

  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "currency",
    currency: DEFAULT_CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const formatNumber = (value: number | null | undefined, fallback = "—"): string =>
  value == null ? fallback : new Intl.NumberFormat(DEFAULT_LOCALE).format(value);

export const formatDate = (value: Date | string | null | undefined): string =>
  value
    ? new Intl.DateTimeFormat(DEFAULT_LOCALE, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "—";

const RELATIVE_STEPS = [
  { limit: 60, unit: "m", divisor: 1 },
  { limit: 24 * 60, unit: "h", divisor: 60 },
  { limit: 30 * 24 * 60, unit: "d", divisor: 24 * 60 },
] as const;

export function formatRelative(value: Date | string): string {
  const date = new Date(value);
  const minutes = Math.round((Date.now() - date.getTime()) / 60_000);

  if (minutes < 1) return "just now";

  const step = RELATIVE_STEPS.find(({ limit }) => minutes < limit);
  return step ? `${Math.round(minutes / step.divisor)}${step.unit} ago` : formatDate(date);
}

export const humanise = (value: string): string =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const REGIONAL_INDICATOR_OFFSET = 0x1f1e6 - 65;

export const flagEmoji = (code: string): string =>
  code.length === 2
    ? String.fromCodePoint(
        ...[...code.toUpperCase()].map((char) => char.charCodeAt(0) + REGIONAL_INDICATOR_OFFSET),
      )
    : "";
