import type { Metadata } from "next";
import Link from "next/link";
import { z } from "zod";

import { AssetStatusBadge } from "@/components/ui/asset-status-badge";
import { Badge } from "@/components/ui/badge";
import { ModerationDialog } from "@/components/manage/moderation-dialog";
import { ManageFilters } from "@/components/manage/manage-filters";
import { Pagination } from "@/components/ui/pagination";
import { flagEmoji, formatDate, formatMoneyShort } from "@/utils/format";
import { requireManager } from "@/server/auth/guards";
import { searchAllAssets } from "@/server/moderation/service";
import { ROUTES } from "@/routes";
import { ASSET_STATUS, MODERATION_ACTION, USER_STATUS } from "@/constants";

export const metadata: Metadata = { title: "Listings" };

const filterSchema = z.object({
  q: z.string().trim().max(200).optional(),
  status: z
    .enum([ASSET_STATUS.DRAFT, ASSET_STATUS.PUBLISHED, ASSET_STATUS.UNDER_OFFER, ASSET_STATUS.SOLD, USER_STATUS.SUSPENDED, ASSET_STATUS.ARCHIVED])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
});

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ManageListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireManager();
  const raw = await searchParams;
  const parsed = filterSchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : filterSchema.parse({});

  const { items, total, page, pageCount } = await searchAllAssets(filters);

  const stringParams = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value.join(",") : value]),
  );

  return (
    <div className="container-page py-10">
      <p className="eyebrow">Platform manager</p>
      <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-ink-900">Listings</h1>
      <p className="mt-1 text-[14px] text-ink-500">
        {total} listing{total === 1 ? "" : "s"} in every state, including drafts and archived
      </p>

      <div className="mt-6">
        <ManageFilters
          basePath="/manage/listings"
          placeholder="Search by title, summary or seller"
          selects={[
            {
              key: "status",
              label: "Status",
              options: [
                { value: "", label: "All statuses" },
                { value: ASSET_STATUS.PUBLISHED, label: "Published" },
                { value: ASSET_STATUS.UNDER_OFFER, label: "Under offer" },
                { value: ASSET_STATUS.DRAFT, label: "Draft" },
                { value: ASSET_STATUS.SOLD, label: "Sold" },
                { value: USER_STATUS.SUSPENDED, label: "Suspended" },
                { value: ASSET_STATUS.ARCHIVED, label: "Archived" },
              ],
            },
          ]}
        />
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="border-b border-ink-100 text-[12px] uppercase tracking-wider text-ink-500">
              <th className="px-5 py-3 font-medium">Listing</th>
              <th className="px-5 py-3 font-medium">Seller</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Updated</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {items.map((asset) => (
              <tr key={asset.id} className="border-b border-ink-100 last:border-0">
                <td className="px-5 py-4">
                  <Link
                    href={ROUTES.assets.detail(asset.slug)}
                    className="text-[14px] font-medium text-ink-900 hover:underline"
                  >
                    {asset.title}
                  </Link>
                  <p className="mt-0.5 text-[12.5px] text-ink-500">
                    #{asset.referenceCode} · {flagEmoji(asset.jurisdictionCode)}{" "}
                    {asset.jurisdiction.name} · {asset.category.code}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-[13.5px] text-ink-900">
                    {asset.seller.sellerProfile?.companyName ?? asset.seller.fullName}
                  </p>
                  {asset.seller.status !== USER_STATUS.ACTIVE ? (
                    <Badge tone="caution" className="mt-1">
                      Seller {asset.seller.status.toLowerCase()}
                    </Badge>
                  ) : null}
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-col items-start gap-1">
                    <AssetStatusBadge status={asset.status} />
                    {asset.isValidated ? <Badge tone="accent">Validated</Badge> : null}
                  </div>
                </td>
                <td className="tabular px-5 py-4 text-[13.5px] text-ink-900">
                  {formatMoneyShort(asset.askingPriceEur, "On request")}
                </td>
                <td className="px-5 py-4 text-[13px] text-ink-500">{formatDate(asset.updatedAt)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end">
                    {asset.status === ASSET_STATUS.SUSPENDED ? (
                      <ModerationDialog
                        type={MODERATION_ACTION.ASSET_REINSTATE}
                        targetAssetId={asset.id}
                        targetName={asset.title}
                        triggerLabel="Reinstate"
                      />
                    ) : (
                      <ModerationDialog
                        type={MODERATION_ACTION.ASSET_SUSPEND}
                        targetAssetId={asset.id}
                        targetName={asset.title}
                        triggerLabel="Suspend"
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 ? (
          <p className="px-5 py-12 text-center text-[14px] text-ink-500">
            No listings match those filters.
          </p>
        ) : null}
      </div>

      <Pagination
        page={page}
        pageCount={pageCount}
        basePath="/manage/listings"
        params={stringParams}
      />
    </div>
  );
}
