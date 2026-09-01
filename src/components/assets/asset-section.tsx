import { AssetCard } from "@/components/assets/asset-card";
import type { AssetListItem } from "@/server/assets/queries";

type AssetSectionProps = {
  title: string;
  hint: string;
  assets: AssetListItem[];
};

export function AssetSection({ title, hint, assets }: AssetSectionProps) {
  if (!assets.length) return null;

  return (
    <section>
      <h2 className="text-[18px] font-semibold tracking-tight text-ink-900">
        {title} <span className="tabular text-ink-300">({assets.length})</span>
      </h2>
      <p className="mt-1 text-[13.5px] text-ink-500">{hint}</p>

      <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </section>
  );
}
