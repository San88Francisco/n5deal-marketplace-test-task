import { BadgeCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function VerifiedBadge({ title = "Verified by N5Deal" }: { title?: string }) {
  return (
    <Badge tone="accent" title={title}>
      <BadgeCheck className="h-3 w-3" aria-hidden />
      Verified
    </Badge>
  );
}
