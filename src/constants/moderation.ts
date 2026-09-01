import { MODERATION_ACTION } from "@/constants/domain";

export type ModerationCopy = {
  title: string;
  body: string;
  confirm: string;
  destructive?: boolean;
};

export const MODERATION_COPY: Record<string, ModerationCopy> = {
  [MODERATION_ACTION.USER_SUSPEND]: {
    title: "Suspend participant",
    body: "They lose access immediately, their sessions are ended, and their profile and listings leave the marketplace. Existing conversations become read-only. This is reversible.",
    confirm: "Suspend",
    destructive: true,
  },
  [MODERATION_ACTION.USER_REINSTATE]: {
    title: "Reinstate participant",
    body: "Access is restored and their profile becomes visible again. Listings stay in whatever state they were left in.",
    confirm: "Reinstate",
  },
  [MODERATION_ACTION.USER_REMOVE]: {
    title: "Remove participant",
    body: "A permanent removal. The account is retained internally so conversations and the audit trail stay intact, but nothing is exposed publicly and their listings are archived.",
    confirm: "Remove permanently",
    destructive: true,
  },
  [MODERATION_ACTION.ASSET_SUSPEND]: {
    title: "Suspend listing",
    body: "The listing leaves the marketplace and its owner cannot republish it. They will see that it is under review.",
    confirm: "Suspend listing",
    destructive: true,
  },
  [MODERATION_ACTION.ASSET_REINSTATE]: {
    title: "Reinstate listing",
    body: "The listing returns to the state it was in before suspension.",
    confirm: "Reinstate listing",
  },
  [MODERATION_ACTION.SELLER_VERIFY]: {
    title: "Mark seller as verified",
    body: "Adds the Verified badge to their profile and every listing they publish. Only do this after KYB documents have been checked.",
    confirm: "Mark verified",
  },
};
