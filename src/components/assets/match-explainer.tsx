"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

export function MatchExplainer({ assetId }: { assetId: string }) {
  const [state, setState] = useState<
    { status: "idle" } | { status: "loading" } | { status: "done"; text: string } | { status: "error" }
  >({ status: "idle" });

  async function load() {
    setState({ status: "loading" });
    try {
      const response = await fetch("/api/match-explanation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setState({ status: "error" });
        return;
      }
      setState({ status: "done", text: data.explanation });
    } catch {
      setState({ status: "error" });
    }
  }

  if (state.status === "done") {
    return (
      <div className="mt-4 rounded-md border border-accent-300/50 bg-accent-50 p-3.5">
        <p className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-wider text-accent-700">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Against your thesis
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-700">{state.text}</p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <p className="mt-4 text-[12.5px] text-ink-500">
        The written summary is unavailable right now — the score breakdown above still applies.
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={load}
      disabled={state.status === "loading"}
      className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent-700 hover:underline disabled:opacity-60"
    >
      <Sparkles className="h-3.5 w-3.5" aria-hidden />
      {state.status === "loading" ? "Reading your thesis…" : "Explain this against my thesis"}
    </button>
  );
}
