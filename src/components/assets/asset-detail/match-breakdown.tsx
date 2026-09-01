import { MatchBadge } from "@/components/ui/match-badge";
import type { MatchResult } from "@/server/matching/score";

type MatchBreakdownProps = {
  match: MatchResult;
  children?: React.ReactNode;
};

export function MatchBreakdown({ match, children }: MatchBreakdownProps) {
  return (
    <div className="mt-5 border-t border-ink-100 pt-4">
      <MatchBadge score={match.score} />

      <ul className="mt-3 space-y-1.5">
        {match.factors.map((factor) => {
          const share = Math.round((factor.earned / factor.weight) * 100);

          return (
            <li key={factor.code} className="flex items-center justify-between gap-3 text-[12.5px]">
              <span className="text-ink-500">{factor.label}</span>

              <span className="flex items-center gap-2">
                <span className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-100">
                  <span
                    className="block h-full rounded-full bg-navy-700"
                    style={{ width: `${share}%` }}
                  />
                </span>
                <span className="tabular w-8 text-right text-ink-700">{share}%</span>
              </span>
            </li>
          );
        })}
      </ul>

      {children}
    </div>
  );
}
