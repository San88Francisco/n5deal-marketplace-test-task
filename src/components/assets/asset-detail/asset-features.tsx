import { Badge } from "@/components/ui/badge";
import { FEATURE_LABEL } from "@/constants";
import type { AssetDetail } from "@/server/assets/queries";
import { humanise } from "@/utils/format";

export function AssetFeatures({ features }: { features: AssetDetail["features"] }) {
  if (features.length === 0) return null;

  return (
    <section className="card mt-6 p-6">
      <h2 className="text-[15px] font-semibold text-ink-900">Included in the sale</h2>

      <ul className="mt-3 flex flex-wrap gap-2">
        {features.map((feature) => (
          <li key={feature.code}>
            <Badge tone="outline">{FEATURE_LABEL[feature.code] ?? humanise(feature.code)}</Badge>
          </li>
        ))}
      </ul>
    </section>
  );
}
