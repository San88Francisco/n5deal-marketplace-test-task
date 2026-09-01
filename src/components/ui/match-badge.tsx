import { Badge, type BadgeTone } from "@/components/ui/badge";
import { MATCH_BAND_LABEL } from "@/constants";
import { matchBand } from "@/server/matching/score";

const TONE_BY_BAND: Record<string, BadgeTone> = {
  strong: "positive",
  good: "navy",
  partial: "caution",
  weak: "neutral",
};

export function MatchBadge({ score, title }: { score: number; title?: string }) {
  const band = matchBand(score);

  return (
    <Badge tone={TONE_BY_BAND[band]} title={title} className="tabular">
      <span className="font-semibold">{score}</span>
      <span className="opacity-70">·</span>
      <span>{MATCH_BAND_LABEL[band]}</span>
    </Badge>
  );
}
