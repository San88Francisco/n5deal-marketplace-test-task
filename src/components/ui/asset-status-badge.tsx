import { Badge, type BadgeTone } from "@/components/ui/badge";
import { ASSET_STATUS_LABEL } from "@/constants";
import { humanise } from "@/utils/format";

const TONE_BY_STATUS: Record<string, BadgeTone> = {
  PUBLISHED: "positive",
  UNDER_OFFER: "caution",
  SUSPENDED: "critical",
  DRAFT: "neutral",
  SOLD: "neutral",
  ARCHIVED: "neutral",
};

export function AssetStatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={TONE_BY_STATUS[status] ?? "neutral"}>
      {ASSET_STATUS_LABEL[status] ?? humanise(status)}
    </Badge>
  );
}
