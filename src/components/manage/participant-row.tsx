import { ModerationDialog } from "@/components/manage/moderation-dialog";
import { UserStatusBadge } from "@/components/ui/user-status-badge";
import { MODERATION_ACTION, USER_ROLE, USER_STATUS } from "@/constants";
import type { ParticipantListItem } from "@/server/moderation/service";
import { formatDate, formatMoneyShort, humanise } from "@/utils/format";

type ParticipantRowProps = {
  participant: ParticipantListItem;
  isSelf: boolean;
};

export function ParticipantRow({ participant, isSelf }: ParticipantRowProps) {
  const company =
    participant.buyerProfile?.companyName ?? participant.sellerProfile?.companyName ?? "—";
  const isManager = participant.role === USER_ROLE.PLATFORM_MANAGER;
  const targetName = `${participant.fullName} · ${participant.email}`;

  return (
    <tr className="border-b border-ink-100 last:border-0">
      <td className="px-5 py-4">
        <p className="text-[14px] font-medium text-ink-900">{participant.fullName}</p>
        <p className="mt-0.5 text-[12.5px] text-ink-500">{participant.email}</p>
        <p className="mt-0.5 text-[12.5px] text-ink-500">{company}</p>
      </td>

      <td className="px-5 py-4 text-[13px] text-ink-700">{humanise(participant.role)}</td>

      <td className="px-5 py-4">
        <UserStatusBadge status={participant.status} />
        {participant.statusReason && (
          <p className="mt-1 max-w-[220px] text-[12px] leading-snug text-ink-500">
            {participant.statusReason}
          </p>
        )}
      </td>

      <td className="px-5 py-4 text-[13px] text-ink-700">
        {participant.buyerProfile && (
          <>
            {humanise(participant.buyerProfile.investorType)}
            <span className="tabular block text-[12.5px] text-ink-500">
              up to {formatMoneyShort(participant.buyerProfile.ticketMaxEur, "—")}
            </span>
          </>
        )}

        {participant.sellerProfile && (
          <>
            {humanise(participant.sellerProfile.sellerType)}
            <span className="block text-[12.5px] text-ink-500">
              {participant._count.assets} listing{participant._count.assets === 1 ? "" : "s"}
              {participant.sellerProfile.isVerified ? " · verified" : ""}
            </span>
          </>
        )}

        {!participant.buyerProfile && !participant.sellerProfile && "—"}
      </td>

      <td className="px-5 py-4 text-[13px] text-ink-500">{formatDate(participant.createdAt)}</td>

      <td className="px-5 py-4">
        {isSelf || isManager ? (
          <span className="text-[12.5px] text-ink-300">{isSelf ? "You" : "Platform team"}</span>
        ) : (
          <div className="flex flex-wrap justify-end gap-2">
            {participant.status === USER_STATUS.ACTIVE && (
              <>
                {participant.sellerProfile && !participant.sellerProfile.isVerified && (
                  <ModerationDialog
                    type={MODERATION_ACTION.SELLER_VERIFY}
                    targetUserId={participant.id}
                    targetName={participant.fullName}
                    triggerLabel="Verify"
                    triggerVariant="ghost"
                  />
                )}

                <ModerationDialog
                  type={MODERATION_ACTION.USER_SUSPEND}
                  targetUserId={participant.id}
                  targetName={targetName}
                  triggerLabel="Suspend"
                />
              </>
            )}

            {participant.status === USER_STATUS.SUSPENDED && (
              <>
                <ModerationDialog
                  type={MODERATION_ACTION.USER_REINSTATE}
                  targetUserId={participant.id}
                  targetName={targetName}
                  triggerLabel="Reinstate"
                />
                <ModerationDialog
                  type={MODERATION_ACTION.USER_REMOVE}
                  targetUserId={participant.id}
                  targetName={targetName}
                  triggerLabel="Remove"
                  triggerVariant="danger"
                />
              </>
            )}

            {participant.status === USER_STATUS.REMOVED && (
              <span className="text-[12.5px] text-ink-300">Removed</span>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}
