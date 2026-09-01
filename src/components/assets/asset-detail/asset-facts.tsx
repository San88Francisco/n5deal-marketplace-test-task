import { LICENCE_STATUS_LABEL } from "@/constants";
import type { AssetDetail } from "@/server/assets/queries";
import { flagEmoji, formatNumber, humanise } from "@/utils/format";

export function AssetFacts({ asset }: { asset: AssetDetail }) {
  const facts = [
    {
      label: "Jurisdiction",
      value: `${flagEmoji(asset.jurisdictionCode)} ${asset.jurisdiction.name}`,
    },
    { label: "Licence type", value: `${asset.category.name} (${asset.category.code})` },
    { label: "Business model", value: humanise(asset.businessType) },
    { label: "Licence status", value: LICENCE_STATUS_LABEL[asset.licenceStatus] },
    { label: "Regulator", value: asset.regulator ?? "—" },
    { label: "Licence issued", value: asset.licenceIssuedYear?.toString() ?? "—" },
    { label: "Company founded", value: asset.yearEstablished?.toString() ?? "—" },
    { label: "Employees", value: formatNumber(asset.employees) },
    { label: "Active clients", value: formatNumber(asset.activeClients) },
    { label: "EEA passporting", value: asset.hasPassporting ? "Yes" : "No" },
  ];

  return (
    <section className="card mt-8 p-6">
      <h2 className="text-[15px] font-semibold text-ink-900">Key facts</h2>

      <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        {facts.map((fact) => (
          <div key={fact.label} className="flex justify-between gap-4 border-b border-ink-100 pb-2">
            <dt className="text-[13px] text-ink-500">{fact.label}</dt>
            <dd className="tabular text-right text-[13.5px] font-medium text-ink-900">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
