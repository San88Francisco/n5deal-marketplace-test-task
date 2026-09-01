import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AssetCard } from "@/components/assets/asset-card";
import { searchAssets } from "@/server/assets/queries";
import { assetFilterSchema } from "@/lib/validation";
import { getPlatformStats } from "@/server/moderation/service";
import { getCurrentUser } from "@/server/auth/session";
import { landingFor, ROUTES } from "@/routes";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) redirect(landingFor(user.role));

  const filters = assetFilterSchema.parse({ sort: "recent" });
  const [{ items }, stats] = await Promise.all([searchAssets(filters), getPlatformStats()]);

  return (
    <>
      <section className="border-b border-navy-800 bg-navy-950">
        <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.15fr_1fr] lg:py-24">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-300">
              FinTech M&amp;A marketplace
            </p>
            <h1 className="mt-4 text-[38px] font-semibold leading-[1.1] tracking-tight text-white sm:text-[46px]">
              Buy and sell licensed financial companies across 30+ jurisdictions
            </h1>
            <p className="mt-5 max-w-[560px] text-[16px] leading-relaxed text-ink-200">
              Structured mandates on one side, vetted assets on the other. N5Deal matches buyers to
              EMI, payment, banking and crypto licences by what they actually need — jurisdiction,
              permissions, cheque size and timeline — then puts the two sides in direct contact.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="accent">
                <Link href={ROUTES.auth.signUp("BUYER")}>I am buying</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-navy-700 bg-transparent text-white hover:bg-navy-900"
              >
                <Link href={ROUTES.auth.signUp("SELLER")}>I am selling</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-ink-200 hover:bg-navy-900 hover:text-white"
              >
                <Link href={ROUTES.assets.index}>Browse listings</Link>
              </Button>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-card border border-navy-800 bg-navy-800">
            {[
              { label: "Live listings", value: stats.published },
              { label: "Active buyers", value: stats.buyers },
              { label: "Verified sellers", value: stats.sellers },
              { label: "Jurisdictions", value: "38" },
            ].map((stat) => (
              <div key={stat.label} className="bg-navy-950 p-6">
                <dt className="text-[12px] uppercase tracking-wider text-ink-300">{stat.label}</dt>
                <dd className="tabular mt-1 text-[30px] font-semibold text-white">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Latest</p>
            <h2 className="mt-1 text-[22px] font-semibold tracking-tight text-ink-900">
              Recently listed
            </h2>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={ROUTES.assets.index}>See all listings</Link>
          </Button>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Structured mandates, not keyword search",
              body: "Buyers describe jurisdiction, licence type, cheque size and timeline once. Every listing is then ranked against that mandate, with the reasoning shown.",
            },
            {
              title: "Sellers browse demand, not just supply",
              body: "A seller picks one of their listings and sees which buyers fit it, ranked, so outreach starts from evidence instead of a spreadsheet.",
            },
            {
              title: "Moderated, with a record",
              body: "Platform managers can suspend or remove participants who break the rules. Every action carries a written reason and is kept in an audit trail.",
            },
          ].map((item) => (
            <div key={item.title} className="card p-6">
              <h3 className="text-[15px] font-semibold text-ink-900">{item.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
