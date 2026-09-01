import { Badge, type BadgeTone } from "@/components/ui/badge";
import { USER_STATUS_LABEL } from "@/constants";
import { humanise } from "@/utils/format";

const TONE_BY_STATUS: Record<string, BadgeTone> = {
  ACTIVE: "positive",
  SUSPENDED: "caution",
  REMOVED: "critical",
};

export function UserStatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={TONE_BY_STATUS[status] ?? "neutral"}>
      {USER_STATUS_LABEL[status] ?? humanise(status)}
    </Badge>
  );
}
