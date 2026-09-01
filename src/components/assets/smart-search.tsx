"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Sparkles, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SMART_SEARCH_NOTICE } from "@/constants";
import { ROUTES } from "@/routes";
import { paramsToObject } from "@/utils/url";

const EXAMPLES = [
  "Operating EMI in the Baltics under 3 million",
  "MiCA-ready crypto licence, ready to move immediately",
  "UK small EMI with a clean regulatory record",
];

export function SmartSearch({ aiEnabled }: { aiEnabled: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [value, setValue] = useState(params.get("q") ?? "");
  const [smart, setSmart] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "info" | "error"; text: string } | null>(null);

  function applyKeyword(query: string) {
    const next = new URLSearchParams(params.toString());
    if (query.trim()) next.set("q", query.trim());
    else next.delete("q");
    next.delete("page");
    startTransition(() =>
      router.replace(ROUTES.assets.list(paramsToObject(next)), { scroll: false }),
    );
  }

  async function applySmart(query: string) {
    setBusy(true);
    setNotice(null);

    try {
      const response = await fetch(ROUTES.api.smartSearch, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();

      if (response.status === 401) {
        setNotice({ tone: "error", text: SMART_SEARCH_NOTICE.expired });
        applyKeyword(query);
        return;
      }

      if (!response.ok || !data.ok) {
        setNotice({
          tone: "error",
          text:
            data.reason === "disabled"
              ? SMART_SEARCH_NOTICE.disabled
              : SMART_SEARCH_NOTICE.unparsable,
        });
        applyKeyword(query);
        return;
      }

      const filters = data.filters as {
        jurisdictions: string[];
        categories: string[];
        businessTypes: string[];
        licenceStatuses: string[];
        priceMin: number | null;
        priceMax: number | null;
        validatedOnly: boolean;
        keywords: string | null;
        interpretation: string;
      };

      const next = new URLSearchParams();
      if (filters.jurisdictions.length) next.set("jurisdictions", filters.jurisdictions.join(","));
      if (filters.categories.length) next.set("categories", filters.categories.join(","));
      if (filters.businessTypes.length) next.set("businessTypes", filters.businessTypes.join(","));
      if (filters.licenceStatuses.length)
        next.set("licenceStatuses", filters.licenceStatuses.join(","));
      if (filters.priceMin != null) next.set("priceMin", String(filters.priceMin));
      if (filters.priceMax != null) next.set("priceMax", String(filters.priceMax));
      if (filters.validatedOnly) next.set("validatedOnly", "true");

      const hasStructuredFilters = Array.from(next.keys()).length > 0;

      if (filters.keywords && !hasStructuredFilters) next.set("q", filters.keywords);

      setNotice({ tone: "info", text: filters.interpretation });
      startTransition(() =>
        router.replace(ROUTES.assets.list(paramsToObject(next)), { scroll: false }),
      );
    } catch {
      setNotice({ tone: "error", text: SMART_SEARCH_NOTICE.failed });
      applyKeyword(query);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (smart) void applySmart(value);
          else applyKeyword(value);
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300">
            {smart ? <Sparkles className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </span>
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={
              smart ? "Describe what you are looking for…" : "Search listings, regulators, keywords"
            }
            className="field h-11 pl-9"
            aria-label={smart ? "Describe what you are looking for" : "Search listings"}
          />
        </div>

        <Button type="submit" size="lg" disabled={busy || pending}>
          {busy ? "Interpreting…" : "Search"}
        </Button>
      </form>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-ink-500">
          <input
            type="checkbox"
            className="accent-accent-600"
            checked={smart}
            onChange={(event) => {
              setSmart(event.target.checked);
              setNotice(null);
            }}
          />
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-accent-600" aria-hidden />
            Ask in plain English
          </span>
          {!aiEnabled && (
            <span className="text-ink-300">(no API key configured — falls back to keywords)</span>
          )}
        </label>

        {smart &&
          EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setValue(example);
                void applySmart(example);
              }}
              className="rounded-full border border-ink-200 px-2.5 py-0.5 text-[12px] text-ink-500 hover:border-navy-600 hover:text-ink-900"
            >
              {example}
            </button>
          ))}
      </div>

      {notice && (
        <p
          className={`mt-3 rounded-md px-3 py-2 text-[13px] ${
            notice.tone === "info"
              ? "border border-accent-300/50 bg-accent-50 text-accent-700"
              : "border border-ink-200 bg-ink-50 text-ink-700"
          }`}
        >
          {notice.tone === "info" && <Sparkles className="mr-1.5 inline h-3.5 w-3.5" aria-hidden />}
          {notice.text}
        </p>
      )}
    </div>
  );
}
