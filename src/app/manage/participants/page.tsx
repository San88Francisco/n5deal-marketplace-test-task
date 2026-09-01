import type { Metadata } from "next";

import { ManageFilters } from "@/components/manage/manage-filters";
import { ParticipantRow } from "@/components/manage/participant-row";
import { DataTable } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { PARTICIPANT_COLUMNS, PARTICIPANT_FILTER_SELECTS } from "@/constants";
import { participantFilterSchema } from "@/lib/validation";
import { ROUTES } from "@/routes";
import { requireManager } from "@/server/auth/guards";
import { searchParticipants } from "@/server/moderation/service";
import type { SearchParams } from "@/types";
import { toQueryRecord } from "@/utils/url";

export const metadata: Metadata = { title: "Participants" };

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

  return (
    <div className="container-page py-10">
      <p className="eyebrow">Platform manager</p>
      <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-ink-900">Participants</h1>
      <p className="mt-1 text-[14px] text-ink-500">
        {total} account{total === 1 ? "" : "s"} — buyers, sellers and managers
      </p>

      <div className="mt-6">
        <ManageFilters
          basePath={ROUTES.manage.participants()}
          placeholder="Search by name, email or company"
          selects={PARTICIPANT_FILTER_SELECTS}
        />
      </div>

      <div className="mt-6">
        <DataTable
          columns={PARTICIPANT_COLUMNS}
          minWidth="900px"
          isEmpty={items.length === 0}
          emptyLabel="No participants match those filters."
        >
          {items.map((participant) => (
            <ParticipantRow
              key={participant.id}
              participant={participant}
              isSelf={participant.id === manager.id}
            />
          ))}
        </DataTable>
      </div>

      <Pagination
        page={page}
        pageCount={pageCount}
        basePath={ROUTES.manage.participants()}
        params={toQueryRecord(raw)}
      />
    </div>
  );
}
