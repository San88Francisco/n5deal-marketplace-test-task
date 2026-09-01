import { BadgeCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function ValidatedBadge() {
  return (
    <Badge tone="accent" title="Due diligence confirmed by N5Deal">
      <BadgeCheck className="h-3 w-3" aria-hidden />
      Validated
    </Badge>
  );
}
