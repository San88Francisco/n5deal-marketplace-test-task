import type { Metadata } from "next";

import { UserStatusBadge } from "@/components/ui/badge";
import { ModerationDialog } from "@/components/manage/moderation-dialog";
import { ManageFilters } from "@/components/manage/manage-filters";
import { Pagination } from "@/components/ui/pagination";
import { formatDate, formatMoneyShort, humanise } from "@/utils/format";
import { participantFilterSchema } from "@/lib/validation";
import { requireManager } from "@/server/auth/guards";
import { searchParticipants } from "@/server/moderation/service";

export const metadata: Metadata = { title: "Participants" };

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ParticipantsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const manager = await requireManager();
  const raw = await searchParams;
  const parsed = participantFilterSchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : participantFilterSchema.parse({});

  const { items, total, page, pageCount } = await searchParticipants(filters);

  const stringParams = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value.join(",") : value]),
  );

  return (
    <div className="container-page py-10">
      <p className="eyebrow">Platform manager</p>
      <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-ink-900">Participants</h1>
      <p className="mt-1 text-[14px] text-ink-500">
        {total} account{total === 1 ? "" : "s"} — buyers, sellers and managers
      </p>

      <div className="mt-6">
        <ManageFilters
          basePath="/manage/participants"
          placeholder="Search by name, email or company"
          selects={[
            {
              key: "role",
              label: "Role",
              options: [
                { value: "", label: "All roles" },
                { value: "BUYER", label: "Buyers" },
                { value: "SELLER", label: "Sellers" },
                { value: "PLATFORM_MANAGER", label: "Managers" },
              ],
            },
            {
              key: "status",
              label: "Status",
              options: [
                { value: "", label: "All statuses" },
                { value: "ACTIVE", label: "Active" },
                { value: "SUSPENDED", label: "Suspended" },
                { value: "REMOVED", label: "Removed" },
              ],
            },
          ]}
        />
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="border-b border-ink-100 text-[12px] uppercase tracking-wider text-ink-500">
              <th className="px-5 py-3 font-medium">Participant</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Detail</th>
              <th className="px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {items.map((participant) => {
              const company =
                participant.buyerProfile?.companyName ??
                participant.sellerProfile?.companyName ??
                "—";
              const isSelf = participant.id === manager.id;
              const isManager = participant.role === "PLATFORM_MANAGER";

              return (
                <tr key={participant.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-5 py-4">
                    <p className="text-[14px] font-medium text-ink-900">{participant.fullName}</p>
                    <p className="mt-0.5 text-[12.5px] text-ink-500">{participant.email}</p>
                    <p className="mt-0.5 text-[12.5px] text-ink-500">{company}</p>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-ink-700">
                    {humanise(participant.role)}
                  </td>
                  <td className="px-5 py-4">
                    <UserStatusBadge status={participant.status} />
                    {participant.statusReason ? (
                      <p className="mt-1 max-w-[220px] text-[12px] leading-snug text-ink-500">
                        {participant.statusReason}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 text-[13px] text-ink-700">
                    {participant.buyerProfile ? (
                      <>
                        {humanise(participant.buyerProfile.investorType)}
                        <span className="tabular block text-[12.5px] text-ink-500">
                          up to {formatMoneyShort(participant.buyerProfile.ticketMaxEur, "—")}
                        </span>
                      </>
                    ) : participant.sellerProfile ? (
                      <>
                        {humanise(participant.sellerProfile.sellerType)}
                        <span className="block text-[12.5px] text-ink-500">
                          {participant._count.assets} listing
                          {participant._count.assets === 1 ? "" : "s"}
                          {participant.sellerProfile.isVerified ? " · verified" : ""}
                        </span>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-5 py-4 text-[13px] text-ink-500">
                    {formatDate(participant.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    {/* Managers cannot moderate themselves or each other — that
                        is an admin operation, not marketplace moderation. */}
                    {isSelf || isManager ? (
                      <span className="text-[12.5px] text-ink-300">
                        {isSelf ? "You" : "Platform team"}
                      </span>
                    ) : (
                      <div className="flex flex-wrap justify-end gap-2">
                        {participant.status === "ACTIVE" ? (
                          <>
                            {participant.sellerProfile && !participant.sellerProfile.isVerified ? (
                              <ModerationDialog
                                type="SELLER_VERIFY"
                                targetUserId={participant.id}
                                targetName={participant.fullName}
                                triggerLabel="Verify"
                                triggerVariant="ghost"
                              />
                            ) : null}
                            <ModerationDialog
                              type="USER_SUSPEND"
                              targetUserId={participant.id}
                              targetName={`${participant.fullName} · ${participant.email}`}
                              triggerLabel="Suspend"
                            />
                          </>
                        ) : null}

                        {participant.status === "SUSPENDED" ? (
                          <>
                            <ModerationDialog
                              type="USER_REINSTATE"
                              targetUserId={participant.id}
                              targetName={`${participant.fullName} · ${participant.email}`}
                              triggerLabel="Reinstate"
                            />
                            <ModerationDialog
                              type="USER_REMOVE"
                              targetUserId={participant.id}
                              targetName={`${participant.fullName} · ${participant.email}`}
                              triggerLabel="Remove"
                              triggerVariant="danger"
                            />
                          </>
                        ) : null}

                        {participant.status === "REMOVED" ? (
                          <span className="text-[12.5px] text-ink-300">Removed</span>
                        ) : null}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {items.length === 0 ? (
          <p className="px-5 py-12 text-center text-[14px] text-ink-500">
            No participants match those filters.
          </p>
        ) : null}
      </div>

      <Pagination
        page={page}
        pageCount={pageCount}
        basePath="/manage/participants"
        params={stringParams}
      />
    </div>
  );
}
