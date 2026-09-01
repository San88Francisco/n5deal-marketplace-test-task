import type { AssetDetail } from "@/server/assets/queries";

export function AssetDescription({ asset }: { asset: AssetDetail }) {
  const paragraphs = asset.description.split("\n").filter(Boolean);

  return (
    <section className="card mt-6 p-6">
      <h2 className="text-[15px] font-semibold text-ink-900">About this asset</h2>

      <div className="mt-3 space-y-3 text-[14.5px] leading-relaxed text-ink-700">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>

      {asset.reasonForSale && (
        <div className="mt-5 rounded-md bg-ink-50 p-4">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-ink-500">
            Reason for sale
          </p>
          <p className="mt-1 text-[14px] text-ink-700">{asset.reasonForSale}</p>
        </div>
      )}
    </section>
  );
}
