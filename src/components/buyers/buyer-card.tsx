import { Building2, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { MatchBadge } from "@/components/ui/match-badge";
import { ContactDialog } from "@/components/messages/contact-dialog";
import { TIMELINE_LABEL } from "@/constants";
import { flagEmoji, formatMoneyShort, humanise } from "@/utils/format";
import type { BuyerListItem } from "@/server/buyers/queries";

export function BuyerCard({
  buyer,
  canContact,
  contactSubject,
  contactAssetId,
}: {
  buyer: BuyerListItem;
  canContact: boolean;
  contactSubject?: string;
  contactAssetId?: string;
}) {
  const jurisdictions = buyer.targetJurisdictions.map((row) => row.jurisdiction);
  const categories = buyer.targetCategories.map((row) => row.category);

  return (
    <article className="card flex flex-col p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-navy-900 text-white">
          <Building2 className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-ink-900">{buyer.companyName}</h3>
          <p className="mt-0.5 text-[12.5px] text-ink-500">
            {humanise(buyer.investorType)} · {flagEmoji(buyer.country)} {buyer.country}
          </p>
        </div>
        {buyer.proofOfFundsReady && (
          <Badge tone="positive" className="ml-auto shrink-0" title="Proof of funds confirmed">
            <ShieldCheck className="h-3 w-3" aria-hidden />
            PoF
          </Badge>
        )}
      </div>

      <p className="mt-3 line-clamp-2 text-[13.5px] leading-relaxed text-ink-700">
        {buyer.headline}
      </p>

      {buyer.match && (
        <div className="mt-3">
          <MatchBadge
            score={buyer.match.score}
            title={
              buyer.match.reasons.length
                ? `Because: ${buyer.match.reasons.join(", ")}`
                : "Scored against the selected listing"
            }
          />
          {buyer.match.concerns.length > 0 && (
            <p className="mt-1.5 text-[12px] text-caution-700">{buyer.match.concerns[0]}</p>
          )}
        </div>
      )}

      <dl className="mt-4 space-y-2 border-t border-ink-100 pt-4 text-[13px]">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-500">Cheque size</dt>
          <dd className="tabular font-medium text-ink-900">
            {formatMoneyShort(buyer.ticketMinEur, "—")} – {formatMoneyShort(buyer.ticketMaxEur, "—")}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-500">Timeline</dt>
          <dd className="text-right font-medium text-ink-900">
            {TIMELINE_LABEL[buyer.timeline] ?? humanise(buyer.timeline)}
          </dd>
        </div>
        {buyer.wantsOperatingOnly && (
          <div className="flex justify-between gap-3">
            <dt className="text-ink-500">Requires</dt>
            <dd className="text-right font-medium text-ink-900">Operating business</dd>
          </div>
        )}
      </dl>

      <div className="mt-3 flex flex-wrap gap-1">
        {jurisdictions.slice(0, 4).map((jurisdiction) => (
          <Badge key={jurisdiction.code} tone="outline">
            {flagEmoji(jurisdiction.code)} {jurisdiction.code}
          </Badge>
        ))}
        {jurisdictions.length > 4 && (
          <Badge tone="neutral">+{jurisdictions.length - 4}</Badge>
        )}
      </div>

      <div className="mt-1.5 flex flex-wrap gap-1">
        {categories.slice(0, 4).map((category) => (
          <Badge key={category.code} tone="navy">
            {category.code}
          </Badge>
        ))}
        {categories.length > 4 && <Badge tone="neutral">+{categories.length - 4}</Badge>}
      </div>

      {canContact && (
        <div className="mt-5">
          <ContactDialog
            counterpartyId={buyer.userId}
            counterpartyName={buyer.companyName}
            assetId={contactAssetId}
            subject={contactSubject ?? `Introduction from a seller on N5Deal`}
            triggerLabel="Contact buyer"
            variant="outline"
            suggestion={
              contactSubject
                ? `I have a listing that looks close to your mandate: ${contactSubject}.\n\n`
                : undefined
            }
          />
        </div>
      )}
    </article>
  );
}
